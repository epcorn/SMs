import useAuthStore from "@/store/authStore";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoutes({ role = [] }) {
  const user = useAuthStore((state) => state.user);
// console.log(user)
  if (!user && !user?.user?.role) return <Navigate to={"/"} replace />;

  if (user) {
    if (role.length && !role.includes(user?.user?.role)) {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  }
}

export default ProtectedRoutes;
