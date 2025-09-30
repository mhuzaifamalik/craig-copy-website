// src/pages/LogIn.js
import React, { useContext } from 'react';
import { Form, Input, Button, message, Row, Col } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/User';
import Cookie from 'js-cookie';

const LogIn = () => {
    const {setAuthToken} = useContext(UserDataContext)
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            console.log('Received values:', values);
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({...values, from: 'web'}),
            });
            const data = await response.json();
            console.log('Response:', data);
            if (data.success) {
                setAuthToken(data.authtoken);
                Cookie.set('authtoken', data.authtoken);
                messageApi.open({
                    type: 'success',
                    content: 'Login successful!',
                });
                navigate('/');
            } else {
                messageApi.open({
                    type: 'error',
                    content: data.message || 'Login failed. Please try again.',
                });
            }
        } catch (err) {
            console.error('Error during login:', err);
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
                                    Log In
                                </h3>

                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
            <div className='auth-form' style={{ maxWidth: 400, margin: '100px auto' }}>
                <h2>Log In</h2>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email address' }]}>
                        <Input placeholder="example@mail.com" />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}>
                        <Input.Password />
                    </Form.Item>
                    <p className='auth-text'>Don't have an account? <Link to="/auth/register">Register</Link></p>
                    <br />
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Log In</Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    );
};

export default LogIn;
