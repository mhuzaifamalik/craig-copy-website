const express = require('express')
const Letter = require('../schema/Letter')
const router = express.Router()

router.post('/new', async (req, res) => {
    try {
        const { letter, letterType, images } = req.body
        await Letter.create({ letter: { $regex: letter, $options: 'i' }, letterType, images })
        res.redirect('/admin/letters')
    } catch (error) {
        res.redirect(`/admin/letters?error=${error.message}`)
    }
})

router.post('/edit', async (req, res) => {
    try {
        const { favicon, logo, title, metaTags, metaDescription, themeColor } = req.body
        const setting = await Setting.findOne()
        setting.favicon = favicon
        setting.logo = logo
        setting.title = title
        setting.metaTags = metaTags
        setting.metaDescription = metaDescription
        setting.themeColor = themeColor
        await setting.save()
        res.redirect('/admin/settings')
    } catch (error) {
        res.redirect(`/admin/settings?error=${error.message}`)
    }
})

router.post('/fetch', async (req, res) => {
    try {
        var { letter, type } = req.body
        console.log(letter, type)
        letter = letter.map(l => {
            const code = l.charCodeAt(0);
            if (l == '*') return 'the'
            // If it's a symbol or punctuation (based on character code ranges)
            if (
                (code >= 33 && code <= 47) ||  // ! " # $ % & ' ( ) * + , - . /
                (code >= 58 && code <= 64) ||  // : ; < = > ? @
                (code >= 91 && code <= 96) ||  // [ \ ] ^ _ `
                (code >= 123 && code <= 126)   // { | } ~
            ) return 'Punctuation';

            return l;
        });

        var letters = await Letter.find({ letter: { $regex: letter.join('|'), $options: 'i' }, letterType: type })
        console.log(letters.map(letter => letter.letter))
        letters = letters.map(letter => ({ ...letter._doc, images: letter.images.map(image => encodeURIComponent(image).replaceAll('%2F', '/')) }))
        res.json({
            success: true,
            data: letters
        })
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        })
    }
})

router.post('/fetchbyids', async (req, res) => {
    try {
        const { ids } = req.body
        var letters = await Letter.find({ _id: ids })
        letters = letters.map(letter => ({ ...letter._doc, images: letter.images.map(image => encodeURIComponent(image).replaceAll('%2F', '/')) }))
        res.json({
            success: true,
            data: letters
        })
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        })
    }
})

module.exports = router