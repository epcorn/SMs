import { dateFormat } from "@/utils/helperfn";

function DashboardTable({ presents, absents, halfday, checkouts, label }) {
  // Pick whichever prop is passed to this specific instance of the table
  const alldata = presents || absents || halfday || checkouts || [];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-2xl ">
        <table className="table w-full">
          <thead className="*:bg-gray-300">
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
            {alldata?.length > 0 ? (
              alldata?.map((d, idx) => {
                // Handle whether data came nested or flattened from your backend service
                const recordStatus = d?.status || d?.attendenceRecords?.[0]?.status || "Absent";
                const checkIn = d?.attendenceRecords?.[0]?.checkInTime;
                const checkOut = d?.attendenceRecords?.[0]?.checkOutTime;

                return (
                  <tr key={d._id || idx} className="hover">
                    <td>{idx + 1}</td>
                    <td>
                      {d?.firstname} {d?.middlename} {d?.lastname}
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
                    <td>{checkIn ? dateFormat(checkIn)?.time : "N/A"}</td>
                    <td>{checkOut ? dateFormat(checkOut)?.time : "N/A"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-lg text-gray-500">
                  No ones on {label} today 
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardTable;