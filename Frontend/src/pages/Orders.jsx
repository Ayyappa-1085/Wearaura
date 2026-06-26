import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// ❌ REMOVE axios
// import axios from "axios";
import "../styles/Account.css";

// ✅ ADD API
import api from "../utils/api";

const API = "/api/orders";

function Orders() {
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const trackingId = location.state?.trackingId;

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.get(API);

        // ✅ SAFE DATA FIX
        const data = Array.isArray(res.data) ? res.data : res.data.orders || [];

        setOrders(data);
      } catch (error) {
        console.log("ORDER FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getExpectedDate = (date) => {
    const newDate = new Date(date);

    newDate.setDate(newDate.getDate() + 7);

    return newDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="account-page">
      <div className="account-card orders-page-card">
        <h2>Order History</h2>

        {trackingId && (
          <div className="success-banner">
            Tracking ID: <strong>{trackingId}</strong>
          </div>
        )}

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map((item) => (
              <div className="order-card new-order-card" key={item._id}>
                <div className="order-top">
                  <div className="multi-order-images">
                    {item.items?.slice(0, 4).map((product, index) => (
                      <div className="multi-img-box" key={index}>
                        <img
                          src={product.image}
                          alt="product"
                          className="multi-img"
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="order-info">
                    <h3>{item.items?.[0]?.title || "Order"}</h3>

                    <p>Order ID: {item.orderId || item._id}</p>

                    <p>Items: {item.items?.length || 0}</p>

                    <p>Expected Delivery: {getExpectedDate(item.createdAt)}</p>
                  </div>

                  <div className="order-side">
                    <h4>₹{item.totalAmount}</h4>

                    <span
                      className={`order-status ${
                        item.status?.toLowerCase() || ""
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="order-items-box">
                  <h5>Ordered Items</h5>

                  {item.items?.map((product, index) => (
                    <div className="ordered-item-row" key={index}>
                      <span>{product.title}</span>

                      <span>Qty: {product.qty || product.quantity}</span>

                      <span>Size: {product.size || "-"}</span>

                      <span>₹{product.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => navigate("/account/profile")}>
          Back to Profile
        </button>
      </div>
    </div>
  );
}

export default Orders;
