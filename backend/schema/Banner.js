const { Schema, model } = require('mongoose')

const bannerSchema = new Schema({
    page: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    bannerImage: {
        type: String
    }
}, { timestamps: true })

const Banner = model('banner', bannerSchema)
module.exports = Banner;