import DashboardStats from "@/components/admin/DashboardStats"
import DashboardTable from "@/components/admin/DashboardTable"
import { useGetDashboardUserStats } from "@/hooks/authHooks"

function Dashboard() {

  const { data: userStats } = useGetDashboardUserStats()

  return (
    <div className="p-4 sm:p-6 pb-20 min-h-full border flex flex-col">
      <header className="my-3">
        <h2 className="text-3xl font-bold">Dashboard</h2>
      </header>
      <DashboardStats />
      {/* Tabs container */}
      <div className="flex-1 tabs tabs-md mt-5 bg-gray-300 tabs-box tabs-border flex">
        <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label="All Present" defaultChecked />
        <div className="tab-content bg-base-100 border-base-300 mb-auto p-0 rounded-b-box shadow-sm w-full outline ">
          <DashboardTable presents={userStats?.allPresent} label='presents' />
        </div>

        <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label="All Absents" />
        <div className="tab-content bg-base-100 border-base-300 p-0 rounded-b-box shadow-sm w-full h-full">
          <DashboardTable absents={userStats?.allAbsent} label='absents' />
        </div>

        <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label="Half-Day" />
        <div className="tab-content bg-base-100 border-base-300 p-0 rounded-b-box shadow-sm w-full h-full">
          <DashboardTable halfday={userStats?.allHalfday} label='halfday' />
        </div>

        <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label="All Checkouts" />
        <div className="tab-content bg-base-100 border-base-300 p-0 rounded-b-box shadow-sm w-full h-full">
          <DashboardTable checkouts={userStats?.allCheckouts} label='checkouts' />
        </div>
      </div>
    </div>
  )
}

export default Dashboard