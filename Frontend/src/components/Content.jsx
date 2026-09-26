import { useNavigate, useParams } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import "./Content.css";

import menBanner from "../assets/menbanner.webp";
import womenBanner from "../assets/womenbanner.webp";
import kidsBanner from "../assets/kidsbanner.webp";
import footwearBanner from "../assets/footwearbanner.webp";

const CATEGORY_OFFERS = [
  {
    key: "men",
    label: "Men's Collection",
    headline: "Modern Style For Every You",
    description:
      "Timeless pieces for work, weekends and everything in between.",
    cta: "Shop Men",
    image: menBanner,
  },
  {
    key: "women",
    label: "Women's Collection",
    headline: "Effortless Elegance",
    description: "Chic styles for every moment of your story.",
    cta: "Shop Women",
    image: womenBanner,
  },
  {
    key: "kids",
    label: "Kids' Collection",
    headline: "Little Looks Big Adventures",
    description: "Comfortable, stylish and made for every tiny milestone.",
    cta: "Shop Kids",
    image: kidsBanner,
  },
  {
    key: "footwear",
    label: "Footwear Collection",
    headline: "Step Into What's Next",
    description: "Stylish, versatile and made to move with you.",
    cta: "Shop Footwear",
    image: footwearBanner,
  },
];

function Content() {
  const navigate = useNavigate();
  const { category } = useParams();
  const activeCategory = category?.toLowerCase();
  const activeOffer =
    CATEGORY_OFFERS.find((offer) => offer.key === activeCategory) ||
    CATEGORY_OFFERS[0];

  return (
    <section
      className="editorial-offers-section"
      aria-label="WearAura category collections"
    >
      <div className="editorial-offers-grid single-category">
        <article className="editorial-offer-card" key={activeOffer.key}>
          <div className="editorial-offer-copy">
            <span className="editorial-category-label">
              {activeOffer.label}
            </span>
            <h2 className="editorial-offer-headline">{activeOffer.headline}</h2>
            <p className="editorial-offer-description">
              {activeOffer.description}
            </p>
            <button
              type="button"
              className="editorial-cta-btn"
              onClick={() => navigate(`/${activeOffer.key}`)}
              aria-label={`${activeOffer.cta} collection`}
            >
              <span>{activeOffer.cta}</span>
              <FaArrowRight className="cta-arrow-icon" />
            </button>
          </div>
          <div className="editorial-offer-image">
            <img
              src={activeOffer.image}
              alt={`${activeOffer.label} editorial collection`}
              loading="eager"
            />
          </div>
        </article>
      </div>
    </section>
  );
}

export default Content;
