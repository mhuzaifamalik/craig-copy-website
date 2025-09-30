const { Schema, model } = require('mongoose');
const Product = require('./Product');
const Coupon = require('./Coupon');

const creationSchema = new Schema({
    items: [{
        letter: {
            type: Schema.Types.ObjectId,
            ref: 'letter',
            required: true
        },
        imageIndex: {
            type: Number,
            required: true
        }
    }],
    quantity: {
        type: Number,
        default: 1
    }
}, { timestamps: true })

const orderSchema = new Schema({
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentinfo: {
        type: Object
    },
    creation: [creationSchema],
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    giftMessage: {
        type: String
    },
    deliveryFirstName: {
        type: String,
        required: true
    },
    deliveryLastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    company: {
        type: String
    },
    country: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    invoice: {
        type: String
    },
    amountPaid: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    shippingPrice: {
        type: Number,
        default: 0
    },
    taxPrice: {
        type: Number,
        default: 0
    },
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'coupon'
    }
}, { timestamps: true })

// Generate unique orderId before saving if not present
orderSchema.pre('validate', async function (next) {
    if (!this.orderId) {
        // Example: ORD-YYYYMMDD-HHMMSS-<random>
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
        const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const randomPart = Math.random().toString(36).substr(2, 5).toUpperCase();
        this.orderId = `ORD-${datePart}-${timePart}-${randomPart}`;
    }
    var products = []
    for (let i = 0; i < this.products.length; i++) {
        const product = await Product.findById(this.products[i].product)
        if (product) {
            products.push({
                ...product._doc,
                quantity: this.products[i].quantity,
            })
        }
    }
    var amount = products.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    amount = this.creation.reduce((acc, item) => {
        return acc + (item.items.length * item.quantity * 10);
    }, amount);

    var discount = 0;

    if (this.coupon) {
        const coupon = await Coupon.findById(this.coupon)
        if (coupon) {
            if (coupon.discountType === 'fixed') {
                discount = Math.min(coupon.discount, amount);
            } else if (coupon.discountType === 'percentage') {
                discount = (coupon.discount / 100) * amount;
            }
        }
    }

    this.amount = amount
    if (amount || this.shippingPrice || this.taxPrice) {
        this.amountPaid = amount + this.shippingPrice + this.taxPrice - discount;
    }
    next();
});

const Order = model('order', orderSchema)
module.exports = Order;