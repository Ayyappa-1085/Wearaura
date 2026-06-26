const Razorpay = require("razorpay");
const crypto = require("crypto");
const Product = require("../models/Product");

// 🔥 INIT RAZORPAY
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= CREATE PAYMENT ORDER ================= */
exports.createPaymentOrder = async (req, res) => {
  try {
    const { items = [], discount = 0, shippingCost = 0, totalAmount } = req.body;

    if (!items.length) {
      return res.status(400).json({
        message: "No items provided",
      });
    }

    /* 🔥 CALCULATE AMOUNT ON BACKEND (DO NOT TRUST FRONTEND) */
    let baseAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const qty = item.qty || item.quantity;

      baseAmount += product.price * qty;
    }

    const safeDiscount = Math.max(0, Number(discount) || 0);
    const safeShipping = Math.max(0, Number(shippingCost) || 0);
    const payableAmount = Math.max(
      0,
      Math.round(
        (Number(totalAmount) || baseAmount - safeDiscount + safeShipping) * 100,
      ),
    );

    const options = {
      amount: payableAmount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user?.id || "guest",
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      amount: payableAmount / 100,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};

/* ================= VERIFY PAYMENT ================= */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    /* 🔥 SUCCESS → RETURN VERIFIED DATA */
    return res.json({
      success: true,
      message: "Payment verified",
      paymentInfo: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};