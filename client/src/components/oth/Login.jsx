import { useLoginMutation } from "@/hooks/authHooks";
import useAuthStore from "@/store/authStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const { mutateAsync: login, isPending: logginIn } = useLoginMutation();
  const authState = useAuthStore((state) => state.user);


  const currentUser = authState?.user || authState;

  useEffect(() => {
    // ONLY redirect if a user session actively exists!
    if (currentUser && currentUser.role) {
      if (currentUser.role === 'employee') {
        navigate("/attendence", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [currentUser, navigate]);

  console.log(currentUser)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const formData = Object.fromEntries(data);

    try {
      const res = await login(formData);
      console.log(res);
      setStatus(res.msg);
      if (res.user.role === "employee") {
        navigate("/attendence");
      }
      navigate("/dashboard");
    } catch (error) {
      setStatus(error?.msg || error?.message || "Login failed");
      console.log(error);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl border border-base-300">
        <form className="card-body" onSubmit={handleSubmit}>
          <h3 className="text-2xl font-bold mb-2 text-center">Login</h3>
          <p className="text-xs text-center text-base-content/60 mb-4">
            Squad Management System
          </p>

          {/* Form Controls */}
          <div className="flex flex-col gap-4">
            <label className="form-control w-full">
              <span className="label-text mb-1 font-semibold text-xs uppercase tracking-wide">
                User Email
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="Enter user email"
                className="input input-bordered w-full"
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text mb-1 font-semibold text-xs uppercase tracking-wide">
                Password
              </span>
              <input
                type="password"
                name="password"
                required
                placeholder="Enter password"
                className="input input-bordered w-full"
              />
            </label>
          </div>

          {status && (
            <div className="mt-2 text-center text-sm text-error font-medium">
              <p>{status}</p>
            </div>
          )}

          {/* Submit Action */}
          <div className="form-control mt-6">
            <button
              type="submit"
              disabled={logginIn}
              className="btn btn-primary w-full"
            >
              {logginIn ? "Logging In..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;