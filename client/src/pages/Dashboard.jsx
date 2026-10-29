// Dashboard.jsx
import React, { Fragment } from "react"
import DashboardStats from "@/components/admin/DashboardStats"
import DashboardTable from "@/components/admin/DashboardTable"
import { useGetDashboardUserStats } from "@/hooks/authHooks"

const TABS = [
  { label: "All Present",   prop: "presents",  key: "allPresent",   name: "presents" },
  { label: "All Absents",   prop: "absents",   key: "allAbsent",    name: "absents" },
  { label: "Half-Day",      prop: "halfday",   key: "allHalfday",   name: "halfday" },
  { label: "All Checkouts", prop: "checkouts", key: "allCheckouts", name: "checkouts" },
]

function Dashboard() {
  const { data: userStats } = useGetDashboardUserStats()

  return (
    // exactly viewport height, page itself never scrolls
    <div className="h-dvh overflow-hidden p-4 sm:p-6 flex flex-col border">
      <header className="my-3 shrink-0">
        <h2 className="text-3xl font-bold">Dashboard</h2>
      </header>

      <div className="shrink-0">
        <DashboardStats />
      </div>

      {/* takes whatever height is left */}
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
      </div>
    </div>
  )
}

export default Dashboard