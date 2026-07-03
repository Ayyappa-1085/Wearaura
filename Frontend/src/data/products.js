// Use the image files that exist in the public folder so product cards resolve
// correctly in both development and production builds.
const shirtImages = [
  "/Men/Shirts/shirt1.webp",
  "/Men/Shirts/shirt2.webp",
  "/Men/Shirts/shirt3.webp",
  "/Men/Shirts/shirt4.webp",
  "/Men/Shirts/shirt5.webp",
  "/Men/Shirts/shirt6.webp",
  "/Men/Shirts/shirt7.webp",
  "/Men/Shirts/shirt8.webp",
];

const jeansImages = [
  "/Men/Jeans/jeans1.webp",
  "/Men/Jeans/jeans2.webp",
  "/Men/Jeans/jeans3.webp",
  "/Men/Jeans/jeans4.webp",
  "/Men/Jeans/jeans5.webp",
  "/Men/Jeans/jeans6.webp",
  "/Men/Jeans/jeans7.webp",
  "/Men/Jeans/jeans8.webp",
];

const sareeImages = [
  "/Women/Sarees/Saree1.webp",
  "/Women/Sarees/Saree2.webp",
  "/Women/Sarees/Saree3.webp",
  "/Women/Sarees/Saree4.webp",
  "/Women/Sarees/Saree5.webp",
  "/Women/Sarees/Saree6.webp",
  "/Women/Sarees/Saree7.webp",
  "/Women/Sarees/Saree8.webp",
];

const kurtaImages = [
  "/Women/Kurtas/Kurta1.webp",
  "/Women/Kurtas/Kurta2.webp",
  "/Women/Kurtas/Kurta3.webp",
  "/Women/Kurtas/Kurta4.webp",
  "/Women/Kurtas/Kurta5.webp",
  "/Women/Kurtas/Kurta6.webp",
  "/Women/Kurtas/Kurta7.webp",
  "/Women/Kurtas/Kurta8.webp",
];

const kidsShirtImages = [
  "/Kids/Shirts/ks1.webp",
  "/Kids/Shirts/ks2.webp",
  "/Kids/Shirts/ks3.webp",
  "/Kids/Shirts/ks4.webp",
  "/Kids/Shirts/ks5.webp",
  "/Kids/Shirts/ks6.webp",
  "/Kids/Shirts/ks7.webp",
  "/Kids/Shirts/ks8.webp",
];

const kidsJeansImages = [
  "/Kids/Jeans/kj1.webp",
  "/Kids/Jeans/kj2.webp",
  "/Kids/Jeans/kj3.webp",
  "/Kids/Jeans/kj4.webp",
];

// ================= PRODUCT DATA =================

const SHIRT_DATA = [
  {
    title: "Black Slim Fit Shirt",
    subtitle: "Cotton Casual",
    price: 999,
    oldPrice: 1999,
  },
  {
    title: "White Formal Shirt",
    subtitle: "Office Wear",
    price: 1299,
    oldPrice: 2499,
  },
  {
    title: "Premium Blue Shirt",
    subtitle: "Casual Wear",
    price: 1199,
    oldPrice: 2299,
  },
  {
    title: "Slim Fit Shirt",
    subtitle: "Formal Wear",
    price: 1399,
    oldPrice: 2699,
  },
  {
    title: "Checked Casual Shirt",
    subtitle: "Daily Wear",
    price: 999,
    oldPrice: 1999,
  },
  {
    title: "Modern Fit Shirt",
    subtitle: "Stylish Look",
    price: 1299,
    oldPrice: 2499,
  },
  {
    title: "Classic White Shirt",
    subtitle: "Office Wear",
    price: 1499,
    oldPrice: 2999,
  },
  {
    title: "Trendy Street Shirt",
    subtitle: "Street Style",
    price: 1099,
    oldPrice: 2199,
  },
];

const JEANS_DATA = [
  {
    title: "Slim Fit Jeans",
    subtitle: "Stretch Denim",
    price: 1499,
    oldPrice: 2999,
  },
  {
    title: "Regular Fit Jeans",
    subtitle: "Classic Blue",
    price: 1399,
    oldPrice: 2799,
  },
  {
    title: "Black Denim Jeans",
    subtitle: "Street Style",
    price: 1599,
    oldPrice: 3199,
  },
  {
    title: "Ripped Jeans",
    subtitle: "Trendy Look",
    price: 1699,
    oldPrice: 3399,
  },
  {
    title: "Loose Fit Jeans",
    subtitle: "Comfort Wear",
    price: 1299,
    oldPrice: 2599,
  },
  {
    title: "Skinny Jeans",
    subtitle: "Modern Fit",
    price: 1499,
    oldPrice: 2999,
  },
  {
    title: "Washed Blue Jeans",
    subtitle: "Casual Wear",
    price: 1399,
    oldPrice: 2799,
  },
  {
    title: "Cargo Jeans",
    subtitle: "Utility Style",
    price: 1799,
    oldPrice: 3499,
  },
];

