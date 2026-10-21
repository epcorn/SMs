import { useAssignAttendence } from "@/hooks/empHooks";
import { dateCompare, dateFormat } from "@/utils/helperfn";
import { Check, CircleSlash2, X, XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import AttendanceCalendar from "../attendence/AttendenceCalendar";

function ShowUserAttendence({ users }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const { mutateAsync: mark } = useAssignAttendence();

  async function handleMark(id, status) {
    try {
      const data = await mark({ id, status });
      toast.success(data?.msg || "Attendance marked successfully!");
    } catch (error) {
      console.log(error.message);
      toast.error(
        error?.response?.data?.msg ||
        error.message ||
        "Failed to mark attendance",
      );
    }
  }

  const buttons = [
    {
      icon: <Check className="text-xs h-4" />,
      tip: "Present",
      btn: "btn btn-sm btn-square btn-success tooltip",
    },
    {
      icon: <X className="text-xs h-4" />,
      tip: "Absent",
      btn: "btn btn-sm btn-square btn-error tooltip",
    },
    {
      icon: <CircleSlash2 className="text-xs h-4" />,
      tip: "Half-day",
      btn: "btn btn-sm btn-square btn-dashed tooltip",
    },
  ];

  return (
    <div className="w-full ">
      <h3 className="text-2xl font-semibold my-5">Today's Employee's Attendance</h3>

      <div className="overflow-x-auto pb-20">
        <table className="table min-w-2xl border border-gray-200 shadow-sm rounded-lg">
          <thead className="bg-accent text-accent-content">
            <tr>
              <th className="w-12">#</th>
              <th>Name</th>
              <th>Status</th>
              <th className="text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {users?.length ? (
              users?.map((user, idx) => {
                const name =
                  `${user?.firstname || ""} ${user?.middlename || ""} ${user?.lastname || ""}`.trim();
                const todays = user?.attendenceRecords?.find(att => dateCompare(att?.createdAt, new Date()));

                return (
                  <tr
                    key={user._id}
                    className="hover cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user);
                      document.getElementById('UserHistory').showModal();
                    }}
                  >
                    <td>{idx + 1}</td>
                    <td>
                      <div className="text-base tooltip md:tooltip-right font-medium">
                        {name || "N/A"}
                        <div className="tooltip-content z-50 p-2 shadow-lg rounded bg-base-200 text-base-content border border-gray-300">
                          <AttedenceHistory
                            history={todays?.history || []}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge badge-md font-medium ${todays?.status === "Present"
                          ? "badge-success"
                          : todays?.status === "Absent"
                            ? "badge-error"
                            : todays?.status === "Half-day"
                              ? "badge-warning"
                              : "badge-ghost"
                          }`}
                      >
                        {todays?.status || "Not Marked"}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 items-center justify-end">
                        {buttons.map((bt) => (
                          <button
                            key={bt.tip}
                            className={bt.btn}
                            data-tip={bt.tip}
                            onClick={(e) => {
                              e.preventDefault();
                              handleMark(user._id, bt.tip);
                            }}
                          >
                            {bt.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserHistory user={selectedUser} />
    </div>
  );
}

export default ShowUserAttendence;

function AttedenceHistory({ history }) {
  if (!history || !Array.isArray(history) || history.length === 0) {
    return (
      <div className="p-2 text-xs text-gray-400">No history available</div>
    );
  }

  return (
    <div className="px-2 space-y-1 text-left max-h-52 overflow-y-auto">
      <p className="font-semibold text-xs border-b pb-1 mb-1">History Log</p>
      {history?.map((h, i) => (
        <div
          key={h._id || i}
          className="text-xs p-1 border-b border-gray-600 last:border-none"
        >
          <span className="font-medium">{h?.status}</span> —{" "}
          <strong className="capitalize">
            {h?.changedBy?.firstname || ""} {h?.changedBy?.lastname || ""}{" "}
            &nbsp;
          </strong>
          <span className="opacity-80">
            {dateFormat(h?.date).fullDateAndTime}
          </span>
        </div>
      ))}
    </div>
  );
}

function UserHistory({ user }) {
  // Safety check to prevent crashing before a user is selected
  if (!user) return null;

  return (
    <dialog id="UserHistory" className="modal">
      <div className="modal-box md:min-w-4xl">
        <div className="modal-action m-0 flex justify-between items-start">
          <h3 className="my-4 text-2xl font-semibold">
            {user.firstname} {user.middlename} {user.lastname}
          </h3>
          <form method="dialog">
            <button className="btn btn-square btn-circle btn-error btn-sm">
              <XIcon className="w-3 h-3" />
            </button>
          </form>
        </div>
        <AttendanceCalendar records={user?.attendenceRecords || []} />
      </div>
    </dialog >
  );
}