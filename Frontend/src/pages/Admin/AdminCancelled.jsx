import { useEffect, useState } from "react";

// ✅ ADD THIS
import api from "../../utils/api";

function AdminCancelled() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ KEEP (not breaking your code)
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // ❌ REMOVE token usage (handled in api.js)
        // const token = getToken();

        // ✅ FIXED
        const res = await api.get("/api/orders");

        // 🔥 SAFE DATA
        const data = Array.isArray(res.data) ? res.data : res.data.orders || [];

        setOrders(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const cancelled = orders.filter(
    (item) => item.status === "Cancelled" || item.status === "Failed",
  );

  if (loading) {
    return (
      <div className="admin-panel-box">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="admin-panel-box">
      <h2>Failed / Cancelled Orders</h2>

      {cancelled.length === 0 ? (
        <p>No cancelled orders found.</p>
      ) : (
        <div className="cancelled-list">
          {cancelled.map((item) => (
            <div className="cancel-card" key={item._id}>
              <div>
                <h4>{item.customerName}</h4>

                <p>{item.phone}</p>

                <small>{new Date(item.createdAt).toLocaleDateString()}</small>
              </div>

              <div className="cancel-right">
                <span className="cancel-badge">{item.status}</span>

                <strong>
                  ₹{Math.round(item.finalAmount ?? item.totalAmount ?? item.subtotal ?? 0)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCancelled;
