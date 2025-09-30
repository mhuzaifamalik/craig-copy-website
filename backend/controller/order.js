const express = require('express');
const Order = require('../schema/Order');
const router = express.Router()
const { randomUUID } = require('crypto');
const { squareAppIdSandbox, squareAccessTokenSandbox, squareLocationIdSandbox, squareAppId, squareAccessToken, squareLocationId } = require('../env.json')
const { SquareError, SquareClient, SquareEnvironment } = require('square');
const sendMail = require('../helper/sendMail');
const { generateOrderEmailBody, generateOrderStatusUpdateEmailBody } = require('../helper/generateEmailContent');
const SalesTax = require('sales-tax');

const squareClient = new SquareClient({
    // token: squareAccessToken,
    token: squareAccessTokenSandbox, // Use Sandbox for testing
    environment: SquareEnvironment.Production // Use Sandbox for testing
});


const getLocation = () => new Promise(async (resolve, reject) => {
    const response = await squareClient.locations.get({
        // locationId: squareLocationId,
        locationId: squareLocationId,
    });
    console.log('Location Response', response);
    resolve(response.location);
})

router.post('/calculate-tax', async (req, res) => {
    try {
        const { country, state } = req.body;

        // Calculate tax using the sales-tax library
        const tax = await SalesTax.getSalesTax(country, state);

        return res.json({
            success: true,
            tax
        });
    } catch (error) {
        console.error('Error calculating tax:', error.message);
        return res.json({
            success: false,
            message: 'Error calculating tax'
        });
    }
});

router.post('/new', async (req, res) => {
    try {
        var { token, user, products, firstName, lastName, email, giftMessage, deliveryFirstName, deliveryLastName, phone, company, country, address, city, state, zipCode, paymentType, coupon, amount, taxPrice } = req.body
        const location = await getLocation()
        const paymentResponse = await squareClient.payments.create({
            sourceId: token,
            amountMoney: {
                amount: BigInt(parseInt((amount + taxPrice) * 100)),
                currency: 'USD'
            },
            idempotencyKey: randomUUID(),
            locationId: location.id,
            buyerEmailAddress: email,
            billingAddress: {
                firstName,
                lastName,
                addressLine1: address,
                locality: city,
                administrativeDistrictLevel1: state,
                postalCode: zipCode,
                country: 'US'
            }
        });
        const paymentId = paymentResponse.payment.id
        const status = paymentResponse.payment.status
        const creation = products.filter((item) => item.type == 'letter').map((item => ({
            items: item.id.map((id, ind) => ({
                letter: id,
                imageIndex: item.items[ind]
            })),
            quantity: item.quantity,
        })))
        products = products.filter((item) => item.type !== 'letter')
        // return
        const order = await Order.create({
            status: 'pending',
            user,
            products: products.map((item) => ({
                product: item.id,
                quantity: item.quantity
            })),
            paymentinfo: {
                paymentId,
                status,
                amount: amount,
                paymentType
            },
            creation,
            firstName,
            lastName,
            email,
            giftMessage,
            deliveryFirstName,
            taxPrice,
            deliveryLastName,
            phone,
            company,
            country,
            address,
            city,
            state,
            zipCode,
            paymentType,
            coupon
        })
        const orderObj = await Order.findById(order._id)
            .populate('user')
            .populate('products.product')
            .populate('creation.items.letter')
            .populate('coupon');
        const { subject, html } = generateOrderEmailBody(orderObj)
        try {
            sendMail(
                email,
                subject,
                html
            )
        } catch (error) {
            console.error('Error sending email:', error.message);
        }
        return res.json({
            success: true,
            message: 'Order created successfully',
            order
        })
    } catch (error) {
        if (error instanceof SquareError) {
            // Handle Square API specific errors
            console.error('Square API Error:', error.errors);
            return res.json({
                success: false,
                message: error.errors.map(e => e.detail).join(', ')
            })
        } else {
            // Handle other errors
            console.error('Payment Error:', error);
            return res.json({
                success: false,
                message: error.message || 'Payment processing error'
            });
        }
    }
})

router.post('/update', async (req, res) => {
    const { orderId, status } = req.body
    try {
        // First, get the current order to check the existing status
        const currentOrder = await Order.findOne({ orderId });
        if (!currentOrder) {
            return res.redirect(`/admin/orders/list?error=Order not found`);
        }

        const oldStatus = currentOrder.status;
        
        // Update the order status
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId }, 
            { status }, 
            { new: true }
        ).populate('user')
         .populate('products.product')
         .populate('creation.items.letter')
         .populate('coupon');

        // Send email notification if status has changed
        if (oldStatus !== status && updatedOrder.email) {
            try {
                const { subject, html } = generateOrderStatusUpdateEmailBody(updatedOrder, oldStatus, status);
                await sendMail(updatedOrder.email, subject, html);
                console.log(`Status update email sent to ${updatedOrder.email} for order ${orderId}`);
            } catch (emailError) {
                console.error('Error sending status update email:', emailError.message);
                // Don't fail the update if email fails
            }
        }

        return res.redirect(`/admin/order/${orderId}?message=Order updated successfully`);
    } catch (error) {
        console.error('Error updating order:', error.message);
        if (orderId) {
            return res.redirect(`/admin/order/${orderId}?error=${error.message}`);
        }
        return res.redirect(`/admin/orders/list?error=${error.message}`);
    }
})

module.exports = router