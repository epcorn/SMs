import { fetchFn } from "@/utils/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMarkAttandence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["mark", "user"],
    mutationFn: async (data) => {
      const att = await fetchFn("emp/mark", { method: "POST", body: data });
      return att;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mark", "user"] });
    },
  });
};

export const useAssignAttendence = () => {
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

export const useGetAttendenceQuery = (id = "") => {
  return useQuery({
    queryKey: ["mark", "user", "assign", id],
    queryFn: async () => {
      // if (id) return await fetchFn(`emp/attendence/${id}`);

      return await fetchFn(`emp/attendence`);
    },
  });
};

export const useGetAllUsers = ({
  page = 1,
  limit = 12,
  name = "",
  email = "",
}) => {
  return useQuery({
    queryKey: ["user", "file-upload", { page, limit, name, email }],
    queryFn: async () => {
      const data = await fetchFn(
        `user/all?page=${page}&limit=${limit}&name=${name}&email=${email}`,
      );
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useAddUser = () => {
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

export const useChangePassword = () => {
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

export const useEditUser = () => {
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

export const useGetCoOrdinatesMutation = () => {
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

export const useUploadFile = () => {
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
