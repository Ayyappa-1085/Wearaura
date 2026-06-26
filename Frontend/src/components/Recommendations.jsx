import { memo, useEffect, useMemo, useState } from "react";
import { useBag } from "../BagContext";
import api from "../utils/api"; // ✅ central API config

function Recommendations() {
  const { bag, addToBag } = useBag();

  const [products, setProducts] = useState([]);
  const [openSize, setOpenSize] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/api/products?limit=8");

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.products)
          ? res.data.products
          : [];

        setProducts(data);
      } catch (error) {
        console.log(error);
        setProducts([]);
      }
    };

    loadProducts();
  }, []);

  if (bag.length === 0) return null;

  const cartIds = useMemo(
    () => bag.map((item) => item._id || item.id),
    [bag],
  );

  const suggested = useMemo(
    () =>
      products
        .filter((item) => !cartIds.includes(item._id || item.id))
        .slice(0, 4),
    [products, cartIds],
  );

  const handleAdd = (product, size) => {
    addToBag(product, size);
    setOpenSize(null);
  };

  if (suggested.length === 0) return null;

  return (
    <div className="recommend-box">
      <h4>You May Also Like</h4>

      <div className="recommend-list">
        {suggested.map((item) => {
          const itemId = item._id || item.id;

          return (
            <div className="recommend-item" key={itemId}>
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />

              <p>{item.title}</p>

              <span>₹{item.price}</span>

              <div className="recommend-action">
                <button
                  className="recommend-add-btn"
                  onClick={() =>
                    setOpenSize(openSize === itemId ? null : itemId)
                  }
                >
                  Add to Bag
                </button>

                {openSize === itemId && (
                  <div className="size-popup">
                    {["S", "M", "L", "XL"].map((size) => (
                      <button
                        key={size}
                        className="popup-size-btn"
                        onClick={() => handleAdd(item, size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(Recommendations);