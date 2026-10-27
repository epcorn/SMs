import { useGetDashboardStats } from '@/hooks/authHooks'
import { dashboardStatsColor } from '@/utils/helperfn'



function DashboardStats() {
  const { data: statsData, isPending: gettingStats } = useGetDashboardStats()

  const statsArray = Object.entries(statsData?.stats || {})?.map(([key, val]) => ({
    label: key,
    value: val
  }))
  statsArray.push({ label: "Total Users", value: statsData?.totalUsers || 0 })

  return (
    <div className='w-full'>
      {gettingStats ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='h-28'>
              <div className='skeleton bg-slate-200 h-full w-full rounded-box' />
            </div>
          ))}
        </div>
      ) : (
        <StatsCard stats={statsArray} />
      )}
    </div>
  )
}

export default DashboardStats


function StatsCard({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 ">
      {stats.map((st) => {
        // Extract the specific color theme for the current label
        const colors = dashboardStatsColor(st.label)
        // console.log(colors)
        return (
          <div
            key={st.label}
            className={`stats border shadow-sm rounded-box transition-all ${colors.bg}`}
          >
            <div className="stat py-4 px-6">
              <div className={`stat-title font-semibold text-xs tracking-wider uppercase ${colors.title}`}>
                {st.label}
              </div>
              <div className={`stat-value text-3xl font-extrabold mt-1 ${colors.value}`}>
                {st.value}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}