import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import collegeImg from '../../assets/college.jpg';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';

export function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
            const response = await api.post("/auth/super-admin/login", { email, password });
            
            if (response.data.success) {
                const { user, token } = response.data.data;
                login(user, token);
                
                showToast("Login successful!", "success");

                // Navigate based on actual role returned from backend
                if (user.role === "SUPER_ADMIN") navigate("/super-admin");
                else if (user.role === "COLLEGE_ADMIN") navigate("/admin");
                else {
                    showToast("Unauthorized access. Super Admin role required.", "error");
                    useAuthStore.getState().logout();
                }
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
            {/* Left side - Image/Illustration */}
            <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center overflow-hidden">
                {/* Background Image with low opacity */}
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${collegeImg})` }}
                />

                {/* Optional dark gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
                
                <div className="relative z-10 text-center px-12">
                    <h2 className="text-4xl font-bold text-white mb-4">Super Admin Portal</h2>
                    <p className="text-lg text-gray-300">Secure administration panel for managing colleges and operations.</p>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-sm border border-border">
                    <div className="mb-8 text-center">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-text mb-2">Super Admin Login</h2>
                        <p className="text-gray-500">Enter your credentials to access the central control panel</p>
                    </div>

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

                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Super Admin Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                placeholder="superadmin@adminia.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-text">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-text/50 hover:text-text"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                Remember me
                            </label>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center py-3 px-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading && <Loader2 className="mr-2 w-5 h-5 animate-spin" />}
                            {loading ? "Authenticating..." : "Login as Super Administrator"}
                        </button>
                    </form>
                    
                    <p className="mt-8 text-center text-sm text-gray-600">
                        <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                            ← Back to Student Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
