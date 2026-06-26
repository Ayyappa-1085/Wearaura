import "./BagDrawer.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaMinus, FaPlus, FaHeart, FaRegHeart } from "react-icons/fa";

import { useBag } from "../BagContext";
import { useWishlist } from "./WishlistContext";
import Recommendations from "./Recommendations";
import PriceSummary from "./PriceSummary";
import toast from "react-hot-toast"; // ✅ added

function BagDrawer() {
  const navigate = useNavigate();

  const {
    bag,
    saved,
    isBagOpen,
    closeBag,
    increaseQty,
    decreaseQty,
    removeFromBag,
    addToBag,
    saveForLater,
    moveToBagFromSaved,
    removeFromSaved,
    totalItems,
    totalPrice,
    coupon,
    discountAmount,
    finalTotal,
    applyCoupon,
  } = useBag();

  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const [loadingMap, setLoadingMap] = useState({});
  const [itemError, setItemError] = useState({});

  const setLoading = (key, value) => {
    setLoadingMap((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    document.body.style.overflow = isBagOpen ? "hidden" : "auto";

    document.documentElement.style.overflow = isBagOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [isBagOpen]);

  useEffect(() => {
    if (bag.length === 0) {
      setAppliedCoupon("");
      setCouponInput("");
    }
  }, [bag]);

  const handleSaveForLater = (item) => {
    saveForLater(item.product._id, item.size);
  };

  const moveToBag = (item) => {
    moveToBagFromSaved(item.product._id, item.size);
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;

    applyCoupon(couponInput);
    setAppliedCoupon(couponInput);
  };

  const handleInputChange = (e) => {
    setCouponInput(e.target.value);

    if (appliedCoupon) {
      setAppliedCoupon("");
    }
  };

  const safeFinalTotal = Number.isFinite(finalTotal) ? finalTotal : totalPrice;
  const couponAmount = coupon?.discount || 0;

  // ✅ CHECK BEFORE CHECKOUT
  const handleCheckout = () => {
    const hasError = Object.keys(itemError).length > 0;

    if (hasError) {
      toast.error("Please fix item issues before checkout");
      return;
    }

    if (bag.length === 0) {
      toast.error("Your bag is empty");
      return;
    }

    closeBag();
    navigate("/checkout");
  };

  return (
    <>
      <div
        className={`bag-overlay ${isBagOpen ? "show" : ""}`}
        onClick={closeBag}
      />

      <div className={`bag-drawer ${isBagOpen ? "open" : ""}`}>
        <div className="bag-header">
          <button onClick={closeBag}>
            <FaTimes />
          </button>
          <h3>BAG ({totalItems})</h3>
        </div>

        <div className="bag-content">
          {bag.length === 0 ? (
            <div className="empty-wrap">
              <h3>Your bag is empty</h3>
              <p>Add something you love.</p>
              <button onClick={closeBag}>Continue Shopping</button>
            </div>
          ) : (
            <>
              {bag.map((item) => {
                const key = `${item.product._id}-${item.size}`;
                const isLoading = loadingMap[key];

                return (
                  <div className="bag-item" key={key}>
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />

                    <div className="bag-info">
                      <h4>{item.product.title}</h4>

                      <p className="bag-price">₹{item.product.price}</p>

                      <div className="bag-size-pill">Size {item.size}</div>

                      <div className="qty-box">
                        <button
                          disabled={isLoading}
                          onClick={async () => {
                            if (isLoading) return;

                            setLoading(key, true);

                            const res = await decreaseQty(
                              item.product._id,
                              item.size,
                            );

                            if (res?.error) {
                              toast.error(res.error);

                              setItemError((prev) => ({
                                ...prev,
                                [key]: res.error,
                              }));

                              setTimeout(() => {
                                setItemError((prev) => {
                                  const updated = { ...prev };
                                  delete updated[key];
                                  return updated;
                                });
                              }, 2000);
                            }

                            setLoading(key, false);
                          }}
                        >
                          {isLoading ? "..." : <FaMinus />}
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          disabled={isLoading}
                          onClick={async () => {
                            if (isLoading) return;

                            setLoading(key, true);

                            const res = await increaseQty(
                              item.product._id,
                              item.size,
                            );

                            if (res?.error) {
                              toast.error(res.error);

                              setItemError((prev) => ({
                                ...prev,
                                [key]: res.error,
                              }));

                              setTimeout(() => {
                                setItemError((prev) => {
                                  const updated = { ...prev };
                                  delete updated[key];
                                  return updated;
                                });
                              }, 2000);
                            }

                            setLoading(key, false);
                          }}
                        >
                          {isLoading ? "..." : <FaPlus />}
                        </button>
                      </div>

                      {itemError[key] && (
                        <p className="item-error">{itemError[key]}</p>
                      )}

                      <div className="save-later">
                        <button onClick={() => handleSaveForLater(item)}>
                          Save for later
                        </button>
                      </div>

                    </div>

                    <div className="bag-actions">
                      <button
                        className="remove-btn"
                        disabled={isLoading}
                        onClick={async () => {
                          if (isLoading) return;

                          setLoading(key, true);
                          await removeFromBag(item.product._id, item.size);
                          setLoading(key, false);
                        }}
                      >
                        <FaTimes />
                      </button>

                      <button
                        className={`bag-wishlist-btn ${
                          isWishlisted(item.product) ? "active" : ""
                        }`}
                        disabled={isLoading}
                        onClick={async () => {
                          if (isLoading) return;

                          setLoading(key, true);

                          try {
                            if (isWishlisted(item.product)) {
                              await removeFromBag(item.product._id, item.size);
                            } else {
                              await addToWishlist(item.product);
                              await removeFromBag(item.product._id, item.size);
                            }
                          } catch {
                            toast.error("Unable to move item to wishlist");
                          }

                          setLoading(key, false);
                        }}
                      >
                        {isWishlisted(item.product) ? <FaHeart /> : <FaRegHeart />}
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="coupon-row">
                <input
                  type="text"
                  placeholder="Enter coupon"
                  value={couponInput}
                  onChange={handleInputChange}
                />
                <button onClick={handleApplyCoupon}>Apply</button>
              </div>

              <PriceSummary
                totalPrice={totalPrice}
                discountAmount={couponAmount}
                finalTotal={safeFinalTotal}
              />

              <Recommendations />

              {saved.length > 0 && (
                <div className="saved-section">
                  <h3>Saved for later</h3>

                  {saved.map((item) => (
                    <div
                      className="bag-item"
                      key={`${item.product._id}-${item.size}`}
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />

                      <div className="bag-info">
                        <h4>{item.product.title}</h4>

                        <p className="bag-price">₹{item.product.price}</p>

                        <button onClick={() => moveToBag(item)}>
                          Move to Bag
                        </button>
                      </div>

                      <div className="bag-actions">
                        <button
                          onClick={() =>
                            removeFromSaved(item.product._id, item.size)
                          }
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {bag.length > 0 && (
          <div className="bag-footer">
            <button className="checkout-btn" onClick={handleCheckout}>
              CHECKOUT / ₹
              {Math.round(safeFinalTotal)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default BagDrawer;
