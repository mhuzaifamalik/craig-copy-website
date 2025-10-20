import React, { useContext, useEffect, useRef, useState } from "react";
import { FaCreditCard } from "react-icons/fa6";
import { FaGoogle } from "react-icons/fa";
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
  const isCardInitialized = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    let payments;
    let card;
    let paymentButton;

    const loadSquare = async () => {
      if (isCardInitialized.current) return;

      try {
        payments = window.Square.payments(
          // sandbox
          "sandbox-sq0idb-7LCROf9ulDla4wfyUrGxDw",
          "LANAP5W17PMBW"
          // production
          // 'sq0idp-PHfy-86q_r9CkjJFsOpX0w',
          // 'LC06S1Y5QHSBY'
        );

        // Clear the card container before attaching
        const cardContainer = document.getElementById("card-container");

        card = await payments.card();
        if (cardContainer) {
          cardContainer.innerHTML = "";
        }
        if (isCardInitialized.current) return;
        await card.attach("#card-container");
        isCardInitialized.current = true;

        paymentButton = document.getElementById("card-button");
        const handlePayment = async () => {
          try {
            paymentButton.disabled = true; // Disable the button to prevent multiple clicks
            paymentButton.innerHTML = "Processing...";
            const result = await card.tokenize();
            if (result.status === "OK") {
              const token = result.token;
              const response = await fetch("/api/order/new", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                // body: JSON.stringify({ token, orderData, products: cartProducts }),
                body: JSON.stringify({
                  ...orderData,
                  products: cartProducts,
                  paymentType: checkedValue,
                  token,
                }),
              });
              const data = await response.json();
              if (data.success) {
                sweetAlert("success", "Order Placed Successfully");
                emptyCartItem();
                setActiveStep(0);
                setCompletedSteps([]);
                setOrderData({
                  coupon: null,
                  // user: userData?.id,
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
                // sweetAlert("success", "Payment successful!");
                setTimeout(() => {
                  navigate("/thankyou");
                }, 1000);
              } else {
                sweetAlert("error", "Payment failed.");
              }
            } else {
              console.error(result.errors);
            }
          } catch (error) {
            console.error("Payment error:", error);
            sweetAlert(
              "error",
              error.message ||
                "An error occurred during payment. Please try again."
            );
          } finally {
            paymentButton.disabled = false; // Re-enable the button
            paymentButton.innerHTML = "Proceed"; // Reset button text
          }
        };
        paymentButton.addEventListener("click", handlePayment);
      } catch (error) {
        console.error("Square initialization error:", error);
      }
    };

    loadSquare();

    // Cleanup
    return () => {
      if (paymentButton) {
        paymentButton.replaceWith(paymentButton.cloneNode(true));
      }
      if (card) {
        card
          .destroy()
          .catch((e) => console.error("Error cleaning up card:", e));
      }
      isCardInitialized.current = false;
    };
  }, []);

  const makePayment = async () => {
    const response = await fetch("/api/order/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...orderData,
        products: cartProducts,
        paymentType: checkedValue,
      }),
    });
    const result = await response.json();
    console.log("result", result);
    const { success, message } = result;
    if (success) {
      emptyCartItem();
      setActiveStep(0);
      setCompletedSteps([]);
      setOrderData({
        coupon: null,
        // user: userData?.id,
        firstName: "",
        lastName: "",
        email: "",
        giftMessage: "",
        deliveryFirstName: "",
        deliveryLastName: "",
        phone: "",
        company: "",
        country: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        paymentType: "",
      });
      sweetAlert("success", "Order Placed Successfully");
      setTimeout(() => {
        navigate("/Thankyou");
      }, 1000);
    } else {
      sweetAlert("error", message);
    }
  };

  return (
    <>
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
                checked
                onChange={(e) => {
                  if (e.target.checked) {
                    setCheckedValue("Credit Card");
                  }
                }}
              />
              <label htmlFor="del-0">
                <FaCreditCard /> Credit Card
              </label>
              <br />
              <div id="card-container"></div>
            </div>
            {checkedValue === "Credit Card" && (
              <div className="content">
                {/* <StripeForm /> */}
                <button
                  id="card-button"
                  // onClick={makePayment}
                  className="submit-btn"
                >
                  Proceed
                </button>
              </div>
            )}
          </li>
          {/* <li>
                        <div className="radio-wrapper">
                            <input type="radio" name="payment-type" id="del-1"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setCheckedValue('G Pay')
                                    }
                                }} />
                            <label htmlFor="del-1"><FaGoogle /> G Pay</label>
                        </div>
                        {checkedValue === 'G Pay' && <div className="content">
                            <button onClick={makePayment} className='submit-btn'>Proceed</button>
                        </div>}
                    </li> */}
        </ul>
      </div>
    </>
  );
};

export default PaymentForm;
