import { memo, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";

function ProductCard({ product, isWishlist = false, priority = false }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const rectRef = useRef(null);
  const rafRef = useRef(null);

  const cardKey = useMemo(
    () => product._id || product.id || product.title,
    [product._id, product.id, product.title],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    rectRef.current = card.getBoundingClientRect();
    card.classList.add("is-tilting");
  };

  const handleMouseMove = (e) => {
    if (!rectRef.current) return;
    const rect = rectRef.current;
    if (rect.width === 0 || rect.height === 0) return;

    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    const MAX_TILT = 6;
    const rotX = Number((-normY * MAX_TILT).toFixed(2));
    const rotY = Number((normX * MAX_TILT).toFixed(2));

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (card) {
        card.style.setProperty("--tilt-x", `${rotX}deg`);
        card.style.setProperty("--tilt-y", `${rotY}deg`);
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    rectRef.current = null;
    const card = cardRef.current;
    if (card) {
      card.classList.remove("is-tilting");
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    }
  };

  const handleCardClick = () => {
    const targetId = product._id || product.id;
    if (!targetId) return;

    const imgEl = cardRef.current?.querySelector(".card-img img");

    if (imgEl && typeof document.startViewTransition === "function") {
      imgEl.style.viewTransitionName = "product-hero";

      const transition = document.startViewTransition(() => {
        navigate(`/product/${targetId}`, {
          state: { product },
        });
      });

      transition.finished.finally(() => {
        if (imgEl) {
          imgEl.style.viewTransitionName = "";
        }
      });
    } else {
      navigate(`/product/${targetId}`, {
        state: { product },
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      ref={cardRef}
      className="product-card"
      key={cardKey}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.title}`}
    >
      <ProductImage product={product} priority={priority} />
      <ProductInfo product={product} isWishlist={isWishlist} />
    </div>
  );
}

export default memo(ProductCard);
