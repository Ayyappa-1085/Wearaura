import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  const isSubCategory = !!item;

  const [products, setProducts] = useState([]);

  const [filteredProducts, setFilteredProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [sortType, setSortType] = useState("");

  const [showSortMenu, setShowSortMenu] = useState(false);

  const [filters, setFilters] = useState({
    price: "",
    size: "",
    color: "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        if (isSubCategory) {
          const res = await api.get(
            // ✅ FIXED
            `${API}?category=${encodeURIComponent(category)}&type=${encodeURIComponent(item)}`,
          );

          const data = Array.isArray(res.data)
            ? res.data
            : res.data.products || [];

          setProducts(data);
          setFilteredProducts(data);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.log(error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category, item, isSubCategory]);

  useEffect(() => {
    let temp = [...products];

    /* Price Filter */
    if (filters.price) {
      if (filters.price === "0-999") {
        temp = temp.filter((p) => p.price <= 999);
      }

      if (filters.price === "1000-1999") {
        temp = temp.filter((p) => p.price >= 1000 && p.price <= 1999);
      }

      if (filters.price === "2000+") {
        temp = temp.filter((p) => p.price >= 2000);
      }
    }

    /* 🔥 FIXED SIZE FILTER */
    if (filters.size) {
      temp = temp.filter((p) => p.sizeStock && p.sizeStock[filters.size] > 0);
    }

    /* Color Filter */
    if (filters.color) {
      temp = temp.filter(
        (p) => p.color && p.color.toLowerCase().includes(filters.color),
      );
    }

    /* Sorting */
    if (sortType === "low") {
      temp.sort((a, b) => a.price - b.price);
    }

    if (sortType === "high") {
      temp.sort((a, b) => b.price - a.price);
    }

    if (sortType === "az") {
      temp.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortType === "za") {
      temp.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredProducts(temp);
  }, [products, filters, sortType]);

  return (
    <div
      className={`category-layout ${isSubCategory ? "sub-page" : "root-page"}`}
    >
      {!isSubCategory && <SidebarSection />}

      <div className="content-wrapper">
        {!isSubCategory && <OffersSection />}

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
              products={filteredProducts}
              showSortMenu={showSortMenu}
              onSortClick={setShowSortMenu}
              setSortType={setSortType}
              filters={filters}
              setFilters={setFilters}
            />
          ))}
      </div>
    </div>
  );
}

export default CategoryLayout;
