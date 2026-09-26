import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaTshirt,
  FaFemale,
  FaChild,
  FaShoePrints,
  FaArrowLeft,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import "./Sidebar.css";
import { CATEGORY_ITEMS, CATEGORY_META } from "../data/categories";

const CATEGORY_ICONS = {
  men: FaTshirt,
  women: FaFemale,
  kids: FaChild,
  footwear: FaShoePrints,
};

function Sidebar({ mobileOnly = false, embedded = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, item } = useParams();

  const normalizedCategory = category?.toLowerCase();
  const currentMeta = CATEGORY_META[normalizedCategory];

  const [expandedCategory, setExpandedCategory] = useState(
    normalizedCategory || "",
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768,
  );

  // Active indicator positioning
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({
    top: 0,
    height: 0,
    opacity: 0,
  });

  const navContainerRef = useRef(null);
  const itemRefs = useRef({});
  const shouldIgnoreNextPathClose = useRef(false);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync expanded category with route on desktop
  useEffect(() => {
    if (isMobile) return;

    if (normalizedCategory) {
      setExpandedCategory(normalizedCategory);
    } else {
      setExpandedCategory("");
    }
  }, [normalizedCategory, isMobile]);

  // Handle openMobileSidebar route state
  useEffect(() => {
    if (
      !isMobile ||
      !normalizedCategory ||
      !location.state?.openMobileSidebar
    ) {
      return;
    }

    shouldIgnoreNextPathClose.current = true;
    setExpandedCategory(normalizedCategory);
    setIsMobileOpen(true);
  }, [isMobile, normalizedCategory, location.state?.openMobileSidebar]);

  // Global event listeners for mobile drawer
  useEffect(() => {
    const openDrawer = (event) => {
      const targetCategory = event?.detail?.category;
      if (targetCategory) {
        setExpandedCategory(targetCategory);
      }
      shouldIgnoreNextPathClose.current = true;
      setIsMobileOpen(true);
    };

    const closeDrawer = () => setIsMobileOpen(false);
    const toggleDrawer = () => setIsMobileOpen((prev) => !prev);

    window.addEventListener("wearaura:open-mobile-sidebar", openDrawer);
    window.addEventListener("wearaura:close-mobile-sidebar", closeDrawer);
    window.addEventListener("wearaura:toggle-mobile-sidebar", toggleDrawer);

    return () => {
      window.removeEventListener("wearaura:open-mobile-sidebar", openDrawer);
      window.removeEventListener("wearaura:close-mobile-sidebar", closeDrawer);
      window.removeEventListener(
        "wearaura:toggle-mobile-sidebar",
        toggleDrawer,
      );
    };
  }, []);

  // Close drawer on path change unless explicitly bypassed
  useEffect(() => {
    if (shouldIgnoreNextPathClose.current) {
      shouldIgnoreNextPathClose.current = false;
      return;
    }

    setIsMobileOpen(false);
  }, [location.pathname, location.search]);

  // Mobile body scroll locking
  useEffect(() => {
    if (!isMobile || !isMobileOpen) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      return;
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isMobile, isMobileOpen]);

  // Define top level navigation list
  const navItems = useMemo(() => {
    return [
      ...Object.entries(CATEGORY_META).map(([key, meta]) => ({
        key,
        label: meta.label,
        path: `/${key}`,
        icon: CATEGORY_ICONS[key] || FaTshirt,
        isCategory: true,
      })),
    ];
  }, []);

  // Determine currently active nav item key
  const currentActiveKey = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith("/men")) return "men";
    if (path.startsWith("/women")) return "women";
    if (path.startsWith("/kids")) return "kids";
    if (path.startsWith("/footwear")) return "footwear";
    return "";
  }, [location.pathname]);

  // Recalculate sliding active indicator position
  useEffect(() => {
    const updateActiveIndicator = () => {
      if (!currentActiveKey || !navContainerRef.current) {
        setActiveIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const activeEl = itemRefs.current[currentActiveKey];
      if (activeEl) {
        const containerRect = navContainerRef.current.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();

        setActiveIndicatorStyle({
          top:
            activeRect.top -
            containerRect.top +
            navContainerRef.current.scrollTop,
          height: activeRect.height,
          opacity: 1,
        });
      } else {
        setActiveIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    const rafId = requestAnimationFrame(updateActiveIndicator);
    return () => cancelAnimationFrame(rafId);
  }, [currentActiveKey, expandedCategory, isMobile, isMobileOpen]);

  // Architecture guards against duplicate instances (placed AFTER all hooks):
  if (mobileOnly && !isMobile) return null;
  if (embedded && isMobile) return null;
  if (embedded && !isMobile && !currentMeta) return null;

  // Drawer handlers
  const closeDrawer = () => setIsMobileOpen(false);

  const handleBackdropClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeDrawer();
  };

  const handleNavClick = (navItem) => {
    if (isMobile) {
      if (expandedCategory === navItem.key) {
        setExpandedCategory("");
      } else {
        setExpandedCategory(navItem.key);
      }
      return;
    }

    // Desktop
    if (expandedCategory === navItem.key) {
      setExpandedCategory((prev) => (prev ? "" : navItem.key));
    } else {
      setExpandedCategory(navItem.key);
      navigate(`/${navItem.key}`);
    }
  };

  const handleSubCategoryClick = (catKey, sub) => {
    closeDrawer();
    navigate(`/${catKey}/${sub}`);
  };

  // Back to Home handler
  const handleBackToHome = () => {
    closeDrawer();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Backdrop Scrim */}
      {isMobile && (
        <div
          className={`sidebar-backdrop ${isMobileOpen ? "open" : ""}`}
          onClick={handleBackdropClick}
          aria-hidden={!isMobileOpen}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`velora-sidebar ${isMobile ? "mobile-drawer" : "desktop-panel"} ${
          isMobile && isMobileOpen ? "drawer-open" : ""
        } ${!isMobile ? "expanded" : ""}`}
        aria-label="Sidebar navigation"
      >
        {/* Mobile Close Button */}
        {isMobile && (
          <div className="sidebar-top" style={{ "--item-idx": 0 }}>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={closeDrawer}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* ================= MIDDLE: PRIMARY NAVIGATION ================= */}
        <div className="sidebar-middle">
          <div className="sidebar-heading">
            <span className="sidebar-eyebrow">Shop</span>
            <h2>Categories</h2>
          </div>

          <nav
            className="sidebar-nav-list"
            ref={navContainerRef}
            aria-label="Primary Categories"
          >
            {/* Animated Sliding Active Indicator */}
            <div
              className="sidebar-active-pill"
              style={{
                transform: `translateY(${activeIndicatorStyle.top}px)`,
                height: `${activeIndicatorStyle.height}px`,
                opacity: activeIndicatorStyle.opacity,
              }}
              aria-hidden="true"
            />

            {navItems.map((nav, idx) => {
              const IconComponent = nav.icon;
              const isActive = currentActiveKey === nav.key;
              const isExpanded = expandedCategory === nav.key;
              const subItems = CATEGORY_ITEMS[nav.key] || [];

              return (
                <div
                  key={nav.key}
                  className={`nav-item-wrapper ${isExpanded ? "has-expanded" : ""}`}
                  style={{ "--item-idx": idx + 1 }}
                >
                  <button
                    ref={(el) => (itemRefs.current[nav.key] = el)}
                    type="button"
                    className={`nav-item-trigger ${isActive ? "active" : ""}`}
                    onClick={() => handleNavClick(nav)}
                    aria-expanded={nav.isCategory ? isExpanded : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="nav-icon-box">
                      <IconComponent className="nav-icon" />
                    </span>

                    <span className="nav-item-label">{nav.label}</span>

                    {nav.isCategory && (
                      <span className={`nav-arrow ${isExpanded ? "open" : ""}`}>
                        <FaChevronDown />
                      </span>
                    )}
                  </button>

                  {/* Subcategories Accordion */}
                  {nav.isCategory && (
                    <div
                      className={`nav-accordion-panel ${isExpanded ? "expanded" : ""}`}
                      aria-hidden={!isExpanded}
                    >
                      <div className="accordion-inner">
                        {subItems.map((sub) => {
                          const isSubSelected =
                            normalizedCategory === nav.key && item === sub;
                          return (
                            <button
                              key={sub}
                              type="button"
                              className={`sub-item-link ${
                                isSubSelected ? "selected" : ""
                              }`}
                              onClick={() =>
                                handleSubCategoryClick(nav.key, sub)
                              }
                            >
                              <span className="sub-indicator" />
                              <span className="sub-text">
                                {sub.charAt(0).toUpperCase() + sub.slice(1)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ================= BOTTOM: BACK TO HOME ================= */}
        <div
          className="sidebar-bottom"
          style={{ "--item-idx": navItems.length + 1 }}
        >
          <button
            type="button"
            className="sidebar-back-btn"
            onClick={handleBackToHome}
            aria-label="Back to Home"
          >
            <span className="nav-icon-box">
              <FaArrowLeft className="back-btn-icon" />
            </span>

            <span className="back-btn-label">Back to Home</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
