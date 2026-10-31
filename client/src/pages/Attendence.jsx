import AttendanceCalendar from "@/components/attendence/AttendenceCalendar";
import ShowUserAttendence from "@/components/employee/ShowUserAttendence";
import { useGetAttendenceQuery, useMarkAttandence } from "@/hooks/empHooks";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { dateCompare } from "@/utils/helperfn";
import { useGetMe } from "@/hooks/authHooks";

function Attendence() {
  const [toggle, setToggle] = useState(false);
  const { data: user } = useGetMe()

  const { mutateAsync: marking, isPending: isMarking } = useMarkAttandence();
  const { data: attendence, isFetching: loadingAttdnc } = useGetAttendenceQuery(
    user?.id,
  );
  const history = attendence?.user || {};

  const handleMark = async (action) => {

    try {
      const res = await marking({ action: action === "in" ? "CHECK_IN" : "CHECK_OUT" });
      toast.success(res?.msg || "Attendance marked successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.msg || error?.message || "Internal server error",
      );
    }
  };

  const isPrivilegedUser = ["admin", "operator"].includes(user?.role);

  if (loadingAttdnc) {
    return (
      <div className="grid place-items-center h-full">
        <span className="loading loading-bars loading-xl"></span>
      </div>
    )
  }

  return (
    <div className="relative bg-base-100 rounded-2xl shadow-xs border border-base-300/60 flex flex-col h-[calc(100dvh-0.1rem)] min-h-0 p-2 px-3 overflow-hidden">
      {isPrivilegedUser && (
        <button
          className={`z-20 btn btn-square btn-circle btn-dash absolute top-1/2 -translate-y-1/2 ${toggle ? "" : "right-0"}`}
          onClick={(e) => { e.stopPropagation(); setToggle(!toggle); }}
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

export default Attendence;

function ShowEmpAttendence({ handleMark, isMarking, user, loadingAttdnc, history }) {

  const records = history?.attendenceRecords || [];
  const todays = records.find(a => dateCompare(a?.createdAt, new Date()));
  const isCheckedIn = Boolean(todays?.checkInTime);
  const isCheckedOut = Boolean(todays?.checkOutTime || todays?.totalWorkingHours);

  const isAdmin = user?.role === "admin"
  // const statusConfig = getStatusStyle(todays?.status || "N/A");

  console.log(todays);

  return (
    <div className="min-h-full flex flex-col gap-6 pb-6 pt-4 items-center justify-center">
      {/* Title & Subtitle */}
      <div className="text-center space-y-1 hidden">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-base-content">
          Work Attendance
        </h2>
        <p className="text-sm text-base-content/60">
          Check-in and check-out to record your daily working hours
        </p>
      </div>

      {/* Main Interactive Action Container */}
      <div className="flex flex-col items-center justify-center gap-6 py-4">

        {/* 1. Show Check-In Button if not yet checked in */}
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

        {/* 2. Show Mark Out Button if Checked In but Not Checked Out */}
        {isCheckedIn && !isCheckedOut && (
          <button
            type="button"
            onClick={() => {
              const confirm = window.confirm("Are you sure want to Mark Out ")
              if (confirm) {
                handleMark("out")
              }
            }}
            disabled={isMarking}
            className="btn btn-circle w-52 h-52 md:w-64 md:h-64 btn-error shadow-2xl text-white font-bold text-xl hover:scale-105 active:scale-95 transition-all duration-200 flex flex-col items-center justify-center gap-2 border-none"
          >
            {isMarking ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : (
              <>
                <span className="text-4xl">✕</span>
                <span>Mark Out</span>
              </>
            )}
          </button>
        )}

        {/* 3. Show Completed State & Total Working Hours when finished for the day */}
        {isCheckedOut && (
          <div className="flex flex-col items-center gap-4 bg-base-200/60 p-6 rounded-2xl border border-base-300 shadow-sm text-center">
            <div className="badge badge-success badge-lg font-semibold px-4 py-3 text-white">
              Shift Completed for Today ✓
            </div>
            {todays?.totalWorkingHours && (
              <div className="text-base font-medium text-base-content/80">
                Total Working Hours: <span className="font-bold text-primary">{todays.totalWorkingHours} hrs</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Employee Personal History Calendar (Only visible for employee view if needed, or structured below) */}
      {isAdmin && <div className="w-full max-w-2xl mt-4">
        {loadingAttdnc ? (
          <div className="flex justify-center items-center py-4">
            <span className="loading loading-spinner text-accent loading-md"></span>
          </div>
        ) : (
          <AttendanceCalendar records={records} />
        )}
      </div>}
    </div>
  );
}