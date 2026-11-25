import ShowUserAttendence from "@/components/employee/ShowUserAttendence";
import { useGetAttendenceQuery, useMarkAttandence } from "@/hooks/empHooks";
import { useGetMe } from "@/hooks/authHooks";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { dateCompare, dateFormat, formatTime12h } from "@/utils/helperfn";


const ACTION_MAP = {
  in: "CHECK_IN",
  out: "CHECK_OUT",
  mid_day: "MID_DAY",
  mid_eve: "MID_EVE",
};


export default function Attendence() {
  const [toggle, setToggle] = useState(false);
  const { data: user } = useGetMe();

  const { mutateAsync: marking, isPending: isMarking } = useMarkAttandence();
  const { data: attendence, isFetching: loadingAttdnc } = useGetAttendenceQuery(
    user?.id
  );

  const history = attendence?.user || {};
  const isPrivilegedUser = ["admin", "operator"].includes(user?.role);

  const handleMark = async (action) => {
    const mappedAction = ACTION_MAP[action] || action;
    try {
      const res = await marking({
        action: mappedAction,
      });
      toast.success(res?.msg || "Attendance marked successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.msg || error?.message || "Internal server error"
      );
    }
  };

  if (loadingAttdnc) {
    return (
      <div className="flex flex-col justify-center items-center gap-10 h-full">
        <span className="skeleton bg-gray-200 rounded-full w-64 h-64"></span>
        <span className="skeleton w-84 h-32 bg-gray-200 rounded-lg"></span>
      </div>
    );
  }

  return (
    <div className="relative bg-base-100 rounded-2xl shadow-xs border border-base-300/60 flex flex-col h-[calc(100dvh-0.1rem)] min-h-0 p-2 px-3 overflow-hidden">
      {isPrivilegedUser && (
        <button
          type="button"
          className={`z-25 btn btn-square btn-circle btn-dash absolute top-1/2 -translate-y-1/2 ${toggle ? "" : "right-0"
            }`}
          onClick={(e) => {
            e.stopPropagation();
            setToggle(!toggle);
          }}
        >
          {toggle ? <ChevronRight /> : <ChevronLeft />}
        </button>
      )}

      <AnimatePresence mode="wait">
        {toggle && isPrivilegedUser ? (
          <motion.div
            key="admin-view"
            initial={{ opacity: 0, x: 70 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.4 }}
            className="w-full flex-1 min-h-0 overflow-y-auto"
          >
            <ShowUserAttendence users={attendence?.users} />
          </motion.div>
        ) : (
          <motion.div
            key="emp-view"
            initial={{ opacity: 0, x: 70 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.4 }}
            className="w-full flex-1 min-h-0 overflow-y-auto"
          >
            <ShowEmpAttendence
              user={user}
              handleMark={handleMark}
              isMarking={isMarking}
              loadingAttdnc={loadingAttdnc}
              history={history}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



function ShowEmpAttendence({ handleMark, isMarking, history }) {
  const duty = history?.duty || {};
  const records = history?.attendenceRecords || [];
  const todays = records.find((a) => dateCompare(a?.createdAt, new Date()));

  const isCheckedIn = Boolean(todays?.checkInTime);
  const isCheckedOut = Boolean(todays?.checkOutTime || todays?.totalWorkingHours);
  const isActiveShift = isCheckedIn && !isCheckedOut;

  const midDayMarked = Boolean(todays?.midDayTime);
  const midEveMarked = Boolean(todays?.midEveningTime);

  const midDayTimeLabel = todays?.midDayTime
    ? dateFormat(todays.midDayTime)?.time
    : null;

  const midEveTimeLabel = todays?.midEveningTime
    ? dateFormat(todays.midEveningTime)?.time
    : null;

  const checkInTimeFormatted = todays?.checkInTime
    ? dateFormat(todays.checkInTime)?.time
    : "Not checked in";

  const checkOutTimeFormatted = todays?.checkOutTime
    ? dateFormat(todays.checkOutTime)?.time
    : "N/A";

  const confirmMarkOut = () => {
    if (window.confirm("Are you sure you want to Mark Out?")) {
      handleMark("out");
    }
  };

  return (
    <div className="min-h-full flex flex-col gap-6 pb-6 pt-4 items-center justify-center">

      <div className="flex flex-col items-center justify-center gap-6 py-2">
        {!isCheckedIn && (
          <button
            type="button"
            onClick={() => handleMark("in")}
            disabled={isMarking}
            className="btn btn-circle w-52 h-52 md:w-64 md:h-64 btn-success shadow-2xl text-white font-bold text-xl hover:scale-105 active:scale-95 transition-all duration-200 flex flex-col items-center justify-center gap-2 border-none"
          >
            {isMarking ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : (
              <>
                <span className="text-4xl">✓</span>
                <span>Check In</span>
              </>
            )}
          </button>
        )}

        {isActiveShift && (
          <button
            type="button"
            onClick={confirmMarkOut}
            disabled={isMarking}
            className="btn btn-circle w-52 h-52 md:w-64 md:h-64 btn-error shadow-2xl text-white font-bold text-xl hover:scale-105 active:scale-95 transition-all duration-200 flex flex-col items-center justify-center gap-2 border-none"
          >
            {isMarking ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : (
              <>
                <span>Mark Out</span>
                <span className="text-4xl">✕</span>
              </>
            )}
          </button>
        )}

        {isCheckedOut && (
          <div className="flex flex-col items-center gap-3 bg-base-200/60 p-6 rounded-2xl border border-base-300 shadow-sm text-center">
            <div className="badge badge-success badge-lg font-semibold px-4 py-3 text-white">
              Shift Completed for Today ✓
            </div>
            {todays?.totalWorkingHours && (
              <div className="text-base font-medium text-base-content/80">
                Total Working Hours:{" "}
                <span className="font-bold text-primary">
                  {todays.totalWorkingHours} hrs
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {isActiveShift && (
        <div className="w-full max-w-md bg-base-200/70 border border-base-300 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
              Scheduled Check-Ins
            </span>
            <span className="text-xs text-base-content/60">12:00 PM &amp; 3:00 PM</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isMarking || midDayMarked}
              onClick={() => handleMark("mid_day")}
              className={`btn btn-sm h-auto py-2.5 flex-col gap-0.5 ${midDayMarked ? "btn-success btn-soft" : "btn-outline btn-info"
                }`}
            >
              <span className="font-semibold">12:00 PM Check-In</span>
              <span className="text-[11px] opacity-80">
                {midDayMarked ? `Done · ${midDayTimeLabel}` : "Mid-Day Presence"}
              </span>
            </button>

            <button
              type="button"
              disabled={isMarking || midEveMarked}
              onClick={() => handleMark("mid_eve")}
              className={`btn btn-sm h-auto py-2.5 flex-col gap-0.5 ${midEveMarked ? "btn-success btn-soft" : "btn-outline btn-secondary"
                }`}
            >
              <span className="font-semibold">3:00 PM Check-In</span>
              <span className="text-[11px] opacity-80">
                {midEveMarked ? `Done · ${midEveTimeLabel}` : "3 PM Presence"}
              </span>
            </button>
          </div>
        </div>
      )}

      {(duty?.startTime || duty?.endTime) && (
        <div className="w-full max-w-md bg-gray-300 border border-base-300 rounded-2xl px-4 py-3 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
              Duty Time
            </span>
            <span className="badge badge-info badge-outline badge-sm">
              {duty?.date
                ? dateFormat(duty.date)?.date || "Scheduled"
                : "Default Shift"}
            </span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-base-300 text-center bg-base-100 rounded-xl py-2.5 border border-base-300/60">
            <div className="px-2">
              <span className="text-[11px] uppercase tracking-wide text-base-content/60 block">
                Duty In
              </span>
              <span className="text-base font-bold text-base-content">
                {formatTime12h(duty?.startTime)}
              </span>
            </div>
            <div className="px-2">
              <span className="text-[11px] uppercase tracking-wide text-base-content/60 block">
                Duty Out
              </span>
              <span className="text-base font-bold text-base-content">
                {formatTime12h(duty?.endTime)}
              </span>
            </div>
          </div>

          {duty?.instruction && (
            <p className="text-xs text-base-content/80 mt-2.5 px-1">
              <span className="font-semibold">Instruction:</span> {duty.instruction}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

