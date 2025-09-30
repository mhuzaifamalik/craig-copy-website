// src/pages/Register.js
import React, { useContext } from 'react';
import { Form, Input, Button, message, Row, Col } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/User';

const Register = () => {
    const {setAuthToken} = useContext(UserDataContext)
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            console.log('Received values:', values);
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });
            const data = await response.json();
            console.log('Response:', data);
            if (data.success) {
                setAuthToken(data.authtoken);
                messageApi.open({
                    type: 'success',
                    content: 'Registration successful!',
                });
                navigate('/');
            } else {
                messageApi.open({
                    type: 'error',
                    content: data.message || 'Registration failed. Please try again.',
                });
            }
        } catch (err) {
            console.error('Error during registration:', err);
            messageApi.open({
                type: 'error',
                content: err.message || 'An error occurred during registration. Please try again.',
            });
        }
    };
    const background = {
        backgroundImage: `url(${require('../images/maxresdefault.jpg')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '50vh', // optional: full screen height
        height: 'auto',
        width: '100%',
        // padding: '60px 20px', // optional spacing
        color: '#fff', // optional text color
    };
    return (
        <>
        {contextHolder}
            <section className='Ready-made-Words' style={background}>
                <div className="container">
                    <Row
                        justify="center"
                        align="middle"
                    >

                        <Col xs={24} sm={20} md={20} lg={20} xl={20} xxl={20}>
                            <div className="banner-ready">
                                <h3 style={{ color: '#000', fontSize: '85px', whiteSpace: 'nowrap' }}>
                                    Register
                                </h3>

                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
            <div className='auth-form' style={{ maxWidth: 400, margin: '100px auto' }}>
                <h2>Register</h2>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item name="firstName" label="First Name" rules={[{ required: true, min: 1, max: 25, message: 'First Name must be between 1 and 15 characters' }]}>
                        <Input placeholder="John" />
                    </Form.Item>
                    <Form.Item name="lastName" label="Last Name" rules={[{ required: true, min: 1, max: 25, message: 'Last Name must be between 1 and 25 characters' }]}>
                        <Input placeholder="Doe" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email address' }]}>
                        <Input placeholder="example@mail.com" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[
                            {
                                pattern: /^(\+1\s?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
                                message: 'Please enter a valid US Phone Number'
                            }
                        ]}
                    >
                        <Input placeholder="123-456-7890" />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}>
                        <Input.Password />
                    </Form.Item>
                    <p className='auth-text'>already have an account? <Link to="/auth/login">Log In</Link></p>
                    <br />
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Register</Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    );
};

export default Register;
