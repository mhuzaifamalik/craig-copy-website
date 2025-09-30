import React, { useState } from 'react'

import { Row, Col, message } from 'antd';
import Contact from '../images/contact-us-img.png'


function ContactForm() {
    const [messageApi, contextHolder] = message.useMessage();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.message) {
            messageApi.open({
                type: 'error',
                content: 'Please fill in all fields.'
            });
            return;
        }
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        debugger
        const data = await response.json();
        console.log(data); //
        debugger
        if (data.success) {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                message: ''
            });
            messageApi.open({
                type: 'success',
                content: 'Message sent successfully!'
            });
        } else {
            console.error('Error sending message:', data);
            messageApi.open({
                type: 'error',
                content: 'Error sending message: ' + data.message
            });
        }
    }

    return (
        <div>
            {contextHolder}
            <section className='about-us'>
                <div className="container">
                    <Row
                        align="middle"
                    >
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12} >
                            <div className="main-tooper">
                                <h2>Contact Us</h2>
                                <form onSubmit={handleSubmit}>
                                    <ul>
                                        <li>
                                            <label >first Name</label>
                                            <input type="text" placeholder='Enter Your First Name' name="firstName" value={formData.firstName} onChange={handleChange} />
                                        </li>
                                        <li>
                                            <label >Last Name</label>
                                            <input type="text" placeholder='Enter Your Last Name' name="lastName" value={formData.lastName} onChange={handleChange} />
                                        </li>
                                    </ul>
                                    <ul>
                                        <li>
                                            <label >Email Address</label>
                                            <input type="text" placeholder='Enter Your Email Address' name="email" value={formData.email} onChange={handleChange} />
                                        </li>


                                    </ul>
                                    <ul>
                                        <li>
                                            <label >Phone number</label>
                                            <input type="number" placeholder='Enter Your Phone Number' name="phone" value={formData.phone} onChange={handleChange} />
                                        </li>

                                    </ul>
                                    <ul>
                                        <li>
                                            <label >Message</label>
                                            <textarea name="message" id="" placeholder='Enter Your Message Here' value={formData.message} onChange={handleChange}></textarea>
                                        </li>

                                    </ul>
                                    <button type="submit">Submit</button>
                                </form>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12} >
                            <div className="main-contact-img">
                                <img src={Contact} alt="" />
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
        </div>
    )
}

export default ContactForm
