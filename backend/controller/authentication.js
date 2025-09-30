const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../env.json');
const User = require('../schema/User')

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body

        if (firstName && lastName && email && password) {
            const checkUser = await User.findOne({ email })
            if (checkUser) {
                return res.status(200).json({ success: false, message: `User with email ${email} already exists` })
            }
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)
            newUser = await User.create({ firstName, lastName, email, phone, password: hashPassword })
            const fetchUser = await User.findOne({ email })
            const { _id } = fetchUser
            const user = {
                id: _id, firstName, lastName, phone, email
            }
            const authtoken = jwt.sign(user, JWT_SECRET);
            return res.status(200).cookie('authtoken', authtoken).json({ success: true, message: `User Registered Successfully...`, authtoken });
        }
        else {
            console.log(req.body)
            return res.status(200).json({ success: false, message: 'Fill all required fields' })
        }
    }
    catch (err) {
        console.log(err.message);
        return res.status(200).json({ success: false, message: err.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password, from } = req.body
        const isWeb = from === 'web'

        if (email && password) {
            const checkUser = await User.findOne({ email })
            if (!checkUser) {
                if (isWeb) {
                    return res.status(200).json({ success: false, message: `Invalid Credentials` })
                }
                return res.status(200).redirect(`/admin/login?error=Invalid Credentials`)
            }
            const checkPassword = await bcrypt.compare(password, checkUser.password)
            if (!checkPassword) {
                if (isWeb) {
                    return res.status(200).json({ success: false, message: `Invalid Credentials` })
                }
                return res.status(200).redirect(`/admin/login?error=Invalid Credentials`)
            }
            const { _id, firstName, lastName, phone } = checkUser
            const user = {
                id: _id, email, firstName, lastName, phone
            }
            const authtoken = jwt.sign(user, JWT_SECRET);
            if (isWeb) {
                return res.status(200).json({ success: true, message: `User Logged In Successfully...`, authtoken });
            }
            return res.status(200).cookie('authtoken', authtoken).redirect(`/admin?message=User Logged In Successfully...`)
        }
        else {
            console.log(req.body)
            if (isWeb) {
                return res.status(200).json({ success: false, message: `Fill all required fields` })
            }
            return res.status(200).redirect(`/admin/login?error=Fill all required fields`)
        }
    }
    catch (err) {
        console.log(err.message);
        if (req.isWeb) {
            return res.status(200).json({ success: false, message: err.message })
        }
        return res.status(200).redirect(`/admin/login?error=${err.message}`)
    }
})

router.get('/logout', (req, res) => {
    res.clearCookie('authtoken'); // Default session cookie
    return res.status(200).redirect(`/admin/login`)
})

module.exports = router