import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
// ❌ REMOVED axios
// import axios from "axios";

// ✅ ADDED api
import api from "../utils/api";

import SidebarSection from "../sections/SidebarSection";
import OffersSection from "../sections/OffersSection";
import ProductsSection from "../sections/ProductsSection";

import "./CategoryLayout.css";

const API = "/api/products";

function CategoryLayout() {
  const { category, item } = useParams();
  const location = useLocation();

  const isSubCategory = !!item;

  const [products, setProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        if (isSubCategory) {
          const searchParams = new URLSearchParams(location.search);
          searchParams.set("category", category);
          searchParams.set("type", item);

          const res = await api.get(`${API}?${searchParams.toString()}`);

          const data = Array.isArray(res.data)
            ? res.data
            : res.data.products || [];

          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.log(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category, item, isSubCategory, location.search]);

  return (
    <div
      className={`category-layout ${isSubCategory ? "sub-page" : "root-page"}`}
    >
      {!isSubCategory && <SidebarSection />}

      <div className="content-wrapper">
        {!isSubCategory && !isMobile && <OffersSection />}

        {isSubCategory &&
          (loading ? (
            <div
              style={{
                padding: "40px",
              }}
            >
              Loading...
            </div>
          ) : (
            <ProductsSection
              products={products}
            />
          ))}
      </div>
    </div>
  );
}

export default CategoryLayout;
