import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  User,
  Phone,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Auth() {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    let isMounted = true;

    const redirectIfLoggedIn = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted && data.session) {
        navigate("/dashboard", { replace: true });
      }
    };

    redirectIfLoggedIn();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted && session) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // =========================
  // AUTH HANDLER
  // =========================
  const handleAuth = async (e) => {
    e.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    // Validation
    if (isSignUp && (!fullName || !phone)) {
      return setMessage({
        type: "error",
        text: "Please enter your name and phone number.",
      });
    }

    if (!email || !password) {
      return setMessage({
        type: "error",
        text: "Please fill all fields.",
      });
    }

    if (password.length < 6) {
      return setMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
    }

    try {
      setLoading(true);

      // =========================
      // SIGN UP
      // =========================
      if (isSignUp) {
        const normalizedPhone = phone.trim();
        const userMetadata = {
          full_name: fullName.trim(),
          phone_number: normalizedPhone,
          phone: normalizedPhone,
        };

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userMetadata,
          },
        });

        // User already exists
        if (error?.message?.includes("User already registered")) {
          setMessage({
            type: "error",
            text: "Account already exists. Please login.",
          });

          setIsSignUp(false);

          return;
        }

        if (error) throw error;

        console.log("SIGNUP SUCCESS:", data);

        setMessage({
          type: "success",
          text: "Account created successfully. Please login.",
        });

        setIsSignUp(false);

        setPassword("");
      }

      // =========================
      // LOGIN
      // =========================
      else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        console.log("LOGIN SUCCESS:", data);

        setMessage({
          type: "success",
          text: "Login successful. Redirecting...",
        });

        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);

      setMessage({
        type: "error",
        text: err.message || "Authentication failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl">
            🩺
          </div>

          <h1 className="text-3xl font-black text-white mt-4">
            SmartHealth
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            AI Healthcare Workspace
          </p>
        </div>

        {/* Alert */}
        {message.text && (
          <div
            className={`mb-5 p-4 rounded-2xl border flex items-start gap-3 text-sm ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />

            <span>{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">

          {isSignUp && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />

                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="h-5 w-5" />
                Create Account
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Login
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);

              setMessage({
                type: "",
                text: "",
              });
            }}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}