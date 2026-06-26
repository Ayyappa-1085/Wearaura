import { memo, useMemo } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";

import { useWishlist } from "./WishlistContext";
import { getOptimizedImageUrl } from "../utils/imageUtils";

function ProductImage({ product, priority = false }) {
  const { toggleWishlist, isWishlisted } = useWishlist();

  const isLiked = isWishlisted(product);
  const imageUrl = useMemo(() => getOptimizedImageUrl(product.image, { width: 480 }), [product.image]);

  return (
    <div className="card-img">
      <img
        src={imageUrl || product.image}
        alt={product.title}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        width="320"
        height="320"
        draggable="false"
        onError={(event) => {
          if (event.currentTarget.src !== product.image) {
            event.currentTarget.src = product.image;
          }
        }}
      />

      <button
        type="button"
        className={`wishlist-icon ${isLiked ? "active" : ""}`}
        aria-pressed={isLiked}
        onClick={() => toggleWishlist(product)}
      >
        {isLiked ? <FaHeart /> : <FaRegHeart />}
      </button>
    </div>
  );
}

export default memo(ProductImage);
