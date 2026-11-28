import useAuthStore from "@/store/authStore";
import { getCreateDeviceId } from "@/utils/device";
import { fetchFn } from "@/utils/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const deviceId = getCreateDeviceId();

const useLoginMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["user"],
    mutationFn: async (creds) => {
      console.log(creds);
      const data = await fetchFn("auth/login", { method: "POST", body: creds });

      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("emp-user", JSON.stringify(data));
      useAuthStore.getState().setUser(data);
      qc.invalidateQueries({ queryKey: ["user", "dash"] });
    },
  });
};

const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["user"],
    mutationFn: async () => {
      await fetchFn("auth/logout", { method: "POST", body: { deviceId } });
      return { msg: "logout success" };
    },
    onSuccess: () => {
      localStorage.removeItem("emp-user");
      useAuthStore.getState().clearUser();
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

const useChangePassword = () => {
  return useMutation({
    mutationKey: ["user"],
    mutationFn: async (creds) => {
      await fetchFn("user/changepassword", { method: "POST", body: creds });
      return { msg: "User updated successfully" };
    },
  });
};

const useGetDashboardStats = (date) => {
  return useQuery({
    queryKey: ["user", "dash", date],
    queryFn: async () => {
      const stats = await fetchFn(`dash/stats?date=${date}`);
      return stats;
    },
  });
};

const useGetDashboardUserStats = (date, options = {}) => {
  return useQuery({
    queryKey: ["dash", "user-stats", date],
    queryFn: async () => {
      const stats = await fetchFn(`dash/userStats?date=${date}`);
      return stats;
    },
    ...options,
  });
};

const useGetMonthlyReports = (options = {}) => {
  return useMutation({
    mutationKey: ["monthly-attendance-report"],
    mutationFn: async () => {
      const res = await fetch("/api/user/report", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to download report (${res.status})`);
      }

      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || "Monthly_Attendance.xlsx";

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    ...options,
  });
};

const useGetMe = (options = {}) => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const stats = await fetchFn("user/me");
      return stats;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });
};

export {
  useLoginMutation,
  useLogout,
  useChangePassword,
  useGetDashboardStats,
  useGetDashboardUserStats,
  useGetMonthlyReports,
  useGetMe,
};
