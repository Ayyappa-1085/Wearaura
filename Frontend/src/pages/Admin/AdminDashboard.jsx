import { useEffect, useState } from "react";
// ❌ REMOVE axios
// import axios from "axios";
import "../../styles/AdminOrders.css";

// ✅ ADD API
import api from "../../utils/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    pending: 0,
    cancelled: 0,
    revenue: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchId, setSearchId] = useState("");
  const [foundOrder, setFoundOrder] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const getFinalAmount = (order) =>
    Number(order.finalAmount ?? order.totalAmount ?? order.subtotal ?? 0);

  const loadStats = async () => {
    try {
      // ❌ REMOVE token logic
      // const token = localStorage.getItem("token");

      const [productRes, orderRes] = await Promise.all([
        // ✅ FIXED
        api.get("/api/products?limit=1000"),

        // ✅ FIXED
        api.get("/api/orders"),
      ]);

      const products = productRes.data.products || [];

      // 🔥 SAFE PARSE
      const allOrders = Array.isArray(orderRes.data)
        ? orderRes.data
        : orderRes.data.orders || [];

      // 💰 REVENUE
      const revenue = allOrders
        .filter((o) => ["Confirmed", "Shipped", "Delivered"].includes(o.status))
        .reduce((sum, item) => sum + getFinalAmount(item), 0);

      // 🔥 LOW STOCK
      const lowStock = products.filter((p) => {
        const stock = p.sizeStock || {};
        return Object.values(stock).some((q) => q > 0 && q <= 2);
      }).length;

      // 🔥 OUT OF STOCK
      const outOfStock = products.filter((p) => {
        const stock = p.sizeStock || {};
        return Object.values(stock).every((q) => q === 0);
      }).length;

      setStats({
        products: products.length,
        orders: allOrders.length,
        pending: allOrders.filter((o) =>
          ["Placed", "Pending"].includes(o.status),
        ).length,
        cancelled: allOrders.filter((o) =>
          ["Cancelled", "Failed"].includes(o.status),
        ).length,
        revenue: Math.round(revenue),
        lowStock,
        outOfStock,
      });

      setOrders(allOrders);
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchId.trim()) return;

    const result = orders.find((item) => {
      const id = (item.orderId || item._id || "").toString().toLowerCase();

      return id === searchId.trim().toLowerCase();
    });

    setFoundOrder(result || false);
  };

  const cards = [
    { title: "Products", value: stats.products },
    { title: "Orders", value: stats.orders },
    { title: "Pending", value: stats.pending },
    { title: "Cancelled", value: stats.cancelled },
    { title: "Low Stock", value: stats.lowStock },
    { title: "Out of Stock", value: stats.outOfStock },
    {
      title: "Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
    },
  ];

  return (
    <div>
      <div className="stats-grid">
        {loading ? (
          <div className="stat-card">Loading...</div>
        ) : (
          cards.map((card) => (
            <div className="stat-card" key={card.title}>
              <p>{card.title}</p>
              <h2>{card.value}</h2>
            </div>
          ))
        )}
      </div>

      <div className="admin-panel-box">
        <h3>Search Order Details</h3>

        <div className="admin-search-row">
          <input
            className="admin-search-input"
            placeholder="Enter Order ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />

          <button className="admin-search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>

        {foundOrder === false && (
          <div className="admin-order-result">Order not found</div>
        )}

        {foundOrder && (
          <div className="admin-order-result admin-order-layout">
            <div className="admin-order-left">
              <p>
                <strong>Order ID:</strong>{" "}
                {foundOrder.orderId || foundOrder._id}
              </p>
              <p>
                <strong>Name:</strong> {foundOrder.customerName}
              </p>
              <p>
                <strong>Phone:</strong> {foundOrder.phone}
              </p>
              <p>
                <strong>Address:</strong> {foundOrder.address}
              </p>
              <p>
                <strong>Status:</strong> {foundOrder.status}
              </p>
              <p>
                <strong>Subtotal:</strong> ₹
                {Math.round(foundOrder.subtotal ?? foundOrder.totalAmount ?? 0)}
              </p>
              <p>
                <strong>Discount:</strong> ₹
                {Math.round(foundOrder.discountAmount ?? 0)}
                {foundOrder.couponCode ? ` (${foundOrder.couponCode})` : ""}
              </p>
              <p>
                <strong>Final:</strong> ₹
                {Math.round(getFinalAmount(foundOrder))}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(foundOrder.createdAt).toLocaleDateString("en-IN")}
              </p>

              <p>
                <strong>Time:</strong>{" "}
                {new Date(foundOrder.createdAt).toLocaleTimeString("en-IN")}
              </p>
            </div>

            <div className="admin-order-right">
              {foundOrder.items?.length > 0 ? (
                foundOrder.items.map((item, index) => (
                  <div className="admin-item-box" key={index}>
                    <img src={item.image} alt={item.title} />
                    <span>{item.title}</span>
                    <small>Qty: {item.qty}</small>
                  </div>
                ))
              ) : (
                <p>No Items</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
