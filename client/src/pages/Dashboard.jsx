import React, { useState } from "react"
import DashboardStats from "@/components/admin/DashboardStats"
import DashboardTable from "@/components/admin/DashboardTable"
import { useGetDashboardStats, useGetDashboardUserStats } from "@/hooks/authHooks"
import { useGetDuties } from "@/hooks/empHooks"
import { dateFormat } from "@/utils/helperfn"


const TABS = [
  { label: "All Present", prop: "presents", key: "allPresent", name: "presents" },
  { label: "All Absents", prop: "absents", key: "allAbsent", name: "absents" },
  { label: "Half-Day", prop: "halfday", key: "allHalfday", name: "halfday" },
  { label: "All Checkouts", prop: "checkouts", key: "allCheckouts", name: "checkouts" },
];

function Dashboard() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: userStats, isLoading: dashLoading } = useGetDashboardUserStats(date);
  const { data: statsData, isPending: gettingStats } = useGetDashboardStats(date);
  const { data: dutyData, } = useGetDuties(currentDate);

  if (dashLoading || gettingStats) {
    return (
      <div className="grid place-items-center h-full">
        <span className="loading loading-bars loading-xl"></span>
      </div>
    )
  }
  return (
    <div className="h-dvh overflow-hidden p-4 sm:p-6 flex flex-col border">
      <header className="my-3 shrink-0">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <input type="date" className="input w-fit" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </header>

      <div className="shrink-0">
        <DashboardStats gettingStats={gettingStats} statsData={statsData} />
      </div>

      <div className="tabs tabs-md tabs-box tabs-border content-start flex-1 min-h-0 mt-5 bg-gray-300">
        {TABS.map((t, i) => (
          <React.Fragment key={t.prop}>
            <input
              type="radio"
              name="my_tabs_6"
              className="tab font-bold"
              aria-label={t.label}
              defaultChecked={i === 0}
            />
            <div className="tab-content bg-base-100 border-base-300 p-0 rounded-b-box shadow-sm w-full h-[calc(100%-var(--tab-height))] min-h-0 overflow-hidden">
              <DashboardTable {...{ [t.prop]: userStats?.[t.key] }} label={t.name} />
            </div>
          </React.Fragment>
        ))}

        <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label={'Duties'} />
        <div className="tab-content bg-base-100 border-base-300 p-0 rounded-b-box shadow-sm w-full h-[calc(100%-var(--tab-height))] min-h-0 overflow-hidden">
          <Duties dutyData={dutyData} currentDate={currentDate} setCurrentDate={setCurrentDate} />
        </div>

      </div>
    </div>
  )
}
export default Dashboard;


const MoveMent = ({ onClick }) => <button onClick={onClick} className="cursor-pointer">◀ Prev</button>;
const MoveRight = ({ onClick }) => <button onClick={onClick} className="cursor-pointer">Next ▶</button>;

function Duties({ dutyData, currentDate, setCurrentDate }) {


  // Helper function to shift days
  const handleDateChange = (daysToMove) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + daysToMove);

    // Format back to YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    setCurrentDate(formattedDate);
  };

  // Handle manual input changes
  const handleInputChange = (e) => {
    setCurrentDate(e.target.value);
  };

  return (
    <div>
      <div className="flex justify-between m-1 rounded-md bg-gray-200 px-2">
        <MoveMent onClick={() => handleDateChange(-1)} />
        <input
          type="date"
          value={currentDate}
          onChange={handleInputChange}
          className="border p-1 rounded input"
        />
        <MoveRight onClick={() => handleDateChange(1)} />
      </div>
      <div className="max-h-full h-full overflow-auto">
        <table className="table table-pin-rows table-pin-cols w-full min-w-2xl">
          <thead className="[&_th]:bg-gray-300">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Duty Start Time</th>
              <th>Duty End Time</th>
              <th>Instruction</th>
            </tr>
          </thead>
          <tbody>
            {dutyData?.length > 0 ? dutyData?.map((d, idx) => {
              return (
                <tr key={d?._id}>
                  <td>{idx + 1}</td>
                  <td>{d?.user?.firstname} {d?.user?.middlename} {d?.user?.lastname}</td>
                  <td>{dateFormat(d?.startTime)?.fullDateAndTime}</td>
                  <td>{dateFormat(d?.endTime)?.fullDateAndTime}</td>
                  <td>{d?.instruction}</td>
                </tr>
              )
            }) : <tr>
              <td colSpan={5} className="text-center py-12">No Duties found</td>
            </tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
