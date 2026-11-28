import { useLoginMutation } from "@/hooks/authHooks";
import useAuthStore from "@/store/authStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Fingerprint,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync: login, isPending: loggingIn } = useLoginMutation();

  const authState = useAuthStore((state) => state.user);
  const currentUser = authState?.user || authState;

  useEffect(() => {
    if (currentUser?.role) navigate("/attendence", { replace: true });
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const data = new FormData(e.target);
    const formData = Object.fromEntries(data);

    try {
      const res = await login(formData);

      setStatus(res.msg);

      navigate(res.user.role === "employee" ? "/attendence" : "/attendence", {
        replace: true,
      });
    } catch (error) {
      setStatus(
        error?.msg ||
          error?.message ||
          "Invalid email or password. Please try again.",
      );
    }
  };

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#080E1B] text-white">
      {/* Full-screen Background */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg/bg1.jpeg")' }}
      />

      {/* Background Overlay */}
      <div className="fixed inset-0 -z-10 bg-[#080E1B]/65" />

      {/* Subtle Background Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.18),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.12),transparent_50%)]" />

      {/* Main Layout */}
      <div className="relative flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-[#101827]/85 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:min-h-[620px] lg:grid-cols-2">
          {/* Left Image Section */}
          <div className="relative hidden min-h-[620px] overflow-hidden lg:block">
            <img
              src="/bg/team.jpg"
              alt="Professional team"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            {/* Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/90 via-[#071426]/25 to-[#071426]/30" />

            {/* Branding */}
            <div className="absolute left-10 top-10 z-10">
              <h2 className="text-2xl font-bold tracking-widest text-black">
                SQUAD<span className="text-blue-400">.</span>
              </h2>
              <p className="mt-1 text-[10px] tracking-[2px] text-black">
                MANAGEMENT SYSTEM
              </p>
            </div>

            {/* Image Caption */}
            <div className="absolute bottom-12 left-10 right-10 z-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[3px] text-black bg-white/40 p-2 py-1 w-fit rounded-xl ">
                Workforce Management
              </p>

              <h1 className="text-4xl font-semibold leading-tight text-white">
                Everything your team needs,
                <span className="block text-blue-300">all in one place.</span>
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
                Simplifying attendance, employee management and everyday
                operations.
              </p>
            </div>
          </div>

          {/* Right Login Section */}
          <div className="flex min-h-[620px] items-center justify-center bg-orange-700 px-6 py-12 sm:px-12 lg:px-14">
            <div className="w-full max-w-sm">
              {/* Mobile Branding */}
              <div className="mb-10 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-500/15">
                  <Fingerprint className="text-blue-300" size={24} />
                </div>
                <div>
                  <h2 className="font-bold tracking-wide">SQUAD</h2>
                  <p className="text-[9px] tracking-[3px] text-blue-300">
                    MANAGEMENT SYSTEM
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-9">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-orange-800">
                  <Lock className="text-blue-300" size={23} />
                </div>

                <p className="mb-3 text-xs font-semibold uppercase tracking-[3px] text-blue-300">
                  Welcome Back
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Sign in to your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Enter your credentials to access your workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-slate-300">
                    EMAIL ADDRESS
                  </legend>
                  <label className="input bg-white/40 text-black border-2 w-full">
                    <Mail size={18} className="opacity-50" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@company.com"
                      autoComplete="username"
                    />
                  </label>
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-slate-300">
                    PASSWORD
                  </legend>
                  <label className="input bg-white/40 text-black border-2 w-full">
                    <Lock size={18} className="opacity-50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </label>
                </fieldset>

                {status && (
                  <div role="alert" className="alert alert-info text-sm">
                    {status.message || status}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn bg-theme-bg w-full border-warning-content/30 shadow-orange-950">
                  {" "}
                  Sign In{" "}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-10 border-t border-white/10 pt-6">
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <ShieldCheck size={15} />
                  <p className="text-[11px]">
                    Secure access • Authorized personnel only
                  </p>
                </div>

                <p className="mt-5 text-center text-[10px] tracking-wide text-slate-600">
                  © {new Date().getFullYear()} Squad Management System. All
                  rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
