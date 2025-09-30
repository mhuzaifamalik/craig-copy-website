const { Schema, model } = require('mongoose')

const sectionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    sectionOf: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    images: [{
        type: String
    }],
    videos: [{
        type: String
    }],
    documents: [{
        type: String
    }]
}, { timestamps: true })

const Section = model('section', sectionSchema)
module.exports = Section;