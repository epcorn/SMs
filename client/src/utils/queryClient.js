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
    credentials: "include",
    ...(body && { body: isFormData ? body : JSON.stringify(body) }),
  });

  if (!res.ok) {
    // session expired: log out, but not for failed login attempts
    if (res.status === 401 && !url.includes("auth/login")) {
      localStorage.removeItem("emp-user");
      useAuthStore.getState().clearUser();
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.msg || errorData.message || "Something went wrong",
    );
  }

  return res.json();
};
