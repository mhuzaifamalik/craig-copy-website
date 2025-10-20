import Header from './MyComponent/Header';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Ready from './pages/ReadyModes';
import Quote from './pages/QuotesSayings'
import Creation from './pages/Stack'
import CreationWords from './pages/Creationwords'
import Contact from './pages/ContactUs'
import Prviacy from './pages/privacy'
import ABouts from './pages/AboutUs'
import Terms from './pages/Termsconditon'
import Footer from './MyComponent/footer';
import Build from './pages/BuildYour'
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import React, { useEffect } from 'react';
import Thankyou from "./pages/Thankyou";


function App() {
  useEffect(() => {
    // Key event detection
    function handleKeydown(e) {
      if (
        (e.key === 'F12') ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        // Optionally, you can show a message or take some action
        console.log('DevTools key combination detected:', e.key);
      }
    }
    window.addEventListener('keydown', handleKeydown);

    // Optional: Listen for devtoolschange event
    // window.addEventListener('devtoolschange', (e) => {
    //   if (e.detail.open) {
    //     // DevTools is open
    //   } else {
    //     // DevTools is closed
    //   }
    // });

    const preventContextMenu = (e) => {
      e.preventDefault();
    }
    document.addEventListener('contextmenu', preventContextMenu);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);
  return (
    <div className="App">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/readyModes" element={<Ready />} />
        {/* <Route path="/quote" element={<Quote  />} /> */}
        <Route path="/category/:url" element={<Quote />} />
        <Route path="/stack" element={<Creation />} />
        <Route path="/creationwords/:type" element={<CreationWords />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/Abouts" element={<ABouts />} />
        <Route path="/buildorder" element={<Build />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/Prviacy" element={<Prviacy />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/thankyou" element={<Thankyou />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
