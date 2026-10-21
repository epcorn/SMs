import { fetchFn } from "@/utils/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateSiteMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["site"],
    mutationFn: async (data) => {
      console.log(data);
      const res = await fetchFn("site/create", { method: "POST", body: data });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site"] }),
  });
};

export const useGetSiteQuery = (options = {}) => {
  return useQuery({
    queryKey: ["site"],
    queryFn: async () => {
      const res = await fetchFn("site");
      return res;
    },
    ...options,
  });
};
