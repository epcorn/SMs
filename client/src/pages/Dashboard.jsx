import DashboardStats from "@/components/admin/DashboardStats"
import DashboardTable from "@/components/admin/DashboardTable"
import { useGetDashboardUserStats } from "@/hooks/authHooks"
import { useState } from "react"

function Dashboard() {
  const [querySwitch, setQuerySwitch] = useState({ id: "", status: false })
  const { data: userStats } = useGetDashboardUserStats()

  return (
    <div className="p-4 sm:p-6 pb-20 w-full min-h-full">
      <header className="my-3">
        <h2 className="text-3xl font-bold">Dashboard</h2>
      </header>
      <DashboardStats />

      {/* Tabs container */}
      <div className="tabs tabs-md mt-5 tabs-border bg-gray-300 tabs-box">
        <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label="All Present" defaultChecked />
        <div className="tab-content bg-base-100 border-base-300 p-6 rounded-b-box shadow-sm">
          <DashboardTable presents={userStats?.allPresent} label='presents' />
        </div>

        <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label="All Absents" />
        <div className="tab-content bg-base-100 border-base-300 p-6 rounded-b-box shadow-sm">
          <DashboardTable absents={userStats?.allAbsent} label='absents' />
        </div>

        <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label="Half-Day" />
        <div className="tab-content bg-base-100 border-base-300 p-6 rounded-b-box shadow-sm">
          <DashboardTable halfday={userStats?.allHalfday} label='halfday' />
        </div>

        <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label="All Checkouts" />
        <div className="tab-content bg-base-100 border-base-300 p-6 rounded-b-box shadow-sm">
          <DashboardTable checkouts={userStats?.allCheckouts} label='checkouts' />
        </div>
      </div>
    </div>
  )
}

export default Dashboard