import { fetchFn } from "@/utils/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useGetHolidaysQuery = () => {
  return useQuery({
    queryKey: ["holiday"],
    queryFn: async () => {
      const res = await fetchFn("emp/holidays");
      return res;
    },
  });
};

const useMarkAttandence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["mark"],
    mutationFn: async (data) => {
      const att = await fetchFn("emp/mark", {
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      });
      return att;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mark", "user", "assign"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user", "mark", "file-upload", "active"],
      });
    },
  });
};

const useAssignAttendence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["mark", "user", "assign"],
    mutationFn: async (data) => {
      const att = await fetchFn("emp/attendence/assign", {
        method: "POST",
        body: data,
      });
      return att;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mark", "user", "assign"] });
    },
  });
};

const useGetAttendenceQuery = (id = "") => {
  return useQuery({
    queryKey: ["mark", "user", "assign", id],
    queryFn: async () => {
      // if (id) return await fetchFn(`emp/attendence/${id}`);

      return await fetchFn(`emp/attendence`);
    },
  });
};

const useGetAllUsers = ({ page = 1, limit = 12, name = "", email = "" }) => {
  const params = Object.fromEntries(
    Object.entries({ page, limit, name, email }).filter(
      ([_, v]) => v !== undefined,
    ),
  );
  const query = new URLSearchParams(params).toString();
  return useQuery({
    queryKey: ["user", "active", "file-upload", "active", params],
    queryFn: async () => {
      const data = await fetchFn(`user/all?${query ? query : ""}`);
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
};

const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["user"],
    mutationFn: async (creds) => {
      const data = await fetchFn("user/add", { method: "POST", body: creds });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
        refetchType: "active",
      });
    },
    onError: (error) => {
      console.error("Mutation failed", error?.message);
    },
  });
};

const useChangePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [],
    mutationFn: async (creds) => {
      const data = await fetchFn("user/changepassword", {
        method: "POST",
        body: creds,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

const useEditUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["user"],
    mutationFn: async ({ creds, id }) => {
      const data = await fetchFn(`user/edit/${id}`, {
        method: "POST",
        body: creds,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
        refetchType: "active",
      });
    },
    onError: (error) => {
      console.error("Mutation failed", error?.message);
    },
  });
};

const useMarkActiveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["active"],
    mutationFn: async ({ status, id }) => {
      const data = await fetchFn(`emp/active/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { status },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "active"] });
    },
  });
};

const useGetCoOrdinatesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["coords", "user"],
    mutationFn: async (coords) => {
      const res = await fetchFn("emp/location/coords", {
        method: "PATCH",
        body: coords,
      });
      return res;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["user", "coords"] }),
  });
};

const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["file-upload"],
    mutationFn: async (file) => {
      const res = await fetchFn(`user/upload`, { method: "POST", body: file });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file-upload"] });
    },
  });
};

export {
  useGetHolidaysQuery,
  useMarkAttandence,
  useAssignAttendence,
  useGetAttendenceQuery,
  useGetAllUsers,
  useAddUser,
  useChangePassword,
  useEditUser,
  useMarkActiveMutation,
  useGetCoOrdinatesMutation,
  useUploadFile,
};
