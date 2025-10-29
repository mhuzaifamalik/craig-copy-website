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

// Use your environment variables for Clover credentials
const CLOVER_API_TOKEN = CLOVER_SANDBOX_PRIVATE_TOKEN; // Private token for Ecommerce API
const CLOVER_MERCHANT_ID = CLOVER_SANDBOX_MID;

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

// ✅ Get Clover Config (frontend may need merchant ID)
router.get("/clover-config", (req, res) => {
  return res.json({
    success: true,
    merchantId: CLOVER_MERCHANT_ID,
  });
});

// ✅ Create Clover Hosted Checkout Session
router.post("/create-checkout", async (req, res) => {
  try {
    const {
      amount,
      taxPrice,
      shippingPrice,
      email,
      firstName,
      lastName,
      products,
      user,
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
      coupon,
    } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, firstName, lastName, or products",
      });
    }

    console.log("Received products:", JSON.stringify(products, null, 2));

    // Transform products to match Order schema structure
    // Separate regular products from creation items
    const regularProducts = [];
    const creationItems = [];
    const lineItems = []; // For Clover

    for (const item of products) {
      console.log(`Processing product:`, {
        type: item.type,
        id: item.id,
        _id: item._id,
        hasIdArray: Array.isArray(item.id),
        has_idArray: Array.isArray(item._id)
      });

      if (item.type === 'creation' || item.type === 'letter') {
        // This is a letter/creation item
        const letterIds = Array.isArray(item.id) ? item.id : [item.id];
        
        // For line items, use a simple description
        const letterCount = letterIds.length;
        const creationObj = {
          items: letterIds.map((letterId, index) => ({
            letter: letterId,
            imageIndex: item.items ? item.items[index] : 0
          })),
          quantity: item.quantity || 1
        };
        creationItems.push(creationObj);

        // Add to Clover line items
        lineItems.push({
          name: `Custom Letter Creation (${letterCount} ${letterCount === 1 ? 'letter' : 'letters'})`,
          price: letterCount * 10 * 100, // $10 per letter in cents
          unitQty: item.quantity || 1,
          note: "Personalized letter creation"
        });

      } else {
        // Regular product
        let productId = item._id || item.id;
        
        // If productId is an array, take the first element
        if (Array.isArray(productId)) {
          console.warn(`⚠️ Product ID is an array, taking first element:`, productId);
          productId = productId[0];
        }
        
        if (!productId) {
          console.error("❌ Product missing ID:", item);
          throw new Error(`Product missing ID: ${item.name || 'Unknown product'}`);
        }
        
        // Ensure productId is a string
        productId = typeof productId === 'string' ? productId : String(productId);
        
        console.log(`✅ Using product ID: ${productId}`);
        
        regularProducts.push({
          product: productId,
          quantity: item.quantity || 1
        });

        // Add to Clover line items
        lineItems.push({
          name: item.name || item.title || "Product Item",
          price: Math.round((item.price || 0) * 100), // Price per unit in cents
          unitQty: item.quantity || 1,
          note: item.note || ""
        });
      }
    }

    console.log("Transformed regular products:", JSON.stringify(regularProducts, null, 2));
    console.log("Transformed creation items:", JSON.stringify(creationItems, null, 2));
    console.log("Line items for Clover:", JSON.stringify(lineItems, null, 2));

    // Validate that we have at least some items
    if (regularProducts.length === 0 && creationItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products or creation items found"
      });
    }

    // Calculate tax rate in PPM (parts per million)
    const taxRateInPPM = taxPrice > 0 && amount > 0 
      ? Math.round((taxPrice / amount) * 1000000) 
      : 0;

    // Calculate final total
    const calculatedTotal = lineItems.reduce((sum, item) => sum + (item.price * item.unitQty), 0) / 100;
    const finalAmount = calculatedTotal + (taxPrice || 0) + (shippingPrice || 0);

    console.log(`Creating Clover Hosted Checkout for: ${email}`);
    console.log(`Total amount: ${finalAmount}`);

    // Prepare order data
    const orderData = {
      status: "pending",
      paymentType: "CLOVER_HOSTED_CHECKOUT",
      paymentinfo: {
        amount: finalAmount,
        paymentType: "CLOVER_HOSTED_CHECKOUT",
        status: "initiated",
        transactionId: null,
      },
      firstName,
      lastName,
      email,
      deliveryFirstName,
      deliveryLastName,
      phone,
      country,
      address,
      city,
      state,
      zipCode,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
    };

    // Add optional fields
    if (user) orderData.user = user;
    if (giftMessage) orderData.giftMessage = giftMessage;
    if (company) orderData.company = company;
    if (coupon) orderData.coupon = coupon;

    // Add products and creation items based on what exists
    if (regularProducts.length > 0) {
      orderData.products = regularProducts;
    } else {
      // If no regular products, we need at least an empty array to satisfy schema
      orderData.products = [];
    }
    
    if (creationItems.length > 0) {
      orderData.creation = creationItems;
    }

    console.log("Order data being created:", JSON.stringify(orderData, null, 2));

    // First, create the order in your database as "pending"
    let order;
    try {
      order = await Order.create(orderData);
      console.log("✅ Order created successfully:", order._id, order.orderId);
    } catch (orderError) {
      console.error("❌ Order creation failed:", orderError);
      
      // If the error is about products being required, let's handle it
      if (orderError.message && orderError.message.includes('products')) {
        console.log("Trying to create order with empty products array...");
        // Make sure products is at least an empty array with one dummy product
        // This is a workaround if your schema requires at least one product
        // You might need to update your Order schema to make products optional
      }
      
      throw orderError;
    }

    // Clover Ecommerce API endpoint for Hosted Checkout
    // ✅ Using correct Clover sandbox endpoint from official docs
    const CLOVER_ECOMMERCE_CHECKOUT_URL =
      "https://apisandbox.dev.clover.com/invoicingcheckoutservice/v1/checkouts";

    console.log("=== CLOVER API REQUEST ===");
    console.log("URL:", CLOVER_ECOMMERCE_CHECKOUT_URL);
    console.log("Merchant ID:", CLOVER_MERCHANT_ID);
    console.log("API Token exists:", !!CLOVER_API_TOKEN);
    console.log("API Token length:", CLOVER_API_TOKEN?.length);
    console.log("API Token (first 10 chars):", CLOVER_API_TOKEN?.substring(0, 10) + "...");
    
    // Validate credentials
    if (!CLOVER_MERCHANT_ID) {
      throw new Error("CLOVER_SANDBOX_MID is not configured in env.json");
    }
    if (!CLOVER_API_TOKEN) {
      throw new Error("CLOVER_SANDBOX_PRIVATE_TOKEN is not configured in env.json");
    }

    const cloverRequestBody = {
      customer: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phone || "",
      },
      shoppingCart: {
        lineItems: lineItems,
        taxRates: taxPrice > 0 ? [
          {
            name: "Sales Tax",
            rate: taxRateInPPM,
          },
        ] : [],
      },
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-status?orderId=${order._id}&status={status}`,
      shippingAddress: {
        address1: address || "",
        city: city || "",
        state: state || "",
        zip: zipCode || "",
        country: country || "US",
        name: `${deliveryFirstName || firstName} ${deliveryLastName || lastName}`,
        phoneNumber: phone || "",
      },
    };

    console.log("Request body:", JSON.stringify(cloverRequestBody, null, 2));

    // Create checkout session with Clover
    // According to docs: Authorization header uses the Private key as Bearer token
    const response = await axios.post(
      CLOVER_ECOMMERCE_CHECKOUT_URL,
      cloverRequestBody,
      {
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "X-Clover-Merchant-Id": CLOVER_MERCHANT_ID,
          "Authorization": `Bearer ${CLOVER_API_TOKEN}`,
        },
      }
    );

    const checkout = response.data;

    if (!checkout || !checkout.href) {
      console.error("Clover returned unexpected response:", checkout);
      
      // Clean up the pending order
      await Order.findByIdAndDelete(order._id);
      
      return res.status(400).json({
        success: false,
        message: "Failed to create hosted checkout. No redirect URL found.",
        details: checkout,
      });
    }

    // Update order with checkout session ID
    await Order.findByIdAndUpdate(order._id, {
      "paymentinfo.transactionId": checkout.id,
    });

    console.log("✅ Clover checkout created:", checkout.href);
    console.log("✅ Order ID:", order._id);
    console.log("✅ Order details:", order.orderId);

    return res.json({
      success: true,
      checkoutUrl: checkout.href,
      orderId: order._id,
      checkoutSessionId: checkout.id,
    });
  } catch (error) {
    console.error("❌ Clover Hosted Checkout error:");
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      console.error("Validation Error Details:", error.errors);
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Order validation failed",
        details: error.message,
        validationErrors: validationErrors
      });
    }
    
    // Check if it's a Clover API error
    if (error.response) {
      console.error("Clover API Error Status:", error.response?.status);
      console.error("Clover API Error Data:", error.response?.data);
    }
    
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error creating Clover Hosted Checkout",
      details: error.response?.data || error.message,
    });
  }
});

// ✅ Webhook handler for Clover payment updates (optional but recommended)
router.post("/clover-webhook", async (req, res) => {
  try {
    const { type, objectId } = req.body;

    console.log("Received Clover webhook:", type);

    if (type === "CHECKOUT_SESSION_COMPLETED") {
      // Find order by checkout session ID
      const order = await Order.findOne({
        "paymentinfo.transactionId": objectId,
      });

      if (order) {
        order.status = "confirmed";
        order.paymentinfo.status = "completed";
        await order.save();

        console.log(`✅ Order ${order._id} marked as completed`);

        // Send confirmation email
        if (order.email) {
          const { subject, html } = generateOrderEmailBody(order);
          await sendMail(order.email, subject, html);
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ success: false, message: error.message });
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