import { useGetMe, useLogout } from "@/hooks/authHooks";
import {
  CircleDollarSign, Highlighter,
  LayoutDashboard,
  Library, LogOutIcon,
  MapPin,
  Users
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from '../../assets/logo.png';
import { dateFormat } from "@/utils/helperfn";

const classes = "w-5 h-5 text-theme-text/80 transition-colors";
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
    label: "Mark Attendance",
    link: "attendence",
    icon: <Highlighter className={classes} />,
    role: ["admin", "operator", "employee"],
  },
  {
    label: "Advance",
    link: "advance",
    icon: <CircleDollarSign className={classes} />,
    role: ["admin", "operator"],
  },
  {
    label: "GPS",
    link: "gps",
    icon: <MapPin className={classes} />,
    role: ["admin"],
  },
];

function Sidebar({ children }) {

  const { mutateAsync: logout, isPending: loggingOut } = useLogout();
  const { data: me, isPending } = useGetMe()

  const checkIn = me?.attendenceRecords?.[0]?.checkInTime || null;
  const checkOut = me?.attendenceRecords?.[0]?.checkOutTime || null;
  const totalWorkingHours = me?.attendenceRecords?.[0]?.totalWorkingHours || 0;

  const location = useLocation();
  const activeLocation = location.pathname.replace("/", "");

  // Function to close the drawer on mobile when a link is clicked
  const handleLinkClick = () => {
    const drawerCheckbox = document.getElementById("my-drawer-4");
    if (drawerCheckbox) {
      drawerCheckbox.checked = false;
    }
  };



  return (
    <div className="drawer lg:drawer-open h-screen">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        {/* Navbar for Mobile devices (hidden on large screens) */}
        <nav className="navbar w-full bg-theme-bg text-theme-text lg:hidden px-4 justify-between">
          <div className="navbar w-full bg-theme-bg text-theme-text border-b border-theme-bg lg:hidden px-4 justify-between">
            <div className="flex items-center gap-3">
              <label
                htmlFor="my-drawer-4"
                aria-label="Open sidebar"
                className="btn btn-square btn-ghost hover:bg-theme-hover text-theme-text"
              >
                <Library />
              </label>

              <span className="font-bold tracking-wide text-theme-text">SMs Menu</span>
            </div>

            {/* Mobile avatar dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar hover:bg-theme-hover"
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
        <main className="flex-1 overflow-y-auto min-h-0 p-0 w-full h-full bg-white">
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

        {/* Left Side Navigation Board */}
        <div className="flex min-h-full flex-col items-start bg-theme-bg text-theme-text w-64 border-r border-theme-hover/40">
          {/* Sidebar Header Title */}
          <div className="px-6 py-3 border-b-2 border-[#e07000] w-full grid grid-cols-3 items-center">
            <img src={logo} alt="" className="" />
            <h3 className="col-span-2 font-extrabold text-2xl text-theme-text tracking-wide">
              SMs
            </h3>
            <p className="col-span-full text-xs text-theme-text/80 mt-1 ">
              Squad Management System
            </p>
          </div>

          {/* Desktop profile accordion */}
          {isPending ? <div className="skeleton bg-theme-bg-light mt-2 rounded-none h-20 w-full"></div> :
            <div className="hidden lg:block w-full rounded-none mt-2 px-0 pb-4">
              <details className="collapse collapse-arrow pl-3 rounded-none bg-theme-bg-hard text-theme-text">
                <summary className="collapse-title min-h-0 px-1 py-2 transition-colors">
                  <div className="flex items-center gap-1 pr-2">
                    <div className="avatar shrink-0">
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
                      <p className="truncate text-sm font-semibold text-theme-text">
                        {[me?.firstname, me?.lastname]
                          .filter(Boolean)
                          .join(" ") || "Employee"}
                      </p>
                      <p className="truncate text-xs text-theme-text/80">
                        {me?.email}
                      </p>
                    </div>
                  </div>
                </summary>

                <div className="collapse-content px-3 text-theme-text">
                  <div className="border-t border-theme-hover pt-3">

                    <p className="mt-2 text-sm text-theme-text">
                      Check-in:{" "}
                      {checkIn
                        ? dateFormat(checkIn)?.fullDateAndTime
                        : "No attendance record"}
                    </p>
                    <p className="mt-2 text-sm text-theme-text">
                      Check-out:{" "}
                      {checkOut
                        ? dateFormat(checkOut)?.fullDateAndTime
                        : "---"}
                    </p>
                    {totalWorkingHours ?
                      <p className="text-theme-text">
                        <span className="font-medium">Total hours: </span>
                        {totalWorkingHours}
                      </p> : ""}
                  </div>
                </div>
              </details>
            </div>}

          {/* Navigation Links */}
          <ul className="menu w-full grow py-4 pl-3 pr-0 gap-1.5">
            {links.map((li) => {
              const isActive = activeLocation === li.link;
              if (!li.role.includes(me?.role)) {
                return;
              }
              return (
                <li key={li.link}>
                  <Link
                    to={li.link}
                    onClick={handleLinkClick}
                    className={`flex focus-within:bg-theme-hover focus:text-theme-text items-center gap-4 py-3 px-4 rounded-l-xl rounded-r-none transition-all duration-200 group font-semibold text-sm text-theme-text
                      ${isActive
                        ? "bg-theme-hover border-l-4 text-theme-text border-l-blue-700 shadow-md scale-[1.02]"
                        : "hover:bg-theme-hover/50 hover:text-theme-text"
                      }`}
                  >
                    {/* Keeps the icon matching text colors correctly */}
                    <span className={`${isActive ? "[&_svg]:text-theme-text" : ""}`}>
                      {li.icon}
                    </span>
                    <span>{li.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Logout Action */}
            <li className="mt-auto mb-6 mr-3">
              <button
                className="btn text-white bg-theme-hover border-0"
                onClick={() => {
                  handleLinkClick();
                  logout();
                }}
                disabled={loggingOut}
              >Logout</button>
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
        <p className="hidden">
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