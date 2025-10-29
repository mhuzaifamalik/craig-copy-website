import React, { useContext, useState } from "react";
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
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/order/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderData,
          products: cartProducts,
          paymentType: "Credit Card",
        }),
      });

      const data = await response.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl; // Redirect to Clover Hosted Checkout
      } else {
        sweetAlert("error", data.message || "Failed to initiate payment.");
      }
    } catch (error) {
      console.error("Clover Checkout Error:", error);
      sweetAlert("error", "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-content payment-step">
      <p className="info-form">
        Select how you would like to pay for your order.
      </p>
      <ul>
        <li>
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
            <div className="content">
              <button
                id="card-button"
                onClick={handlePayment}
                disabled={loading}
                className="submit-btn"
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

export default PaymentForm;
