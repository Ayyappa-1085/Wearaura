import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBag } from "../../BagContext";
import toast from "react-hot-toast";
import "./Payment.css";

import api from "../../utils/api";

const API = "/api/orders";

let isProcessing = false;

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearBag } = useBag();

  const data = location.state || {};

  const [loading, setLoading] = useState(false);

  /* ================= 🔥 CART VALIDATION ================= */
  const validateCart = async () => {
    try {
      const res = await api.get("/api/cart");

      const backendCart = res.data || [];

      if (backendCart.length !== (data?.bagItems?.length || 0)) {
        toast.error("Cart changed. Please refresh.");
        return false;
      }

      for (const item of backendCart) {
        const stock = item.product?.sizeStock?.[item.size] || 0;

        if (stock === 0) {
          toast.error(
            `${item.product?.title || "Item"} (${item.size}) is out of stock`
          );
          return false;
        }

        if (item.quantity > stock) {
          toast.error(`${item.product?.title || "Item"} only ${stock} left`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.log("VALIDATION ERROR:", error);
      toast.error("Failed to validate cart");
      return false;
    }
  };

  /* ================= 🔥 FORMAT ITEMS (REUSED) ================= */
  const getFormattedItems = () => {
    return data.bagItems.map((item) => {
      let productId = null;

      if (item.product && item.product._id) {
        productId = item.product._id;
      } else if (typeof item.product === "string") {
        productId = item.product;
      } else if (item._id) {
        productId = item._id;
      }

      if (!productId) {
        throw new Error("Invalid product in cart");
      }

      return {
        product: productId,
        title: item.product?.title || "",
        price: item.product?.price || 0,
        image: item.product?.image || item.product?.images?.[0] || "",
        quantity: item.quantity,
        size: item.size,
      };
    });
  };

  const handlePlaceOrder = async (paymentDetails) => {
    try {
      if (!data?.bagItems?.length) {
        toast.error("Your bag is empty");
        return;
      }

      if (!data?.addressData?.name) {
        toast.error("Address missing");
        return;
      }

      setLoading(true);

      const idempotencyKey =
        (window.crypto && crypto.randomUUID && crypto.randomUUID()) ||
        Date.now().toString();

      const formattedItems = getFormattedItems();

      const payload = {
        customerName: data.addressData?.name || "Guest",
        phone: data.addressData?.mobile || "",
        address: [
          data.addressData?.address,
          data.addressData?.city,
          data.addressData?.state,
          data.addressData?.pincode,
        ]
          .filter(Boolean)
          .join(", "),
        paymentMethod: "ONLINE",
        status: "Placed",
        totalAmount: data.total || 0,
        items: formattedItems,
        idempotencyKey,
        paymentInfo: paymentDetails,
      };

      const res = await api.post(API, payload);
      const createdOrder = res.data;

      await clearBag();

      localStorage.removeItem("WearAura-checkout");
      localStorage.removeItem("WearAura-address");

      toast.success(
        `Order placed successfully. Tracking ID: ${createdOrder.trackingId || createdOrder.orderId}`,
      );

      navigate("/account/orders", {
        state: {
          trackingId: createdOrder.trackingId || createdOrder.orderId,
        },
      });
    } catch (error) {
      console.log("ORDER ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Order failed. Try again."
      );
    } finally {
      setLoading(false);
      isProcessing = false;
    }
  };

  /* ================= 🔥 PAYMENT ================= */
  const handleRazorpayPayment = async () => {
    try {
      const valid = await validateCart();
      if (!valid) return;

      setLoading(true);

      const formattedItems = getFormattedItems(); // ✅ NEW

      // 🔥 FIXED HERE (IMPORTANT)
      const res = await api.post("/api/payment/create-order", {
        items: formattedItems,
        discount: data.discount || 0,
        shippingCost: data.shippingCost || 0,
        totalAmount: data.total || 0,
      });

      const order = res.data.order;

      const options = {
        key: "rzp_test_SkRHJI7zZDoOMG",
        amount: order.amount,
        currency: "INR",
        name: "WearAura",
        description: "Order Payment",
        order_id: order.id,

        handler: async function (response) {
          if (isProcessing) return;
          isProcessing = true;

          try {
            const verifyRes = await api.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              await handlePlaceOrder({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
            } else {
              toast.error("Payment verification failed");
              isProcessing = false;
              setLoading(false);
            }
          } catch (err) {
            toast.error("Payment verification failed");
            isProcessing = false;
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
            isProcessing = false;
            setLoading(false);
          },
        },

        theme: {
          color: "#000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log("RAZORPAY ERROR:", error);
      toast.error("Payment failed to start");
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-icon">💳</div>

        <h1>Payment Gateway</h1>

        <p className="payment-subtitle">Razorpay payment enabled</p>

        <div className="payment-box">
          <div className="payment-row">
            <span>Order Total</span>
            <strong>₹{data.total || 0}</strong>
          </div>

          <div className="payment-row">
            <span>Payment Mode</span>
            <strong>Online Payment</strong>
          </div>
        </div>

        <div className="payment-actions">
          <button onClick={() => navigate("/order-summary", { state: data })} disabled={loading}>
            Back to Summary
          </button>

          <button
            className="home-btn"
            onClick={handleRazorpayPayment}
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Payment;