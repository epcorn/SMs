import { Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Employees from "./pages/Employees";
import Leave from "./pages/Leave";
import Attendence from "./pages/Attendence";
import Login from "./components/oth/Login";
import GPS from "./pages/GPS";
import useGpsStore from "./store/gpsStore";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import { useGetCoOrdinatesMutation } from "./hooks/empHooks";
import Advance from "./pages/Advance";
import useDocumentTitle from "./hooks/useDocumentTitle";

function App() {
  useDocumentTitle()

  const startTracking = useGpsStore((state) => state.startTracking);
  const stopTracking = useGpsStore((state) => state.stopTracking);
  const user = useAuthStore((state) => state.user);
  const location = useGpsStore((state) => state.location);

  const { mutateAsync: setCoords } = useGetCoOrdinatesMutation();

  useEffect(() => {
    if (!location || !user?.user?.id) return;

    const sendCoords = async () => {
      try {
        await setCoords({
          coords: [location.longitude, location.latitude],
          id: user?.user?.id,
        });
      } catch (err) {
        console.error("Failed to update database coordinates:", err);
      }
    };

    sendCoords();
  }, [location, user?.user?.id, setCoords]);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);


  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          {/* ROLE protected */}
          <Route element={<ProtectedRoutes role={["admin", "operator"]} />}>
            <Route path="/employee" element={<Employees />} />
          </Route>

          <Route element={<ProtectedRoutes role={["admin"]} />}>
            <Route path="/gps" element={<GPS />} />
          </Route>

          <Route element={<ProtectedRoutes role={["admin", "operator"]} />}>
            <Route path="/employee" element={<Employees />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leave" element={<Leave />} />
          </Route>


          <Route element={<ProtectedRoutes role={["admin", "operator", "employee"]} />}>
            <Route path="/attendence" element={<Attendence />} />
            <Route path="/advance" element={<Advance />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
