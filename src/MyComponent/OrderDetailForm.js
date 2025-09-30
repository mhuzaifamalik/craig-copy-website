import React, { useContext, useEffect } from 'react'
import { Col, Row } from 'antd'
import { UserDataContext } from '../context/User'

const OrderDetailForm = ({ setActiveStep, setCompletedSteps, formData, setFormData, sweetAlert }) => {
    const { userData, logOut } = useContext(UserDataContext)
    const handleSubmit = (e) => {
        e.preventDefault()
        const { firstName, lastName, email } = formData
        if (!firstName || !lastName || !email) {
            sweetAlert('error', 'Please fill all the required fields')
            return
        }
        setActiveStep(1)
        setCompletedSteps(prevCompletedSteps => [...prevCompletedSteps, 0]);
    }
    useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName, lastName: userData.lastName, email: userData.email
            })
        }
    }, [userData])
    const handleFormData = (e) => {
        const name = e.target.name
        const value = e.target.value
        setFormData({ ...formData, [name]: value })
    }
    const userLogout = () => {
        logOut()
        sweetAlert('success','User Logged Out')
        setFormData({
            firstName: "", 
            lastName: "", 
            email: ""
        })
    }
    return (
        <>
            <div className="step-content">
                {/* {userData ? <p className="info-form"><button className='info' onClick={userLogout}>Log Out</button> to use different information!</p>: <p className="info-form">Already have an account? <button onClick={() => setLoginModal(true)}>Log In</button></p>} */}
                <form onSubmit={handleSubmit}>
                    {!userData ? <Row gutter={[{ lg: 15 }, { lg: 15 }]}>
                        <Col lg={12} sm={24}>
                            <div className="input-field">
                                <label>First Name</label>
                                <input name='firstName' onChange={handleFormData} value={formData.firstName} type="text" placeholder='Enter Your First Name' />
                            </div>
                        </Col>
                        <Col lg={12} sm={24}>
                            <div className="input-field">
                                <label>Last Name</label>
                                <input name='lastName' onChange={handleFormData} value={formData.lastName} type="text" placeholder='Enter Your Second Name' />
                            </div>
                        </Col>
                        <Col sm={24}>
                            <div className="input-field">
                                <label>Email Address</label>
                                <p className="info-txt">Your order confirmation will be send to this address</p>
                                <input name='email' onChange={handleFormData} value={formData.email} type="email" placeholder='Enter Your Email Address' />                                
                            </div>
                        </Col>
                        <Col sm={24}>
                            <div className="input-field">
                                <label>Gift Message <span className='opt'>(Optional)</span></label>
                                <textarea name='giftMessage' onChange={handleFormData} value={formData.giftMessage}></textarea>
                                <p className="info-txt">This message will show on the gift receipt</p>
                            </div>
                        </Col>
                        <Col sm={24}>
                            <button className='submit-btn' type='submit'>Continue</button>
                        </Col>
                    </Row> :
                        <Row gutter={[{ lg: 15 }, { lg: 15 }]}>
                            <Col lg={12} sm={24}>
                                <div className="input-field">
                                    <label>First Name</label>
                                    <input name='firstName' value={formData.firstName} type="text" placeholder='Enter Your First Name' readOnly />
                                </div>
                            </Col>
                            <Col lg={12} sm={24}>
                                <div className="input-field">
                                    <label>Last Name</label>
                                    <input name='lastName' value={formData.lastName} type="text" placeholder='Enter Your Second Name' readOnly />
                                </div>
                            </Col>
                            <Col sm={24}>
                                <div className="input-field">
                                    <label>Email Address</label>
                                    <p className="info-txt">Your order confirmation will be send to this address</p>
                                    <input name='email' value={formData.email} type="email" placeholder='Enter Your Email Address' readOnly />
                                </div>
                            </Col>
                            <Col sm={24}>
                                <div className="input-field">
                                    <label>Gift Message <span className='opt'>(Optional)</span></label>
                                    <textarea name='giftMessage' onChange={handleFormData} value={formData.giftMessage}></textarea>
                                    <p className="info-txt">This message will show on the gift receipt</p>
                                </div>
                            </Col>
                            <Col sm={24}>
                                <button className='submit-btn' type='submit'>Continue</button>
                            </Col>
                        </Row>}
                </form>
            </div>
        </>
    )
}

export default OrderDetailForm
