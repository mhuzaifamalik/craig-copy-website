const express = require('express')
const Section = require('../schema/Section')
const router = express.Router()

router.post('/new', async (req, res) => {
    try {
        const { title, sectionOf, content, images, videos, documents } = req.body
        await Section.create({ title, sectionOf, content, images, videos, documents })
        res.redirect('/admin/cms/section')
    } catch (error) {
        res.redirect(`/admin/cms/section?error=${error.message}`)
    }
})

router.post('/edit', async (req, res) => {
    try {
        const { id, title, content, images, videos, documents } = req.body
        const section = await Section.findById(id)
        section.title = title
        // section.sectionOf = sectionOf
        section.content = content
        section.images = images
        section.videos = videos
        section.documents = documents
        await section.save()
        res.redirect('/admin/cms/section')
    } catch (error) {
        res.redirect(`/admin/cms/section?error=${error.message}`)
    }
})

router.post('/fetch/:sectionOf', async (req, res) => {
    try {
        const { sectionOf } = req.params
        const section = await Section.findOne({ sectionOf })
        res.json({
            success: true,
            data: section
        })
    } catch (error) {
        res.json({
            success: false,
            data: error.message
        })
    }
})

module.exports = router