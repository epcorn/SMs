import { dateCompare, dateFormat } from "@/utils/helperfn";
import { AttedenceHistory } from "../employee/ShowUserAttendence";

function DashboardTable({ presents, absents, halfday, checkouts, label }) {
  const alldata = presents || absents || halfday || checkouts || [];

  return (
    <div className="max-h-full h-full overflow-auto">
      <table className="table table-pin-rows table-pin-cols w-full min-w-2xl">
        <thead className="[&_th]:bg-gray-300">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Duty Time</th>
            <th>Check In Time</th>
            <th>Check Out Time</th>
          </tr>
        </thead>
        <tbody>
          {alldata?.length > 0 ? (
            alldata?.map((d, idx) => {
              const recordStatus = d?.status || d?.attendenceRecords?.[0]?.status || "Absent";
              const checkIn = d?.checkInTime;
              const checkOut = d?.checkOutTime;
              const duty = d?.duty.find(d => dateCompare(d.createdAt, new Date()))?.startTime;

              return (
                <tr key={d._id || idx} className="hover">
                  <td>{idx + 1}</td>
                  <td >
                    <div className="dropdown dropdown-hover">
                      <span className="cursor-pointer">{d?.firstname} {d?.middlename} {d?.lastname}</span>
                      <div className="dropdown-content z-50 p-3 shadow-xl rounded-box bg-base-200 text-base-content border border-gray-400 min-w-96 ">
                        <AttedenceHistory history={d?.history || []} />
                      </div>
                    </div>
                  </td>
                  <td>{d?.role}</td>
                  <td>
                    <span
                      className={`badge ${recordStatus === "Present"
                        ? "badge-success"
                        : recordStatus === "Half-day"
                          ? "badge-warning"
                          : "badge-error"
                        }`}
                    >
                      {recordStatus}
                    </span>
                  </td>
                  <td>{dateFormat(duty)?.time || "N/A"}</td>
                  <td>{checkIn ? dateFormat(checkIn)?.time : "N/A"}</td>
                  <td>{checkOut ? dateFormat(checkOut)?.time : "N/A"}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4 text-lg text-gray-500">
                No ones on {label} today
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardTable;