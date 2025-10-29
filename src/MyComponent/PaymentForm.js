import React, { useContext, useEffect, useRef, useState } from "react";
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
  const [iframeReady, setIframeReady] = useState(false);
  const navigate = useNavigate();

  const CLOVER_PUBLIC_TOKEN = "22d7e946-566e-d99c-bb61-925e0295add4";
  const CLOVER_MID = "RCTSTAVI0010002";

  // ✅ Load Clover SDK + Iframe
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.sandbox.clover.com/sdk.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://checkout.dev.clover.com/ui/?public_token=${CLOVER_PUBLIC_TOKEN}&merchant_id=${CLOVER_MID}&env=sandbox`;
      iframe.width = "100%";
      iframe.height = "400px";
      iframe.style.border = "none";
      iframe.onload = () => setIframeReady(true);
      iframeRef.current.appendChild(iframe);
    };
  }, []);

  // ✅ Listen for Clover token (only once)
  useEffect(() => {
    const listener = async (event) => {
      if (!event.origin.includes("clover.com")) return;
      if (event.data?.type === "token") {
        const token = event.data.token;
        console.log("✅ Received Clover token:", token);

        try {
          const response = await fetch("/api/order/charge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...orderData,
              products: cartProducts,
              paymentType: "Credit Card",
              token,
            }),
          });

          const data = await response.json();
          if (data.success) {
            sweetAlert("success", "Order Placed Successfully");
            emptyCartItem();
            setActiveStep(0);
            setCompletedSteps([]);
            setOrderData({});
            setTimeout(() => navigate("/thankyou"), 1000);
          } else {
            sweetAlert("error", data.message || "Payment failed.");
          }
        } catch (error) {
          console.error("Clover payment error:", error);
          sweetAlert("error", "Payment failed. Please try again.");
        }
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  // ✅ Safely handle payment
  const handlePayment = () => {
    const iframe = iframeRef.current?.querySelector("iframe");
    if (!iframe || !iframeReady) {
      sweetAlert("error", "Payment form is still loading. Please wait a moment.");
      return;
    }

    iframe.contentWindow.postMessage({ type: "getToken" }, "*");
  };

  return (
    <div className="step-content payment-step">
      <p className="info-form">Select how you would like to pay for your order.</p>
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
            <div ref={iframeRef} id="clover-container"></div>
          </div>

          {checkedValue === "Credit Card" && (
            <div className="content">
              <button
                id="card-button"
                onClick={handlePayment}
                disabled={!iframeReady}
                className="submit-btn"
              >
                {iframeReady ? "Proceed" : "Loading Clover..."}
              </button>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

export default PaymentForm;
