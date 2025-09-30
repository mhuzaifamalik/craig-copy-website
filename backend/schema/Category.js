const { Schema, model } = require('mongoose');
const generateUrl = require('../helper/generateUrl');

const categorySchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    description: {
        type: String
    },
    banner: {
        type: String
    },
    image: {
        type: String
    },
    url: {
        type: String,
        unique: true,
        default: generateUrl(this.title)
    }
}, { timestamps: true })

// Pre-save hook for create/save
categorySchema.pre('save', function (next) {
    if (this.isModified('title') || !this.url) {
        this.url = generateUrl(this.title);
    }
    next();
});

// Pre-update hook (for findOneAndUpdate and updateOne)
categorySchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
    const update = this.getUpdate();

    if (update.title) {
        update.url = generateUrl(update.title);
        this.setUpdate(update);
    }

    next();
});

const Category = model('category', categorySchema)
module.exports = Category;