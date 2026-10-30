import { useGetMe, useLogout } from "@/hooks/authHooks";
import useAuthStore from "@/store/authStore";
import {
  CircleDollarSign,
  FaceGrinning,
  Highlighter,
  LayoutDashboard,
  Library, LogOutIcon,
  MapPin,
  Users
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from '../../assets/logo.png'
import { dateFormat } from "@/utils/helperfn";

const classes = "w-5 h-5 text-slate-400 transition-colors";
const links = [
  {
    label: "Dashboard",
    link: "dashboard",
    icon: <LayoutDashboard className={classes} />,
    role: ["admin", "operator"],
  },
  {
    label: "Employee",
    link: "employee",
    icon: <Users className={classes} />,
    role: ["admin", "operator"],
  },
  {
    label: "Leave",
    link: "leave",
    icon: <FaceGrinning className={classes} />,
    role: ["admin", "operator"],
  },
  {
    label: "Mark Attendance",
    link: "attendence",
    icon: <Highlighter className={classes} />,
    role: ["admin", "operator", "employee"],
  },
  {
    label: "Advance",
    link: "advance",
    icon: <CircleDollarSign className={classes} />,
    role: ["admin", "operator", "employee"],
  },
  {
    label: "GPS",
    link: "gps",
    icon: <MapPin className={classes} />,
    role: ["admin"],
  },
];

function Sidebar({ children }) {
  const user = useAuthStore((state) => state.user);
  const { mutateAsync: logout, isPending: loggingOut } = useLogout();
  const { data: me } = useGetMe()

  const checkIn = me?.attendenceRecords?.[0]?.checkInTime || null;
  const checkOut = me?.attendenceRecords?.[0]?.checkOutTime || null;
  const totalWorkingHours = me?.attendenceRecords?.[0]?.totalWorkingHours || 0;

  const location = useLocation();
  const activeLocation = location.pathname.replace("/", "");

  return (
    <div className="drawer lg:drawer-open h-screen">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        {/* Navbar for Mobile devices (hidden on large screens) */}
        <nav className="navbar w-full bg-slate-900 text-white lg:hidden px-4 justify-between">
          <div className="navbar w-full bg-slate-900 text-white border-b border-slate-800 lg:hidden px-4 justify-between">
            <div className="flex items-center gap-3">
              <label
                htmlFor="my-drawer-4"
                aria-label="Open sidebar"
                className="btn btn-square btn-ghost hover:bg-slate-800 text-rose-300"
              >
                <Library />
              </label>

              <span className="font-bold tracking-wide">SMs Menu</span>
            </div>

            {/* Mobile avatar dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="mask mask-hexagon-2 w-10">
                  <img
                    alt="User avatar"
                    src={
                      me?.photo ||
                      "https://res.cloudinary.com/epcorn/image/upload/v1711437894/employee/tmp-1-1711437811427_xkm42n.png"
                    }
                  />
                </div>
              </div>

              <div
                tabIndex={0}
                className="dropdown-content z-99 mt-3 w-72 rounded-box border border-base-300 bg-base-100 p-4 text-slate-900 shadow-xl"
              >
                <ProfileDetails
                  me={me}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  workingHour={totalWorkingHours}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Page Content rendered here */}
        <main className="flex-1 overflow-y-auto min-h-0 p-0 w-full h-full bg-slate-50">
          {children}
        </main>
      </div>

      {/* Sidebar Drawer Container */}
      <div className="drawer-side z-9999">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        {/* Left Side Navigation Board - Upgraded to Premium Dark Slate Theme */}
        <div className="flex min-h-full flex-col items-start bg-slate-900 w-64 border-r border-slate-800 text-slate-300">
          {/* Sidebar Header Title */}
          <div className="px-6 py-5 border-b border-slate-800 w-full grid grid-cols-3 items-center">
            <img src={logo} alt="" className="" />
            <h3 className="col-span-2 font-extrabold text-2xl text-rose-300 tracking-wide">
              SMs
            </h3>
            <p className="col-span-full text-xs text-slate-400 mt-1 hidden lg:block">
              Squad Management System
            </p>
          </div>

          {/* Navigation Links */}
          <ul className="menu w-full grow p-4 gap-1.5">
            {links.map((li) => {
              const isActive = activeLocation === li.link;
              if (!li.role.includes(user?.user?.role)) {
                return;
              }
              return (
                <li key={li.link}>
                  <Link
                    to={li.link}
                    className={`flex focus-within:bg-rose-400/20 focus:text-white items-center gap-4 py-3 px-4 rounded-xl transition-all duration-200 group font-semibold text-sm
                      ${isActive
                        ? "bg-rose-400/20 border-l-4 text-white border-l-rose-400 shadow-lg shadow-rose-300/10 scale-[1.02]"
                        : "hover:bg-rose-400/30 hover:text-white"
                      }`}
                  >
                    {/* Keeps the icon matching text colors correctly */}
                    <span className={`${isActive ? "[&_svg]:text-white" : ""}`}>
                      {li.icon}
                    </span>
                    <span>{li.label}</span>
                  </Link>
                </li>
              );
            })}



            {/* Desktop profile accordion */}
            <div className="hidden lg:block w-full mt-auto px-0 pb-4">
              <details className="collapse collapse-arrow rounded-xl border border-slate-700 bg-slate-800/60">
                <summary className="collapse-title min-h-0 px-1 py-2">
                  <div className="flex items-center gap-1 pr-2">
                    <div className="avatar shrink-0">
                      <div className="mask mask-hexagon-2 w-10">
                        <img
                          alt="User avatar"
                          src={
                            me?.photo ||
                            "https://img.daisyui.com/images/profile/demo/distracted2@192.webp"
                          }
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {[me?.firstname, me?.lastname]
                          .filter(Boolean)
                          .join(" ") || "Employee"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        View profile
                      </p>
                    </div>
                  </div>
                </summary>

                <div className="collapse-content px-3 text-slate-200">
                  <div className="border-t border-slate-700 pt-3">
                    <p className="break-words text-sm">
                      {me?.email || "N/A"}
                    </p>
                    <p className="mt-2 text-sm">
                      Phone: {me?.phone || "N/A"}
                    </p>
                    <p className="mt-2 text-sm">
                      Check-in:{" "}
                      {checkIn
                        ? dateFormat(checkIn)?.fullDateAndTime
                        : "No attendance record"}
                    </p>
                    <p className="mt-2 text-sm">
                      Check-out:{" "}
                      {checkOut
                        ? dateFormat(checkOut)?.fullDateAndTime
                        : "---"}
                    </p>
                    {totalWorkingHours ?
                      <p>
                        <span className="font-medium">Total hours: </span>
                        {totalWorkingHours}
                      </p> : ""}
                  </div>
                </div>
              </details>
            </div>

            {/* Logout Action */}
            <li className="mt-auto mb-6">
              <img src="" alt="" />
              <button
                onClick={logout}
                disabled={loggingOut}
                className="flex items-center gap-4 py-3 px-4 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-xl transition-all duration-200 w-full text-left font-semibold text-sm group"
              >
                <LogOutIcon className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Logout</span>
              </button>
            </li>
          </ul>


        </div>
      </div>
    </div>
  );
}

export default Sidebar;


function ProfileDetails({ me, checkIn, checkOut, workingHour }) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-base-300 pb-3">
        <div className="avatar">
          <div className="mask mask-hexagon-2 w-12">
            <img
              alt="User avatar"
              src={
                me?.photo ||
                "https://res.cloudinary.com/epcorn/image/upload/v1711437894/employee/tmp-1-1711437811427_xkm42n.png"
              }
            />
          </div>
        </div>

        <div className="min-w-0">
          <p className="font-semibold">
            {[me?.firstname, me?.middlename, me?.lastname]
              .filter(Boolean)
              .join(" ") || "Employee"}
          </p>
          <p className="truncate text-sm opacity-70">
            {me?.email || "N/A"}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-3 text-sm">
        <p>
          <span className="font-medium">Phone:</span>{" "}
          {me?.phone || "N/A"}
        </p>

        <p>
          <span className="font-medium">Check-in:</span>{" "}
          {checkIn
            ? dateFormat(checkIn)?.fullDateAndTime
            : "No attendance record"}
        </p>

        <p>
          <span className="font-medium">Check-out:</span>
          {checkOut ? dateFormat(checkOut)?.fullDateAndTime
            : "---"}
        </p>
        {workingHour ? <p>
          <span className="font-medium">Total hours</span>
          {workingHour}
        </p> : ""}
      </div>
    </>
  );
}