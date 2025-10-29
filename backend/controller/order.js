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

// ✅ Get Clover Public Token (for frontend)
router.get("/clover-config", (req, res) => {
  console.log("Clover config requested");
  console.log("Public Token:", CLOVER_SANDBOX_PUBLIC_TOKEN);
  console.log("Merchant ID:", CLOVER_SANDBOX_MID);

  return res.json({
    success: true,
    publicToken: CLOVER_SANDBOX_PUBLIC_TOKEN,
    merchantId: CLOVER_SANDBOX_MID,
  });
});

// ✅ Process Payment with Clover Token
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
      cloverToken, // Token from Clover Elements
    } = req.body;

    if (!cloverToken) {
      console.error("No Clover token provided");
      return res.json({
        success: false,
        message: "Payment token is required",
      });
    }

    const totalAmount = Math.round((amount + taxPrice) * 100);

    console.log("Processing Clover payment:");
    console.log("- Email:", email);
    console.log("- Amount:", totalAmount, "(cents)");
    console.log("- Token:", cloverToken.substring(0, 20) + "...");

    // ✅ Create the order in your DB
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

    // ✅ Charge the card using Clover Pay API
    const chargeResponse = await axios.post(
      `https://scl-sandbox.dev.clover.com/v1/charges`,
      {
        amount: totalAmount,
        currency: "usd",
        source: cloverToken,
        description: `Order for ${firstName} ${lastName}`,
        capture: true,
        metadata: {
          email,
          orderId: `ORDER-${Date.now()}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${CLOVER_SANDBOX_PRIVATE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const charge = chargeResponse.data;

    if (!charge.id || charge.status !== "succeeded") {
      return res.json({
        success: false,
        message: charge.outcome?.description || "Payment failed",
      });
    }

    // ✅ Create order with successful payment info
    const order = await Order.create({
      status: "processing",
      user,
      products: filteredProducts.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
      paymentinfo: {
        amount,
        paymentType: "CLOVER",
        status: "paid",
        transactionId: charge.id,
        chargeId: charge.id,
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

    // ✅ Send confirmation email
    const { subject, html } = generateOrderEmailBody(order);
    await sendMail(email, subject, html);

    return res.json({
      success: true,
      message: "Payment successful",
      order,
      orderId: order.orderId || order._id,
    });
  } catch (error) {
    console.error(
      "Clover Payment error:",
      error.response?.data || error.message
    );
    return res.json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.message ||
        "Payment processing failed",
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
