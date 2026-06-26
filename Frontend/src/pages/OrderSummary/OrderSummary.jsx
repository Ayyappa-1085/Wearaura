import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBag } from "../../BagContext";
import "./OrderSummary.css";

function OrderSummary() {
  const navigate = useNavigate();

  const location = useLocation();

  const { bag, coupon } = useBag();

  const savedCheckout =
    JSON.parse(localStorage.getItem("WearAura-checkout")) || {};

  const addressData =
    location.state?.addressData || savedCheckout.addressData || {};

  const [shipping, setShipping] = useState("standard");

  // ✅ FIXED
  const subtotal =
    location.state?.subtotal ??
    savedCheckout.subtotal ??
    bag.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const discountAmount =
    coupon?.discount ?? location.state?.discount ?? savedCheckout.discount ?? 0;

  const shippingCost = shipping === "express" ? 50 : 0;

  const total = Math.round(subtotal - discountAmount + shippingCost);

  const handleContinue = () => {
    const nextState = {
      addressData,
      bagItems: bag,
      shipping,
      subtotal,
      discount: discountAmount,
      shippingCost,
      total,
      coupon,
    };

    navigate("/payment", {
      state: nextState,
    });
  };

  useEffect(() => {
    localStorage.setItem(
      "WearAura-checkout",
      JSON.stringify({
        addressData,
        bagItems: bag,
        shipping,
        subtotal,
        discount: discountAmount,
        shippingCost,
        total,
        coupon,
      }),
    );
  }, [addressData, bag, shipping, subtotal, discountAmount, shippingCost, total, coupon]);

  if (bag.length === 0) {
    return (
      <div className="summary-page">
        <div className="empty-summary">
          <h1>Your Bag is Empty</h1>

          <p>Add products before checkout.</p>

          <button onClick={() => navigate("/")}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-page">
      <div className="summary-container">
        {/* LEFT */}
        <div className="summary-products">
          <div className="section-head">
            <h1>Order Summary</h1>

            <p>Review your selected items</p>
          </div>

          <div className="items-wrap">
            {bag.map((item) => (
              <div
                className="summary-item"
                key={`${item.product._id}-${item.size}`}
              >
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />

                <div className="item-details">
                  <h3>{item.product.title}</h3>

                  <div className="meta-row">
                    <span>Size: {item.size}</span>

                    <span>Qty: {item.quantity}</span>
                  </div>

                  <div className="item-price">
                    ₹{Math.round(item.product.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="summary-sidebar">
          <div className="card-box">
            <h2>Deliver To</h2>

            <p>{addressData.name}</p>

            <p>{addressData.mobile}</p>

            <p>{addressData.address}</p>

            <p>
              {addressData.city}, {addressData.state} - {addressData.pincode}
            </p>
          </div>

          <div className="card-box">
            <h2>Shipping</h2>

            <label className="ship-option">
              <input
                type="radio"
                checked={shipping === "standard"}
                onChange={() => setShipping("standard")}
              />

              <span>Standard</span>

              <strong>Free</strong>
            </label>

            <label className="ship-option">
              <input
                type="radio"
                checked={shipping === "express"}
                onChange={() => setShipping("express")}
              />

              <span>Express</span>

              <strong>+₹50</strong>
            </label>
          </div>

          <div className="card-box">
            <h2>Bill Details</h2>

            <div className="bill-line">
              <span>Subtotal</span>

              <span>₹{subtotal}</span>
            </div>

            {coupon?.discount > 0 && (
              <div className="bill-line">
                <span>Coupon ({coupon.code})</span>

                <span>
                  -₹
                  {discountAmount}
                </span>
              </div>
            )}

            <div className="bill-line">
              <span>Shipping</span>

              <span>₹{shippingCost}</span>
            </div>

            <div className="bill-line grand-total">
              <span>Total</span>

              <span>₹{total}</span>
            </div>

            <button className="pay-btn" onClick={handleContinue}>
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
