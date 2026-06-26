const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

/* ================= GENERATE ORDER ID ================= */
const generateOrderId = () => {
  const num = Math.floor(1000000000 + Math.random() * 9000000000);
  return `VLR${num}`;
};

const generateTrackingId = () => {
  const num = Math.floor(1000000000 + Math.random() * 9000000000);
  return `TRK${num}`;
};

/* ================= CREATE ORDER ================= */
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let createdOrder = null;

    await session.withTransaction(async () => {
      const { items = [], idempotencyKey, paymentInfo } = req.body;

      /* ================= BASIC VALIDATION ================= */
      if (!items.length) {
        throw new Error("No items in order");
      }

      // 🔥 PAYMENT VALIDATION (CRITICAL FIX)
      if (
        !paymentInfo ||
        !paymentInfo.paymentId ||
        !paymentInfo.orderId
      ) {
        throw new Error("Payment not verified");
      }

      /* ================= IDEMPOTENCY ================= */
      if (idempotencyKey) {
        const existing = await Order.findOne({
          idempotencyKey,
        }).session(session);

        if (existing) {
          createdOrder = existing;
          return;
        }
      }

      /* ================= UNIQUE ORDER ID ================= */
      let orderId = generateOrderId();
      let trackingId = generateTrackingId();

      let exists = await Order.findOne({ orderId }).session(session);
      while (exists) {
        orderId = generateOrderId();
        exists = await Order.findOne({ orderId }).session(session);
      }

      let trackingExists = await Order.findOne({ trackingId }).session(session);
      while (trackingExists) {
        trackingId = generateTrackingId();
        trackingExists = await Order.findOne({ trackingId }).session(session);
      }

      /* ================= PRE-CHECK STOCK ================= */
      for (const item of items) {
        const productId = item.productId || item.product;
        const qty = item.qty || item.quantity;
        const size = item.size;

        const product = await Product.findById(productId).session(session);

        if (!product) {
          throw new Error("Product not found");
        }

        const available = product.sizeStock?.[size] || 0;

        if (available < qty) {
          throw new Error(`${product.title} (${size}) only ${available} left`);
        }
      }

      /* ================= STOCK CONTROL ================= */
      for (const item of items) {
        const productId = item.productId || item.product;
        const qty = item.qty || item.quantity;
        const size = item.size;

        const product = await Product.findById(productId).session(session);

        const result = await Product.updateOne(
          {
            _id: product._id,
            [`sizeStock.${size}`]: { $gte: qty },
          },
          {
            $inc: {
              [`sizeStock.${size}`]: -qty,
            },
          },
          { session }
        );

        if (result.modifiedCount === 0) {
          throw new Error(`${product.title} (${size}) sold out`);
        }
      }

      /* ================= TOTAL CALCULATION ================= */
      let calculatedTotal = 0;

      for (const item of items) {
        const productId = item.productId || item.product;
        const qty = item.qty || item.quantity;

        const product = await Product.findById(productId).session(session);

        if (!product) {
          throw new Error("Product not found");
        }

        calculatedTotal += product.price * qty;
      }

      /* ================= NORMALIZE ITEMS ================= */
      const normalizedItems = items.map((item) => ({
        title: item.title,
        price: item.price,
        qty: item.qty || item.quantity,
        size: item.size,
        image: item.image || "",
      }));

      /* ================= CREATE ORDER ================= */
      const order = await Order.create(
        [
          {
            ...req.body,
            items: normalizedItems,
            orderId,
            trackingId,
            user: req.user.id,
            idempotencyKey: idempotencyKey || undefined,
            paymentInfo,
            totalAmount: calculatedTotal,
          },
        ],
        { session }
      );

      createdOrder = order[0];

      /* ================= CLEAR CART ================= */
      await Cart.updateOne(
        { user: req.user.id },
        { $set: { items: [] } },
        { session }
      );
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    console.log("ORDER ERROR:", error.message);

    res.status(400).json({
      message: error.message || "Order failed",
    });
  } finally {
    session.endSession();
  }
};

/* ================= GET ORDERS ================= */
const getOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      orders = await Order.find({
        user: req.user.id,
      }).sort({ createdAt: -1 });
    }

    res.status(200).json(orders);
  } catch {
    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

/* ================= GET SINGLE ORDER ================= */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json(order);
  } catch {
    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

/* ================= UPDATE ORDER STATUS ================= */
const updateOrderStatus = async (req, res) => {
  try {
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    status =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const allowed = [
      "Placed",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.log("STATUS UPDATE ERROR:", error);

    res.status(500).json({
      message: "Failed to update status",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};