const SAREE_DATA = [
  {
    title: "Silk Banarasi Saree",
    subtitle: "Festive Wear",
    price: 2999,
    oldPrice: 5999,
  },
  {
    title: "Cotton Printed Saree",
    subtitle: "Casual Wear",
    price: 1299,
    oldPrice: 2599,
  },
  {
    title: "Georgette Saree",
    subtitle: "Party Wear",
    price: 1999,
    oldPrice: 3999,
  },
  {
    title: "Kanjivaram Saree",
    subtitle: "Bridal Wear",
    price: 4999,
    oldPrice: 9999,
  },
  {
    title: "Chiffon Saree",
    subtitle: "Light & Elegant",
    price: 1499,
    oldPrice: 2999,
  },
  { title: "Linen Saree", subtitle: "Daily Wear", price: 1199, oldPrice: 2399 },
  {
    title: "Designer Saree",
    subtitle: "Special Occasion",
    price: 3499,
    oldPrice: 6999,
  },
  {
    title: "Embroidered Saree",
    subtitle: "Traditional Look",
    price: 2499,
    oldPrice: 4999,
  },
];

const KURTA_DATA = [
  {
    title: "Floral Printed Kurta",
    subtitle: "Casual Wear",
    price: 899,
    oldPrice: 1799,
  },
  {
    title: "Anarkali Kurta",
    subtitle: "Festive Wear",
    price: 1499,
    oldPrice: 2999,
  },
  {
    title: "Straight Fit Kurta",
    subtitle: "Office Wear",
    price: 1099,
    oldPrice: 2199,
  },
  {
    title: "Embroidered Kurta",
    subtitle: "Traditional Wear",
    price: 1299,
    oldPrice: 2599,
  },
  { title: "Cotton Kurta", subtitle: "Daily Wear", price: 799, oldPrice: 1599 },
  { title: "Silk Kurta", subtitle: "Party Wear", price: 1799, oldPrice: 3599 },
  {
    title: "Asymmetric Kurta",
    subtitle: "Trendy Look",
    price: 1199,
    oldPrice: 2399,
  },
  {
    title: "Palazzo Kurta Set",
    subtitle: "Ethnic Style",
    price: 1599,
    oldPrice: 3199,
  },
];

const KIDS_SHIRT_DATA = [
  {
    title: "Cartoon Print Shirt",
    subtitle: "Fun Wear",
    price: 499,
    oldPrice: 999,
  },
  {
    title: "Striped Kids Shirt",
    subtitle: "Casual Wear",
    price: 549,
    oldPrice: 1099,
  },
  {
    title: "Polo Kids Shirt",
    subtitle: "Smart Wear",
    price: 599,
    oldPrice: 1199,
  },
  {
    title: "Graphic Tee Shirt",
    subtitle: "Trendy Look",
    price: 449,
    oldPrice: 899,
  },
  {
    title: "Checked Kids Shirt",
    subtitle: "Daily Wear",
    price: 499,
    oldPrice: 999,
  },
  {
    title: "Solid Cotton Shirt",
    subtitle: "Comfort Fit",
    price: 399,
    oldPrice: 799,
  },
  {
    title: "Denim Kids Shirt",
    subtitle: "Cool Style",
    price: 649,
    oldPrice: 1299,
  },
  {
    title: "Party Kids Shirt",
    subtitle: "Special Wear",
    price: 699,
    oldPrice: 1399,
  },
];

const KIDS_JEANS_DATA = [
  {
    title: "Slim Fit Kids Jeans",
    subtitle: "Stretch Denim",
    price: 699,
    oldPrice: 1399,
  },
  {
    title: "Regular Fit Kids Jeans",
    subtitle: "Classic Blue",
    price: 649,
    oldPrice: 1299,
  },
  {
    title: "Ripped Kids Jeans",
    subtitle: "Trendy Look",
    price: 749,
    oldPrice: 1499,
  },
  {
    title: "Black Kids Jeans",
    subtitle: "Street Style",
    price: 699,
    oldPrice: 1399,
  },
  {
    title: "Cargo Kids Jeans",
    subtitle: "Utility Wear",
    price: 799,
    oldPrice: 1599,
  },
  {
    title: "Comfort Fit Jeans",
    subtitle: "Daily Wear",
    price: 599,
    oldPrice: 1199,
  },
  {
    title: "Blue Wash Jeans",
    subtitle: "Play Wear",
    price: 649,
    oldPrice: 1299,
  },
  { title: "Jogger Jeans", subtitle: "Active Fit", price: 729, oldPrice: 1459 },
];

// ================= HELPERS =================

const mapStatic = (data, cat, type, imgs, prefix) =>
  data.map((item, i) => ({
    id: `${prefix}-${i + 1}`,
    category: cat,
    type: type,
    ...item,
    discount: Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100),
    image: imgs[i] || imgs[0],
  }));

const STATIC_PRODUCTS = [
  ...mapStatic(SHIRT_DATA, "Men", "Shirts", shirtImages, "shirt"),
  ...mapStatic(JEANS_DATA, "Men", "Jeans", jeansImages, "jeans"),
  ...mapStatic(SAREE_DATA, "Women", "Sarees", sareeImages, "saree"),
  ...mapStatic(KURTA_DATA, "Women", "Kurtas", kurtaImages, "kurta"),
  ...mapStatic(
    KIDS_SHIRT_DATA,
    "Kids",
    "Shirts",
    kidsShirtImages,
    "kids-shirt",
  ),
  ...mapStatic(KIDS_JEANS_DATA, "Kids", "Pants", kidsJeansImages, "kids-jeans"),
];

export const PRODUCTS = STATIC_PRODUCTS;
