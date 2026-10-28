import Pagination from "@/components/oth/Pagination";
import { useGetAdvances } from "@/hooks/empHooks";
import { dateFormat } from "@/utils/helperfn";
import { useState } from "react";

function Advance() {
  const [state, setState] = useState({ page: 1, limit: 5, date: null });

  const { data: advanceData } = useGetAdvances({
    date: state.date,
    limit: state.limit,
    page: state.page
  });
  const { page = 1, pages = 1, total = 0 } = advanceData || {};
  const onchange = (newpage) => {
    setState(prev => ({ ...prev, page: newpage }))
  }
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="m-4 flex justify-between shrink-0">
        <h3 className="text-2xl font-semibold">All Employee Advance</h3>
        <input
          type="date"
          className="input max-w-fit"
          onChange={(e) => setState((prev) => ({ ...prev, date: e.target.value || null, page: 1 }))}
        />
      </div>
      <AllAdvances allAdvancesList={advanceData?.advances} paginationData={{ page, pages, total, onchange }} />
    </div>
  );
}

export default Advance;

function AllAdvances({ allAdvancesList, paginationData }) {
  const { page, pages, total, onchange } = paginationData
  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden m-4 mt-0 outline outline-neutral-400 rounded-lg">
      {/* Scrollable table container separated from pagination */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[80dvh]">
        <table className="table table-pin-rows table-pin-cols max-h-[80dvh] w-full">
          <thead className="[&_th]:bg-neutral-300 sticky top-0 z-10">
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Email</th>
              <th>Given By</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {!allAdvancesList?.length ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-gray-500">
                  No advance records found
                </td>
              </tr>
            ) : (
              allAdvancesList?.map(({ amount, date, email, employeeName, note, image, givenBy }, idx) => (
                <tr key={idx}>
                  <td>{dateFormat(date)?.fullDateAndTime || "N/A"}</td>
                  <td>{employeeName}</td>
                  <td>{email}</td>
                  <td>{givenBy?.firstname ? `${givenBy.firstname} ${givenBy.lastname || ""}` : "System"}</td>
                  <td>{amount} ₹</td>
                  <td>{note || "—"}</td>
                  <td>
                    {image ? (
                      <a href={image} target="_blank" rel="noreferrer" className="link link-primary">
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pinned Pagination at the bottom */}
      <div className="shrink-0 p-2 border-t border-neutral-300 bg-base-100 flex justify-center">
        <Pagination page={page} pages={pages} total={total} onchange={onchange} />
      </div>
    </div>
  );
}
// function MyAdvance({ advance }) {
//   return (<div className="overflow-x-auto flex-1 overflow-y-auto">
//     <table className="table table-auto outline min-w-3xl w-full">
//       <thead className="bg-neutral-400 sticky top-0 z-10">
//         <tr>
//           <th>Given By</th>
//           <th>Amount</th>
//           <th>Date</th>
//           <th>Note</th>
//           <th>Photo</th>
//         </tr>
//       </thead>
//       <tbody>
//         {advance?.length ? advance?.map(ad => (
//           <tr key={ad._id}>
//             <td>{ad?.givenBy?.firstname} {ad?.givenBy?.lastname}</td>
//             <td>{ad?.amount}</td>
//             <td>{dateFormat(ad?.date).fullDateAndTime || "na"}</td>
//             <td>{ad?.note}</td>
//             <td>{ad?.photo}</td>
//           </tr>
//         )) : (
//           <tr>
//             <td colSpan="5" className="text-center py-4 text-gray-500">No advance records found</td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   </div>)
// }

// function TodaysAdvance({ usersWithAdvanceToday }) {
//   return (
//     <div className="overflow-x-auto flex-1 overflow-y-auto">
//       <table className="table outline outline-neutral-400 w-full">
//         <thead className="bg-neutral-300 sticky top-0 z-10">
//           <tr>
//             <th>Name</th>
//             <th>Given By</th>
//             <th>Amount</th>
//             <th>Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {usersWithAdvanceToday.length === 0 ? (
//             <tr>
//               <td colSpan={4} className="text-center py-5 text-gray-500">No advance record for today</td>
//             </tr>
//           ) : (
//             usersWithAdvanceToday.map(emp => {
//               const todayAd = emp.advance.find(ad => new Date(ad.date).setHours(0, 0, 0, 0) === todayMidnight);
//               return (
//                 <tr key={emp._id}>
//                   <td>{`${emp.firstname || ""} ${emp.lastname || ""}`.trim()}</td>
//                   <td>{todayAd?.givenBy?.firstname || "Admin"}</td>
//                   <td>{todayAd?.amount}</td>
//                   <td>{dateFormat(todayAd?.date).fullDateAndTime || "N/A"}</td>
//                 </tr>
//               );
//             })
//           )}
//         </tbody>
//       </table>
//     </div>
//   )
// }