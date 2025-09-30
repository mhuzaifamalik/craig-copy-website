import React, { useEffect, useState } from 'react'
import { Row, Col } from 'antd';
import logo from '../images/logo.png'
import X from '../images/icons/1.png'
import Insta from '../images/icons/2.png'
import Fac from '../images/icons/3.png'
import { Link } from 'react-router-dom';

function Footer() {
        const [categories, setCategories] = useState([])
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
    return (
        <div>
            <section className="footer">
                <div className="container">

                    <Row
                        gutter={(50, 50)}
                        //    justify="center"
                        align="middle"
                        justify="space-between"

                    >
                        <Col xs={24} sm={6} md={6} lg={6} xl={6} xxl={6}>
                            <div className="footer-images" style={{ marginBottom: '20px' }}>
                                <Link to="/"><img src={logo} alt="" /></Link>
                                <p>We sell photographs of objects found in the environment that resemble, look like letters of the alphabet. We combine these images into words, names and sayings. These images in both color, black and white and brown tone are all mounted onto a floating frame or stick frame for home use.</p>
                            </div>
                        </Col>
                        <Col xs={24} sm={18} md={18} lg={18} xl={18} xxl={16}>
                            <Row gutter={(50, 50)}>
                                <Col xs={24} sm={12} md={12} lg={8} xl={8} xxl={8}>
                                    <div className="footer-ul">
                                        <ul>
                                            <h4>Main Links</h4>
                                            <li><Link to="/">Home</Link></li>
                                            {/* <li><Link to="/readyModes">Ready Mades</Link></li> */}
                                            {categories.map((item) => (
                                                <li key={item._id}>
                                                    <Link to={`/category/${item.url}`}>{item.title}</Link>
                                                </li>
                                            ))}
                                            <li><Link to="/buildorder">Build Your Order</Link></li>
                                            <li>
                                                <Link to="/Abouts">About Us</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={8} xl={8} xxl={8}>
                                    <div className="footer-ul">
                                        <ul>
                                            <h4>Quick Links</h4>
                                            <li><Link to="/terms">Terms & Conditions</Link></li>
                                            <li><Link to="/Prviacy">Privacy Policy</Link></li>
                                            <li><Link to="/Contact">Contact Us</Link></li>

                                        </ul>
                                    </div>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={8} xl={8} xxl={8}>
                                    <div className="footer-ul">
                                        <ul>
                                            <h4>Reach Us Out</h4>
                                            {/* <li><a href="tel:8657401978">8657401978</a></li> */}
                                            <li><a href="mailto:info@craigphotoletters.com">info@craigphotoletters.com</a></li>
                                            {/* <li><a>123 Springfield Avenue, Wilson Street, OH</a></li> */}

                                        </ul>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                            <div className="last-footer">
                                <ul className='last-footer-ul'>
                                    <li>© 2025 Copyright | Craig Photo Letters | All Rights Reserved</li>
                                    <li className='icons-sec'>
                                        <ul>
                                            <li>
                                                <a href="https://www.instagram.com/craigphotoletters/" target='_blank'>
                                                    <img src={Insta} alt="" />
                                                </a>
                                            </li>
                                            <li>
                                                <a href="https://www.facebook.com/craigphotoletter" target='_blank'>
                                                    <img src={Fac} alt="" />
                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li>Powered By <a href="https://designversestudios.com/">Design Verse Studios</a></li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
        </div>
    )
}

export default Footer