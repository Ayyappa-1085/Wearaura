import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";

import Wishlist from "./pages/Wishlist";
import Homepage from "./pages/Homepage";
import CategoryLayout from "./pages/CategoryLayout";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import TrackOrder from "./pages/TrackOrder";
import Checkout from "./pages/Checkout/Checkout";
import OrderSummary from "./pages/OrderSummary/OrderSummary";
import Payment from "./pages/Payment/Payment";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminRevenue from "./pages/Admin/AdminRevenue";
import AdminStock from "./pages/Admin/AdminStock";
import AdminCancelled from "./pages/Admin/AdminCancelled";

import ProductDetail from "./pages/ProductDetail/ProductDetail";

// 🔥 ONLY THIS (REMOVE AdminRoute)
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();
  const state = location.state;
  const backgroundLocation = state?.backgroundLocation;

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      <Routes
        location={
          backgroundLocation && isAuthRoute ? backgroundLocation : location
        }
      >
        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="cancelled" element={<AdminCancelled />} />
        </Route>

        {/* ================= USER ================= */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/:category" element={<CategoryLayout />} />
          <Route path="/:category/:item" element={<CategoryLayout />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          <Route
            path="/account/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account/track"
            element={
              <ProtectedRoute>
                <TrackOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order-summary"
            element={
              <ProtectedRoute>
                <OrderSummary />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>

      {/* ================= AUTH MODAL ================= */}
      {isAuthRoute && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      )}
    </>
  );
}

export default App;
