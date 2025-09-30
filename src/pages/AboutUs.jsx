import React from 'react'
import { Row, Col } from 'antd';
// import Tron from '../images/team-ap-2.jpg'
import Img1 from '../images/card-12.png'
import aboutUsImg from '../images/about-revised.png'
import Makingunique from '../MyComponent/Makingunique';

function AboutUs() {
    const background = {
        backgroundImage: `url(${require('../images/maxresdefault.jpg')})`,
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
                                <h3 style={{ color: '#000', fontSize: '85px', whiteSpace: 'nowrap' }}>
                                    About Us
                                </h3>

                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
            <Makingunique />
           {/*  <section className="main-aboutus" style={{padding: 0}}>
                    <img className='img-fluid' src={aboutUsImg} alt="" />
                 <div className="container">
                   <Row gutter={(50 ,50)}
                        align="middle"
                    >
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
                            <div className="main-abouts-01">
                                <h2>What Makes Us Unique?</h2>
                                <p>We sell photographs of objects found in the environment that resemble, look like letters of the alphabet. We combine these images into words, names and sayings. These images in both color, black and white and brown tone are all mounted onto a floating frame or stick frame for home use.</p>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
                            <div className="main-about-img">
                                <img src={Img1}  alt="img" />
                            </div>
                        </Col>
                    </Row>
                </div> 
            </section>*/}
        </div>
    )
}

export default AboutUs
