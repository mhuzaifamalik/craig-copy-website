const mongoose = require('mongoose')
const { Schema, model } = require('mongoose');
const generateUrl = require('../helper/generateUrl');

const productSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    stock: {
        type: Number
    },
    sku: {
        type: String
    },
    tax: {
        type: Number
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
    }],
    image: {
        type: String
    },
    url: {
        type: String,
        // required: true,
        unique: true,
        default: generateUrl(this.title)
    }
}, { timestamps: true })

// // Pre-save hook for create/save
// productSchema.pre('save', function (next) {
//     if (this.isModified('title') || !this.url) {
//         this.url = generateUrl(this.title);
//     }
//     next();
// });

// // Pre-update hook (for findOneAndUpdate and updateOne)
// productSchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
//     const update = this.getUpdate();

//     if (update.title) {
//         update.url = generateUrl(update.title);
//         this.setUpdate(update);
//     }
//     next();
// });

productSchema.pre('save', async function (next) {
    if (this.isModified('title') || !this.url) {
        let url = generateUrl(this.title);
        let exists = true;
        let counter = 1;

        // Try to find a unique URL
        while (exists) {
            const existingProduct = await this.constructor.findOne({ url });

            if (!existingProduct || existingProduct._id.equals(this._id)) {
                exists = false;
            } else {
                url = `${generateUrl(this.title)}-${counter}`;
                counter++;
            }
        }

        this.url = url;
    }
    next();
});


// Pre-update hook (for findOneAndUpdate and updateOne)
productSchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
    const update = this.getUpdate();

    if (update.title) {
        let url = generateUrl(update.title);
        let exists = true;
        let counter = 1;

        // Try to find a unique URL
        while (exists) {
            const existingProduct = await this.model.findOne({ url });

            // If not found or updating same document, break
            if (!existingProduct || (existingProduct && existingProduct._id.equals(this.getQuery()._id))) {
                exists = false;
            } else {
                url = `${generateUrl(update.title)}-${counter}`;
                counter++;
            }
        }

        update.url = url;
        this.setUpdate(update);
    }

    next();
});


const Product = model('product', productSchema)
module.exports = Product;