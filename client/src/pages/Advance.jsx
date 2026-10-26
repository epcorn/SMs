import { useGetAllUsers } from "@/hooks/empHooks";
import useAuthStore from "@/store/authStore";
import { dateFormat } from "@/utils/helperfn";
import { useState } from "react";

function Advance() {
  const { user } = useAuthStore(state => state.user);
  const [state, setState] = useState({ page: 1, limit: 15 });
  const { data: users } = useGetAllUsers({ limit: state.limit, page: state.page });

  const todayMidnight = new Date().setHours(0, 0, 0, 0);

  const advance = users?.advance || users?.user || [];
  const allUsers = users?.data || [];

  // Flatten or map all advance records across all users for "All Employee Advance" tab
  const allAdvancesList = allUsers.flatMap(emp =>
    (emp.advance || []).map(ad => ({ ...emp, advanceRecord: ad }))
  );

  // Filter users who took an advance today
  const usersWithAdvanceToday = allUsers.filter(emp => {
    return emp.advance && emp.advance.some(ad => {
      return new Date(ad.date).setHours(0, 0, 0, 0) === todayMidnight;
    });
  });

  return (
    <div className="h-full overflow-hidden">
      <div className="tabs tabs-lift">
        <input type="radio" name="my_tabs_3" className="tab" aria-label="All Employee Advance" />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <AllAdvances allAdvancesList={allAdvancesList} />
        </div>

        <input type="radio" name="my_tabs_3" className="tab" aria-label="Todays Advance" defaultChecked />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <TodaysAdvance usersWithAdvanceToday={usersWithAdvanceToday} />
        </div>

        <input type="radio" name="my_tabs_3" className="tab" aria-label="My Advance" />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <MyAdvance advance={advance} />
        </div>
      </div>
    </div>
  );
}

export default Advance;

function AllAdvances({ allAdvancesList }) {
  return (
    <div className="overflow-x-auto flex-1 overflow-y-auto">
      <table className="table outline outline-neutral-400 w-full">
        <thead className="bg-neutral-300 sticky top-0 z-10">
          <tr>
            <th>Name</th>
            <th>Given By</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {allAdvancesList.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-5 text-gray-500">No advance records found</td>
            </tr>
          ) : (
            allAdvancesList.map(({ firstname, middlename, lastname, advanceRecord }, idx) => (
              <tr key={advanceRecord._id || idx}>
                <td>{`${firstname || ""} ${lastname || ""}`.trim()}</td>
                <td>{advanceRecord?.givenBy?.firstname || "Admin"}</td>
                <td>{advanceRecord?.amount}</td>
                <td>{dateFormat(advanceRecord?.date).fullDateAndTime || "N/A"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function MyAdvance({ advance }) {
  return (<div className="overflow-x-auto flex-1 overflow-y-auto">
    <table className="table table-auto outline min-w-3xl w-full">
      <thead className="bg-neutral-400 sticky top-0 z-10">
        <tr>
          <th>Given By</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Note</th>
          <th>Photo</th>
        </tr>
      </thead>
      <tbody>
        {advance?.length ? advance?.map(ad => (
          <tr key={ad._id}>
            <td>{ad?.givenBy?.firstname} {ad?.givenBy?.lastname}</td>
            <td>{ad?.amount}</td>
            <td>{dateFormat(ad?.date).fullDateAndTime || "na"}</td>
            <td>{ad?.note}</td>
            <td>{ad?.photo}</td>
          </tr>
        )) : (
          <tr>
            <td colSpan="5" className="text-center py-4 text-gray-500">No advance records found</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>)
}

function TodaysAdvance({ usersWithAdvanceToday }) {
  return (
    <div className="overflow-x-auto flex-1 overflow-y-auto">
      <table className="table outline outline-neutral-400 w-full">
        <thead className="bg-neutral-300 sticky top-0 z-10">
          <tr>
            <th>Name</th>
            <th>Given By</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {usersWithAdvanceToday.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-5 text-gray-500">No advance record for today</td>
            </tr>
          ) : (
            usersWithAdvanceToday.map(emp => {
              const todayAd = emp.advance.find(ad => new Date(ad.date).setHours(0, 0, 0, 0) === todayMidnight);
              return (
                <tr key={emp._id}>
                  <td>{`${emp.firstname || ""} ${emp.lastname || ""}`.trim()}</td>
                  <td>{todayAd?.givenBy?.firstname || "Admin"}</td>
                  <td>{todayAd?.amount}</td>
                  <td>{dateFormat(todayAd?.date).fullDateAndTime || "N/A"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  )
}