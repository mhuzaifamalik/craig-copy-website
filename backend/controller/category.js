const express = require('express')
const Category = require('../schema/Category')
const router = express.Router()

router.post('/create', async (req, res) => {
    const { title, description, image, banner } = req.body
    try {
        // Assuming you have a Category model defined
        await Category.create({ title, description, image, banner })
        return res.redirect(`/admin/category-list`)
    } catch (error) {
        console.error('Error creating category:', error)
        return res.redirect(`/admin/new-category?error=${error.message}`)
    }
})

router.post('/edit', async (req, res) => {
    const { id, title, description, image, banner } = req.body
    try {
        // Assuming you have a Category model defined
        await Category.findByIdAndUpdate(id, { title, description, image, banner })
        return res.redirect(`/admin/category-list`)
    } catch (error) {
        console.error('Error updating category:', error)
        return res.redirect(`/admin/edit-category?id=${id}&error=${error.message}`)
    }
})

router.post('/delete', async (req, res) => {
    const { id } = req.body
    try {
        // Assuming you have a Category model defined
        await Category.findByIdAndDelete(id)
        return res.redirect(`/admin/category-list`)
    } catch (error) {
        console.error('Error deleting category:', error)
        return res.redirect(`/admin/category-list?error=${error.message}`)
    }
})

router.post('/fetch', async (req, res) => {
    const { filter = {} } = req.body
    try {
        // Assuming you have a Category model defined
        const categories = await Category.find(filter)
        return res.json({ categories, success: true })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return res.json({ error: error.message, success: false })
    }
})

module.exports = router