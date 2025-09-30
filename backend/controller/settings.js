const express = require('express')
const Setting = require('../schema/Setting')
const router = express.Router()

router.post('/new', async (req, res) => {
    try {
        const { title, metaTags, metaDescription, themeColor } = req.body
        await Setting.create({ title, metaTags, metaDescription, themeColor })
        res.redirect('/admin/settings')
    } catch (error) {
        res.redirect(`/admin/settings?error=${error.message}`)
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
        const setting = await Setting.findOne()
        res.json({
            success: true,
            data: setting
        })
    } catch (error) {
        res.json({
            success: false,
            data: error.message
        })
    }
})

module.exports = router