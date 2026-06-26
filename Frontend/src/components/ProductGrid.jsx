import { memo, useMemo } from "react";
import ProductCard from "./ProductCard";

function ProductGrid({ products, isWishlist = false }) {
  const safeProducts = useMemo(() => products || [], [products]);

  return (
    <div className="products-grid">
      {safeProducts.map((product, index) => (
        <ProductCard
          key={product._id || product.id || product.title}
          product={product}
          isWishlist={isWishlist}
          priority={index < 4}
        />
      ))}
    </div>
  );
}

export default memo(ProductGrid);
