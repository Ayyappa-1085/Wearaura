/**
 * Velora Central Motion Controller
 * Singleton IntersectionObserver and animation orchestration utility
 */

class AnimationController {
  constructor() {
    this.observer = null;
    this.observedElements = new WeakSet();
    this.initObserver();
  }

  isReducedMotion() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  initObserver() {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateIn(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: [0, 0.15],
      }
    );
  }

  calculateStagger(index, baseStagger = 35, maxDelay = 350) {
    return Math.min(index * baseStagger, maxDelay);
  }

  animateIn(element) {
    if (!element) return;

    if (this.isReducedMotion()) {
      element.classList.add("motion-revealed", "reveal-active");
      element.style.opacity = "1";
      element.style.transform = "none";
      element.style.transition = "none";
      if (this.observer) this.observer.unobserve(element);
      return;
    }

    const staggerAttr = element.getAttribute("data-motion-stagger");
    const delayAttr = element.getAttribute("data-motion-delay");

    if (delayAttr) {
      element.style.setProperty("--motion-delay", `${delayAttr}ms`);
      element.style.transitionDelay = `${delayAttr}ms`;
    } else if (staggerAttr) {
      const idx = parseInt(staggerAttr, 10) || 0;
      const calculated = this.calculateStagger(idx);
      element.style.setProperty("--motion-delay", `${calculated}ms`);
      element.style.transitionDelay = `${calculated}ms`;
    }

    // Double RAF ensures browser applies any style variables prior to transition start
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.classList.add("motion-revealed", "reveal-active");
      });
    });

    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  animateOut(element) {
    if (!element) return;
    element.classList.remove("motion-revealed", "reveal-active");
  }

  observe(element) {
    if (!element || !this.observer) return;
    if (this.observedElements.has(element)) return;

    this.observedElements.add(element);
    this.observer.observe(element);
  }

  unobserve(element) {
    if (!element || !this.observer) return;
    this.observedElements.delete(element);
    this.observer.unobserve(element);
  }

  refresh() {
    if (typeof document === "undefined") return;

    if (!this.observer) {
      this.initObserver();
    }

    const targets = document.querySelectorAll(
      '[data-motion]:not(.motion-revealed), .reveal-init:not(.reveal-active)'
    );

    targets.forEach((el, index) => {
      if (!el.hasAttribute("data-motion-stagger") && !el.hasAttribute("data-motion-delay")) {
        el.setAttribute("data-motion-stagger", String(index));
      }
      this.observe(el);
    });
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observedElements = new WeakSet();
    }
  }
}

export const animationController = new AnimationController();
export default animationController;

