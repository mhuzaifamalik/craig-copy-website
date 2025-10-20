const generateOrderEmailBody = (order) => {
  const {
    orderId,
    firstName,
    lastName,
    phone,
    products,
    creation,
    paymentinfo,
    deliveryFirstName,
    deliveryLastName,
    address,
    city,
    state,
    zipCode,
    country,
    amount,
    shippingPrice,
    taxPrice,
    amountPaid,
    createdAt,
  } = order;
  const subject = `Order Confirmation - ${orderId}`;
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.5;">
  <!-- Header -->
  <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eeeeee;">
    <img src="http://craigphotoletters.com/admin/assets/images/logo-light.png" alt="Company Logo" style="max-width: 180px;">
    <h1 style="color: #222222; margin: 15px 0 10px 0; font-size: 24px;">Thank You For Your Order!</h1>
    <p style="margin: 0; color: #666666;">Your order #${orderId} has been confirmed</p>
  </div>

  <!-- Order Summary -->
  <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 4px;">
    <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #222222;">Order Summary</h2>
    <table style="width: 100%;">
      <tr>
        <td style="padding: 5px 0; width: 120px;"><strong>Order Number:</strong></td>
        <td style="padding: 5px 0;">#${orderId}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0;"><strong>Order Date:</strong></td>
        <td style="padding: 5px 0;">${new Date(createdAt).toDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0;"><strong>Name:</strong></td>
        <td style="padding: 5px 0;">${firstName} ${lastName}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0;"><strong>Phone:</strong></td>
        <td style="padding: 5px 0;">${phone}</td>
      </tr>
      ${
        paymentinfo
          ? `<tr>
        <td style="padding: 5px 0;"><strong>Payment Method:</strong></td>
        <td style="padding: 5px 0;">${paymentinfo.paymentId}</td>
      </tr>`
          : ""
      }
    </table>
  </div>

  <!-- Order Items -->
  <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #222222;">Your Items</h3>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th style="text-align: left; padding: 10px; border-bottom: 1px solid #dddddd;">Item</th>
        <th style="text-align: left; padding: 10px; border-bottom: 1px solid #dddddd;">Qty</th>
        <th style="text-align: right; padding: 10px; border-bottom: 1px solid #dddddd;">Price</th>
      </tr>
    </thead>
    <tbody>
    ${products
      .map((item) => {
        return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${item.product.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">$${item.product.price}</td>
      </tr>`;
      })
      .join("")}
    ${creation
      .map((item) => {
        return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">
        ${Array.from(item.items)
          .map((obj) => {
            return `<div><img src="http://craigphotoletters.com${
              obj.letter.images[obj.imageIndex]
            }" alt="${
              obj.letter.letter
            }" style="max-width: 50px; margin-right: 10px;"><span>${
              obj.letter.images[obj.imageIndex].split("/").pop().split(".")[0]
            }</span></div>`;
          })
          .join(" ")}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${
          item.quantity
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">$${
          item.items.length * item.quantity * 10
        }</td>
      </tr>`;
      })
      .join("")}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
        <td style="padding: 10px; text-align: right;">$${amount}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
        <td style="padding: 10px; text-align: right;">$${shippingPrice}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 10px; text-align: right;"><strong>Tax:</strong></td>
        <td style="padding: 10px; text-align: right;">$${taxPrice}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
        <td style="padding: 10px; text-align: right;">$${amountPaid}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Shipping Info -->
  <div style="margin-bottom: 20px;">
    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #222222;">Shipping Information</h3>
    <p style="margin: 5px 0;">${deliveryFirstName} ${deliveryLastName}<br>
    ${address}<br>
    ${city}, ${state} ${zipCode}<br>
    ${country}</p>
  </div>

  <!-- Footer -->
  <div style="padding: 20px 0; border-top: 1px solid #eeeeee; color: #777777; font-size: 14px;">
    <p style="margin: 0 0 10px 0;">Need help? Contact us at <a href="mailto:support@yourcompany.com" style="color: #4CAF50;">support@yourcompany.com</a></p>
    <p style="margin: 0;">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
  </div>
</div>
    `;
  return { subject, html };
};

const generateContactEmailBody = (contact) => {
  const { firstName, lastName, email, phone, message } = contact;
  const subject = `New Contact Form Submission from ${firstName} ${lastName}`;
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.5;">
        <h1 style="color: #222222;">New Contact Form Submission</h1>
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p style="color: #777777; font-size: 14px;">This message was sent from the contact form on your website.</p>
      </div>
    `;
  return { subject, html };
};

