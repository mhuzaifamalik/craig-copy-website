import React from 'react'
import { Row, Col } from 'antd';
import Img1 from '../images/card-12.png'
import { Link } from 'react-router-dom';
import aboutUsImg from '../images/about-revised.png';
import stickFrameImg from '../images/stick-frame.png';
function Makingunique() {
  return (
    <div>
      <section className='unique'>
        <img className='img-fluid' src={aboutUsImg} alt="" />
        <img className='img-fluid' src={stickFrameImg} alt="" />
        {/* <div className="container">
          <Row gutter={(15 , 15)}
             justify="center"
                    align="middle"
          >
            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
              <div className="main-textire">
                <h2>What Makes Us Unique?</h2>
                <p>We sell photographs of objects found in the environment that resemble, look like letters of the alphabet. We combine these images into words, names and sayings. These images in both color, black and white and brown tone are all mounted onto a floating frame or stick frame for home use.</p>
                <Link to="/Abouts">About Us </Link>
              </div>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
            <div className="main-images">
              <img style={{width: '100%'}} src={Img1} alt="img" />
            </div>
            </Col>

          </Row>
        </div> */}
      </section>
    </div>
  )
}

export default Makingunique
