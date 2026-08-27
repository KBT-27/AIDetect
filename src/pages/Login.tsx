import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { mapSupabaseUser, startSocialLogin, useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Cpu, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";

type Mode = "login" | "signup" | "otp";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) { toast.error("Enter your email first."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) { toast.error(error.message); setLoading(false); return; }
    setMode("otp");
    toast.success("Verification code sent to " + email);
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || !password) { toast.error("Enter the code and a password."); return; }
    setLoading(true);
    const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (verifyErr) { toast.error(verifyErr.message); setLoading(false); return; }
    const { data: updateData, error: updateErr } = await supabase.auth.updateUser({
      password,
      data: { username: email.split("@")[0] },
    });
    if (updateErr) { toast.error(updateErr.message); setLoading(false); return; }
    if (updateData.user) { login(mapSupabaseUser(updateData.user)); navigate("/"); }
  };

  const handleLogin = async () => {
    if (!email || !password) { toast.error("Enter email and password."); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    if (data.user) { login(mapSupabaseUser(data.user)); navigate("/"); }
  };

  const handleGoogle = async () => {
    const res = await startSocialLogin("google");
    if (!res.ok) toast.error(res.message || "Google login failed.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-background" />
          </div>
          <span className="font-bold text-2xl tracking-tight">
            AI<span className="text-primary text-glow-cyan">Detect</span>
          </span>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">
              {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Check your email"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "otp" ? `We sent a 4-digit code to ${email}` : "Sign in to track your analysis history"}
            </p>
          </div>

          {mode !== "otp" && (
            <>
              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl glass-light border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-sm font-medium"
              >
                <Chrome className="w-4 h-4" />
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Email */}
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm transition-all placeholder:text-muted-foreground"
                  />
                </div>

                {mode === "login" && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm transition-all placeholder:text-muted-foreground"
                    />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                <button
                  onClick={mode === "login" ? handleLogin : handleSendOtp}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Send Verification Code"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {mode === "otp" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="4-digit code"
                value={otp}
                maxLength={6}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm text-center tracking-[0.5em] font-mono transition-all placeholder:text-muted-foreground placeholder:tracking-normal"
              />
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Create a password (min. 6 chars)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm transition-all placeholder:text-muted-foreground"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-primary/20"
              >
                {loading ? <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> : <><ArrowRight className="w-4 h-4" />Verify & Create Account</>}
              </button>
              <button onClick={() => setMode("signup")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← Back to sign up
              </button>
            </div>
          )}

          {mode !== "otp" && (
            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setPassword(""); setOtp(""); }}
                className="text-primary hover:underline font-medium"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
