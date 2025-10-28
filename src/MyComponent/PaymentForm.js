import { useContext, useEffect, useRef, useState } from "react";
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
  const iframeRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [chargeId, setChargeId] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Listen for messages from Clover iframe
    const handleMessage = async (event) => {
      // Verify origin for security
      if (event.origin !== "https://checkout.clover.com") return;

      const { type, chargeId: cloverChargeId } = event.data;

      if (type === "CLOVER_PAYMENT_SUCCESS" && cloverChargeId) {
        console.log("Payment successful, verifying...");
        await verifyPayment(cloverChargeId);
      } else if (type === "CLOVER_PAYMENT_ERROR") {
        sweetAlert("error", "Payment failed. Please try again.");
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [chargeId, orderId]);

  const createCharge = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/order/create-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderData,
          products: cartProducts,
          paymentType: checkedValue,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        sweetAlert("error", data.message || "Failed to create checkout.");
        setLoading(false);
        return;
      }

      setCheckoutUrl(data.checkoutUrl);
      setChargeId(data.chargeId);
      setOrderId(data.orderId);
      setLoading(false);
    } catch (err) {
      console.error("Charge creation error:", err);
      sweetAlert("error", "Failed to initialize payment.");
      setLoading(false);
    }
  };

  const verifyPayment = async (cloverChargeId) => {
    try {
      const response = await fetch("/api/order/payment-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chargeId: cloverChargeId || chargeId,
          orderId: orderId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        sweetAlert("success", "Order Placed Successfully");
        emptyCartItem();
        setActiveStep(0);
        setCompletedSteps([]);
        setOrderData({
          coupon: null,
          firstName: "",
          lastName: "",
          email: "",
          giftMessage: "",
          deliveryFirstName: "",
          deliveryLastName: "",
          phone: "",
          company: "",
          country: "United States",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          paymentType: "",
        });
        setTimeout(() => {
          navigate("/thankyou");
        }, 1000);
      } else {
        sweetAlert("error", result.message || "Payment verification failed.");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      sweetAlert("error", "Failed to verify payment.");
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
              onChange={(e) => {
                if (e.target.checked) {
                  setCheckedValue("Credit Card");
                }
              }}
            />
            <label htmlFor="del-0">
              <FaCreditCard /> Credit Card
            </label>
          </div>

          {checkedValue === "Credit Card" && (
            <div className="content">
              {!checkoutUrl ? (
                <button
                  onClick={createCharge}
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? "Loading Payment..." : "Proceed to Payment"}
                </button>
              ) : (
                <div style={{ marginTop: "20px" }}>
                  <iframe
                    ref={iframeRef}
                    src={checkoutUrl}
                    width="100%"
                    height="600"
                    frameBorder="0"
                    allow="payment"
                    title="Clover Payment"
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

export default PaymentForm;
