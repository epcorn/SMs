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

  const usersWithAdvanceToday = allUsers.filter(user => {

    return user.advance && user.advance.some(ad => {
      return new Date(ad.date).setHours(0, 0, 0, 0) === todayMidnight;
    });
  });

  return (

    < div className="h-full flex flex-col overflow-hidden" >
      <div className="tabs bg-neutral-500 p-2 h-full flex-1 flex flex-col overflow-hidden border-0">

        {user.role !== "employee" && (
          <>
            <input type="radio" name="my_tabs_3" className="tab text-white font-medium checked:text-black" aria-label="All Employee Advance" />
            <div className="tab-content bg-base-100 border-base-300 p-6 flex-1 flex flex-col overflow-hidden">

            </div>


            <input type="radio" name="my_tabs_3" className="tab text-white font-medium checked:text-black" aria-label="Todays Advance" />
            <div className="tab-content bg-base-100 border-base-300 p-6 flex-1 flex flex-col overflow-hidden">
              <div className="overflow-x-auto flex-1 overflow-y-auto">
                <table className="table outline outline-neutral-400">
                  <thead className="bg-neutral-300 sticky top-0 z-10">
                    <tr>
                      <th>Name</th>
                      <th>Given By</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersWithAdvanceToday.length === 0 ? <tr>
                      <td colSpan={4}> <p className="text-center py-5">No advance record for today</p></td>
                    </tr> : usersWithAdvanceToday?.map(user => (
                      <tr key={user._id}>
                        <td>{user.firstname}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}

        <input type="radio" name="my_tabs_3" className="tab checked:tab-active text-white checked:text-black font-medium" aria-label="My Advance Data" defaultChecked />

        {/* 2. Make tab-content a flex container that handles its own internal scroll */}
        <div className="tab-content bg-base-100 border-base-300 p-6 flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto flex-1 overflow-y-auto">
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
          </div>
        </div>

      </div>
    </div >
  );
}

export default Advance;