import React from 'react'
import { Row, Col } from 'antd';
import Card from '../MyComponent/CardBanner'


function createWords() {
    const background = {
        backgroundImage: `url(${require('../images/bannerReadyfully.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh', // optional: full screen height
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
                <h2>turn Your House Into A Home With Multi Line </h2>
                <div className="yellow-ready">
                  <h3>Stacks</h3>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      <Card />
    </div>
  )
}

export default createWords
