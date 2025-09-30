const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../env.json');
const User = require('../schema/User');

const authValidator = () => {
    return async (req, res, next) => {
        try {
            const cookieAuthtoken = req.cookies['authtoken'];
            if (cookieAuthtoken) {
                const tokenUser = jwt.verify(cookieAuthtoken, JWT_SECRET)
                const dbUser = await User.findById(tokenUser.id)
                const { _id, firstName, lastName, email, phone, role } = dbUser
                const user = {
                    id: _id, firstName, lastName, email, phone, role
                }
                const authtoken = jwt.sign(user, JWT_SECRET);
                const expirationDate = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes in milliseconds
                if (role == 'admin') {
                    res.cookie('authtoken', authtoken, { expires: expirationDate });
                } else {
                    res.cookie('authtoken', authtoken);
                }
                req.user = user
                next()
            }
            else {
                next()
            }
        }
        catch (err) {
            next()
            console.log(err)
        }
    }
}

module.exports = authValidator