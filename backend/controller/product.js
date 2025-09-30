const express = require('express')
const Product = require('../schema/Product')
const router = express.Router()

router.post('/create', async (req, res) => {
    var { title, description, price, stock, sku, tax, image, categories } = req.body
    try {
        // Assuming you have a Product model defined
        if (Array.isArray(categories)) categories = categories.filter(category => category !== '')
        await Product.create({ title, description, price, stock, sku, tax, image, categories })
        return res.redirect(`/admin/new-product?success=Product created successfully`)
        // return res.redirect(`/admin/product-list`)
    } catch (error) {
        console.error('Error creating product:', error)
        return res.redirect(`/admin/new-product?error=${error.message}`)
    }
})

router.post('/edit', async (req, res) => {
    var { id, title, description, price, stock, sku, tax, image, categories } = req.body
    try {
        if (Array.isArray(categories)) categories = categories.filter(category => category !== '')
        await Product.findByIdAndUpdate(id, { title, description, price, stock, sku, tax, image, categories })
        return res.redirect(`/admin/product-list?success=Product updated successfully`)
    } catch (error) {
        console.error('Error updating product:', error)
        return res.redirect(`/admin/edit-product/${id}?error=${error.message}`)
    }
})

router.post('/delete', async (req, res) => {
    var { id } = req.body
    try {
        await Product.findByIdAndDelete(id)
        return res.redirect(`/admin/product-list?success=Product deleted successfully`)
    } catch (error) {
        console.error('Error deleting product:', error)
        return res.redirect(`/admin/product-list?error=${error.message}`)
    }
})

router.post('/fetch', async (req, res) => {
    var { filter = {} } = req.body
    try {
        // Assuming you have a Product model defined
        const products = await Product.find(filter).populate('categories')
        return res.json({ products, success: true })
        // return res.redirect(`/admin/product-list`)
    } catch (error) {
        console.error('Error creating product:', error)
        return res.json({ error: error.message, success: false })
    }
})

module.exports = router