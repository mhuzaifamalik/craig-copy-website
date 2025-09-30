const nodemailer = require('nodemailer');

const sendMail = async (to, subject, html) => {
    return new Promise(async (resolve, reject) => {
        try {
            const transporter = await nodemailer.createTransport({
                host: 'craigphotoletters.com',
                port: 465,
                secure: true, // Use true if you're using port 465 (SSL)
                auth: {
                    user: 'info@craigphotoletters.com',
                    pass: 'kvo8Wm$p6Wkv'
                },
                tls: {
                    // Do not fail on invalid certs
                    rejectUnauthorized: false
                }
            });

            // Construct the email message
            const mailOptions = {
                from: 'info@craigphotoletters.com',
                to: to,
                subject: subject,
                html: html
            };
            var success = false
            // Send the email
            await transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                } else {
                    console.log(`Email successfully sent to ${to}`)
                    resolve(info);
                }
            });
            return success
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    })
}

module.exports = sendMail