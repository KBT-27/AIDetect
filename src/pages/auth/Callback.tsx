import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { mapSupabaseUser, useAuth } from "@/context/AuthContext";

const exchangedCodes = new Set<string>();

async function exchangeOAuthCodeOnce(code: string) {
  if (exchangedCodes.has(code)) return;
  exchangedCodes.add(code);
  await supabase.auth.exchangeCodeForSession(code);
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const isOAuthPopup = window.name === "onspace-oauth";
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorCode = params.get("error") || params.get("error_code");

    if (errorCode) {
      if (isOAuthPopup) {
        window.opener?.postMessage({ type: "OAUTH_ERROR", error: errorCode }, "*");
        window.close();
      } else {
        navigate("/login?error=" + errorCode, { replace: true });
      }
      return;
    }

    if (code && isOAuthPopup) {
      window.opener?.postMessage({ type: "OAUTH_CODE", code }, "*");
      window.close();
      return;
    }

    if (code && !isOAuthPopup) {
      exchangeOAuthCodeOnce(code).then(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) login(mapSupabaseUser(session.user));
        navigate("/", { replace: true });
      });
      return;
    }

    navigate("/", { replace: true });
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground font-mono">Completing sign-in...</p>
      </div>
    </div>
  );
}
