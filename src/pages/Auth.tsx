import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, Shield, Lock, Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";

type AuthView = "login" | "signup" | "forgot";

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (view === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setForgotSent(true);
      }
      setLoading(false);
      return;
    }

    if (view === "login") {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else if (data.user?.email) {
        toast({ title: "Verifying credentials..." });

        // --- NEW SMART ROUTING LOGIC ---
        try {
          // Replace with your Render URL if testing on production
          const roleRes = await fetch(`https://clinic-appointment-booking-fglv.onrender.com/api/auth/check-role/${data.user.email}`);
          const roleData = await roleRes.json();

          if (roleData.role === "admin") {
            toast({ title: `Welcome Admin, ${roleData.profile.name}` });
            navigate("/admin");
          } else if (roleData.role === "doctor") {
            toast({ title: `Welcome back, ${roleData.profile.name}` });
            navigate("/provider");
          } else {
            toast({ title: "Welcome to MediBook!" });
            navigate("/dashboard");
          }
        } catch (err) {
          navigate("/dashboard"); // Fallback
        }
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    }

    setLoading(false);
  };

  const titles = {
    login: "Welcome Back",
    signup: "Create Account",
    forgot: "Reset Password",
  };

  const subtitles = {
    login: "Sign in to manage your appointments",
    signup: "Join MediBook to book appointments",
    forgot: "Enter your email and we'll send you a reset link",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero mb-4">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{titles[view]}</h1>
          <p className="mt-2 text-muted-foreground">{subtitles[view]}</p>
        </div>

        {/* Trust banner */}
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Your data is safe with us</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                We use industry-standard encryption to protect your personal and medical information. Your privacy is our top priority.
              </p>
            </div>
          </div>
        </div>

        {/* Forgot password success */}
        {view === "forgot" && forgotSent ? (
          <div className="rounded-xl border border-border bg-card p-6 shadow-card text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
            </p>
            <Button className="mt-6 w-full" onClick={() => { setView("login"); setForgotSent(false); }}>
              Back to Sign In
            </Button>
          </div>
        ) : (
          /* Form */
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {view !== "forgot" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {view === "login" && (
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full shadow-hero" size="lg" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : view === "login"
                  ? "Sign In"
                  : view === "signup"
                  ? "Create Account"
                  : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-1">
              {view === "forgot" ? (
                <button
                  onClick={() => setView("login")}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Sign In
                </button>
              ) : (
                <button
                  onClick={() => setView(view === "login" ? "signup" : "login")}
                  className="text-sm text-primary hover:underline"
                >
                  {view === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Security badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
