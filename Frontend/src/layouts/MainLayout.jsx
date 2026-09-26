import { useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer";
import BagDrawer from "../components/BagDrawer";
import Sidebar from "../components/Sidebar";
import useScrollReveal from "../utils/useScrollReveal";

function MainLayout() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  useScrollReveal();

  const categoryRoots = ["/men", "/women", "/kids", "/footwear"];

  const hideFooter =
    path === "/wishlist" ||
    path === "/login" ||
    path === "/register" ||
    path === "/account/profile" ||
    path === "/account/orders" ||
    path === "/account/track" ||
    path === "/checkout" ||
    path === "/order-summary" ||
    path === "/payment" ||
    categoryRoots.includes(path);

  useEffect(() => {
    if (!path.startsWith("/account")) {
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
  }, [path]);

  useEffect(() => {
    const updateMobileChromeSize = () => {
      const navbar = document.querySelector(".navbar");
      const mobileNav = document.querySelector(".mobile-nav");

      if (!navbar || !mobileNav) return;

      const headerHeight = Math.max(0, navbar.getBoundingClientRect().bottom);
      const bottomNavHeight = Math.max(
        0,
        mobileNav.getBoundingClientRect().height,
      );

      document.documentElement.style.setProperty(
        "--mobile-header-height",
        `${headerHeight}px`,
      );
      document.documentElement.style.setProperty(
        "--mobile-bottom-nav-height",
        `${bottomNavHeight}px`,
      );
    };

    const resizeObserver = new ResizeObserver(updateMobileChromeSize);
    const observeChrome = () => {
      document
        .querySelectorAll(".top-bar, .navbar, .mobile-nav")
        .forEach((element) => {
          resizeObserver.observe(element);
        });
      updateMobileChromeSize();
    };

    observeChrome();
    window.addEventListener("resize", updateMobileChromeSize);
    window.addEventListener("scroll", updateMobileChromeSize, {
      passive: true,
    });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMobileChromeSize);
      window.removeEventListener("scroll", updateMobileChromeSize);
      document.documentElement.style.removeProperty("--mobile-header-height");
      document.documentElement.style.removeProperty(
        "--mobile-bottom-nav-height",
      );
    };
  }, []);

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <div
          key={location.pathname}
          className="velora-route-wrapper velora-page-fade"
        >
          <Outlet />
        </div>
      </main>

      {!hideFooter && <Footer />}

      <BagDrawer />

      <Sidebar mobileOnly={true} />
    </div>
  );
}

export default MainLayout;
