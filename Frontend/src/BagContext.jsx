import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useAuth } from "./components/AuthContext";
import { useNavigate } from "react-router-dom";

// ✅ NEW (API CENTRALIZED)
import api from "./utils/api";

const BagContext = createContext();

export function BagProvider({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  const [bag, setBag] = useState([]);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [saved, setSaved] = useState([]);

  const syncBag = (nextBag) => {
    const normalized = Array.isArray(nextBag) ? nextBag : [];

    setBag(normalized);

    if (normalized.length === 0) {
      setCoupon(null);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      const data = res.data;
      syncBag(data);
    } catch (err) {
      console.log(err);
      syncBag([]);
    }
  };

  const patchBag = (updater) => {
    setBag((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;

      if (Array.isArray(next) && next.length === 0) {
        setCoupon(null);
      }

      return Array.isArray(next) ? next : [];
    });
  };

  const fetchSaved = async () => {
    try {
      const res = await api.get("/api/saved");
      const data = res.data;
      setSaved(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setSaved([]);
    }
  };

  useEffect(() => {
    if (!loading && isLoggedIn) {
      void (async () => {
        await Promise.all([fetchCart(), fetchSaved()]);
      })();
      return;
    }

    queueMicrotask(() => {
      setBag([]);
      setSaved([]);
    });
  }, [isLoggedIn, loading]);

  const addToBag = async (product, size = "M") => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!product?._id) {
      console.error("Invalid product");
      return;
    }

    const previousBag = bag;

    patchBag((prev) => {
      const index = prev.findIndex(
        (item) => item.product?._id === product._id && item.size === size,
      );

      if (index > -1) {
        return prev.map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prev, { product, size, quantity: 1 }];
    });

    try {
      const res = await api.post("/api/cart/add", {
        productId: product._id,
        size,
        quantity: 1,
      });

      patchBag(res.data);
    } catch (err) {
      console.log(err);
      patchBag(previousBag);
    }
  };

  // ✅ FIXED (NO MORE 404)
  const clearBag = async () => {
    try {
      await api.post("/api/cart/clear");

      patchBag([]);
    } catch (err) {
      console.log("CLEAR BAG ERROR:", err);
      patchBag([]);
    }
  };

  const increaseQty = async (productId, size) => {
    const item = bag.find(
      (i) => i.product._id === productId && i.size === size,
    );

    if (!item) return;

    const stock = item.product.sizeStock?.[size] || item.product.stock || 0;

    if (item.quantity >= stock) {
      return { error: `Only ${stock} available` };
    }

    const previousBag = bag;

    patchBag((prev) =>
      prev.map((i) =>
        i.product._id === productId && i.size === size
          ? { ...i, quantity: i.quantity + 1 }
          : i,
      ),
    );

    try {
      const res = await api.put("/api/cart/update", {
        productId,
        size,
        quantity: item.quantity + 1,
      });

      patchBag(res.data);
    } catch (err) {
      console.log(err);
      patchBag(previousBag);
    }
  };

  const decreaseQty = async (productId, size) => {
    const item = bag.find(
      (i) => i.product._id === productId && i.size === size,
    );

    if (!item) return;

    if (item.quantity === 1) {
      removeFromBag(productId, size);
      return;
    }

    const previousBag = bag;

    patchBag((prev) =>
      prev.map((i) =>
        i.product._id === productId && i.size === size
          ? { ...i, quantity: i.quantity - 1 }
          : i,
      ),
    );

    try {
      const res = await api.put("/api/cart/update", {
        productId,
        size,
        quantity: item.quantity - 1,
      });

      patchBag(res.data);
    } catch (err) {
      console.log(err);
      patchBag(previousBag);
    }
  };

  const removeFromBag = async (productId, size) => {
    const previousBag = bag;

    patchBag((prev) =>
      prev.filter(
        (item) =>
          !(item.product._id === productId && item.size === size),
      ),
    );

    try {
      const res = await api.post("/api/cart/remove", {
        productId,
        size,
      });

      patchBag(res.data);
    } catch (err) {
      console.log(err);
      patchBag(previousBag);
    }
  };

  const saveForLater = async (productId, size) => {
    try {
      await api.post("/api/saved/add", {
        productId,
        size,
      });

      await api.post("/api/cart/remove", {
        productId,
        size,
      });

      await fetchCart();
      await fetchSaved();
    } catch (err) {
      console.log(err);
    }
  };

  const moveToBagFromSaved = async (productId, size) => {
    try {
      await api.post("/api/cart/add", {
        productId,
        size,
        quantity: 1,
      });

      await api.post("/api/saved/remove", {
        productId,
        size,
      });

      await fetchCart();
      await fetchSaved();
    } catch (err) {
      console.log(err);
    }
  };

  const removeFromSaved = async (productId, size) => {
    try {
      await api.post("/api/saved/remove", {
        productId,
        size,
      });

      await fetchSaved();
    } catch (err) {
      console.log(err);
    }
  };

  const openBag = () => setIsBagOpen(true);
  const closeBag = () => setIsBagOpen(false);

  const totalItems = bag.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = bag.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  const resolvedCoupon = useMemo(() => {
    if (!coupon?.code || bag.length === 0) return null;

    const coupons = {
      SAVE10: 10,
      SAVE20: 20,
      WELCOME15: 15,
    };

    const percent = coupon.percent || coupons[coupon.code];

    if (!percent) return null;

    const discount = Math.round(totalPrice * (percent / 100));

    return {
      code: coupon.code,
      percent,
      discount,
    };
  }, [coupon, bag.length, totalPrice]);

  const applyCoupon = (code) => {
    const clean = code?.trim().toUpperCase();

    const coupons = {
      SAVE10: 10,
      SAVE20: 20,
      WELCOME15: 15,
    };

    const percent = coupons[clean];

    if (!percent) {
      return { error: "Invalid coupon" };
    }

    setCoupon({
      code: clean,
      percent,
    });
  };

  const discountAmount = resolvedCoupon?.discount || 0;

  const finalTotal = Math.max(0, totalPrice - discountAmount);

  return (
    <BagContext.Provider
      value={{
        bag,
        saved,
        isBagOpen,
        openBag,
        closeBag,
        addToBag,
        increaseQty,
        decreaseQty,
        removeFromBag,
        saveForLater,
        moveToBagFromSaved,
        removeFromSaved,
        totalItems,
        totalPrice,
        coupon: resolvedCoupon,
        discountAmount,
        finalTotal,
        applyCoupon,
        clearBag,
      }}
    >
      {children}
    </BagContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBag() {
  return useContext(BagContext);
}
