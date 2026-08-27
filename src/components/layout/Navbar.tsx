import { Cpu, Zap, LogIn, LogOut, LayoutDashboard, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ADMIN_EMAIL } from "@/constants";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-background" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                AI<span className="text-primary text-glow-cyan">Detect</span>
              </span>
              <div className="text-[10px] font-mono text-muted-foreground -mt-1 tracking-widest uppercase">
                Content Scanner
              </div>
            </div>
          </div>

          {/* Center badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs font-mono text-muted-foreground">
            <Zap className="w-3 h-3 text-primary" />
            <span>Free • No account required</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-xs font-medium text-violet-400 hover:bg-violet-500/20 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-light">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium text-foreground hidden sm:inline max-w-[100px] truncate">
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
