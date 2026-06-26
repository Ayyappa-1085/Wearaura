import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBag } from "../../BagContext";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { bag, totalItems, totalPrice, coupon } = useBag();

  const savedAddress = JSON.parse(localStorage.getItem("WearAura-address")) || {};
  const savedCheckout =
    JSON.parse(localStorage.getItem("WearAura-checkout")) || {};
  const incomingState = location.state || savedCheckout;

  const [formData, setFormData] = useState({
    name: savedAddress.name || "",
    email: savedAddress.email || "",
    mobile: savedAddress.mobile || "",
    pincode: savedAddress.pincode || "",
    city: savedAddress.city || "",
    district: savedAddress.district || "",
    state: savedAddress.state || "",
    address: savedAddress.address || "",
    landmark: savedAddress.landmark || "",
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [error, setError] = useState("");

  const discountAmount = coupon?.discount || incomingState.discount || 0;

  const finalTotal = Math.round(totalPrice - discountAmount);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "pincode" && value.length === 6) {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${value}`,
        );

        const data = await res.json();
        const result = data[0];

        if (result.Status === "Success" && result.PostOffice?.length) {
          const offices = result.PostOffice;

          const district = offices[0].District;
          const state = offices[0].State;

          const cities = [...new Set(offices.map((i) => i.Name))].slice(0, 4);

          setCityOptions([...cities, "Other"]);

          setFormData((prev) => ({
            ...prev,
            pincode: value,
            district,
            state,
            city: cities[0] || "",
          }));

          setError("");
        } else {
          resetLocation();
          setError("Invalid pincode");
        }
      } catch {
        resetLocation();
        setError("Failed to fetch location");
      }
    }

    if (name === "pincode" && value.length < 6) {
      resetLocation();
    }
  };

  const resetLocation = () => {
    setCityOptions([]);
    setFormData((prev) => ({
      ...prev,
      city: "",
      district: "",
      state: "",
    }));
  };

  const handleContinue = () => {
    if (!bag.length) {
      setError("Bag is empty");
      return;
    }

    if (!formData.name || !formData.mobile) {
      setError("Please fill required fields");
      return;
    }

    const checkoutState = {
      addressData: formData,
      bagItems: bag,
      subtotal: totalPrice,
      discount: discountAmount,
      shippingCost: 0,
      total: finalTotal,
      coupon,
    };

    localStorage.setItem("WearAura-address", JSON.stringify(formData));
    localStorage.setItem("WearAura-checkout", JSON.stringify(checkoutState));

    navigate("/order-summary", {
      state: checkoutState,
    });
  };

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <div className="checkout-left">
          <h1>Checkout</h1>
          <p className="checkout-subtitle">Fill your delivery details</p>

          {error && <p className="error-text">{error}</p>}

          <div className="checkout-grid">
            <div className="input-group">
              <label>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Mobile</label>
              <input
                name="mobile"
                maxLength="10"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Pincode</label>
              <input
                name="pincode"
                maxLength="6"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>

            <div className="input-group full-width">
              <label>Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>City</label>
              {cityOptions.length > 0 ? (
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                >
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={formData.city} readOnly />
              )}
            </div>

            <div className="input-group">
              <label>District</label>
              <input value={formData.district} readOnly />
            </div>

            <div className="input-group">
              <label>State</label>
              <input value={formData.state} readOnly />
            </div>
          </div>

          <button className="continue-btn" onClick={handleContinue}>
            Continue to Payment
          </button>
        </div>

        <div className="checkout-right">
          <div className="summary-box">
            <h2>Order Summary</h2>

            <p>Items: {totalItems}</p>
            <p>Subtotal: ₹{totalPrice}</p>

            {coupon?.discount > 0 && <p>Discount: -₹{discountAmount}</p>}

            <p>
              <strong>Total: ₹{finalTotal}</strong>
            </p>

            <hr />

            {bag.slice(0, 3).map((item) => (
              <p key={`${item.product._id}-${item.size}`}>
                {item.product.title} × {item.quantity}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
