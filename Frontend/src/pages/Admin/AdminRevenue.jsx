import { useEffect, useState } from "react";
// ❌ REMOVE axios
// import axios from "axios";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

// ✅ ADD API
import api from "../../utils/api";

function AdminRevenue() {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
  });

  const [chartData, setChartData] = useState([]);

  // ⚠️ KEEP (not breaking structure)
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const loadData = async () => {
      try {
        // ❌ REMOVE token usage

        const res = await api.get("/api/orders");

        const raw = Array.isArray(res.data) ? res.data : res.data.orders || [];

        const orders = raw.filter((item) =>
          ["Confirmed", "Shipped", "Delivered"].includes(item.status),
        );

        const now = new Date();

        const startToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

        const start7 = new Date(startToday);
        start7.setDate(startToday.getDate() - 6);

        const start30 = new Date(startToday);
        start30.setDate(startToday.getDate() - 29);

        const getAmount = (item) =>
          Number(item.finalAmount ?? item.totalAmount ?? item.total ?? 0);

        const total = orders.reduce((sum, item) => sum + getAmount(item), 0);

        const today = orders
          .filter((item) => {
            const d = new Date(item.createdAt);
            return d >= startToday;
          })
          .reduce((sum, item) => sum + getAmount(item), 0);

        const week = orders
          .filter((item) => {
            const d = new Date(item.createdAt);
            return d >= start7;
          })
          .reduce((sum, item) => sum + getAmount(item), 0);

        const month = orders
          .filter((item) => {
            const d = new Date(item.createdAt);
            return d >= start30;
          })
          .reduce((sum, item) => sum + getAmount(item), 0);

        const last7 = Array.from({ length: 7 }, (_, i) => {
          const dayDate = new Date(start7);
          dayDate.setDate(start7.getDate() + i);

          const nextDate = new Date(dayDate);
          nextDate.setDate(dayDate.getDate() + 1);

          const revenue = orders
            .filter((item) => {
              const d = new Date(item.createdAt);
              return d >= dayDate && d < nextDate;
            })
            .reduce((sum, item) => sum + getAmount(item), 0);

          return {
            day: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
            revenue,
          };
        });

        setStats({
          total: Math.round(total),
          today: Math.round(today),
          week: Math.round(week),
          month: Math.round(month),
        });

        setChartData(last7);
      } catch (error) {
        console.log("Revenue Error:", error);
      }
    };

    loadData();
  }, []);

  const cards = [
    { title: "Today", value: stats.today },
    { title: "7 Days", value: stats.week },
    { title: "30 Days", value: stats.month },
    { title: "Total", value: stats.total },
  ];

  return (
    <div className="revenue-wrap">
      <div className="revenue-banner">
        <p>Revenue Overview</p>

        <h1>₹{stats.total.toLocaleString()}</h1>

        <span>Successful orders only</span>
      </div>

      <div className="revenue-mini-grid">
        {cards.map((card) => (
          <div className="revenue-mini-card" key={card.title}>
            <p>{card.title}</p>
            <h3>₹{card.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      <div className="chart-box">
        <h3>Last 7 Days Trend</h3>

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#111" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#111"
              fill="url(#revFill)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <h3>Revenue Breakdown</h3>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <Tooltip />

            <Bar dataKey="revenue" fill="#111" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminRevenue;
