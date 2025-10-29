const express = require("express");
const axios = require("axios");
// const { randomUUID } = require("crypto");
const Order = require("../schema/Order");
const sendMail = require("../helper/sendMail");
const {
  generateOrderEmailBody,
  generateOrderStatusUpdateEmailBody,
} = require("../helper/generateEmailContent");
const SalesTax = require("sales-tax");
const {
  CLOVER_PRIVATE_TOKEN,
  CLOVER_SANDBOX_PUBLIC_TOKEN,
} = require("../env.json");

const router = express.Router();

//  Calculate tax route
router.post("/calculate-tax", async (req, res) => {
  try {
    const { country, state } = req.body;
    const tax = await SalesTax.getSalesTax(country, state);
    return res.json({ success: true, tax });
  } catch (error) {
    console.error("Error calculating tax:", error.message);
    return res.json({ success: false, message: "Error calculating tax" });
  }
});

// Clover production charge route
router.post("/charge", async (req, res) => {
  try {
    const {
      token, // Clover token from frontend iframe
      user,
      products,
      firstName,
      lastName,
      email,
      giftMessage,
      deliveryFirstName,
      deliveryLastName,
      phone,
      company,
      country,
      address,
      city,
      state,
      zipCode,
      paymentType,
      coupon,
      amount,
      taxPrice,
    } = req.body;

    // ✅ Total in cents (integer)
    const totalAmount = Math.round((amount + taxPrice) * 100);

    console.log("Processing Clover payment for:", email, totalAmount);

    // ✅ Create charge in Clover (sandbox)
    const chargeResponse = await axios.post(
      "https://scl-sandbox.dev.clover.com/v1/charges",
      {
        amount: totalAmount,
        currency: "usd",
        source: token, // token generated from Clover Iframe on frontend
        description: `Order for ${firstName} ${lastName}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_PRIVATE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const payment = chargeResponse.data;
    const paymentId = payment.id;
    const status = payment.status || "pending";

    // ✅ Build your order payload
    const creation = products
      .filter((item) => item.type === "letter")
      .map((item) => ({
        items: item.id.map((id, ind) => ({
          letter: id,
          imageIndex: item.items[ind],
        })),
        quantity: item.quantity,
      }));

    const filteredProducts = products.filter((item) => item.type !== "letter");

    const order = await Order.create({
      status: "pending",
      user,
      products: filteredProducts.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
      paymentinfo: {
        paymentId,
        status,
        amount,
        paymentType: "CLOVER",
      },
      creation,
      firstName,
      lastName,
      email,
      giftMessage,
      deliveryFirstName,
      deliveryLastName,
      phone,
      company,
      country,
      address,
      city,
      state,
      zipCode,
      paymentType,
      coupon,
      taxPrice,
    });

    const orderObj = await Order.findById(order._id)
      .populate("user")
      .populate("products.product")
      .populate("creation.items.letter")
      .populate("coupon");

    // ✅ Send emails
    const { subject, html } = generateOrderEmailBody(orderObj);
    await sendMail(email, subject, html);
    await sendMail(
      "orders@craigphotoletters.com",
      `New Clover Order from ${firstName} ${lastName}`,
      html
    );

    return res.json({
      success: true,
      message: "Clover payment processed successfully",
      order,
    });
  } catch (error) {
    console.error("Clover payment error:", error.response?.data || error);
    return res.json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.message ||
        "Payment processing failed",
    });
  }
});

// Order status update route

router.post("/update", async (req, res) => {
  const { orderId, status } = req.body;
  try {
    const currentOrder = await Order.findOne({ orderId });
    if (!currentOrder)
      return res.redirect(`/admin/orders/list?error=Order not found`);

    const oldStatus = currentOrder.status;
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    )
      .populate("user")
      .populate("products.product")
      .populate("creation.items.letter")
      .populate("coupon");

    if (oldStatus !== status && updatedOrder.email) {
      const { subject, html } = generateOrderStatusUpdateEmailBody(
        updatedOrder,
        oldStatus,
        status
      );
      await sendMail(updatedOrder.email, subject, html);
    }

    return res.redirect(
      `/admin/order/${orderId}?message=Order updated successfully`
    );
  } catch (error) {
    console.error("Error updating order:", error.message);
    return res.redirect(`/admin/orders/list?error=${error.message}`);
  }
});

module.exports = router;
