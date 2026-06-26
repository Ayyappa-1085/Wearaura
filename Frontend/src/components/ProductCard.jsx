import { memo, useMemo } from "react";
import "./ProductCard.css";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";

function ProductCard({ product, isWishlist = false, priority = false }) {
  const cardKey = useMemo(() => product._id || product.id || product.title, [product._id, product.id, product.title]);

  return (
    <div className="product-card" key={cardKey}>
      <ProductImage product={product} priority={priority} />

      <ProductInfo product={product} isWishlist={isWishlist} />
    </div>
  );
}

export default memo(ProductCard);
