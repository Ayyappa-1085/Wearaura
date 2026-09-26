import { useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import { useBag } from "../BagContext";
import { useWishlist } from "./WishlistContext";

function ProductInfo({ product, isWishlist = false }) {
  const { addToBag } = useBag();
  const { toggleWishlist } = useWishlist();

  const [showSizes, setShowSizes] = useState(false);

  const sizes = ["S", "M", "L", "XL"];

  // fallback safety
  const sizeStock = product.sizeStock || {
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
  };

  const allOut = Object.values(sizeStock).every((qty) => qty === 0);

  // 🔥 low stock indicator
  const isLowStock = (size) => sizeStock[size] > 0 && sizeStock[size] <= 2;

  const handleSelectSize = (size) => {
    if (sizeStock[size] === 0) return;

    // 🔥 HARD VALIDATION
    if (!product || !product._id) {
      console.error("Invalid product passed to cart:", product);
      return;
    }

    // ✅ FIX: PASS FULL PRODUCT OBJECT
    addToBag(product, size);

    setShowSizes(false);

    if (isWishlist) {
      toggleWishlist(product);
    }
  };

  return (
    <div className="card-info">
      <div className="title-row">
        <h4>{product.title}</h4>

        {/* 🔥 disable icon when out */}
        <span
          className={`plus-icon ${allOut ? "disabled" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!allOut) {
              setShowSizes(!showSizes);
            }
          }}
        >
          <FaShoppingBag />
        </span>
      </div>

      <p className="subtitle">{product.subtitle}</p>

      <div className="price">
        <span className="new">₹{product.price}</span>
        <span className="old">₹{product.oldPrice}</span>
      </div>

      {/* 🔴 GLOBAL OUT OF STOCK */}
      {allOut && <p className="out-stock">Out of Stock</p>}

      {/* ✅ SIZE PICKER */}
      {showSizes && !allOut && (
        <div className="size-picker" onClick={(e) => e.stopPropagation()}>
          {sizes.map((size) => {
            const stock = sizeStock[size];
            const isOut = stock === 0;

            return (
              <button
                key={size}
                disabled={isOut}
                className={`size-btn ${isOut ? "disabled-size" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectSize(size);
                }}
              >
                {size}

                {/* 🔥 LOW STOCK */}
                {isLowStock(size) && (
                  <span className="low-stock">Only {stock} left</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductInfo;
