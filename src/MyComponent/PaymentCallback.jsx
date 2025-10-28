import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CartContext } from "../context/Cart";

const PaymentCallback = ({
  setActiveStep,
  setCompletedSteps,
  setOrderData,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { emptyCartItem } = useContext(CartContext);
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    const handleCallback = () => {
      const orderId = searchParams.get("orderId");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setMessage(getErrorMessage(error));
        setTimeout(() => navigate("/checkout"), 3000);
        return;
      }

      if (orderId) {
        // Payment was successful
        setStatus("success");
        setMessage("Payment successful! Thank you for your order.");

        // Clear cart and reset state
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
      } else {
        setStatus("error");
        setMessage("Invalid payment information");
        setTimeout(() => navigate("/checkout"), 3000);
      }
    };

    handleCallback();
  }, [
    searchParams,
    navigate,
    emptyCartItem,
    setActiveStep,
    setCompletedSteps,
    setOrderData,
  ]);

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      missing_order_id: "Payment information is missing",
      order_not_found: "Order not found",
      payment_verification_failed: "Unable to verify payment",
      payment_failed: "Payment was not successful",
      callback_error: "An error occurred processing your payment",
    };
    return errorMessages[errorCode] || "Payment processing failed";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      {status === "processing" && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {message}
          </h2>
          <p className="text-sm text-gray-500">
            Please wait while we confirm your payment...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6">
            <span className="text-white text-5xl font-bold">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Thank You!</h1>
          <h2 className="text-xl font-medium text-gray-800 mb-4">{message}</h2>
          <p className="text-gray-600 mt-4">
            A confirmation email has been sent to your email address.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mb-6">
            <span className="text-white text-5xl font-bold">✕</span>
          </div>
          <h2 className="text-2xl font-semibold text-red-600 mb-2">
            Payment Failed
          </h2>
          <p className="text-lg text-gray-800 mb-4">{message}</p>
          <p className="text-sm text-gray-500 mt-4">
            Redirecting back to checkout...
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;
