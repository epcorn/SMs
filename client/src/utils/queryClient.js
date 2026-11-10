import useAuthStore from "@/store/authStore";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const fetchFn = async (url, options = {}) => {
  const { body, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const res = await fetch(`/api/${url}`, {
    ...rest,
    method: rest.method || "GET",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    credentials: "include", // Ensures the EMS_token cookie is sent properly
    ...(body && { body: isFormData ? body : JSON.stringify(body) }),
  });

  if (!res.ok) {
    // Only clear session on 401 if it's not a login/auth check endpoint
    // and we actually have an active user in the store
    if (
      res.status === 401 &&
      !url.includes("auth/") &&
      !url.includes("user/me")
    ) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        localStorage.removeItem("emp-user");
        useAuthStore.getState().clearUser();
      }
    }

    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.msg || errorData.message || "Something went wrong",
    );
  }

  return res.json();
};
