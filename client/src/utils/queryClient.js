import useAuthStore from "@/store/authStore";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

// const BASE_URL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:8000/api"
//     : "https://panel-sends-limiting-olympus.trycloudflare.com/api";

export const fetchFn = async (url, options = {}) => {
  const { body, ...rest } = options;
  const isFormData = body instanceof FormData;

  const res = await fetch(`/api/${url}`, {
    method: rest.method || "GET",
    headers: {
      // Only set JSON content-type if it's NOT FormData
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...rest.headers,
    },
    credentials: "include",
    // Only stringify if it's NOT FormData
    ...(body && { body: isFormData ? body : JSON.stringify(body) }),
    ...rest,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("emp-user");
      useAuthStore.getState().clearUser();
    }
    const errorData = await res.json().catch(() => ({}));
    const errorMessage =
      errorData.msg || errorData.message || "Something went wrong";
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return data;
};
