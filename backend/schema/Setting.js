const { Schema, model } = require('mongoose')

const settingSchema = new Schema({
    favicon: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    metaTags: {
        type: Array
    },
    metaDescription: {
        type: String
    },
    themeColor: {
        type: String,
        required: true,
    },
}, { timestamps: true })

const Setting = model('setting', settingSchema)
module.exports = Setting;