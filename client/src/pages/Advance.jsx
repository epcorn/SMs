import { useGetAllUsers } from "@/hooks/empHooks";
import useAuthStore from "@/store/authStore";
import { dateFormat } from "@/utils/helperfn";
import { useState } from "react";


function Advance() {
  const { user } = useAuthStore(state => state.user)
  const [state, setState] = useState({ page: 1, limit: 15 })
  const { data: users } = useGetAllUsers({ limit: state.limit, page: state.page });

  const advance = users?.advance || users?.user || [];

  const allUsers = users?.data || [];
  console.log(allUsers)
  return (
    <div>
      <div className="tabs tabs-lift bg-neutral-500 p-2">
        {user.role !== "employee" &&
          <>
            < input type="radio" name="my_tabs_3" className="tab" aria-label="All Employees" />
            <div className="tab-content bg-base-100 border-base-300 p-6">
              <table className="table outline outline-neutral-400 ">
                <thead className="bg-neutral-300">
                  <tr>
                    <th>Name</th>
                    <th>Given By</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {allUsers.map(u => {

                    return (
                      <tr>
                        <td></td>
                      </tr>
                    )
                  })} */}
                </tbody>
              </table>
            </div>
          </>
        }

        <input type="radio" name="my_tabs_3" className="tab" aria-label="My Advance Data" defaultChecked />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <table className="table outline">
            <thead className="bg-neutral-400 ">
              <tr>
                {/* <th>Name</th> */}
                <th>Given By</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Photo</th>
              </tr>
            </thead>
            <tbody>
              {advance?.length ? advance?.map(ad => (
                <tr key={ad._id}>

                  <td>{ad?.givenBy?.firstname} {ad?.givenBy?.lastname}</td>
                  <td>{ad?.amount}</td>
                  <td>{dateFormat(ad?.date).fullDateAndTime || "na"}</td>
                  <td>{ad?.photo}</td>
                </tr>
              )) : ""}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default Advance;