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

// Calculate Tax Route
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

// Get Clover Public Token (for frontend)
router.get("/clover-config", (req, res) => {
  return res.json({
    success: true,
    publicToken: CLOVER_SANDBOX_PUBLIC_TOKEN,
    merchantId: CLOVER_SANDBOX_MID,
  });
});

// Create Clover Token (server-side tokenization)
router.post("/create-token", async (req, res) => {
  try {
    const { card } = req.body;

    // Validate required card fields
    if (
      !card ||
      !card.number ||
      !card.exp_month ||
      !card.exp_year ||
      !card.cvv
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required card fields: number, exp_month, exp_year, cvv",
      });
    }

    // Create token using Clover Tokenization API
    const response = await axios.post(
      "https://token-sandbox.dev.clover.com/v1/tokens",
      {
        card: {
          number: card.number,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          cvv: card.cvv,
          brand: card.brand || undefined,
          name: card.name || undefined,
          address_line1: card.address_line1 || undefined,
          address_line2: card.address_line2 || undefined,
          address_city: card.address_city || undefined,
          address_state: card.address_state || undefined,
          address_zip: card.address_zip || undefined,
          address_country: card.address_country || undefined,
        },
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          apiKey: CLOVER_SANDBOX_PUBLIC_TOKEN,
        },
      }
    );

    console.log("Token created successfully:", response.data.id);

    return res.json({
      success: true,
      token: response.data.id,
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Clover Token Creation Error:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        "Failed to create Clover token",
      details: error.response?.data,
    });
  }
});

// Process Payment with Clover Token
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
      cloverToken,
    } = req.body;

    if (!cloverToken) {
      console.error("No Clover token provided");
      return res.status(400).json({
        success: false,
        message: "Payment token is required",
      });
    }

    const totalAmount = Math.round((amount + taxPrice) * 100);

    console.log("Processing Clover payment:");
    console.log("- Email:", email);
    console.log("- Amount:", totalAmount, "(cents)");
    console.log("- Token:", cloverToken.substring(0, 20) + "...");

    // Prepare order data - FIX: Add validation and default values
    const creation = products
      .filter((item) => item.type === "letter")
      .map((item) => ({
        items: (item.id || []).map((id, ind) => ({
          letter: id,
          imageIndex: (item.items || [])[ind],
        })),
        quantity: item.quantity,
      }));

    const filteredProducts = products.filter((item) => item.type !== "letter");

    // Charge the card using Clover Pay API
    const chargeResponse = await axios.post(
      `https://scl-sandbox.dev.clover.com/v1/charges`,
      {
        amount: totalAmount,
        currency: "usd",
        source: cloverToken,
        description: `Order for ${firstName} ${lastName}`,
        capture: true,
        receipt_email: email,
        metadata: {
          customer_name: `${firstName} ${lastName}`,
          order_reference: `ORDER-${Date.now()}`,
        },
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${CLOVER_SANDBOX_PRIVATE_TOKEN}`,
        },
      }
    );

    const charge = chargeResponse.data;

    console.log("Charge response:", {
      id: charge.id,
      status: charge.status,
      amount: charge.amount,
      captured: charge.captured,
    });

    // Check if payment was successful
    if (!charge.id || charge.status !== "succeeded") {
      console.error("Charge failed:", charge);
      return res.status(400).json({
        success: false,
        message:
          charge.outcome?.seller_message ||
          charge.outcome?.description ||
          charge.failure_message ||
          "Payment failed",
        details: charge,
      });
    }

    // Create order in database
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
        last4: charge.source?.last4 || null,
        brand: charge.source?.brand || null,
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

    // FIX: Populate order data before generating email (like old API)
    const orderObj = await Order.findById(order._id)
      .populate("user")
      .populate("products.product")
      .populate("creation.items.letter")
      .populate("coupon");

    // FIX: Send confirmation email to both customer and admin (like old API)
    const { subject, html } = generateOrderEmailBody(orderObj);

    try {
      // Send confirmation to the customer
      await sendMail(email, subject, html);

      // Send notification to admin as well
      await sendMail(
        "orders@craigphotoletters.com",
        `New Order from ${firstName} ${lastName}`,
        html
      );

      console.log("Emails sent to customer and admin successfully");
    } catch (error) {
      console.error("Error sending emails:", error.message);
      // Don't fail the order if email fails, just log it
    }

    console.log("Order created successfully:", order._id);

    return res.json({
      success: true,
      message: "Payment successful",
      order: orderObj, // Return populated order
      orderId: orderObj.orderId || orderObj._id,
      chargeId: charge.id,
    });
  } catch (error) {
    console.error(
      "Clover Payment error:",
      error.response?.data || error.message
    );

    // Enhanced error logging
    if (error.response?.data) {
      console.error(
        "Full error response:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    return res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Payment processing failed",
      details: error.response?.data,
    });
  }
});

// Order status update route
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
