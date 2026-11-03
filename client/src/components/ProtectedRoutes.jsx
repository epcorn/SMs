import { useGetMe } from "@/hooks/authHooks";
import useAuthStore from "@/store/authStore";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoutes({ role = [] }) {
  const user = useAuthStore((state) => state.user);
  const me = useGetMe();
  console.log(me)
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