const generateOrderStatusUpdateEmailBody = (order, oldStatus, newStatus) => {
  const {
    orderId,
    firstName,
    lastName,
    deliveryFirstName,
    deliveryLastName,
    address,
    city,
    state,
    zipCode,
    country,
  } = order;

  const statusMessages = {
    pending: "Your order has been received and is pending processing.",
    processing: "Great news! Your order is now being processed.",
    shipped: "Your order has been shipped and is on its way!",
    completed: "Your order has been completed and delivered.",
    cancelled: "Your order has been cancelled.",
    refunded: "Your order has been refunded.",
  };

  const statusColors = {
    pending: "#f39c12",
    processing: "#3498db",
    shipped: "#9b59b6",
    completed: "#27ae60",
    cancelled: "#e74c3c",
    refunded: "#95a5a6",
  };

  const subject = `Order Update - ${orderId} - ${
    newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
  }`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.5;">
      <!-- Header -->
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eeeeee;">
        <img src="http://craigphotoletters.com/admin/assets/images/logo-light.png" alt="Company Logo" style="max-width: 180px;">
        <h1 style="color: #222222; margin: 15px 0 10px 0; font-size: 24px;">Order Status Update</h1>
        <p style="margin: 0; color: #666666;">Your order #${orderId} status has been updated</p>
      </div>

      <!-- Status Update -->
      <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center;">
        <div style="background-color: ${
          statusColors[newStatus]
        }; color: white; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
          <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">${newStatus}</h2>
        </div>
        <p style="margin: 0; font-size: 16px; color: #555555;">${
          statusMessages[newStatus]
        }</p>
      </div>

      <!-- Order Details -->
      <div style="margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #222222;">Order Details</h3>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 5px 0; width: 120px;"><strong>Order Number:</strong></td>
            <td style="padding: 5px 0;">#${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Customer:</strong></td>
            <td style="padding: 5px 0;">${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Previous Status:</strong></td>
            <td style="padding: 5px 0; text-transform: capitalize;">${oldStatus}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Current Status:</strong></td>
            <td style="padding: 5px 0; text-transform: capitalize; color: ${
              statusColors[newStatus]
            }; font-weight: bold;">${newStatus}</td>
          </tr>
        </table>
      </div>

      ${
        newStatus === "shipped" || newStatus === "completed"
          ? `
      <!-- Shipping Info -->
      <div style="margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #222222;">Delivery Address</h3>
        <p style="margin: 5px 0;">${deliveryFirstName} ${deliveryLastName}<br>
        ${address}<br>
        ${city}, ${state} ${zipCode}<br>
        ${country}</p>
      </div>
      `
          : ""
      }

      <!-- Footer -->
      <div style="padding: 20px 0; border-top: 1px solid #eeeeee; color: #777777; font-size: 14px;">
        <p style="margin: 0 0 10px 0;">Need help? Contact us at <a href="mailto:info@craigphotoletters.com" style="color: #4CAF50;">info@craigphotoletters.com</a></p>
        <p style="margin: 0;">© ${new Date().getFullYear()} Craig Photo Letters. All rights reserved.</p>
      </div>
    </div>
  `;
  return { subject, html };
};

module.exports = {
  generateOrderEmailBody,
  generateContactEmailBody,
  generateOrderStatusUpdateEmailBody,
};
