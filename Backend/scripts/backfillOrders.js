const mongoose = require("mongoose");
require("dotenv").config({ quiet: true });

const connectDB = require("../config/db");
const Order = require("../models/Order");

const backfillOrders = async () => {
  await connectDB();

  const cursor = Order.find({}).cursor();
  let updated = 0;

  for await (const order of cursor) {
    const subtotal = Number(order.subtotal ?? order.totalAmount ?? 0);
    const finalAmount = Number(order.finalAmount ?? order.totalAmount ?? subtotal);

    const patch = {};

    if (order.subtotal == null) {
      patch.subtotal = subtotal;
    }

    if (order.couponCode == null) {
      patch.couponCode = null;
    }

    if (order.discountAmount == null) {
      patch.discountAmount = 0;
    }

    if (order.shippingFee == null) {
      patch.shippingFee = 0;
    }

    if (order.taxAmount == null) {
      patch.taxAmount = 0;
    }

    if (order.finalAmount == null) {
      patch.finalAmount = finalAmount;
    }

    if (order.totalAmount == null) {
      patch.totalAmount = finalAmount;
    }

    if (Object.keys(patch).length > 0) {
      await Order.updateOne({ _id: order._id }, { $set: patch });
      updated += 1;
    }
  }

  console.log(`Backfilled ${updated} orders`);
  await mongoose.disconnect();
};

backfillOrders().catch(async (error) => {
  console.error("Backfill failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});