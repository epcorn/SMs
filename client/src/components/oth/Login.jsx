
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

  const { mutateAsync: login, isPending: loggingIn } =
    useLoginMutation();

  const authState = useAuthStore((state) => state.user);
  const currentUser = authState?.user || authState;

  useEffect(() => {
    if (currentUser?.role) {
      navigate(
        currentUser.role === "employee"
          ? "/attendence"
          : "/dashboard",
        { replace: true }
      );
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const data = new FormData(e.target);
    const formData = Object.fromEntries(data);

    try {
      const res = await login(formData);

      setStatus(res.msg);

      navigate(
        res.user.role === "employee"
          ? "/attendence"
          : "/dashboard",
        { replace: true }
      );
    } catch (error) {
      setStatus(
        error?.msg ||
        error?.message ||
        "Invalid email or password. Please try again."
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
              <span className="block text-blue-300">
                all in one place.
              </span>
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              Simplifying attendance, employee management
              and everyday operations.
            </p>
          </div>
        </div>

        {/* Right Login Section */}
        <div className="flex min-h-[620px] items-center justify-center bg-[#101827]/90 px-6 py-12 sm:px-12 lg:px-14">

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
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wide text-slate-300">
                  EMAIL ADDRESS
                </label>

                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@company.com"
                    autoComplete="username"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wide text-slate-300">
                  PASSWORD
                </label>

                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {status && (
                <div role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {status}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingIn ? "Authenticating..." : "Sign In to Workspace"}
                {!loggingIn && (
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                )}
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
                © {new Date().getFullYear()} Squad Management System. All rights reserved.
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
