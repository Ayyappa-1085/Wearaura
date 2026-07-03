import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Sidebar.css";
import { CATEGORY_ITEMS, CATEGORY_META } from "../data/categories";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, item } = useParams();

  const normalizedCategory = category?.toLowerCase();
  const currentMeta = CATEGORY_META[normalizedCategory];

  const [expandedCategory, setExpandedCategory] = useState(normalizedCategory || "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const shouldIgnoreNextPathClose = useRef(false);

  // Desktop keeps its original route-driven behavior: the expanded/active
  // category mirrors the URL. On mobile, the drawer is a self-contained UI
  // surface — it must NOT be overwritten by route changes while the user is
  // browsing inside it (this was the source of Bug 3).
  useEffect(() => {
    if (isMobile) return;

    if (normalizedCategory) {
      setExpandedCategory(normalizedCategory);
    } else {
      setExpandedCategory("");
    }
  }, [normalizedCategory, isMobile]);

  useEffect(() => {
    if (!isMobile || !normalizedCategory || !location.state?.openMobileSidebar) {
      return;
    }

    shouldIgnoreNextPathClose.current = true;
    setExpandedCategory(normalizedCategory);
    setIsMobileOpen(true);
  }, [isMobile, normalizedCategory, location.state?.openMobileSidebar]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      window.removeEventListener("wearaura:toggle-mobile-sidebar", toggleDrawer);
    };
  }, []);

  useEffect(() => {
    if (shouldIgnoreNextPathClose.current) {
      shouldIgnoreNextPathClose.current = false;
      return;
    }

    setIsMobileOpen(false);
  }, [location.pathname, location.search]);

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

  const topLevelCategories = useMemo(
    () =>
      Object.entries(CATEGORY_META).map(([key, meta]) => ({
        key,
        label: meta.label,
      })),
    [],
  );

  // On mobile the sidebar is a global drawer that can open over ANY page
  // (Home, Orders, etc.), so it must not depend on being on a category
  // route. Desktop keeps its original behavior of only rendering as an
  // embedded panel on category pages.
  if (!isMobile && !currentMeta) return null;

  const closeDrawer = () => setIsMobileOpen(false);

  // NOTE: This handler is intentionally wired to onClick ONLY (see JSX below).
  // `click` is the terminal event in the touch-to-mouse compatibility sequence
  // (touchstart -> touchend -> mousemove -> mousedown -> mouseup -> click).
  // By only reacting here, the drawer-close + navigation state change happens
  // strictly AFTER the entire tap gesture has been fully dispatched, so there
  // is no leftover event left in the queue that can be re-hit-tested against
  // newly-mounted Home page content underneath. No setTimeout is needed
  // because there is no longer a race to defer past.
  const handleCloseWithoutSelection = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    closeDrawer();
    if (isMobile) {
      navigate("/");
    }
  };

  const handleBackdropInteraction = (event) => {
    handleCloseWithoutSelection(event);
  };

  const toggleCategory = (key) => {
    if (expandedCategory === key) {
      setExpandedCategory("");
      return;
    }

    setExpandedCategory(key);
  };

  // Selecting a top-level category (Men/Women/Kids/Footwear) only ever
  // changes what the sidebar is showing. It is never a navigation event —
  // the URL should not change until the user picks a final submenu item.
  const handleCategorySelect = (key) => {
    if (isMobile) {
      toggleCategory(key);
      return;
    }

    // Desktop: unchanged original behavior (embedded nav follows the route).
    if (normalizedCategory === key) {
      toggleCategory(key);
      return;
    }

    setExpandedCategory(key);
    closeDrawer();
    navigate(`/${key}`);
  };

  // The only place routing actually happens: the user picked a final
  // destination. Always build the path from the category the sidebar has
  // expanded, never from the current route.
  const handleSubCategorySelect = (sub) => {
    closeDrawer();
    navigate(`/${expandedCategory}/${sub}`);
  };

  return (
    <>
      {isMobile && (
        <button
          type="button"
          className={`sidebar-overlay ${isMobileOpen ? "open" : ""}`}
          onClick={handleBackdropInteraction}
          aria-label="Close categories"
        />
      )}

      <aside
        className={`sidebar ${isMobile ? "mobile-drawer" : ""} ${isMobile && isMobileOpen ? "open" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onTouchEnd={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <div>
              <p className="sidebar-eyebrow">Shop</p>
              <h3>Categories</h3>
            </div>

            {isMobile && (
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={handleCloseWithoutSelection}
                aria-label="Close categories"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Category navigation">
          {topLevelCategories.map((group) => {
            const isExpanded = expandedCategory === group.key;
            const isActive = expandedCategory === group.key;

            return (
              <div className="sidebar-group" key={group.key}>
                <button
                  type="button"
                  className={`group-trigger ${isActive ? "active" : ""}`}
                  onClick={() => handleCategorySelect(group.key)}
                >
                  <span className="group-title">{group.label}</span>
                  <span className={`group-arrow ${isExpanded ? "open" : ""}`}>
                    ▾
                  </span>
                </button>

                <div
                  className={`group-panel ${isExpanded ? "open" : ""}`}
                  aria-hidden={!isExpanded}
                >
                  {CATEGORY_ITEMS[group.key].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      className={`group-item ${
                        normalizedCategory === group.key && item === sub ? "selected" : ""
                      }`}
                      onClick={() => handleSubCategorySelect(sub)}
                    >
                      {sub.charAt(0).toUpperCase() + sub.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <button className="back-btn" onClick={handleCloseWithoutSelection}>
          ← Back to Home
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
