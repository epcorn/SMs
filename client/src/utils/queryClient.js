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

  // Track if this is a retry attempt to prevent infinite loops
  const isRetry = options._isRetry || false;

  let res = await fetch(`/api/${url}`, {
    method: rest.method || "GET",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...rest.headers,
    },
    credentials: "include",
    ...(body && { body: isFormData ? body : JSON.stringify(body) }),
    ...rest,
  });

  // Handle errors
  if (!res.ok) {
    // Catch expired access token (401) and attempt to refresh if we haven't tried yet
    if (res.status === 401 && !isRetry) {
      try {
        // 1. Silent Refresh Request
        const refreshRes = await fetch("/api/refresh", {
          method: "POST",
          credentials: "include", // Essential to send/receive the httpOnly cookie
        });

        if (refreshRes.ok) {
          // 2. Refresh was successful! Retry the original request
          return await fetchFn(url, { ...options, _isRetry: true });
        }
      } catch (refreshError) {
        console.error("Silent refresh network error:", refreshError);
      }

      // 3. If refresh failed (403/500/network error), the refresh token is dead.
      // Log the user out completely.
      localStorage.removeItem("emp-user");
      useAuthStore.getState().clearUser();
    }

    // Process regular error messages
    const errorData = await res.json().catch(() => ({}));
    const errorMessage =
      errorData.msg || errorData.message || "Something went wrong";
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return data;
};
