// DashboardTable.jsx
import { dateFormat } from "@/utils/helperfn";

function DashboardTable({ presents, absents, halfday, checkouts, label }) {
  const alldata = presents || absents || halfday || checkouts || [];

  return (
    <div className="max-h-full overflow-auto">
      <table className="table table-pin-rows table-pin-cols w-full min-w-2xl">
        <thead className="[&_th]:bg-gray-300">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Check In Time</th>
            <th>Check Out Time</th>
          </tr>
        </thead>
        <tbody>
          {alldata.length > 0 ? (
            alldata.map((d, idx) => {
              const recordStatus = d?.status || d?.attendenceRecords?.[0]?.status || "Absent";
              const checkIn = d?.attendenceRecords?.[0]?.checkInTime;
              const checkOut = d?.attendenceRecords?.[0]?.checkOutTime;

              return (
                <tr key={d._id || idx} className="hover">
                  <td>{idx + 1}</td>
                  <td>{d?.firstname} {d?.middlename} {d?.lastname}</td>
                  <td>{d?.role}</td>
                  <td>
                    <span
                      className={`badge ${
                        recordStatus === "Present"
                          ? "badge-success"
                          : recordStatus === "Half-day"
                          ? "badge-warning"
                          : "badge-error"
                      }`}
                    >
                      {recordStatus}
                    </span>
                  </td>
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