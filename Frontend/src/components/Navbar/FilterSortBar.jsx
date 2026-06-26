import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function FilterSortBar({
  onSortClick,
  showSortMenu,
  setSortType,
}) {
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const updateSearchParams = (changes) => {
    const searchParams = new URLSearchParams(location.search);

    Object.entries(changes).forEach(([key, value]) => {
      if (!value) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
    });

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };

  const chooseSort = (type) => {
    setSortType(type);
    updateSearchParams({ sort: type });
    onSortClick(false);
  };

  const toggleSort = () => {
    setShowFilter(false);
    onSortClick(!showSortMenu);
  };

  const toggleFilter = () => {
    onSortClick(false);
    setShowFilter(!showFilter);
  };

  const applyFilter = (key, value) => {
    const searchParams = new URLSearchParams(location.search);
    const current = searchParams.get(key);

    updateSearchParams({ [key]: current === value ? "" : value });
  };

  const clearAll = () => {
    navigate({
      pathname: location.pathname,
      search: "",
    });
    setShowFilter(false);
  };

  useEffect(() => {
    const closeMenus = () => {
      setShowFilter(false);
      onSortClick(false);
    };

    window.addEventListener("scroll", closeMenus, { passive: true });

    return () => window.removeEventListener("scroll", closeMenus);
  }, [onSortClick]);

  return (
    <div className="filter-sort-wrap">
      {/* FILTER */}
      <div className="sort-box">
        <a onClick={toggleFilter}>FILTER</a>

        {showFilter && (
          <div className="sort-menu filter-menu">
            <div className="menu-title">Price Range</div>

            <div onClick={() => applyFilter("price", "0-999")}>₹0 - ₹999</div>

            <div onClick={() => applyFilter("price", "1000-1999")}>
              ₹1000 - ₹1999
            </div>

            <div onClick={() => applyFilter("price", "2000+")}>₹2000+</div>

            <div className="menu-title">Size</div>

            {["S", "M", "L", "XL"].map((size) => (
              <div key={size} onClick={() => applyFilter("size", size)}>
                {size}
              </div>
            ))}

            <div className="menu-title">Color</div>

            {["Black", "White", "Blue", "Grey"].map((color) => (
              <div
                key={color}
                onClick={() => applyFilter("color", color.toLowerCase())}
              >
                {color}
              </div>
            ))}

            <div className="clear-btn" onClick={clearAll}>
              Clear Filters
            </div>
          </div>
        )}
      </div>

      {/* SORT */}
      <div className="sort-box">
        <a onClick={toggleSort}>SORT</a>

        {showSortMenu && (
          <div className="sort-menu">
            <div onClick={() => chooseSort("low")}>Price Low to High</div>

            <div onClick={() => chooseSort("high")}>Price High to Low</div>

            <div onClick={() => chooseSort("az")}>Name A-Z</div>

            <div onClick={() => chooseSort("za")}>Name Z-A</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterSortBar;
