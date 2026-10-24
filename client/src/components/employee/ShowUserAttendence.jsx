import { useAssignAttendence } from "@/hooks/empHooks";
import { dateCompare, dateFormat, getStatusStyle } from "@/utils/helperfn";
import { Check, X, XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import AttendanceCalendar from "../attendence/AttendenceCalendar";
import { useForm } from "react-hook-form";

function ShowUserAttendence({ users }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');

  const { mutateAsync: mark } = useAssignAttendence();
  const { register, handleSubmit, reset } = useForm();

  async function handleMark(data) {
    const payload = { ...data, id: selectedUser, status: selectedOption };
    try {
      const res = await mark(payload);
      toast.success(res?.msg || "Attendance marked successfully!");
      reset();
      setSelectedOption('');
    } catch (error) {
      console.log(error?.message || error);
      toast.error(
        error?.response?.data?.msg || error?.message || "Failed to mark attendance"
      );
    }
  }

  const buttons = [
    {
      icon: <Check className="w-4 h-4" />,
      tip: "Present",
      btn: "btn btn-sm btn-square btn-success tooltip",
    },
    {
      icon: <X className="w-4 h-4" />,
      tip: "Absent",
      btn: "btn btn-sm btn-square btn-error tooltip",
    },
    {
      icon: null,
      text: "½",
      tip: "Half-day",
      btn: "btn btn-sm btn-square text-base bg-warning text-warning-content border-warning tooltip",
    },
  ];

  return (
    <div className="w-full">
      <h3 className="text-2xl font-semibold my-5">Today's Employee's Attendance</h3>

      <div className="overflow-x-auto pb-20">
        <table className="table min-w-2xl border border-base-300 shadow-sm rounded-lg bg-base-100">
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
                const todays = user?.attendenceRecords?.find((att) =>
                  dateCompare(att?.createdAt, new Date())
                );
                const isSelected = user._id === selectedUser;

                return (
                  <tr
                    key={user._id}
                    className="hover cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                      document.getElementById('UserHistory').showModal();
                    }}
                  >
                    <td>{idx + 1}</td>
                    <td>
                      {/* Tooltip for History Log on Name */}
                      <div className="dropdown dropdown-hover">
                        <span className="font-medium">{name || "N/A"}</span>
                        <div className="dropdown-content z-50 p-3 shadow-xl rounded-box bg-base-200 text-base-content border border-base-300 w-96">
                          <AttedenceHistory history={todays?.history || []} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge badge-md font-medium ${getStatusStyle(todays?.status).bg
                          }`}
                      >
                        {todays?.status || "Not Marked"}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <form onSubmit={handleSubmit(handleMark)}>
                        <div className="flex flex-wrap gap-2 items-center">
                          {buttons.map((bt) => {
                            const isActive = isSelected && bt.tip === selectedOption;
                            return (
                              <div
                                key={bt.tip}
                                className={` ${isActive ? "aura aura-dual" : ""}`}

                              >
                                <button
                                  type="button"
                                  className={`${bt.btn} text-base`} data-tip={bt.tip}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSelectedUser(user._id);
                                    setSelectedOption(bt.tip);
                                  }}
                                >
                                  {bt?.icon || bt.text}
                                </button>
                              </div>
                            );
                          })}

                          {isSelected && selectedOption && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded border ${getStatusStyle(selectedOption).text}`}>
                              Selected: {selectedOption}
                            </span>
                          )}
                        </div>

                        {isSelected && selectedOption && (
                          <div className="mt-2 flex gap-2 items-center">
                            <textarea
                              className="textarea textarea-bordered textarea-sm w-full max-w-xs"
                              {...register('reason')}
                              placeholder="Reason..."
                            />
                            <button type="submit" className="btn btn-sm btn-neutral">
                              Mark
                            </button>
                          </div>
                        )}
                      </form>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-base-content/60">
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
    return <div className="p-2 text-xs text-base-content/60">No history available</div>;
  }

  return (
    <div className="space-y-2 text-left max-h-52 overflow-y-auto">
      <p className="font-bold text-sm border-b pb-1">History Log</p>
      <div className="grid grid-cols-6 font-semibold text-xs bg-base-300 p-1 rounded">
        <span>Status</span>
        <span className="col-span-2">Changed By</span>
        <span>Time</span>
        <span className="col-span-2">Reason</span>
      </div>
      {history?.map((h, i) => (
        <div
          key={h._id || i}
          className="text-xs grid grid-cols-6 p-1 border-b border-base-300 last:border-none items-center"
        >
          <span className="font-medium">{h?.status}</span>
          <span className="col-span-2 capitalize truncate">
            {h?.givenBy?.firstname || h?.changedBy?.firstname || "System"}
          </span>
          <span className="opacity-80 text-[10px]">
            {dateFormat(h?.date)?.time || "N/A"}
          </span>
          <span className="col-span-2 opacity-80 truncate">
            {h?.reason || "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function UserHistory({ user }) {
  if (!user || typeof user !== "object") return null;

  return (
    <dialog id="UserHistory" className="modal">
      <div className="modal-box md:max-w-4xl p-4 relative">
        <form method="dialog" className="absolute right-3 top-3">
          <button className="btn btn-square btn-circle btn-error btn-sm">
            <XIcon className="w-3 h-3" />
          </button>
        </form>
        <h3 className="my-2 text-2xl font-semibold">
          {user.firstname} {user.middlename} {user.lastname}
        </h3>
        <AttendanceCalendar records={user?.attendenceRecords || []} />
      </div>
    </dialog>
  );
}