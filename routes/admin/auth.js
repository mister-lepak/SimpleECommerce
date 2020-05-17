const express = require('express');


const { handleErrors } = require('./middlewares');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { 
    requireEmail, 
    requirePassword, 
    requirePasswordConfirmation, 
    requireEmailExists, 
    requireValidPasswordForUser } = require('./validator');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
});

// bodyParser replaced with off-the shelve library
// const bodyParser = (req, res, next) => {
//     if (req.method === "POST") {
//         // get access to email, password, password confirmation
//         req.on('data', data => {
//             const parsed = data.toString('utf8').split('&');
//             const formData = {};
//             for (let pair of parsed) {
//                 // code below is to help collect respective info as it got split by '=' sign
//                 const [key, value] = pair.split('=');
//                 formData[key] = value;
//             }
//             req.body = formData;
//             next();
//         }); 
//     } else {
//         next();
//     }
// };

router.post(
    '/signup',
    [requireEmail,requirePassword,requirePasswordConfirmation], 
    handleErrors(signupTemplate),
    async (req, res) => {
        const { email, password, passwordConfirmation } = req.body;
        // Create a user in our user repo to represent this person
        const user = await usersRepo.create({ email, password });

        // Store the id of that user inside the users cookie
        // pro-tip: try to use ready made library to handle cookies!
        req.session.userID = user.id;  // Added by cookie session!

        res.redirect('/admin/products');
});

router.get('/signout', (req, res) => {
    req.session = null;
    res.send('You are logged out!');
});

router.get('/signin', (req, res) => {
    res.send(signinTemplate({}))
});

router.post('/signin',
    [ requireEmailExists, requireValidPasswordForUser ],
    handleErrors(signinTemplate),
    async (req, res) => {
        const { email } = req.body;
        const user = await usersRepo.getOneBy({ email });
        
        req.session.userID = user.id;

        res.redirect('/admin/products');
});

module.exports = router;