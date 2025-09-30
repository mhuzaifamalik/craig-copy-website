import React from 'react'
import { Row, Col } from 'antd';
import Img1 from '../images/seller-1.png'
import Img2 from '../images/seller-2.png'
import Img3 from '../images/seller-3.png'
import Img4 from '../images/seller-4.png'
import Img5 from '../images/seller-center.png'


function Sellers() {
    return (
        <div>
            <section className='seller'>
                <div className="container">
                    <h2>Best Sellers </h2>
                    <Row gutter={(0, 0)} align={"middle"} justify="center">

                        <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={8}>
                            <div className="seller-dev">
                                <ul>
                                    <li><a href="/category/saying-quotes">
                                        <img className='rounded' src={Img1} alt="img" />
                                        <h4>Accept Triology</h4>
                                    </a></li>
                                    <li><a href="/category/saying-quotes">
                                        <img className='rounded' src={Img2} alt="img" />
                                        <h4>Live Laugh Love</h4>
                                    </a></li>
                                </ul>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={8}>
                            <div className="seller-dev">
                                <ul>
                                    <li>
                                        <a href="/category/multi-lines-stacks">
                                            <img className='rounded' src={Img5} alt="img" />
                                            <h4>Together we make a family</h4>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={8}>
                            <div className="seller-dev">
                                <ul>
                                    <li><a href="/category/ready-made-words">
                                        <img className='rounded' src={Img3} alt="img" />
                                        <h4>Blessed 1</h4>
                                    </a></li>
                                    <li><a href="/category/ready-made-words">
                                        <img className='rounded' src={Img4} alt="img" />
                                        <h4>Family 1</h4>
                                    </a></li>

                                </ul>
                            </div>

                        </Col>
                    </Row>
                </div>
            </section>
        </div>
    )
}

export default Sellers
