import React, { useContext, useState, useEffect, useRef } from "react";
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
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [zipCode, setZipCode] = useState("");
  const navigate = useNavigate();

  // Fetch Clover Config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/order/clover-config");
        const data = await response.json();
        if (data.success) {
          setCloverConfig(data);
          console.log("Clover config loaded");
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

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpMonthChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 2 && (value === "" || parseInt(value) <= 12)) {
      setExpMonth(value);
    }
  };

  const handleExpYearChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 4) {
      setExpYear(value);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const handleZipCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 5) {
      setZipCode(value);
    }
  };

  const validateCardDetails = () => {
    const cardNum = cardNumber.replace(/\s/g, "");

    if (cardNum.length < 13 || cardNum.length > 19) {
      sweetAlert("error", "Please enter a valid card number");
      return false;
    }

    if (!expMonth || parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
      sweetAlert("error", "Please enter a valid expiration month (01-12)");
      return false;
    }

    if (!expYear || expYear.length !== 4) {
      sweetAlert("error", "Please enter a valid 4-digit year");
      return false;
    }

    const currentYear = new Date().getFullYear();
    if (parseInt(expYear) < currentYear) {
      sweetAlert("error", "Card has expired");
      return false;
    }

    if (cvv.length < 3) {
      sweetAlert("error", "Please enter a valid CVV");
      return false;
    }

    if (zipCode.length !== 5) {
      sweetAlert("error", "Please enter a valid 5-digit ZIP code");
      return false;
    }

    return true;
  };

  const createCloverToken = async () => {
    const cardNum = cardNumber.replace(/\s/g, "");

    try {
      const tokenResponse = await fetch("/api/order/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card: {
            number: cardNum,
            exp_month: expMonth.padStart(2, "0"),
            exp_year: expYear,
            cvv: cvv,
            zip: "11111", // optional, but Clover accepts it
          },
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error("Token creation failed:", tokenData);
        throw new Error(tokenData.message || "Failed to create payment token");
      }

      return tokenData.id;
    } catch (error) {
      console.error("Token creation error:", error);
      throw error;
    }
  };

  const detectCardBrand = (cardNum) => {
    if (cardNum.startsWith("4")) return "VISA";
    if (cardNum.startsWith("5")) return "MASTERCARD";
    if (cardNum.startsWith("6011")) return "DISCOVER";
    if (cardNum.startsWith("34") || cardNum.startsWith("37")) return "AMEX";
    return "VISA";
  };

  const handlePayment = async () => {
    if (!cloverConfig) {
      sweetAlert("error", "Payment system not ready. Please try again.");
      return;
    }

    if (!validateCardDetails()) {
      return;
    }

    try {
      setLoading(true);
      console.log("Creating payment token...");

      // Create Clover token
      const token = await createCloverToken();
      console.log("Token created successfully");

      // Send payment to backend
      const response = await fetch("/api/order/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderData,
          products: cartProducts,
          paymentType: "Credit Card",
          cloverToken: token,
        }),
      });

      const data = await response.json();
      console.log("Payment response:", data);

      if (data.success) {
        sweetAlert("success", "Payment successful!");
        emptyCartItem();

        // Navigate to thank you page
        navigate("/thankyou", {
          state: { orderId: data.orderId, order: data.order },
        });
      } else {
        sweetAlert(
          "error",
          data.message || "Payment failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Payment Error:", error);
      sweetAlert("error", "Payment failed: " + error.message);
    } finally {
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
              <FaCreditCard /> Credit Card
            </label>
          </div>

          {checkedValue === "Credit Card" && (
            <div
              className="payment-content-wrapper"
              style={{
                marginTop: "20px",
                display: "block !important",
                visibility: "visible !important",
                opacity: "1 !important",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="card-number-input"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                  }}
                >
                  Card Number *
                </label>
                <input
                  id="card-number-input"
                  type="text"
                  placeholder="4111 1111 1111 1111"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  autoComplete="cc-number"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    display: "block",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    htmlFor="exp-month-input"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    Exp Month *
                  </label>
                  <input
                    id="exp-month-input"
                    type="text"
                    placeholder="MM"
                    value={expMonth}
                    onChange={handleExpMonthChange}
                    autoComplete="cc-exp-month"
                    maxLength="2"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      display: "block",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="exp-year-input"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    Exp Year *
                  </label>
                  <input
                    id="exp-year-input"
                    type="text"
                    placeholder="YYYY"
                    value={expYear}
                    onChange={handleExpYearChange}
                    autoComplete="cc-exp-year"
                    maxLength="4"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      display: "block",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    htmlFor="cvv-input"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    CVV *
                  </label>
                  <input
                    id="cvv-input"
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    autoComplete="cc-csc"
                    maxLength="4"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      display: "block",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="zip-input"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    ZIP Code *
                  </label>
                  <input
                    id="zip-input"
                    type="text"
                    placeholder="12345"
                    value={zipCode}
                    onChange={handleZipCodeChange}
                    autoComplete="postal-code"
                    maxLength="5"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      display: "block",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="submit-btn"
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: loading ? "#ccc" : "#ff9800",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background-color 0.3s",
                  display: "block",
                  boxSizing: "border-box",
                }}
              >
                {loading ? "Processing Payment..." : "Pay Now"}
              </button>

              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "#666",
                  display: "block",
                }}
              >
                <strong>Test Cards (Sandbox):</strong>
                <div style={{ marginTop: "8px", lineHeight: "1.6" }}>
                  • Visa: 4111 1111 1111 1111
                  <br />
                  • Mastercard: 5555 5555 5554 4444
                  <br />
                  • Discover: 6011 3610 0000 6668
                  <br />
                  Use any future date, CVV: 123, ZIP: 12345
                </div>
              </div>

              <p
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#666",
                  textAlign: "center",
                  display: "block",
                }}
              >
                🔒 Your payment is secure and encrypted
              </p>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

export default PaymentForm;
