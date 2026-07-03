import "./Homepage.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import menImg from "../assets/men.png";
import womenImg from "../assets/women.png";
import kidsImg from "../assets/kids.png";
import footwearImg from "../assets/footware.png";

function Homepage() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryKey) => {
    if (window.innerWidth <= 768) {
      navigate(`/${categoryKey}`, {
        state: { openMobileSidebar: true },
      });
      return;
    }

    navigate(`/${categoryKey}`);
  };

  useEffect(() => {
    [menImg, womenImg, kidsImg, footwearImg].forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  return (
    <div className="home-container">
      <div className="main-layout">
        <div className="section men" onClick={() => handleCategoryClick("men")}>
          <img src={menImg} alt="Men" loading="eager" fetchPriority="high" />
          <div className="overlay">MEN</div>
        </div>

        <div className="section women" onClick={() => handleCategoryClick("women")}>
          <img
            src={womenImg}
            alt="Women"
            loading="eager"
            fetchPriority="high"
          />
          <div className="overlay">WOMEN</div>
        </div>

        <div className="right-section">
          <div className="section kids" onClick={() => handleCategoryClick("kids")}>
            <img
              src={kidsImg}
              alt="Kids"
              loading="eager"
              fetchPriority="high"
            />
            <div className="overlay">KIDS</div>
          </div>

          <div
            className="section footwear"
            onClick={() => handleCategoryClick("footwear")}
          >
            <img
              src={footwearImg}
              alt="Footwear"
              loading="eager"
              fetchPriority="high"
            />
            <div className="overlay">FOOTWEAR</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
