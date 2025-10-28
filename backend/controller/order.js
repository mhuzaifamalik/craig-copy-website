const express = require("express");
const Order = require("../schema/Order");
const router = express.Router();
const sendMail = require("../helper/sendMail");
const {
  generateOrderEmailBody,
  generateOrderStatusUpdateEmailBody,
} = require("../helper/generateEmailContent");
const SalesTax = require("sales-tax");

// CLOVER CONFIGURATION - PRODUCTION
const CLOVER_CONFIG = {
  merchantId: "518993421147158",
  publicToken: "761a0f1f5c6cf8b9c40833c4916c39b0",
  privateToken: "8aade3b9-b171-169f-b094-0623fe96f33b",
  apiBase: "https://scl.clover.com/v1",
  environment: "production",
};

// TAX CALCULATION
router.post("/calculate-tax", async (req, res) => {
  try {
    const { country, state } = req.body;
    const tax = await SalesTax.getSalesTax(country, state);

    return res.json({
      success: true,
      tax,
    });
  } catch (error) {
    console.error("Error calculating tax:", error.message);
    return res.json({
      success: false,
      message: "Error calculating tax",
    });
  }
});

// GET CLOVER CONFIG FOR FRONTEND
router.get("/clover-config", (req, res) => {
  return res.json({
    success: true,
    publicToken: CLOVER_CONFIG.publicToken,
    merchantId: CLOVER_CONFIG.merchantId,
    environment: CLOVER_CONFIG.environment,
  });
});

// CREATE CLOVER CHARGE (For iframe checkout)
router.post("/create-charge", async (req, res) => {
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

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.json({
        success: false,
        message: "Customer information is incomplete",
      });
    }

    const totalAmount = Math.round((amount + taxPrice) * 100); // Convert to cents

    console.log("Creating Clover charge:", {
      amount: totalAmount,
      email,
      environment: CLOVER_CONFIG.environment,
    });

    // Create Clover Charge
    const response = await fetch(`${CLOVER_CONFIG.apiBase}/charges`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOVER_CONFIG.privateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: "usd",
        description: `Order for ${firstName} ${lastName}`,
        metadata: {
          email,
          customer_name: `${firstName} ${lastName}`,
        },
        redirect_url: `${
          process.env.FRONTEND_URL || "https://craigphotoletters.com"
        }/payment-callback`,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.id) {
      console.error("Clover API error:", data);
      return res.json({
        success: false,
        message: data.message || "Failed to create charge",
      });
    }

    // Store order data temporarily with charge ID
    // You might want to use Redis or a temporary collection for this
    const creation = products
      .filter((item) => item.type === "letter")
      .map((item) => ({
        items: item.id.map((id, ind) => ({
          letter: id,
          imageIndex: item.items[ind],
        })),
        quantity: item.quantity,
      }));

    const productData = products.filter((item) => item.type !== "letter");

    // Create order with pending status
    const order = await Order.create({
      status: "payment_pending",
      user,
      products: productData.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
      paymentinfo: {
        paymentId: data.id, // Clover charge ID
        status: "pending",
        amount,
        paymentType: "Clover",
        environment: CLOVER_CONFIG.environment,
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

    return res.json({
      success: true,
      checkoutUrl: data.hosted_checkout_url,
      chargeId: data.id,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Charge creation error:", error);
    return res.json({
      success: false,
      message: "Error creating charge",
      error: error.message,
    });
  }
});

// PAYMENT CALLBACK (After Clover redirect)
router.post("/payment-callback", async (req, res) => {
  try {
    const { chargeId, orderId } = req.body;

    if (!chargeId || !orderId) {
      return res.json({
        success: false,
        message: "Missing charge or order ID",
      });
    }

    // Verify payment status with Clover
    const response = await fetch(
      `${CLOVER_CONFIG.apiBase}/charges/${chargeId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${CLOVER_CONFIG.privateToken}`,
        },
      }
    );

    const chargeData = await response.json();

    if (!response.ok) {
      return res.json({
        success: false,
        message: "Failed to verify payment",
      });
    }

    // Update order based on payment status
    const paymentSuccess = chargeData.captured === true;
    const orderStatus = paymentSuccess ? "pending" : "payment_failed";

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: orderStatus,
        "paymentinfo.status": paymentSuccess ? "completed" : "failed",
      },
      { new: true }
    )
      .populate("user")
      .populate("products.product")
      .populate("creation.items.letter")
      .populate("coupon");

    // Send confirmation emails if payment successful
    if (paymentSuccess && updatedOrder.email) {
      try {
        const { subject, html } = generateOrderEmailBody(updatedOrder);
        await sendMail(updatedOrder.email, subject, html);
        await sendMail(
          "orders@craigphotoletters.com",
          `New Order from ${updatedOrder.firstName} ${updatedOrder.lastName}`,
          html
        );
        console.log("Order confirmation emails sent successfully");
      } catch (error) {
        console.error("Email Error:", error.message);
      }
    }

    return res.json({
      success: paymentSuccess,
      message: paymentSuccess
        ? "Payment successful"
        : "Payment failed or incomplete",
      order: {
        id: updatedOrder._id,
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    console.error("Payment callback error:", error);
    return res.json({
      success: false,
      message: "Error processing payment callback",
    });
  }
});

// ORDER UPDATE
router.post("/update", async (req, res) => {
  const { orderId, status } = req.body;
  try {
    const currentOrder = await Order.findOne({ orderId });
    if (!currentOrder) {
      return res.redirect(`/admin/orders/list?error=Order not found`);
    }

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
      try {
        const { subject, html } = generateOrderStatusUpdateEmailBody(
          updatedOrder,
          oldStatus,
          status
        );
        await sendMail(updatedOrder.email, subject, html);
      } catch (emailError) {
        console.error("Error sending status update email:", emailError.message);
      }
    }

    return res.redirect(
      `/admin/order/${orderId}?message=Order updated successfully`
    );
  } catch (error) {
    console.error("Error updating order:", error.message);
    if (orderId) {
      return res.redirect(`/admin/order/${orderId}?error=${error.message}`);
    }
    return res.redirect(`/admin/orders/list?error=${error.message}`);
  }
});

module.exports = router;
