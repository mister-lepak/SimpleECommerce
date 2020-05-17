const { validationResult } = require('express-validator');

module.exports = {
    handleErrors(templateFunc, dataCb) {
        // Middleware has to be all functions. 
        // Hence, also need to return in fucntions 
        return async (req, res, next) => {
            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                let data = {};
                if (dataCb) {
                    data = await dataCb(req);
                }
                return res.send(templateFunc({ errors, ...data }));
            }

            next();
        };
    },
    requireAuth(req, res, next) {
        if (!req.session.userID) {
            return res.redirect('/signin');
        }

        next();
    }
};