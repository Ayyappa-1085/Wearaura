import { FaBars, FaSearch, FaUser, FaHeart, FaShoppingCart } from "react-icons/fa";
import { useWishlist } from "../WishlistContext";
import { useBag } from "../../BagContext";

function MobileNav({ setShowSearch, navigate, location, onMenuClick, showMenuButton }) {
  const { wishlist } = useWishlist();
  const { totalItems, openBag } = useBag();

  return (
    <div className="mobile-nav">
      {showMenuButton && (
        <button
          type="button"
          className="mobile-menu-trigger"
          onClick={onMenuClick}
          aria-label="Open categories"
        >
          <FaBars />
        </button>
      )}

      <FaSearch onClick={() => setShowSearch((prev) => !prev)} />

      <FaUser
        onClick={() =>
          navigate("/login", {
            state: { backgroundLocation: location },
          })
        }
      />

      <div
        style={{ position: "relative", cursor: "pointer" }}
        onClick={() => navigate("/wishlist")}
      >
        <FaHeart />
        {wishlist.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-8px",
              background: "white",
              color: "black",
              fontSize: "10px",
              padding: "2px 5px",
              borderRadius: "50%",
            }}
          >
            {wishlist.length}
          </span>
        )}
      </div>

      <div
        style={{ position: "relative", cursor: "pointer" }}
        onClick={openBag}
      >
        <FaShoppingCart />
        {totalItems > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-8px",
              background: "white",
              color: "black",
              fontSize: "10px",
              padding: "2px 5px",
              borderRadius: "50%",
            }}
          >
            {totalItems}
          </span>
        )}
      </div>
    </div>
  );
}

export default MobileNav;
