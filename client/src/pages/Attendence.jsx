import AttendanceCalendar from "@/components/attendence/AttendenceCalendar";
import ShowUserAttendence from "@/components/employee/ShowUserAttendence";
import { useGetAttendenceQuery, useMarkAttandence } from "@/hooks/empHooks";
import useAuthStore from "@/store/authStore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

const getStatusStyle = (val) => {
  switch (val) {
    case "Present":
      return {
        btn: "btn-accent shadow-emerald-500/30 hover:shadow-emerald-500/50",
        ring: "bg-emerald-500/15",
        icon: "✓",
        label: "Marked (Present)",
      };
    case "Absent":
      return {
        btn: "btn-error shadow-rose-500/30 hover:shadow-rose-500/50",
        ring: "bg-rose-500/15",
        icon: "✘",
        label: "Marked (Absent)",
      };
    case "Half-day":
      return {
        btn: "btn-warning shadow-amber-500/30 hover:shadow-amber-500/50",
        ring: "bg-amber-500/15",
        icon: "½",
        label: "Marked (Half-Day)",
      };
    default:
      return {
        btn: "btn-primary shadow-primary/30 hover:shadow-primary/50",
        ring: "bg-primary/15",
        icon: "👆",
        label: "Tap to Check-In",
      };
  }
};

function Attendence() {
  const [toggle, setToggle] = useState(false);
  const { user } = useAuthStore((state) => state.user);

  const {
    mutateAsync: marking,
    isPending: isMarking,
    data,
  } = useMarkAttandence();

  const { data: attendence, isFetching: loadingAttdnc } = useGetAttendenceQuery(
    user?.id,
  );
  const history = attendence?.user || {};

  const handleMark = async () => {
    try {
      const res = await marking();
      toast.success(res?.msg || "Attendance marked successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.msg || error?.message || "Internal server error",
      );
    }
  };

  return (
    <div className="relative bg-base-100 rounded-2xl shadow-xs border border-base-300/60 flex flex-col gap-10 h-full">
      {["admin", "operator"].includes(user?.role) && (
        <button
          className={`btn btn-square btn-circle  btn-dash absolute top-1/2 -translate-y-1/2 ${toggle ? "" : "right-0"}`}
          onClick={() => setToggle(!toggle)}
        >
          {toggle ? <ChevronRight /> : <ChevronLeft />}
        </button>
      )}

      <AnimatePresence mode="wait">
        {toggle ? (
          ["admin", "operator"].includes(user?.role) && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, x: 70 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <ShowUserAttendence users={attendence?.users} />
            </motion.div>
          )
        ) : (
          <motion.div
            key="emp-view"
            initial={{ opacity: 0, x: 70 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <ShowEmpAttendence
              data={data}
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

function ShowEmpAttendence({ handleMark, isMarking, loadingAttdnc, history }) {
  const statusConfig = getStatusStyle(history?.todayAttendence);
  const records = history?.attendenceRecords || [];
  console.log(records);
  return (
    <div className="flex flex-col gap-10">
      {/* Header Section */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-base-content">
          Work Attendance
        </h2>
        <p className="text-sm text-base-content/60">
          Check-in daily to record your work log
        </p>
      </div>

      {/* Interactive Action Button with Decorative Ring */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative flex items-center justify-center">
          <div
            className={`absolute -inset-3 rounded-full blur-md transition-all duration-300 ${statusConfig.ring}`}
          />
          <button
            type="button"
            onClick={handleMark}
            disabled={isMarking}
            className={`relative btn ${statusConfig.btn} btn-circle w-40 h-40 text-sm font-bold tracking-wide shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border-none flex flex-col items-center justify-center gap-2 text-white`}
          >
            {isMarking ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : (
              <>
                <span className="text-3xl drop-shadow-xs">
                  {statusConfig.icon}
                </span>
                <span className="px-3 text-center leading-snug">
                  {statusConfig.label}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* History Log Section */}
      {loadingAttdnc ? (
        <div className="flex justify-center items-center py-2">
          <span className="loading loading-spinner text-accent loading-md"></span>
        </div>
      ) : (
        <AttendanceCalendar records={records} />
      )}
    </div>
  );
}
