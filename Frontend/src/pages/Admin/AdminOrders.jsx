import { useEffect, useState } from "react";
// ❌ REMOVE axios
// import axios from "axios";
import "../../styles/AdminOrders.css";

// ✅ ADD API
import api from "../../utils/api";

const API = "/api/orders";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      // ❌ REMOVE token logic

      const res = await api.get(API);

      // 🔥 SAFE DATA
      const data = Array.isArray(res.data) ? res.data : res.data.orders || [];

      setOrders(data);
    } catch (error) {
      console.log("Order Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, value) => {
    try {
      // ❌ REMOVE token logic

      await api.put(`${API}/${id}`, {
        status: value,
      });

      // 🔥 UPDATE UI
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id
            ? {
                ...order,
                status: value,
              }
            : order,
        ),
      );
    } catch (error) {
      console.log("Update Error:", error);
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAmounts = (order) => {
    const subtotal = Number(order.subtotal ?? order.totalAmount ?? 0);
    const discountAmount = Number(order.discountAmount ?? 0);
    const finalAmount = Number(
      order.finalAmount ?? order.totalAmount ?? subtotal,
    );

    return {
      subtotal,
      discountAmount,
      finalAmount,
      couponCode: order.couponCode || null,
    };
  };

  if (loading) {
    return (
      <div className="orders-page">
        <h2>Loading Orders...</h2>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-topbar">
        <h2>Order Management</h2>

        <span>{orders.length} Orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="empty-products">No Orders Found</div>
      ) : (
        <>
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Final</th>
                  <th>Payment</th>
                  <th>Date / Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const amounts = getAmounts(order);

                  return (
                  <tr key={order._id}>
                    <td>{order.orderId || order._id}</td>

                    <td>
                      <strong>{order.customerName}</strong>
                      <br />

                      <small>{order.phone}</small>
                    </td>

                    <td>{order.items?.length || 0}</td>

                    <td>₹{Math.round(amounts.subtotal)}</td>

                    <td>
                      ₹{Math.round(amounts.discountAmount)}
                      {amounts.couponCode ? ` (${amounts.couponCode})` : ""}
                    </td>

                    <td>₹{Math.round(amounts.finalAmount)}</td>

                    <td>{order.paymentMethod}</td>

                    <td>{formatDateTime(order.createdAt)}</td>

                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                        className={`status-select ${order.status?.toLowerCase()}`}
                      >
                        <option>Placed</option>

                        <option>Confirmed</option>

                        <option>Shipped</option>

                        <option>Delivered</option>

                        <option>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mobile-orders">
            {orders.map((order) => {
              const amounts = getAmounts(order);

              return (
              <div className="order-card" key={order._id}>
                <div className="card-head">
                  <h3>{order.orderId || order._id}</h3>

                  <span>{formatDateTime(order.createdAt)}</span>
                </div>

                <p>
                  {order.customerName} • {order.phone}
                </p>

                <p>Items: {order.items?.length || 0}</p>

                <p>Subtotal: ₹{Math.round(amounts.subtotal)}</p>

                <p>
                  Discount{amounts.couponCode ? ` (${amounts.couponCode})` : ""}: -₹
                  {Math.round(amounts.discountAmount)}
                </p>

                <p>Final: ₹{Math.round(amounts.finalAmount)}</p>

                <p>Payment: {order.paymentMethod}</p>

                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className={`status-select ${order.status?.toLowerCase()}`}
                >
                  <option>Placed</option>

                  <option>Confirmed</option>

                  <option>Shipped</option>

                  <option>Delivered</option>

                  <option>Cancelled</option>
                </select>
              </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminOrders;
