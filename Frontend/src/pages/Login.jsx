import "../styles/Auth.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../utils/api"; // 🔥 ADDED

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const closeTo = location.state?.backgroundLocation?.pathname || "/";

  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        navigate(closeTo, { replace: true });
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      window.scrollTo(0, scrollY);
    };
  }, [navigate, closeTo]);

  const handleLogin = async () => {
    try {
      setError("");

      if (!email || !password) {
        toast.error("Enter email and password");
        return;
      }

      setLoading(true);

      const normalizedEmail = email.toLowerCase().trim();

      // 🔥 ONLY FIX: fetch → api
      const res = await api.post("/api/auth/login", {
        email: normalizedEmail,
        password,
      });

      const data = res.data;

      localStorage.clear();

      await login(data.token);

      toast.success("Login successful");

      setTimeout(() => {
        if (data.user?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/account/profile", { replace: true });
        }
      }, 50);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Server error. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-overlay"
      onClick={() => navigate(closeTo, { replace: true })}
      onWheel={(e) => e.stopPropagation()}
      onMouseWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <form
        className="auth-box login-box"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        <div className="forgot-wrap">
          <span className="forgot-link">Forgot Password?</span>
        </div>

        {error && (
          <p
            style={{
              color: "red",
              fontSize: "14px",
              marginTop: "-6px",
            }}
          >
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account?{" "}
          <span
            onClick={() =>
              navigate("/register", {
                state: location.state,
                replace: true,
              })
            }
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;