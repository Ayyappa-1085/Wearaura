import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import animationController from "./animationController";

/**
 * Hook to automatically scan and register [data-motion] elements with the central controller
 * on route change and component lifecycle.
 */
export function useScrollReveal(deps = []) {
  const location = useLocation();

  useEffect(() => {
    // Refresh after DOM layout pass
    const timer = setTimeout(() => {
      animationController.refresh();
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search, ...deps]);

  return {
    refresh: () => animationController.refresh(),
    observe: (el) => animationController.observe(el),
    unobserve: (el) => animationController.unobserve(el),
  };
}

export default useScrollReveal;

