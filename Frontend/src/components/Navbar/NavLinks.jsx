import MobileSearch from "../MobileSearch";
import FilterSortBar from "./FilterSortBar";

function NavLinks({
  showSearch,
  setShowSearch,
  query,
  setQuery,
  currentCategory,
  navigate,
  showFilterSort,
  isMobile,
  showSortMenu,
  onSortClick,
  setSortType,
}) {
  const showMobileSearch = isMobile && showSearch;

  const handleCategoryClick = (categoryKey) => {
    if (isMobile) {
      navigate(`/${categoryKey}`, {
        state: { openMobileSidebar: true },
      });
      return;
    }

    navigate(`/${categoryKey}`);
  };

  return (
    <div className="nav-left">
      {showMobileSearch ? (
        <MobileSearch
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          query={query}
          setQuery={setQuery}
        />
      ) : showFilterSort ? (
        <FilterSortBar
          showSortMenu={showSortMenu}
          onSortClick={onSortClick}
          setSortType={setSortType}
        />
      ) : (
        <>
          <a
            className={currentCategory === "men" ? "active" : ""}
            onClick={() => handleCategoryClick("men")}
          >
            MEN
          </a>

          <a
            className={currentCategory === "women" ? "active" : ""}
            onClick={() => handleCategoryClick("women")}
          >
            WOMEN
          </a>

          <a
            className={currentCategory === "kids" ? "active" : ""}
            onClick={() => handleCategoryClick("kids")}
          >
            KIDS
          </a>

          <a
            className={currentCategory === "footwear" ? "active" : ""}
            onClick={() => handleCategoryClick("footwear")}
          >
            FOOTWEAR
          </a>
        </>
      )}
    </div>
  );
}

export default NavLinks;
