const { Schema, model } = require('mongoose')
const mongoose = require('mongoose')

const couponSchema = new Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    couponCode: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        default: 0
    },
    discountType: {
        type: String,
        enum: ['fixed', 'percentage', 'freeShipping'],
        default: 'percentage'
    },
    maxDiscount: {
        type: Number
    },
    minPurchase: {
        type: Number
    },
    maxUsage: {
        type: Number
    },
    used: {
        type: Number,
        default: 0
    },
    // categories: [{
    //     type: mongoose.Schema.Types.Mixed,
    //     ref: 'category'
    // }]
}, { timestamps: true })

const Coupon = model('coupon', couponSchema)
module.exports = Coupon;