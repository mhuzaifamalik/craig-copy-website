const express= require('express');
const { generateContactEmailBody } = require('../helper/generateEmailContent');
const sendMail = require('../helper/sendMail');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, message } = req.body;

        // Here you would typically save the contact message to a database or send an email
        // For this example, we'll just log it to the console
        console.log('Contact Message:', { firstName, lastName, email, phone, message });

        const { subject, html } = generateContactEmailBody({ firstName, lastName, email, phone,  message });

        await sendMail('info@craigphotoletters.com', subject, html)

        // Respond with success
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error handling contact form:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;