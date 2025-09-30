import React, { useState, useContext, useEffect } from 'react'
import { Skeleton, Empty, Avatar, Image } from 'antd'
import { CartContext } from '../context/Cart'
import { AiOutlineLoading } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import salesTax from '../data/sales-tax.json'


const CartItemSkeleton = () => {
    return (
        <>
            <div className="thumb">
                <Skeleton.Image active />
            </div>
            <div className='info'>
                <Skeleton active paragraph={{
                    rows: 1,
                }} />
            </div>
        </>
    )
}

const CartItemCart = ({ data }) => {
    console.log('data', data)
    return (
        <>
            <div className="thumb">
                {
                    data.type === 'creation' ?
                        // <Avatar.Group
                        //     max={{
                        //         count: 3,
                        //         style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                        //     }}
                        // >
                        //     {data.obj.map((item, index) => (
                        //         <Avatar key={index} src={item.image} />
                        //     ))}
                        // </Avatar.Group>
                        <ul>
                            {data.obj.map((item) => {
                                const imageName = item.images[item.imageIndex] || item.image;
                                return (
                                    <li key={item.image}>
                                        <Image style={{ width: 40 }} src={imageName} alt="" />
                                        <span>{decodeURIComponent(imageName.split('/').pop().split('.')[0])}</span>
                                    </li>
                                )
                            })}
                        </ul>
                        : <img src={data.image} alt="" />
                }
            </div>
            <div className='info'>
                <h4>{data.name}</h4>
                <h5>${data.saleprice ? data.saleprice.toFixed(2) : data.price.toFixed(2)} x {data.quantity}</h5>
            </div>
        </>
    )
}

const OrderSummary = ({ sweetAlert, setOrderData, orderData }) => {
    const [coupon, setCoupon] = useState({
        value: '',
        verified: false,
        obj: null,
        loading: false
    })
    const [subTotal, setSubTotal] = useState(0)
    const [shippingPrice, setShippingPrice] = useState(0)
    const [taxPrice, setTaxPrice] = useState(0)
    const [discountPrice, setDiscountPrice] = useState(0)
    const [totalPrice, setTotalPrice] = useState(0)

    useEffect(() => {
        setTotalPrice(subTotal + shippingPrice + taxPrice - discountPrice)
    }, [shippingPrice, taxPrice, subTotal, discountPrice])

    useEffect(() => {
        setOrderData({ ...orderData, amount: subTotal, taxPrice, amount_paid: totalPrice, coupon: coupon?.obj?._id })
    }, [shippingPrice, taxPrice, subTotal, discountPrice])

    useEffect(() => {
        if (orderData.state) {
            debugger
            const taxRate = salesTax.find(item => item.State === orderData.state)?.combinedRate || 0;
            setTaxPrice((taxRate / 100) * subTotal);
            // const fetchTaxPrice = async () => {
            //     try {
            //         const response = await fetch('/api/order/calculate-tax', {
            //             method: 'POST',
            //             headers: {
            //                 "Content-Type": "application/json",
            //             },
            //             body: JSON.stringify({ state: orderData.state, country: orderData.country })
            //         });
            //         const result = await response.json();
            //         debugger
            //         if (result.success) {
            //             setTaxPrice(result.tax.rate * subTotal);
            //         } else {
            //             throw new Error(result.message || "Failed to fetch shipping price");
            //         }
            //     } catch (error) {
            //         console.error('Error fetching shipping price:', error);
            //         sweetAlert('error', error.message);
            //     }
            // };
            // fetchTaxPrice();
        }
    }, [orderData.state])

    const { fetchCartItems, cartProducts } = useContext(CartContext)

    const [loading, setLoading] = useState(true)
    const [cartProductObj, setCartProductObj] = useState([])
    const fetchCartProducts = async () => {
        setLoading(true)
        let price = 0
        const products = await fetchCartItems()
        products.forEach(item => {
            price += item.saleprice ? (item.saleprice * item.quantity) : (item.price * item.quantity)
        })
        setSubTotal(price)
        setCartProductObj(products)
        setLoading(false)
    }

    const handleCoupon = async (e) => {
        e.preventDefault();

        if (coupon.loading) return; // Prevent multiple submissions

        setCoupon({ ...coupon, loading: true });

        try {
            const response = await fetch('/api/coupon/validate', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ couponCode: coupon.value, cartTotal: subTotal, products: cartProductObj })
            });

            const result = await response.json();
            const { success, message, coupon: obj, discountType, discountValue } = result;

            console.log('Coupon Verification Result:', result);

            if (!success || !obj) {
                throw new Error(message || "Coupon verification failed");
            }
            let discount = 0;

            // if (obj.discountType === 'fixed') {
            discount = Math.min(discountValue, subTotal);
            // } else {
            // discount = (subTotal * discountValue) / 100;
            // discount = obj.maxDiscount ? Math.min(discount, obj.maxDiscount) : discount;
            // }

            // Update state after calculating discount
            setCoupon({ ...coupon, verified: true, obj, loading: false });
            setDiscountPrice(discount);

        } catch (err) {
            setCoupon({ ...coupon, verified: false, obj: null, loading: false });
            sweetAlert('error', err.message);
        }
    };


    useEffect(() => {
        setCoupon({
            value: '',
            verified: false,
            obj: null,
            loading: false
        })
        setDiscountPrice(0)
        fetchCartProducts()
    }, [cartProducts])

    return (
        <div className='order-summary'>
            <div className="head">
                <h3>Order Summary</h3>
            </div>
            <ul className="cart-products">
                {loading ? <>
                    <li><CartItemSkeleton /></li>
                    <li><CartItemSkeleton /></li>
                </> : cartProductObj.length > 0 ? <>
                    {cartProductObj.map(item => <li><CartItemCart data={item} key={item.id} /></li>)}
                </> : <Empty
                    description={
                        <h3 className="theme-h3 text-center">No Items in Cart</h3>
                    }
                />
                }
            </ul>
            <ul className="additional">
                <li>
                    <span>Subtotal</span>
                    <span>${subTotal.toFixed(2)}</span>
                </li>
                <li>
                    <span>Shipping</span>
                    {/* <span>${shippingPrice.toFixed(2)}</span> */}
                    <span>Free</span>
                </li>
                <li>
                    <span>Tax</span>
                    <span>${taxPrice.toFixed(2)}</span>
                </li>
                {coupon.verified && <li>
                    <span>Discount ({coupon.value}) <button className='remove-btn' onClick={() => {
                        setDiscountPrice(0)
                        setCoupon({
                            value: '',
                            verified: false,
                            obj: null,
                            loading: false
                        })
                    }}><IoMdClose /></button></span>
                    <span>-${discountPrice.toFixed(2)}</span>
                </li>}
            </ul>
            <form onSubmit={handleCoupon}>
                {!coupon.verified && <div className="coupon-code">
                    <input onChange={(e) => {
                        setCoupon({
                            value: e.target.value,
                            verified: false,
                            obj: null,
                            loading: false
                        })
                        setDiscountPrice(0)
                    }} type="text" placeholder='Enter Coupon Code' />
                    <button>{coupon.loading ? <span className="spin-loader"><AiOutlineLoading /></span> : 'Apply'}</button>
                </div>}
            </form>
            <div className="footer">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
            </div>
        </div>
    )
}


export default OrderSummary
