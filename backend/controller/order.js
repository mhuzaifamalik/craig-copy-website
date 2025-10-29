const express = require("express");
const axios = require("axios");
const Order = require("../schema/Order");
const sendMail = require("../helper/sendMail");
const {
  generateOrderEmailBody,
  generateOrderStatusUpdateEmailBody,
} = require("../helper/generateEmailContent");
const SalesTax = require("sales-tax");
const {
  CLOVER_SANDBOX_PRIVATE_TOKEN,
  CLOVER_SANDBOX_PUBLIC_TOKEN,
  CLOVER_SANDBOX_MID,
} = require("../env.json");

const router = express.Router();

// ✅ Calculate Tax Route
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

// ✅ Clover Hosted Checkout (Sandbox)
router.post("/charge", async (req, res) => {
  try {
    const {
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

    const totalAmount = Math.round((amount + taxPrice) * 100);

    console.log("Creating Clover Hosted Checkout for:", email, totalAmount);

    // ✅ Create the order in your DB (before redirect)
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
        amount,
        paymentType: "CLOVER",
        status: "pending",
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

    const checkoutResponse = await axios.post(
      `https://scl-sandbox.dev.clover.com/v3/merchants/${CLOVER_SANDBOX_MID}/checkouts`,
      {
        order: {
          amount: totalAmount,
          currency: "usd",
          description: `Order for ${firstName} ${lastName}`,
        },
        redirectUrl: `https://craigphotoletters.com/thankyou`,
        cancelUrl: `https://craigphotoletters.com/checkout`,
      },
      {
        headers: {
          Authorization: `Bearer ${CLOVER_SANDBOX_PRIVATE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const checkout = checkoutResponse.data;
    const hostedCheckoutUrl = checkout._links["checkout-page"].href;

    return res.json({
      success: true,
      redirectUrl: hostedCheckoutUrl,
      message: "Hosted Checkout created successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Clover Hosted Checkout error:",
      error.response?.data || error.message
    );
    return res.json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.message ||
        "Hosted Checkout creation failed",
    });
  }
});

// ✅ Order status update route
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
