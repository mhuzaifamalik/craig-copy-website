import React, { useState, useEffect, useContext } from 'react'
import { Col, Row, message } from 'antd'
import OrderSummary from '../MyComponent/OrderSummary'
import OrderDetailForm from '../MyComponent/OrderDetailForm'
import DeliveryForm from '../MyComponent/DeliveryForm'
import PaymentForm from '../MyComponent/PaymentForm'
import { UserDataContext } from '../context/User'

const Checkout = () => {
    const background = {
        backgroundImage: `url(${require('../images/checkout-banner.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '80vh', // optional: full screen height
        height: 'auto',
        width: '100%',
        // padding: '60px 20px', // optional spacing
        color: '#fff', // optional text color
    };
    const { userData } = useContext(UserDataContext)
    const [messageApi, contextHolder] = message.useMessage();
    const sweetAlert = (type, message) => {
        messageApi.open({
            type,
            content: message,
            duration: 2,
        });
    };
    const [orderData, setOrderData] = useState({
        coupon: null,
        user: userData?.id,
        firstName: '',
        lastName: '',
        email: '',
        giftMessage: '',
        deliveryFirstName: '',
        deliveryLastName: '',
        phone: '',
        company: '',
        country: 'United States',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        paymentType: '',
        amount: 0
    })
    const [orderDetail, setOrderDetail] = useState({
        user: '',
        firstName: '',
        lastName: '',
        email: '',
        giftMessage: '',
    })
    const [deliveryForm, setDeliveryForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        company: '',
        country: 'United States',
        address: '',
        city: '',
        state: '',
        zipCode: '',
    })
    const [paymentType, setPaymentType] = useState('Credit Card')
    const [activeStep, setActiveStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState([])
    useEffect(() => {
        setOrderData({
            ...orderData,
            user: userData?.id,
            firstName: orderDetail.firstName,
            lastName: orderDetail.lastName,
            email: orderDetail.email,
            giftMessage: orderDetail.giftMessage,
            deliveryFirstName: deliveryForm.firstName,
            deliveryLastName: deliveryForm.lastName,
            phone: deliveryForm.phone,
            company: deliveryForm.company,
            country: deliveryForm.country,
            address: deliveryForm.address,
            city: deliveryForm.city,
            state: deliveryForm.state,
            zipCode: deliveryForm.zipCode,
            paymentType: paymentType
        })
    }, [orderDetail, deliveryForm, paymentType])
    useEffect(() => {
        console.log('orderData', orderData)
    }, [orderData])
    const steps = [
        {
            title: 'Order Details',
            content: <OrderDetailForm setActiveStep={setActiveStep} activeStep={activeStep} completed={completedSteps} setCompletedSteps={setCompletedSteps} formData={orderDetail} setFormData={setOrderDetail} sweetAlert={sweetAlert} />
        },
        {
            title: 'Delivery',
            content: <DeliveryForm setActiveStep={setActiveStep} activeStep={activeStep} completed={completedSteps} setCompletedSteps={setCompletedSteps} sweetApenalert={sweetAlert} formData={deliveryForm} setFormData={setDeliveryForm} sweetAlert={sweetAlert} />
        },
        {
            title: 'Payment',
            content: <PaymentForm setActiveStep={setActiveStep} setCompletedSteps={setCompletedSteps} sweetApenalert={sweetAlert} checkedValue={paymentType} setCheckedValue={setPaymentType} orderData={orderData} sweetAlert={sweetAlert} setOrderData={setOrderData} />
        },

    ]
    return (
        <>
            <section className='Ready-made-Words' style={background}>
                <div className="container">
                    {/* <Row
                        justify="center"
                        align="middle"
                    >

                        <Col xs={24} sm={20} md={20} lg={20} xl={20} xxl={20}>
                            <div className="banner-ready">
                                <h3 style={{ color: '#000', fontSize: '85px', whiteSpace: 'nowrap' }}>
                                    Cart
                                </h3>

                            </div>
                        </Col>
                    </Row> */}
                </div>
            </section>
            <section className='checkout-page'>
                {contextHolder}
                <div className="container">
                    <Col lg={16} style={{ margin: '0 auto' }}>
                        <Row gutter={[30, 30]}>
                            <Col xs={24} sm={24} md={16}>
                                <div className="checkout-steps">
                                    {steps.map((step, index) => {
                                        return (
                                            <div className={`step-item ${activeStep === index ? 'active' : ''} ${completedSteps.includes(index) ? 'completed' : ''}`} key={index}>
                                                <h3 className="step-title">
                                                    {(index + 1).toString().padStart(2, '0')}. {step.title}
                                                    {completedSteps.includes(index) ? <button
                                                        onClick={() => {
                                                            setActiveStep(index)
                                                        }}
                                                    >
                                                        Change
                                                    </button> : ''}
                                                </h3>
                                                {activeStep === index && step.content}
                                            </div>
                                        )
                                    })}
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <OrderSummary setOrderData={setOrderData} orderData={orderData} sweetAlert={sweetAlert} />
                            </Col>
                        </Row>
                    </Col>
                </div>
            </section>
        </>
    )
}

export default Checkout