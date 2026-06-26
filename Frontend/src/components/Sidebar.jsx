import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Sidebar.css";
import { CATEGORY_ITEMS, CATEGORY_META } from "../data/categories";
import Content from "./Content";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, item } = useParams();

  const normalizedCategory = category?.toLowerCase();
  const currentMeta = CATEGORY_META[normalizedCategory];

  const [expandedCategory, setExpandedCategory] = useState(normalizedCategory || "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    if (normalizedCategory) {
      setExpandedCategory(normalizedCategory);
    } else {
      setExpandedCategory("");
    }
  }, [normalizedCategory]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const openDrawer = () => setIsMobileOpen(true);
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
        icon: meta.icon,
        description: meta.description,
      })),
    [],
  );

  if (!currentMeta) return null;

  const closeDrawer = () => setIsMobileOpen(false);

  const toggleCategory = (key) => {
    if (expandedCategory === key) {
      setExpandedCategory("");
      return;
    }

    setExpandedCategory(key);
  };

  const handleCategorySelect = (key) => {
    if (normalizedCategory === key) {
      toggleCategory(key);
      return;
    }

    setExpandedCategory(key);
    closeDrawer();
    navigate(`/${key}`);
  };

  const handleSubCategorySelect = (sub) => {
    closeDrawer();
    navigate(`/${normalizedCategory}/${sub}`);
  };

  return (
    <>
      {isMobile && (
        <button
          type="button"
          className={`sidebar-overlay ${isMobileOpen ? "open" : ""}`}
          onClick={closeDrawer}
          aria-label="Close categories"
        />
      )}

      <aside className={`sidebar ${isMobile ? "mobile-drawer" : ""} ${isMobile && isMobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <div>
              <p className="sidebar-eyebrow">Shop by</p>
              <h3>{currentMeta.label}</h3>
            </div>

            {isMobile && (
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={closeDrawer}
                aria-label="Close categories"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {isMobile && (
          <div className="sidebar-offer-shell">
            <Content />
          </div>
        )}

        <nav className="sidebar-nav" aria-label="Category navigation">
          {topLevelCategories.map((group) => {
            const isExpanded = expandedCategory === group.key;
            const isActive = normalizedCategory === group.key;

            return (
              <div className="sidebar-group" key={group.key}>
                <button
                  type="button"
                  className={`group-trigger ${isActive ? "active" : ""}`}
                  onClick={() => handleCategorySelect(group.key)}
                >
                  <span className="group-main">
                    <span className="group-icon">{group.icon}</span>
                    <span className="group-copy">
                      <span className="group-title">{group.label}</span>
                      <span className="group-description">{group.description}</span>
                    </span>
                  </span>
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
                      className={`group-item ${item === sub ? "selected" : ""}`}
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

        <button className="back-btn" onClick={() => {
          closeDrawer();
          navigate("/");
        }}>
          ← Back to Home
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
