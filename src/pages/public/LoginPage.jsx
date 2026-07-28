import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, User, GraduationCap } from "lucide-react";
import collegeImg from "../../assets/college.jpg";
import api from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../../components/ui/Toast";

export function LoginPage() {
    const [role, setRole] = useState("student"); // student | admin
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const showToast = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        try {
            const endpoint = role === "student" ? "/auth/student/login" : "/auth/college-admin/login";
            const response = await api.post(endpoint, { email, password });
            
            if (response.data.success) {
                const { user, token } = response.data.data;
                login(user, token);
                
                showToast("Login successful!", "success");

                // Navigate based on actual role returned from backend
                if (user.role === "STUDENT") navigate("/student");
                else if (user.role === "COLLEGE_ADMIN") navigate("/admin");
                else if (user.role === "SUPER_ADMIN") navigate("/super-admin");
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Login failed. Please try again.";
            setErrorMsg(msg);
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-72px)] flex">
            {/* LEFT SIDE */}
            <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center overflow-hidden">
                {/* Background Image with low opacity */}
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${collegeImg})` }}
                />

                {/* Optional dark gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
                
                <div className="relative z-10 text-center px-12">
                    <h2 className="text-4xl font-bold text-white mb-4">Welcome Back to Adminia</h2>
                    <p className="text-lg text-gray-300">Access your dashboard to continue your admission process.</p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-6">
                <div className="w-full max-w-md bg-gradient-to-br from-cyan-200 to-blue-200 dark:from-slate-800 dark:to-slate-900 p-8 rounded-3xl shadow-xl">
                    
                    {/* TITLE */}
                    <h2 className="text-2xl font-semibold text-center mb-6 text-text">
                        Log in as {role === "student" ? "Student" : "Admin"}
                    </h2>

                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
                            <div className="mt-0.5">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium">{errorMsg}</p>
                        </div>
                    )}

                    {/* TOGGLE BUTTON */}
                    <div className="flex bg-background rounded-xl p-1 mb-6 shadow-inner">
                        <button
                            onClick={() => setRole("student")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                                role === "student"
                                    ? "bg-blue-600 text-white shadow"
                                    : "text-text/60"
                            }`}
                        >
                            <GraduationCap size={16} />
                            Student Portal
                        </button>

                        <button
                            onClick={() => setRole("admin")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                                role === "admin"
                                    ? "bg-blue-600 text-white shadow"
                                    : "text-text/60"
                            }`}
                        >
                            <User size={16} />
                            Admin Portal
                        </button>
                    </div>

                    {/* FORM */}
                    <form className="space-y-5" onSubmit={handleLogin}>
                        
                        {/* EMAIL */}
                        <div>
                            <label className="text-sm font-medium block mb-1 text-text">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-border bg-card text-text placeholder:text-text/45 focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                                <User className="absolute right-3 top-2.5 text-text/45" size={18} />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="text-sm font-medium block mb-1 text-text">Password / Mobile Number</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password or mobile number"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-border bg-card text-text placeholder:text-text/45 focus:ring-2 focus:ring-primary/50 outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-text/50 hover:text-text"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* REMEMBER */}
                        <div className="flex items-center text-sm text-text">
                            <input type="checkbox" className="mr-2 rounded border-border bg-card text-primary accent-primary" />
                            Remember me
                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            ) : (
                                <LogIn className="mr-2" size={18} />
                            )}
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    {/* FOOTER */}
                    {/* <p className="text-center text-sm mt-6">
                        Don’t have an account?{" "}
                        <Link to="/register" className="text-blue-600 font-semibold">
                            Register
                        </Link>
                    </p> */}
                </div>
            </div>
        </div>
    );
}