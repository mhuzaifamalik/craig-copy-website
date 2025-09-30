import React from 'react'
import { Row, Col } from 'antd';
import Bannercard from '../MyComponent/BannerCards'
function ReadyModes() {
    return (
        <div>
            <section className='Ready-made-Words'>
                <div className="container">
                    <Row
                        justify="center"
                        align="middle"
                    >

                        <Col xs={24} sm={20} md={20} lg={20} xl={20} xxl={20}>
                            <div className="banner-ready">
                                <h2>Fan Favorites Of Our </h2>
                                <div className="yellow-ready">
                                    <h3>Ready made Words</h3>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
            <Bannercard />
        </div>
    )
}

export default ReadyModes
