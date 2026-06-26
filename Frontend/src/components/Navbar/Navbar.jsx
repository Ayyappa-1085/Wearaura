import "./Navbar.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "./TopBar";
import NavLinks from "./NavLinks";
import NavIcons from "./NavIcons";
import MobileNav from "./MobileNav";

const MAX_H = 76;
const MIN_H = 46;
const MAX_SCROLL = 160;

function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileScrolled, setMobileScrolled] = useState(false);
  const [showFilterSort, setShowFilterSort] = useState(false);

  const [showSortMenu, setShowSortMenu] = useState(false);

  const [sortType, setSortType] = useState("default");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  const ticking = useRef(false);
  const lastScrollY = useRef(0);

  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const pathParts = location.pathname.split("/").filter(Boolean);

  const currentCategory = pathParts[0];
  const isSubCategory = pathParts.length >= 2;
  const productCategories = ["men", "women", "kids", "footwear"];
  const isProductBrowsePage = productCategories.includes(currentCategory);

  /* FIX: close sort menu when bar hides / route changes */
  useEffect(() => {
    if (!showFilterSort) {
      setShowSortMenu(false);
    }
  }, [showFilterSort, location.pathname]);

  useEffect(() => {
    if (!isProductBrowsePage || isAuthPage) {
      setShowFilterSort(false);
      setShowSortMenu(false);
    }
  }, [isProductBrowsePage, isAuthPage]);

  useEffect(() => {
    const resetNavbarState = () => {
      setScrolled(false);
      setMobileScrolled(false);
      setShowFilterSort(false);
      setShowSortMenu(false);
      setProgress(0);
      lastScrollY.current = 0;
      ticking.current = false;
      window.scrollTo({ top: 0, behavior: "auto" });
    };

    if (!isProductBrowsePage || isAuthPage) {
      resetNavbarState();
      return;
    }

    const updateScrollState = () => {
      const scrollTop = window.scrollY;
      const mobile = window.innerWidth <= 768;

      const nextScrolled = scrollTop > 10;

      const nextProgress = Math.min(scrollTop / MAX_SCROLL, 1);

      setScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));

      setProgress((prev) =>
        Math.abs(prev - nextProgress) > 0.01 ? nextProgress : prev,
      );

      if (mobile) {
        const nextMobile = scrollTop > lastScrollY.current && scrollTop > 40;

        setMobileScrolled((prev) => (prev !== nextMobile ? nextMobile : prev));
      } else {
        setMobileScrolled(false);
      }

      setShowFilterSort(
        isProductBrowsePage && (isSubCategory || productCategories.includes(currentCategory)) && scrollTop > 80 && !showSearch,
      );

      lastScrollY.current = scrollTop;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollState);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSubCategory, showSearch, isAuthPage, isProductBrowsePage, currentCategory]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("WearAura-sort", sortType);
  }, [sortType]);

  const navStyle = !isMobile
    ? {
        height: `${MAX_H - progress * (MAX_H - MIN_H)}px`,
      }
    : {};

  const logoStyle = !isMobile
    ? {
        fontSize: `${2.6 - progress * 1.2}em`,
      }
    : {};

  return (
    <>
      <TopBar hidden={mobileScrolled} />

      <nav
        className={`navbar ${scrolled ? "scrolled" : ""} ${
          mobileScrolled ? "mobile-up" : ""
        }`}
        style={navStyle}
      >
        <NavLinks
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          query={query}
          setQuery={setQuery}
          currentCategory={currentCategory}
          navigate={navigate}
          showFilterSort={showFilterSort}
          isMobile={isMobile}
          showSortMenu={showSortMenu}
          onSortClick={setShowSortMenu}
          setSortType={setSortType}
        />

        <div className="nav-logo">
          <h2 onClick={() => navigate("/")} style={logoStyle}>
            WearAura
          </h2>
        </div>

        <NavIcons navigate={navigate} location={location} />
      </nav>

      <MobileNav
        setShowSearch={setShowSearch}
        navigate={navigate}
        location={location}
        onMenuClick={() => window.dispatchEvent(new Event("wearaura:toggle-mobile-sidebar"))}
        showMenuButton={isProductBrowsePage && isMobile}
      />
    </>
  );
}

export default Navbar;
