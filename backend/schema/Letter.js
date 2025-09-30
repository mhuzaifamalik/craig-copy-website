const { Schema, model } = require('mongoose')

const letterSchema = new Schema({
    letter: {
        type: String,
        required: [true, 'Letter is required'],
    },
    letterType: {
        type: String,
        required: [true, 'Letter Type is required'],
        enum: ['color', 'sepia']
    },
    images: [{
        type: String
    }]
}, { timestamps: true })

const Letter = model('letter', letterSchema)
module.exports = Letter;