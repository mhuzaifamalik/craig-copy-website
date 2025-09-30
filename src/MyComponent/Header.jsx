import React, { useContext, useEffect, useState } from 'react'
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import { Dropdown, message } from 'antd';
import logo from '../images/logo.png'
import { Link } from 'react-router-dom';
import { CartContext } from '../context/Cart';
import { IoChevronDownOutline } from "react-icons/io5";
import { UserDataContext } from '../context/User';
// Create this CSS file for additional styles

const Header = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const { cartProducts } = useContext(CartContext)
    const { userData, logOut } = useContext(UserDataContext)
    const [categories, setCategories] = useState([])
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    
    useEffect(() => {
        const fetchCategories = async () => {
            const response = await fetch('/api/category/fetch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ filter: {} })
            })
            const data = await response.json()
            if (data.success) {
                setCategories(data.categories)
            } else {
                console.error('Error fetching categories:', data.error)
            }
        }
        fetchCategories()
    }, [])

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    return (
        <>
            {contextHolder}
            <header className="header">
                <nav>
                    <div className="nav-container">
                        <div className="logo-hamburger">
                            <Link to="/" onClick={closeMobileMenu}>
                                <img src={logo} alt="logo" className="logo" />
                            </Link>
                            <button className="hamburger" onClick={toggleMobileMenu}>
                                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                            </button>
                        </div>

                        <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                            <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
                            <li><Link to="/Abouts" onClick={closeMobileMenu}>About</Link></li>
                            <li><Link to="/contact" onClick={closeMobileMenu}>Contact</Link></li>
                            <li className="category-dropdown">
                                <Dropdown
                                    className='select-category'
                                    menu={{ 
                                        items: categories.map((item) => ({ 
                                            key: item._id, 
                                            label: <Link to={`/category/${item.url}`} onClick={closeMobileMenu}>{item.title}</Link> 
                                        })) 
                                    }}
                                >
                                    <span className='select-category-text'>
                                        Categories <IoChevronDownOutline />
                                    </span>
                                </Dropdown>
                            </li>
                            <li><Link to="/" onClick={closeMobileMenu}>Build Your Order</Link></li>
                        </ul>

                        <ul className='nav-menu-button'>
                            <li>
                                <Link to="/cart" onClick={closeMobileMenu}>
                                    <span className="cart-count">{cartProducts.length}</span>
                                    <FaShoppingCart />
                                </Link>
                            </li>
                            {!userData ? (
                                <li>
                                    <Link to="/auth/register" onClick={closeMobileMenu}>
                                        <IoPersonSharp />
                                    </Link>
                                </li>
                            ) : (
                                <li>
                                    <Dropdown
                                        className='user-dropdown'
                                        menu={{ 
                                            items: [
                                                { 
                                                    key: userData._id, 
                                                    label: (
                                                        <button 
                                                            className='logout-button' 
                                                            onClick={() => {
                                                                logOut()
                                                                closeMobileMenu()
                                                                messageApi.open({
                                                                    type: 'success',
                                                                    content: 'Logged out successfully!',
                                                                });
                                                            }}
                                                        >
                                                            Log Out
                                                        </button>
                                                    ) 
                                                }
                                            ] 
                                        }}
                                    >
                                        <span className='logged-in-user'>
                                            <IoPersonSharp />
                                        </span>
                                    </Dropdown>
                                </li>
                            )}
                        </ul>
                    </div>
                </nav>
            </header>
        </>
    )
}

export default Header