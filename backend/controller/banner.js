const express = require('express')
const Banner = require('../schema/Banner')
const router = express.Router()

router.post('/new', async (req, res) => {
    try {
        const { page, title, bannerImage } = req.body
        await Banner.create({page, title, bannerImage})
        res.redirect('/admin/cms/banner')
    } catch (error) {
        res.redirect(`/admin/cms/banner?error=${error.message}`)
    }
})

router.post('/edit', async (req, res) => {
    try {
        const { id, title, bannerImage } = req.body
        const banner = await Banner.findById(id)
        banner.title = title
        if(bannerImage) banner.bannerImage = bannerImage
        await banner.save()
        res.redirect('/admin/cms/banner')
    } catch (error) {
        res.redirect(`/admin/cms/banner?error=${error.message}`)
    }
})

router.post('/fetch/:page', async (req, res) => {
    try {
        const { page } = req.params
        const banner = await Banner.findOne({page})
        res.json({
            success: true,
            data: banner
        })
    } catch (error) {
        res.json({
            success: false,
            data: error.message
        })
    }
})

module.exports = router