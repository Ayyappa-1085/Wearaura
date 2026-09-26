import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaShoppingBag,
  FaCheck,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaChevronDown,
  FaMinus,
  FaPlus,
} from "react-icons/fa";

import { useBag } from "../../BagContext";
import { useWishlist } from "../../components/WishlistContext";
import api from "../../utils/api";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import "./ProductDetail.css";

const SIZES = ["S", "M", "L", "XL"];

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { addToBag, openBag } = useBag();
  const { toggleWishlist, isWishlisted } = useWishlist();

  // Prefer instantaneous state from route transition
  const initialProduct =
    location.state?.product?._id === id || location.state?.product?.id === id
      ? location.state.product
      : null;

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variant selections
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  // Micro-interaction states
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Accordion open states
  const [openAccordion, setOpenAccordion] = useState("details");

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const recsSectionRef = useRef(null);
  const [recsVisible, setRecsVisible] = useState(false);

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setActiveImageIndex(0);
    setQuantity(1);
    setAddedSuccess(false);
  }, [id]);

  // Fetch product if not provided or to ensure fresh inventory
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        if (!product) {
          setLoading(true);
        }
        const res = await api.get(`/api/products/${id}`);
        if (isMounted) {
          setProduct(res.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load product:", err);
          if (!product) {
            setError("Product could not be found");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Available images array (strictly real data — never create fake thumbnails)
  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return product.image ? [product.image] : [];
  }, [product]);

  // Stock calculations
  const sizeStock = useMemo(() => {
    return (
      product?.sizeStock || {
        S: product?.stock || 0,
        M: product?.stock || 0,
        L: product?.stock || 0,
        XL: product?.stock || 0,
      }
    );
  }, [product]);

  const allOutOfStock = useMemo(() => {
    return Object.values(sizeStock).every((qty) => Number(qty) <= 0);
  }, [sizeStock]);

  // Automatically select first in-stock size if current is out
  useEffect(() => {
    if (product) {
      const currentStock = sizeStock[selectedSize] ?? 0;
      if (currentStock <= 0) {
        const firstInStock = SIZES.find((s) => (sizeStock[s] ?? 0) > 0);
        if (firstInStock) {
          setSelectedSize(firstInStock);
        }
      }
    }
  }, [product, sizeStock, selectedSize]);

  // Discount calculation (strictly guarded against missing/invalid oldPrice)
  const discountPercent = useMemo(() => {
    if (!product?.oldPrice || !product?.price) return 0;
    const oldP = Number(product.oldPrice);
    const newP = Number(product.price);
    if (oldP > newP && oldP > 0) {
      return Math.round(((oldP - newP) / oldP) * 100);
    }
    return 0;
  }, [product]);

  // Current selected size stock
  const currentSizeStock = sizeStock[selectedSize] ?? 0;

  // Quantity handlers
  const handleIncreaseQty = () => {
    if (quantity < currentSizeStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Add to Bag with fast tactile micro-interaction
  const handleAddToBag = async () => {
    if (allOutOfStock || currentSizeStock <= 0 || isAdding) return;

    setIsAdding(true);
    try {
      await addToBag(product, selectedSize, quantity);
      setIsAdding(false);
      setAddedSuccess(true);

      // Reset feedback after 2 seconds
      setTimeout(() => {
        setAddedSuccess(false);
      }, 2200);
    } catch (err) {
      setIsAdding(false);
      console.error("Add to bag failed:", err);
    }
  };

  // Lazy-load recommendations with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRecsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    if (recsSectionRef.current) {
      observer.observe(recsSectionRef.current);
    }

    return () => observer.disconnect();
  }, [id]);

  useEffect(() => {
    if (!recsVisible || !product?.category) return;

    let isMounted = true;
    const loadRecommendations = async () => {
      try {
        setLoadingRecs(true);
        const res = await api.get(
          `/api/products?category=${encodeURIComponent(product.category)}&limit=8`,
        );
        const list = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];

        if (isMounted) {
          // Exclude current product and take top 4
          const filtered = list
            .filter((p) => (p._id || p.id) !== (product._id || product.id))
            .slice(0, 4);
          setRecommendations(filtered);
        }
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        if (isMounted) setLoadingRecs(false);
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [recsVisible, product?.category, product?._id]);

  // Navigate to recommendation with View Transition
  const handleRecClick = (recProduct, imgElement) => {
    const targetId = recProduct._id || recProduct.id;
    if (!targetId) return;

    if (imgElement && typeof document.startViewTransition === "function") {
      // Clear viewTransitionName from current hero image so no duplicate exists during snapshot
      const currentHero = document.querySelector(".product-hero-img");
      if (currentHero) {
        currentHero.style.viewTransitionName = "none";
      }

      imgElement.style.viewTransitionName = "product-hero";

      const transition = document.startViewTransition(() => {
        navigate(`/product/${targetId}`, {
          state: { product: recProduct },
        });
      });

      transition.finished.finally(() => {
        if (imgElement) {
          imgElement.style.viewTransitionName = "";
        }
      });
    } else {
      navigate(`/product/${targetId}`, {
        state: { product: recProduct },
      });
    }
  };

  if (loading && !product) {
    return (
      <div className="product-detail-skeleton">
        <div className="skeleton-image" />
        <div className="skeleton-info">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-price" />
          <div className="skeleton-line skeleton-sizes" />
          <div className="skeleton-line skeleton-button" />
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="product-detail-error">
        <h2>{error}</h2>
        <p>The garment you are looking for is currently unavailable.</p>
        <button
          className="editorial-primary-btn"
          onClick={() => navigate(-1)}
        >
          Return to Collection
        </button>
      </div>
    );
  }

  const isLiked = isWishlisted(product);
  const mainImageUrl = images[activeImageIndex] || product.image;
  const optimizedMainImage = getOptimizedImageUrl(mainImageUrl, { width: 960 });

  return (
    <div className="product-detail-page velora-page-fade">
      {/* Editorial Breadcrumb */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to={`/${product.category}`}>{product.category}</Link>
        {product.type && (
          <>
            <span className="breadcrumb-sep">/</span>
            <Link to={`/${product.category}/${product.type}`}>
              {product.type}
            </Link>
          </>
        )}
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{product.title}</span>
      </nav>

      <div className="product-detail-layout">
        {/* ================= LEFT: VISUAL GALLERY ================= */}
        <section className="product-gallery-section" aria-label="Product Gallery">
          {/* Thumbnails: ONLY rendered if multiple authentic images exist */}
          {images.length > 1 && (
            <div className="product-thumbnails-col">
              {images.map((imgSrc, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`product-thumbnail-btn ${
                    activeImageIndex === idx ? "active" : ""
                  }`}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={getOptimizedImageUrl(imgSrc, { width: 160 })}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Focal Hero Image */}
          <div className="product-hero-container">
            <img
              src={optimizedMainImage}
              alt={product.title}
              className="product-hero-img"
              style={{ viewTransitionName: "product-hero" }}
              fetchPriority="high"
              decoding="async"
              width="640"
              height="800"
            />

            {/* Mobile swipe indicators (when multiple images) */}
            {images.length > 1 && (
              <div className="mobile-gallery-dots">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`gallery-dot ${
                      activeImageIndex === idx ? "active" : ""
                    }`}
                    onClick={() => setActiveImageIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= RIGHT: EDITORIAL PRODUCT INFO ================= */}
        <section className="product-info-section" aria-label="Product Information">
          <div className="product-header">
            {product.subtitle && (
              <span className="product-badge">{product.subtitle}</span>
            )}
            <h1 className="product-title">{product.title}</h1>

            <div className="product-price-row">
              <span className="product-price-current">₹{product.price}</span>
              {discountPercent > 0 && (
                <>
                  <span className="product-price-old">₹{product.oldPrice}</span>
                  <span className="product-discount-tag">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="product-tax-note">Inclusive of all local taxes</p>
          </div>

          <hr className="editorial-divider" />

          {/* Color Indicator */}
          <div className="product-variant-group">
            <div className="variant-label-row">
              <span className="variant-label">Category / Style</span>
              <span className="variant-value">
                {product.category} &bull; {product.type}
              </span>
            </div>
          </div>

          {/* Size Selector */}
          <div className="product-variant-group">
            <div className="variant-label-row">
              <span className="variant-label">Select Size</span>
              {currentSizeStock > 0 && currentSizeStock <= 2 && (
                <span className="variant-alert">
                  Only {currentSizeStock} remaining
                </span>
              )}
            </div>

            <div className="size-selector-grid" role="radiogroup" aria-label="Size Selection">
              {SIZES.map((size) => {
                const stock = sizeStock[size] ?? 0;
                const isOut = stock <= 0;
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isOut}
                    className={`editorial-size-pill ${
                      isSelected ? "selected" : ""
                    } ${isOut ? "out-of-stock" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    <span className="size-text">{size}</span>
                    {isOut && <span className="size-out-line" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper */}
          {!allOutOfStock && currentSizeStock > 0 && (
            <div className="product-quantity-row">
              <span className="variant-label">Quantity</span>
              <div className="quantity-stepper">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={handleDecreaseQty}
                >
                  <FaMinus />
                </button>
                <span className="quantity-display" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={quantity >= currentSizeStock}
                  onClick={handleIncreaseQty}
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          )}

          {/* Primary CTA Area */}
          <div className="product-actions-block">
            <button
              type="button"
              className={`editorial-add-to-bag-btn ${
                addedSuccess ? "success" : ""
              } ${allOutOfStock || currentSizeStock <= 0 ? "disabled" : ""}`}
              disabled={allOutOfStock || currentSizeStock <= 0 || isAdding}
              onClick={handleAddToBag}
            >
              {allOutOfStock || currentSizeStock <= 0 ? (
                "Sold Out"
              ) : isAdding ? (
                "Adding..."
              ) : addedSuccess ? (
                <>
                  <FaCheck className="btn-icon-check" /> Added to Bag
                </>
              ) : (
                <>
                  <FaShoppingBag className="btn-icon" /> Add to Bag
                </>
              )}
            </button>

            <button
              type="button"
              className={`editorial-wishlist-btn ${isLiked ? "active" : ""}`}
              aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isLiked}
              onClick={() => toggleWishlist(product)}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
              <span>{isLiked ? "Saved" : "Wishlist"}</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="product-perks-strip">
            <div className="perk-item">
              <FaTruck className="perk-icon" />
              <span>Free standard delivery on orders above ₹999</span>
            </div>
            <div className="perk-item">
              <FaShieldAlt className="perk-icon" />
              <span>100% Genuine WearAura Craftsmanship</span>
            </div>
            <div className="perk-item">
              <FaUndo className="perk-icon" />
              <span>Complimentary 30-day doorstep exchanges</span>
            </div>
          </div>

          {/* Editorial Collapsible Details */}
          <div className="product-accordions">
            <div className="accordion-item">
              <button
                type="button"
                className="accordion-header"
                onClick={() =>
                  setOpenAccordion(
                    openAccordion === "details" ? null : "details",
                  )
                }
                aria-expanded={openAccordion === "details"}
              >
                <span>Product Details & Silhouette</span>
                <FaChevronDown
                  className={`chevron ${
                    openAccordion === "details" ? "open" : ""
                  }`}
                />
              </button>
              {openAccordion === "details" && (
                <div className="accordion-content">
                  <p>
                    Precision-tailored from our signature {product.category} collection.
                    Featuring clean lines, refined structural drape, and tailored
                    proportions engineered for effortless everyday luxury.
                  </p>
                  <ul className="editorial-spec-list">
                    <li>Cut: Tailored Modern Fit</li>
                    <li>Category: {product.category}</li>
                    <li>Style: {product.type || "Casual Luxury"}</li>
                    <li>Item ID: {product._id || product.id}</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <button
                type="button"
                className="accordion-header"
                onClick={() =>
                  setOpenAccordion(openAccordion === "care" ? null : "care")
                }
                aria-expanded={openAccordion === "care"}
              >
                <span>Fabric & Garment Care</span>
                <FaChevronDown
                  className={`chevron ${
                    openAccordion === "care" ? "open" : ""
                  }`}
                />
              </button>
              {openAccordion === "care" && (
                <div className="accordion-content">
                  <p>
                    Crafted with premium high-density yarns for longevity and soft hand-feel.
                  </p>
                  <ul className="editorial-spec-list">
                    <li>100% Premium Selected Cotton & Fiber Blend</li>
                    <li>Machine wash delicate at 30°C / 85°F</li>
                    <li>Do not tumble dry; reshape whilst damp</li>
                    <li>Warm iron on reverse if desired</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <button
                type="button"
                className="accordion-header"
                onClick={() =>
                  setOpenAccordion(
                    openAccordion === "shipping" ? null : "shipping",
                  )
                }
                aria-expanded={openAccordion === "shipping"}
              >
                <span>Shipping & Express Returns</span>
                <FaChevronDown
                  className={`chevron ${
                    openAccordion === "shipping" ? "open" : ""
                  }`}
                />
              </button>
              {openAccordion === "shipping" && (
                <div className="accordion-content">
                  <p>
                    All WearAura orders are dispatched within 24 hours in eco-conscious
                    signature packaging. Standard delivery takes 2–4 business days across India.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ================= MOBILE STICKY BOTTOM BAR ================= */}
      <aside className="mobile-sticky-cta-bar" aria-label="Quick Purchase Bar">
        <div className="sticky-price-block">
          <span className="sticky-label">Total Price</span>
          <span className="sticky-price">₹{product.price * quantity}</span>
        </div>
        <button
          type="button"
          className={`sticky-add-btn ${addedSuccess ? "success" : ""} ${
            allOutOfStock || currentSizeStock <= 0 ? "disabled" : ""
          }`}
          disabled={allOutOfStock || currentSizeStock <= 0 || isAdding}
          onClick={handleAddToBag}
        >
          {allOutOfStock || currentSizeStock <= 0
            ? "Sold Out"
            : addedSuccess
            ? "Added ✓"
            : `Add to Bag • ${selectedSize}`}
        </button>
      </aside>

      {/* ================= RECOMMENDATIONS ("YOU MAY ALSO LIKE") ================= */}
      <section
        ref={recsSectionRef}
        className="recommendations-container reveal-init reveal-active"
        aria-label="Recommended Garments"
      >
        <div className="recs-header">
          <span className="recs-subtitle">Curated Pairings</span>
          <h2 className="recs-title">You May Also Like</h2>
        </div>

        {loadingRecs ? (
          <div className="recs-loading">Curating selections...</div>
        ) : recommendations.length > 0 ? (
          <div className="recommendations-grid">
            {recommendations.map((recItem) => {
              const recId = recItem._id || recItem.id;
              const hasRecDiscount =
                recItem.oldPrice && Number(recItem.oldPrice) > Number(recItem.price);
              const recDiscount = hasRecDiscount
                ? Math.round(
                    ((recItem.oldPrice - recItem.price) / recItem.oldPrice) * 100,
                  )
                : 0;

              return (
                <article
                  key={recId}
                  className="rec-card"
                  onClick={(e) => {
                    const img = e.currentTarget.querySelector("img");
                    handleRecClick(recItem, img);
                  }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const img = e.currentTarget.querySelector("img");
                      handleRecClick(recItem, img);
                    }
                  }}
                  aria-label={`View ${recItem.title}`}
                >
                  <div className="rec-img-wrapper">
                    <img
                      src={getOptimizedImageUrl(recItem.image, { width: 420 })}
                      alt={recItem.title}
                      loading="lazy"
                      decoding="async"
                      width="280"
                      height="360"
                    />
                  </div>
                  <div className="rec-info">
                    <h3 className="rec-card-title">{recItem.title}</h3>
                    <p className="rec-card-subtitle">{recItem.subtitle}</p>
                    <div className="rec-card-price">
                      <span className="rec-new-price">₹{recItem.price}</span>
                      {recDiscount > 0 && (
                        <span className="rec-old-price">₹{recItem.oldPrice}</span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default ProductDetail;

