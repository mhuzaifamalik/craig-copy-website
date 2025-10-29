import React, { useContext, useState, useEffect } from "react";
import { FaCreditCard } from "react-icons/fa6";
import { CartContext } from "../context/Cart";
import { useNavigate } from "react-router-dom";

const PaymentForm = ({
  setActiveStep,
  setCompletedSteps,
  checkedValue,
  setCheckedValue,
  orderData,
  sweetAlert,
  setOrderData,
}) => {
  const { emptyCartItem, cartProducts } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [cloverConfig, setCloverConfig] = useState(null);
  const navigate = useNavigate();

  // Fetch Clover Config on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/order/clover-config");
        const data = await response.json();
        if (data.success) {
          setCloverConfig(data);
          console.log("✅ Clover config loaded");
        } else {
          sweetAlert("error", "Failed to load payment configuration");
        }
      } catch (error) {
        console.error("Failed to fetch Clover config:", error);
        sweetAlert("error", "Failed to load payment configuration");
      }
    };

    fetchConfig();
  }, []);

  // Handle Payment - Redirect to Clover Hosted Checkout
  const handlePayment = async () => {
    // Validate cart and order data
    if (!cartProducts || cartProducts.length === 0) {
      sweetAlert("error", "Your cart is empty.");
      return;
    }

    if (!orderData || !orderData.amount || !orderData.email) {
      sweetAlert("error", "Missing required order information.");
      return;
    }

    if (!orderData.firstName || !orderData.lastName) {
      sweetAlert("error", "Please provide your name.");
      return;
    }

    if (!orderData.deliveryFirstName || !orderData.deliveryLastName) {
      sweetAlert("error", "Please provide delivery name.");
      return;
    }

    if (
      !orderData.address ||
      !orderData.city ||
      !orderData.state ||
      !orderData.zipCode
    ) {
      sweetAlert("error", "Please provide complete delivery address.");
      return;
    }

    try {
      setLoading(true);

      console.log("=== CHECKOUT DEBUG INFO ===");
      console.log("Cart products:", JSON.stringify(cartProducts, null, 2));
      console.log("Order data:", JSON.stringify(orderData, null, 2));

      // Check if cart products have the required _id field
      const hasIds = cartProducts.every((item) => item._id || item.id);
      if (!hasIds) {
        console.error("❌ Some products are missing _id or id field!");
        sweetAlert(
          "error",
          "Cart data is incomplete. Please refresh and try again."
        );
        setLoading(false);
        return;
      }

      // Prepare the request payload
      const checkoutPayload = {
        ...orderData,
        products: cartProducts,
        paymentType: "CLOVER_HOSTED_CHECKOUT",
      };

      console.log(
        "Checkout payload:",
        JSON.stringify(checkoutPayload, null, 2)
      );
      console.log("=== END DEBUG INFO ===");

      // Call backend to create Clover Hosted Checkout session
      const response = await fetch("/api/order/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutPayload),
      });

      const data = await response.json();
      console.log("Checkout Response:", data);

      if (data.success && data.checkoutUrl) {
        // Show success message
        sweetAlert("success", "Redirecting to secure payment page...");

        // Small delay to show the message
        setTimeout(() => {
          // Redirect to Clover's hosted checkout page
          window.location.href = data.checkoutUrl;
        }, 1000);
      } else {
        // Show detailed error if available
        let errorMessage = data.message || "Failed to create checkout session.";

        if (data.validationErrors && data.validationErrors.length > 0) {
          errorMessage += "\n\nValidation errors:\n";
          errorMessage += data.validationErrors
            .map((err) => `- ${err.field}: ${err.message}`)
            .join("\n");
        }

        if (data.details) {
          console.error("Error details:", data.details);
        }

        console.error("Checkout error details:", data);
        sweetAlert("error", errorMessage);
        setLoading(false);
      }
    } catch (err) {
      console.error("Payment initiation failed:", err);
      sweetAlert("error", "Error initiating payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="step-content payment-step">
      <p className="info-form">
        Select how you would like to pay for your order.
      </p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ marginBottom: "20px" }}>
          <div className="radio-wrapper">
            <input
              type="radio"
              name="payment-type"
              id="del-0"
              checked={checkedValue === "Credit Card"}
              onChange={(e) =>
                e.target.checked && setCheckedValue("Credit Card")
              }
            />
            <label htmlFor="del-0">
              <FaCreditCard /> Credit Card (Secure Checkout)
            </label>
          </div>

          {checkedValue === "Credit Card" && (
            <div
              className="payment-content-wrapper"
              style={{
                marginTop: "20px",
                padding: "20px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              {/* Information Box */}
              <div
                style={{
                  borderLeft: "4px solid #4CAF50",
                  paddingLeft: "15px",
                  marginBottom: "20px",
                  backgroundColor: "#f1f8f4",
                  padding: "15px",
                  borderRadius: "4px",
                }}
              >
                <h4 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>
                  🔒 Secure Payment
                </h4>
                <p style={{ margin: 0, color: "#555", fontSize: "14px" }}>
                  You will be redirected to Clover's secure payment page to
                  complete your transaction. Your card details are never stored
                  on our servers.
                </p>
              </div>

              {/* Order Summary */}
              {orderData && (
                <div
                  style={{
                    backgroundColor: "#fff",
                    padding: "15px",
                    borderRadius: "4px",
                    marginBottom: "20px",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
                    Order Summary
                  </h4>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span>Subtotal:</span>
                      <span>
                        $
                        {(orderData.amount - (orderData.taxPrice || 0)).toFixed(
                          2
                        )}
                      </span>
                    </div>
                    {orderData.taxPrice > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span>Tax:</span>
                        <span>${orderData.taxPrice.toFixed(2)}</span>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "2px solid #e0e0e0",
                        fontWeight: "bold",
                        fontSize: "16px",
                        color: "#333",
                      }}
                    >
                      <span>Total:</span>
                      <span>${orderData.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="submit-btn"
                style={{
                  width: "100%",
                  padding: "16px",
                  backgroundColor: loading ? "#ccc" : "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: loading ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "#45a049";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "#4CAF50";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaCreditCard style={{ marginRight: "8px" }} />
                    Proceed to Secure Payment
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  backgroundColor: "#fff3cd",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "#856404",
                  border: "1px solid #ffeaa7",
                }}
              >
                <strong>🔐 Security Note:</strong> You'll be redirected to
                Clover's PCI-compliant payment page. All transactions are
                encrypted and secure.
              </div>

              {/* Accepted Cards */}
              <div
                style={{
                  marginTop: "12px",
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#999",
                }}
              >
                <p style={{ margin: "8px 0" }}>We accept:</p>
                <p style={{ margin: "4px 0" }}>
                  💳 Visa • Mastercard • American Express • Discover
                </p>
              </div>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

export default PaymentForm;
