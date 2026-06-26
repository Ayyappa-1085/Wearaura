import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const wishlistRef = useRef([]);
  const pendingOpsRef = useRef(new Set());

  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/wishlist");
      const data = Array.isArray(res.data) ? res.data : [];

      const normalized = data.map((item) => ({
        ...item,
        _id: item._id?.toString(),
      }));

      setWishlist(normalized);
      wishlistRef.current = normalized;
    } catch {
      setWishlist([]);
      wishlistRef.current = [];
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && isLoggedIn) {
      void fetchWishlist();
    } else if (!isLoggedIn) {
      setWishlist([]);
      wishlistRef.current = [];
      setWishlistLoading(false);
    }
  }, [user, isLoggedIn, loading]);

  const updateWishlistState = (updater) => {
    setWishlist((prev) => {
      const next = updater(prev);
      wishlistRef.current = next;
      return next;
    });
  };

  const toggleWishlist = async (product) => {
    if (!isLoggedIn) {
      navigate("/login");
      return false;
    }

    const productId = product?._id?.toString();

    if (!productId || pendingOpsRef.current.has(productId)) {
      return false;
    }

    pendingOpsRef.current.add(productId);

    const previousWishlist = wishlistRef.current;
    const isCurrentlyWishlisted = wishlistRef.current.some(
      (item) => item._id === productId,
    );

    updateWishlistState((prev) => {
      if (isCurrentlyWishlisted) {
        return prev.filter((item) => item._id !== productId);
      }

      return prev.some((item) => item._id === productId)
        ? prev
        : [...prev, { ...product, _id: productId }];
    });

    try {
      await api.post("/api/wishlist", { productId });
      return true;
    } catch {
      setWishlist(previousWishlist);
      wishlistRef.current = previousWishlist;
      return false;
    } finally {
      pendingOpsRef.current.delete(productId);
    }
  };

  const addToWishlist = async (product) => {
    if (!isLoggedIn) {
      navigate("/login");
      return false;
    }

    const productId = product?._id?.toString();

    if (!productId || pendingOpsRef.current.has(productId)) {
      return false;
    }

    if (wishlistRef.current.some((item) => item._id === productId)) {
      return true;
    }

    pendingOpsRef.current.add(productId);

    const previousWishlist = wishlistRef.current;
    const normalizedProduct = { ...product, _id: productId };

    updateWishlistState((prev) => [...prev, normalizedProduct]);

    try {
      await api.post("/api/wishlist", { productId });
      return true;
    } catch {
      setWishlist(previousWishlist);
      wishlistRef.current = previousWishlist;
      return false;
    } finally {
      pendingOpsRef.current.delete(productId);
    }
  };

  const removeFromWishlist = async (product) => {
    if (!isLoggedIn) {
      return false;
    }

    const productId = product?._id?.toString();

    if (!productId || pendingOpsRef.current.has(productId)) {
      return false;
    }

    if (!wishlistRef.current.some((item) => item._id === productId)) {
      return true;
    }

    pendingOpsRef.current.add(productId);

    const previousWishlist = wishlistRef.current;

    updateWishlistState((prev) => prev.filter((item) => item._id !== productId));

    try {
      await api.post("/api/wishlist", { productId });
      return true;
    } catch {
      setWishlist(previousWishlist);
      wishlistRef.current = previousWishlist;
      return false;
    } finally {
      pendingOpsRef.current.delete(productId);
    }
  };

  const isWishlisted = (product) => {
    const productId = product?._id?.toString();
    return wishlistRef.current.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistLoading,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}