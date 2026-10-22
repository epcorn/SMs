import { useLogout } from "@/hooks/authHooks";
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

const classes = "w-5 h-5 text-slate-400 transition-colors";
const links = [
  {
    label: "Dashboard",
    link: "dashboard",
    icon: <LayoutDashboard className={classes} />,
    role: ["admin", "operator", "employee"],
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
    role: ["admin", "operator", "employee"],
  },
  {
    label: "Mark Attendance",
    link: "attendence",
    icon: <Highlighter className={classes} />,
    role: ["admin", "operator", "employee"],
  },
  // {
  //   label: "Advance",
  //   link: "advance",
  //   icon: <CircleDollarSign className={classes} />,
  //   role: ["admin", "operator", "employee"],
  // },
  {
    label: "GPS",
    link: "gps",
    icon: <MapPin  className={classes} />,
    role: ["admin"],
  },
];

function Sidebar({ children }) {
  const user = useAuthStore((state) => state.user);
  const { mutateAsync: logout, isPending: loggingOut } = useLogout();

  const location = useLocation();
  const activeLocation = location.pathname.replace("/", "");

  return (
    <div className="drawer lg:drawer-open h-screen">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        {/* Navbar for Mobile devices (hidden on large screens) */}
        <nav className="navbar w-full bg-slate-900 text-white border-b border-slate-800 lg:hidden px-4 justify-between">
          <div className="flex items-center gap-3">
            <label
              htmlFor="my-drawer-4"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost hover:bg-slate-800 text-rose-300"
            >
              <Library />
            </label>
            <span className="font-bold tracking-wide">SMs Menu</span>
          </div>
        </nav>

        {/* Main Page Content rendered here */}
        <main className="flex-1 overflow-y-auto p-2 w-full bg-slate-50">
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
            <img src="src/assets/logo.png" alt="" className=""/>
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

            <li className="">
              
            </li>
            {/* Logout Action */}
            <li className="mt-auto mb-6">
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
