const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const cookieParser = require('cookie-parser')
const generateUrl = require('./helper/generateUrl')
require('./db')

const authValidator = require('./middleware/authValidator')
const Section = require('./schema/Section')
const Letter = require('./schema/Letter')
const Banner = require('./schema/Banner')
const Setting = require('./schema/Setting')
const Category = require('./schema/Category')
const Product = require('./schema/Product')
const Coupon = require('./schema/Coupon')
const Order = require('./schema/Order')
const User = require('./schema/User')
const { generateOrderEmailBody } = require('./helper/generateEmailContent')
const sendMail = require('./helper/sendMail')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(authValidator())

app.set('view engine', 'ejs');
app.use('/', express.static(__dirname + '/views'));
app.use('/uploads', express.static(path.join(__dirname, 'views', 'uploads')));
const PORT = process.env.PORT || 6871

// app.use(async(req, res, next) => {
//     const multiLineStacks = await Product.find({categories: '6822896331fe0416318d99c4'})

//     for (let index = 0; index < multiLineStacks.length; index++) {
//         const element = multiLineStacks[index];
//         if(element.title.toLowerCase().includes('cw for web use')){
//             console.log('element', element);
//             const newTitle = element.title.replace('cw for web use', '');
//             element.title = newTitle;
//             console.log('Updated title:', newTitle);
//         }
//     }
//     next()
// })


app.get('/admin', async (req, res) => {
    const user = req.user
    console.log('user', user)
    if (user?.role == 'admin') {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const orders = await Order.find({
            createdAt: { $gte: threeDaysAgo }
        });
        const totalOrderCount = await Order.countDocuments();
        const totalCustomers = await Order.distinct('email').countDocuments();
        return res.render('admin/index', { user, orders, totalOrderCount, totalCustomers })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/cms/banner', async (req, res) => {
    const user = req.user
    console.log('user', user)
    if (user?.role == 'admin') {
        const banners = await Banner.find()
        return res.render('admin/banner', { banners, user })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/cms/section', async (req, res) => {
    const user = req.user
    console.log('user', user)
    if (user?.role == 'admin') {
        const sections = await Section.find()
        return res.render('admin/section', { sections, user })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/letters/:letterType', async (req, res) => {
    const user = req.user
    const { letterType } = req.params
    const { char } = req.query
    console.log('user', user)
    console.log('letterType', letterType)
    if (user?.role == 'admin') {
        const letter = await Letter.find({ letterType, letter: char ? char : 'A' })
        const uniqueLetters = await Letter.distinct('letter');
        console.log(uniqueLetters);
        return res.render('admin/letters', { letter, user, letterType, uniqueLetters, char })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/settings', async (req, res) => {
    const user = req.user
    console.log('user', user)
    if (user?.role == 'admin') {
        const setting = await Setting.findOne()
        return res.render('admin/settings', { setting, user })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/new-product', async (req, res) => {
    const user = req.user
    console.log('user', user)
    if (user?.role == 'admin') {
        const categories = await Category.find()
        return res.render('admin/new-product', { categories, user })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/edit-product/:id', async (req, res) => {
    const user = req.user
    const { id } = req.params
    console.log('user', user)
    if (user?.role == 'admin') {
        const categories = await Category.find()
        const product = await Product.findById(id).populate('categories')
        return res.render('admin/edit-product', { categories, user, product })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/product-list', async (req, res) => {
    const user = req.user
    const { category } = req.query
    console.log('user', user)
    if (user?.role == 'admin') {
        var products
        const categories = await Category.find()
        const selectedCategory = categories.find(cat => cat.url === category);
        if (category) {
            products = await Product.find({ categories: selectedCategory._id }).populate('categories')
        } else {
            products = await Product.find().populate('categories')
        }
        return res.render('admin/product-list', { products, user, categories, selectedCategory })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/new-category', async (req, res) => {
    const user = req.user
    console.log('user', user)
    if (user?.role == 'admin') {
        return res.render('admin/new-category', { user })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/edit-category/:id', async (req, res) => {
    const user = req.user
    const { id } = req.params
    console.log('user', user)
    if (user?.role == 'admin') {
        const category = await Category.findById(id)
        return res.render('admin/edit-category', { category, user })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/category-list', async (req, res) => {
    const user = req.user
    console.log('user', user)
    if (user?.role == 'admin') {
        const categories = await Category.find()
        return res.render('admin/category-list', { categories, user })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/coupon/new', async (req, res) => {
    const user = req.user
    if (user?.role == 'admin') {
        const categories = await Category.find()
        return res.render('admin/coupon-add', { user, categories })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/coupon/list', async (req, res) => {
    const user = req.user
    if (user?.role == 'admin') {
        const coupons = await Coupon.find()
        // .populate('categories')
        return res.render('admin/coupon-list', { user, coupons })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/orders/list', async (req, res) => {
    const user = req.user
    if (user?.role == 'admin') {
        const orders = await Order.find()
        const totalOrderCount = await Order.countDocuments();
        const totalRefunded = await Order.countDocuments({ status: 'refunded' });
        const totalCompleted = await Order.countDocuments({ status: 'completed' });
        const totalPending = await Order.countDocuments({ status: 'pending' });
        return res.render('admin/orders-list', { user, orders, totalOrderCount, totalRefunded, totalCompleted, totalPending })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/order/:orderId', async (req, res) => {
    const user = req.user
    const { orderId } = req.params
    if (user?.role == 'admin') {
        const order = await Order.findOne({ orderId })
            .populate('user')
            .populate('products.product')
            .populate('creation.items.letter')
            .populate('coupon');
        return res.render('admin/order-detail', { user, order: order._doc })
    }
    return res.redirect('/admin/login')
})

app.get('/admin/order-json/:orderId', async (req, res) => {
    const user = req.user
    const { orderId } = req.params
    if (user?.role == 'admin') {
        const order = await Order.findOne({ orderId })
            .populate('user')
            .populate('products.product')
            .populate('creation.items.letter')
            .populate('coupon');
        return res.json(order._doc)
    }
    return res.redirect('/admin/login')
})


app.get('/admin/login', (req, res) => {
    const user = req.user
    console.log('user', user)
    if (user?.role !== 'admin') {
        return res.render('admin/signin')
    }
    return res.redirect('/admin')
});

app.get('/test-email', async (req, res) => {
    const user = req.user
    console.log('user', user)
    try {
        const response = await sendMail('codemark.codes@gmail.com',
            "Test Email",
            '<h1>Hello World</h1>')
        res.json({ success: true, response })
    } catch (err) {
        res.json({ success: false, err })
    }
});

app.use('/api', require('./controller/apiHandler'))


app.use('/', (req, res) => {
    const filePath = path.resolve(__dirname, 'views', 'index.html');
    res.sendFile(filePath);
});




// const addUrl = () => {
//     Product.find().then((products) => {
//         products.forEach((product) => {
//             if (!product.url) {
//                 product.url = generateUrl(product.title);
//                 product.save();
//                 console.log('product', product);
//             }
//         });
//     });
// }


// (async()=>{
//     const letters = await Letter.find({ letter: 'Hearts' })
//     for (let index = 0; index < letters.length; index++) {
//         const element = letters[index];
//         const cur = Letter.findByIdAndUpdate(element._id, {
//             letter: 'Heart'
//         })
//     }
// })()

app.listen(PORT, () => {
    console.log(`App is live on: http://localhost:${PORT}`)
})