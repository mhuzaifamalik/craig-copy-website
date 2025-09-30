import React from 'react'
import { Row, Col } from 'antd';
import ContacForm from '../MyComponent/ContactForm'



function AboutUs() {
    const background = {
        backgroundImage: `url(${require('../images/abouts.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh', // optional: full screen height
        width: '100%',
        // padding: '60px 20px', // optional spacing
        color: '#fff', // optional text color
    };
    return (
        <div>
            <section className='Ready-made-Words' style={background}>
                <div className="container">
                    <Row
                        justify="center"
                        align="middle"
                    >

                        <Col xs={24} sm={20} md={20} lg={20} xl={20} xxl={20}>
                            <div className="banner-ready">
                                <h3>Contact Us</h3>

                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
            <ContacForm />
        </div>
    )
}

export default AboutUs
