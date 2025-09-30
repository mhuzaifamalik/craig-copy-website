import React, { useEffect, useState } from 'react'
import { Row, Col } from 'antd';
import Img from '../images/card/1.png'
import Img1 from '../images/card/2.png'
import Img2 from '../images/card/3.png'
import { Link } from 'react-router-dom';

const Card = () => {
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
            <section className='cards-mentor'>
                <div className="container">
                    <Row gutter={[16, 16]}
                        justify="center"
                        align="middle"
                    >
                        {categories.map((category, index) => (
                            <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={8} key={index}>
                                <div className="card-item">
                                    <ul>
                                        <li><img className='rounded' src={category.image} alt="img" /></li>
                                        <li><h4>{category.title}</h4></li>
                                        <li> <Link to={`/category/${category.url}`}>View More</Link></li>
                                    </ul>
                                </div>
                            </Col>
                        ))}
                        {/* <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={8}>
                            <div className="card-item">

                                <ul>
                                    <li><img src={Img2} alt="img" /></li>
                                    <li><h4>saying & Quotes</h4></li>
                                    <li> <Link to="/quote">View More</Link></li>
                                </ul>

                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={8}>
                            <div className="card-item">
                                <ul>
                                    <li><img src={Img1} alt="img" /></li>
                                    <li><h4>Multi-Lines “Stacks”</h4></li>
                                    <li> <Link to="/stack">View More</Link></li>
                                </ul>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={8}>
                            <div className="card-item">
                                <ul>
                                    <li><img src={Img} alt="img" /></li>
                                    <li><h4>Ready made Words</h4></li>
                                    <li> <Link to="/readyModes">View More</Link></li>
                                </ul>
                            </div>
                        </Col> */}
                    </Row>
                </div>
            </section>
        </div>
    )
}

export default Card
