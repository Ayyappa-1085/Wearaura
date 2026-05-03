import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/Profile.css";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 🔥 Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // 🔥 Prevent crash while loading
  if (!user) {
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* LEFT - PROFILE CARD */}
        <div className="profile-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
            alt="Profile"
            className="profile-img"
          />

          <h2>{user.name}</h2>

          {/* ✅ SAFE DATE HANDLING */}
          <p className="joined">
            Member since{" "}
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "N/A"}
          </p>

          <div className="profile-details">
            <div>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>{user.phone || "Not provided"}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT - ACTIONS */}
        <div className="profile-actions">
          <h3>My Account</h3>

          <button onClick={() => navigate("/account/orders")}>
            🧾 Order History
          </button>

          <button onClick={() => navigate("/account/track")}>
            🚚 Track Order
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;