const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    // 🔥 USER LINK
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 IDEMPOTENCY (CRITICAL FOR CONCURRENCY)
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true, // allows null
    },

    customerName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "COD",
    },

    status: {
      type: String,
      default: "Placed",
    },

    trackingId: {
      type: String,
      unique: true,
      sparse: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    items: [
      {
        title: String,
        price: Number,
        qty: Number,
        size: String,
        image: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
