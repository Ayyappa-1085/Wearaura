const Razorpay = require("razorpay");
const crypto = require("crypto");
const { calculateOrderPricing } = require("../utils/orderPricing");

// 🔥 INIT RAZORPAY
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= CREATE PAYMENT ORDER ================= */
exports.createPaymentOrder = async (req, res) => {
  try {
    console.log("createPaymentOrder couponCode:", req.body.couponCode);

    const {
      items = [],
      couponCode = null,
      shippingMethod = "standard",
      taxAmount = 0,
    } = req.body;

    if (!items.length) {
      return res.status(400).json({
        message: "No items provided",
      });
    }

    const pricing = await calculateOrderPricing({
      items,
      couponCode,
      shippingMethod,
      taxAmount,
    });

    console.log("createPaymentOrder pricing:", pricing);

    const options = {
      amount: pricing.finalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user?.id || "guest",
        couponCode: pricing.couponCode || "",
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: pricing.finalAmount,
      pricing,
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