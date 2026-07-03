import { useEffect, useState } from "react";
// ❌ REMOVE axios
// import axios from "axios";

import { CATEGORY_ITEMS } from "../../data/categories";
import "../../styles/AdminStock.css";

// ✅ ADD API
import api from "../../utils/api";

function AdminStock() {
  const [products, setProducts] = useState([]);
  const [editStock, setEditStock] = useState({});

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");

  // ⚠️ KEEP (not breaking structure)
  const getToken = () => localStorage.getItem("token");

  const loadProducts = async () => {
    try {
      const res = await api.get("/api/products?limit=1000");

      setProducts(res.data.products || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const updateStock = async (id) => {
    const product = products.find((p) => p._id === id);
    const updated = editStock[id];

    if (!updated || !product) return;

    try {
      // ✅ SAFE MERGE (FIX)
      const finalStock = {
        ...(product.sizeStock || {
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
        }),
        ...updated,
      };

      await api.put(`/api/products/stock/${id}`, { sizeStock: finalStock });

      // 🔥 reload
      await loadProducts();

      setEditStock((prev) => ({
        ...prev,
        [id]: {},
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const isLowStock = (qty) => qty > 0 && qty <= 2;
  const isOut = (qty) => qty === 0;

  const subOptions = category === "all" ? [] : CATEGORY_ITEMS[category] || [];

  const filtered = products.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      category === "all" || item.category.toLowerCase() === category;

    const matchSub =
      subCategory === "all" || item.type.toLowerCase() === subCategory;

    return matchSearch && matchCategory && matchSub;
  });

  const visibleProducts =
    search || category !== "all" || subCategory !== "all"
      ? filtered
      : filtered.slice(0, 9);

  return (
    <div className="admin-panel-box">
      <h2>Stock Management</h2>

      <div className="admin-search-row">
        <input
          className="admin-search-input"
          placeholder="Search Product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="admin-search-input"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubCategory("all");
          }}
        >
          <option value="all">All Categories</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
          <option value="footwear">Footwear</option>
        </select>

        <select
          className="admin-search-input"
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
        >
          <option value="all">All Types</option>
          {subOptions.map((item) => (
            <option key={item} value={item.toLowerCase()}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-stock-list">
        {visibleProducts.map((item) => {
          const sizeStock = item.sizeStock || {
            S: 0,
            M: 0,
            L: 0,
            XL: 0,
          };

          const isEdited =
            editStock[item._id] && Object.keys(editStock[item._id]).length > 0;

          const hasLowStock = Object.values(sizeStock).some((q) => q <= 2);

          return (
            <div key={item._id} className="admin-stock-card">
              <div className="stock-left">
                <img src={item.image} alt={item.title} />
                <div>
                  <h4>{item.title}</h4>
                  <p>
                    {item.category} • {item.type}
                  </p>
                </div>
              </div>

              <div className="stock-right">
                <div className="size-labels">
                  {["S", "M", "L", "XL"].map((size) => (
                    <span key={size}>{size}</span>
                  ))}
                </div>

                <div className="size-input-row">
                  {["S", "M", "L", "XL"].map((size) => {
                    const value =
                      editStock[item._id]?.[size] ?? sizeStock[size];

                    const low = isLowStock(value);
                    const out = isOut(value);

                    return (
                      <input
                        key={size}
                        type="number"
                        min="0"
                        value={Number(value)}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);

                          setEditStock((prev) => ({
                            ...prev,
                            [item._id]: {
                              ...prev[item._id],
                              [size]: val,
                            },
                          }));
                        }}
                        className={`size-input ${
                          low ? "low" : ""
                        } ${out ? "out" : ""}`}
                      />
                    );
                  })}
                </div>

                {hasLowStock && <p className="stock-alert">⚠ Low stock</p>}

                {isEdited && (
                  <button
                    className="save-btn"
                    onClick={() => updateStock(item._id)}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminStock;
