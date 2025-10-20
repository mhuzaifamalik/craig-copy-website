import React from 'react';


function ThankYou() {
  return (
    <div className="thank-you-page">
      {/* Header */}


      {/* Main Content */}
      <main className="thank-you-main">
        <div className="container">
          <div className="thank-you-card">
            {/* Success Icon */}
            <div className="success-animation">
              <svg 
                className="checkmark" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 52 52"
              >
                <circle 
                  className="checkmark__circle" 
                  cx="26" 
                  cy="26" 
                  r="25" 
                  fill="none"
                />
                <path 
                  className="checkmark__check" 
                  fill="none" 
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="thank-you-title">
              Thank You!
            </h1>
            
            {/* Message */}
            <p className="thank-you-message">
              Your order has been received successfully. We've sent a confirmation email to your 
              registered email address with all the details.
            </p>

            {/* Order Details */}
 

            {/* Action Buttons */}
          

            {/* Support Info */}
            <div className="support-info">
              <h3>Need Help?</h3>
              <p>Our support team is here to help you</p>
              <div className="contact-methods">
                <div className="contact-item">
                  <span className="contact-icon"></span>
                  <span>info@craigphotoletters.com</span>
                </div>
             
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="thank-you-footer">
        <div className="container">
          <p>© 2024 YourBrand. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ThankYou;