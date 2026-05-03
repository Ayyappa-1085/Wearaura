import "../styles/Auth.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../utils/api"; // 🔥 ADDED

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleRegister = async () => {
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const normalizedEmail = email.toLowerCase().trim();

      // 🔥 ONLY FIX
      const res = await api.post("/api/auth/register", {
        name,
        email: normalizedEmail,
        password,
      });

      const data = res.data;

      toast.success("Account created successfully");

      navigate("/login", {
        state: location.state,
        replace: true,
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Register failed"
      );
    }
  };

  return (
    <div
      className="auth-overlay"
      onClick={() => navigate(closeTo, { replace: true })}
    >
      <form
        className="auth-box register-box"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
      >
        <h2>Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        <div className="password-field">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <span
            className="eye-icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        {error && (
          <p style={{ color: "red", fontSize: "14px", marginTop: "-6px" }}>
            {error}
          </p>
        )}

        <button type="submit">Register</button>

        <p>
          Already have an account?{" "}
          <span
            onClick={() =>
              navigate("/login", {
                state: location.state,
                replace: true,
              })
            }
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;