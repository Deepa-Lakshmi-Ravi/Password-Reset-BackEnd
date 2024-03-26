
const {body,validationResult} = require('express-validator');
//const body = require('express-validator');

const validate = async(route) =>{
    switch(route){
        case "signup":[
            body('firstName').notEmpty().withMessage('First Name is required'),
            body('lastName').notEmpty().withMessage('Last Name is required'),
            body('emailName').isEmail().withMessage('Invalid email address'),
            body('password')
            .matches(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/)
            .withMessage('Password must contain at least one digit, one lowercase and one uppercase letter, and one special character (@#$%^&+=)'),
        ];
        case"signin":[
            body('email').isEmail().withMessage('Invalid email address'),
            body('password').notEmpty().withMessage('Password is required'),
        ];
        case"forgetPassword":[
            body('email').isEmail().withMessage('Invalid email address'),
        ];
        case"resetPassword":[
            body('randomString').notEmpty().withMessage('Random String is required'),
            body('password')
            .isLength({min:8})
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{12,}$/)
            .withMessage('Password must be at least 12 characters long and contain at least one digit, one lowercase and one uppercase letter, and one special character (@#$%^&+=)')
        ];
        default:
            return[]
    }
};

const validationMiddleware = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    next();
}

module.exports = {
    validate,
    validationMiddleware,
}