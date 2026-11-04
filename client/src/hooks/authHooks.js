import useAuthStore from "@/store/authStore";
import { fetchFn } from "@/utils/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

const useLoginMutation = () => {
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
    },
  });
};

const useLogout = () => {
  return useMutation({
    mutationKey: ["user"],
    mutationFn: async () => {
      await fetchFn("auth/logout", { method: "POST" });
      return { msg: "logout success" };
    },
    onSuccess: () => {
      localStorage.removeItem("emp-user");
      useAuthStore.getState().clearUser();
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

const useGetMe = (options = {}) => {
  return useQuery({
    queryKey: ["user", "dash", "user-stats"],
    queryFn: async () => {
      const stats = await fetchFn("user/me");
      return stats;
    },
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
  useGetMe,
};
