import { useAssignAttendence } from "@/hooks/empHooks";
import { dateFormat } from "@/utils/helperfn";
import { Check, CircleSlash2, X } from "lucide-react";
import toast from "react-hot-toast";

function ShowUserAttendence({ users }) {
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
    <>
      <h3 className="text-2xl font-semibold my-5">Today's Employee's Attendance</h3>
      <table className="table outline outline-gray-400">
        <thead className="bg-accent ">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users?.length ? (
            users?.map((user, idx) => {
              const name =
                `${user?.firstname || ""} ${user?.middlename || ""} ${user?.lastname || ""}`.trim();
              return (
                <tr key={user._id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="text-base tooltip cursor-pointer">
                      {name || "N/A"}
                      <div className="tooltip-content z-50 p-2 shadow-lg rounded">
                        <AttedenceHistory
                          history={user?.attendenceRecords?.[0]?.history || {}}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge badge-md font-medium ${
                        user?.todayAttendence === "Present"
                          ? "badge-success"
                          : user?.todayAttendence === "Absent"
                            ? "badge-error"
                            : user?.todayAttendence === "Half-day"
                              ? "badge-warning"
                              : "badge-ghost"
                      }`}
                    >
                      {user?.todayAttendence || "Not Marked"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3 items-center">
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
    </>
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
