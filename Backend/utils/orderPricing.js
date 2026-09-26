const Order = require("../models/Order");
const Product = require("../models/Product");

const COUPONS = {
  SAVE10: {
    percent: 10,
    minSubtotal: 0,
    expiresAt: "2099-12-31T23:59:59.000Z",
    usageLimit: null,
  },
  SAVE20: {
    percent: 20,
    minSubtotal: 0,
    expiresAt: "2099-12-31T23:59:59.000Z",
    usageLimit: null,
  },
  WELCOME15: {
    percent: 15,
    minSubtotal: 0,
    expiresAt: "2099-12-31T23:59:59.000Z",
    usageLimit: null,
  },
};

const SHIPPING_FEES = {
  standard: 0,
  express: 50,
};

const normalizeCouponCode = (couponCode) => {
  const clean = couponCode?.trim().toUpperCase();

  return clean || null;
};

const getCouponUsageCount = async (couponCode, session) => {
  let query = Order.countDocuments({ couponCode });

  if (session) {
    query = query.session(session);
  }

  return query;
};

const resolveCoupon = async ({ couponCode, subtotal, session }) => {
  const cleanCode = normalizeCouponCode(couponCode);

  if (!cleanCode) {
    return { couponCode: null, discountAmount: 0 };
  }

  const rule = COUPONS[cleanCode];

  if (!rule) {
    throw new Error("Invalid coupon");
  }

  if (rule.expiresAt && new Date(rule.expiresAt) < new Date()) {
    throw new Error("Coupon expired");
  }

  if (subtotal < Number(rule.minSubtotal || 0)) {
    throw new Error(`Minimum order value is ₹${rule.minSubtotal}`);
  }

  if (rule.usageLimit != null) {
    const usageCount = await getCouponUsageCount(cleanCode, session);

    if (usageCount >= rule.usageLimit) {
      throw new Error("Coupon usage limit reached");
    }
  }

  const discountAmount = Math.round(subtotal * (rule.percent / 100));

  return {
    couponCode: cleanCode,
    discountAmount,
  };
};

const calculateOrderPricing = async ({
  items = [],
  couponCode = null,
  shippingMethod = "standard",
  taxAmount = 0,
  session = null,
}) => {
  if (!items.length) {
    throw new Error("No items provided");
  }

  let subtotal = 0;
  const normalizedItems = [];

  for (const item of items) {
    const productId = item.productId || item.product || item._id;
    const qty = Number(item.qty || item.quantity || 0);

    if (!productId || qty <= 0) {
      throw new Error("Invalid cart item");
    }

    let productQuery = Product.findById(productId);

    if (session) {
      productQuery = productQuery.session(session);
    }

    const product = await productQuery;

    if (!product) {
      throw new Error("Product not found");
    }

    subtotal += Number(product.price || 0) * qty;

    normalizedItems.push({
      productId: product._id.toString(),
      title: product.title,
      price: Number(product.price || 0),
      qty,
      size: item.size || "",
      image: product.image || product.images?.[0] || item.image || "",
    });
  }

  const resolvedCoupon = await resolveCoupon({
    couponCode,
    subtotal,
    session,
  });

  const shippingFee =
    SHIPPING_FEES[shippingMethod] ?? Math.max(0, Number(shippingMethod) || 0);
  const normalizedTaxAmount = Math.max(0, Number(taxAmount) || 0);
  const finalAmount = Math.max(
    0,
    Math.round(
      subtotal -
        resolvedCoupon.discountAmount +
        shippingFee +
        normalizedTaxAmount,
    ),
  );

  return {
    subtotal: Math.round(subtotal),
    couponCode: resolvedCoupon.couponCode,
    discountAmount: resolvedCoupon.discountAmount,
    shippingFee,
    taxAmount: normalizedTaxAmount,
    finalAmount,
    normalizedItems,
  };
};

module.exports = {
  calculateOrderPricing,
};