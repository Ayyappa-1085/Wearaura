import { useState } from "react";
import { useNavigate } from "react-router-dom";
// ❌ REMOVE axios
// import axios from "axios";
import "../styles/Account.css";

// ✅ ADD API
import api from "../utils/api";

const API = "/api/orders";

function TrackOrder() {
  const navigate = useNavigate();

  const [trackingId, setTrackingId] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const handleTrack = async () => {
    if (!trackingId.trim()) return;

    try {
      setLoading(true);

      const res = await api.get(API);

      // ✅ SAFE DATA
      const orders = Array.isArray(res.data) ? res.data : res.data.orders || [];

      const found = orders.find((item) => {
        const searchValue = trackingId.toLowerCase().trim();
        const orderValue = (item.orderId || item._id)
          .toString()
          .toLowerCase()
          .trim();
        const trackingValue = item.trackingId?.toString().toLowerCase().trim();

        return orderValue === searchValue || trackingValue === searchValue;
      });

      setResult(found || false);
    } catch (error) {
      console.log("TRACK ERROR:", error);
      setResult(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getSteps = (order) => {
    const status = order.status?.toLowerCase();

    const adminDate = formatDate(order.updatedAt || order.createdAt);

    const confirmedDone = ["confirmed", "shipped", "delivered"].includes(
      status,
    );

    const shippedDone = ["shipped", "delivered"].includes(status);

    const deliveredDone = status === "delivered";

    return [
      {
        label: "Placed",
        done: true,
        date: confirmedDone ? adminDate : "",
      },
      {
        label: "Confirmed",
        done: confirmedDone,
        date: confirmedDone ? adminDate : "",
      },
      {
        label: "Shipped",
        done: shippedDone,
        date: shippedDone ? adminDate : "",
      },
      {
        label: "Delivered",
        done: deliveredDone,
        date: deliveredDone ? adminDate : "",
      },
    ];
  };

  return (
    <div className="account-page">
      <div className="account-card track-page-card">
        <h2>Track Order</h2>

        <input
          type="text"
          className="track-input"
          placeholder="Enter Order / Tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />

        <button onClick={handleTrack}>
          {loading ? "Searching..." : "Search"}
        </button>

        {result === false && (
          <div className="track-result">Order not found</div>
        )}

        {result && result.status?.toLowerCase() === "cancelled" && (
          <div className="tracking-box">
            <div className="cancel-box">
              <span className="cancel-dot"></span>

              <div>
                <h3>Cancelled</h3>

                <p>{formatDate(result.updatedAt)}</p>
              </div>
            </div>
          </div>
        )}

        {result && result.status?.toLowerCase() !== "cancelled" && (
          <div className="tracking-box">
            {getSteps(result).map((step, index) => (
              <div className="timeline-item" key={index}>
                <div className="timeline-left">
                  <span
                    className={`timeline-dot ${step.done ? "active" : ""}`}
                  ></span>

                  {index !== 3 && (
                    <span
                      className={`timeline-line ${step.done ? "active" : ""}`}
                    ></span>
                  )}
                </div>

                <div className="timeline-content">
                  <h4 className={step.done ? "done-text" : ""}>{step.label}</h4>

                  {step.date && <p>{step.date}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="demo-track">Use your Order ID or Tracking ID from Orders Page</p>

        <button onClick={() => navigate("/account/profile")}>
          Back to Profile
        </button>
      </div>
    </div>
  );
}

export default TrackOrder;
