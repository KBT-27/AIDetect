import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split("@")[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

const exchangedCodes = new Set<string>();

async function exchangeOAuthCodeOnce(code: string) {
  if (exchangedCodes.has(code)) return;
  exchangedCodes.add(code);
  await supabase.auth.exchangeCodeForSession(code);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const oauthPopupRef = useRef<Window | null>(null);

  const login = useCallback((u: AuthUser) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    logout();
  }, [logout]);

  // Listen for OAuth popup message
  useEffect(() => {
    function onOAuthMessage(event: MessageEvent) {
      if (event.data?.type !== "OAUTH_CODE" || typeof event.data.code !== "string") return;
      void exchangeOAuthCodeOnce(event.data.code);
    }
    window.addEventListener("message", onOAuthMessage);
    return () => window.removeEventListener("message", onOAuthMessage);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) login(mapSupabaseUser(session.user));
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session?.user) {
        login(mapSupabaseUser(session.user));
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        logout();
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        login(mapSupabaseUser(session.user));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [login, logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { mapSupabaseUser };

function isInIframe(): boolean {
  try { return window.self !== window.top; } catch { return true; }
}

type OAuthProvider = "google";

export async function startSocialLogin(provider: OAuthProvider): Promise<{ ok: boolean; message?: string }> {
  const iframe = isInIframe();
  const width = 520, height = 720;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

  const popup = iframe
    ? window.open("about:blank", "onspace-oauth", `popup=yes,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`)
    : null;

  if (iframe && !popup) return { ok: false, message: "Popup was blocked. Please allow popups and try again." };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    popup?.close();
    return { ok: false, message: "Unable to start login. Please try again." };
  }

  if (iframe && popup) popup.location.assign(data.url);
  else window.location.assign(data.url);
  return { ok: true };
}
