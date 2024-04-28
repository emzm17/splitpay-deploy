const joi=require('@hapi/joi')

const loginSchema=joi.object({
         email:joi.string().email().lowercase().required(),
         password:joi.string().min(8).required()
})


const signupSchema=joi.object({
     name:joi.string().required(),
     email:joi.string().email().lowercase().required(),
     password:joi.string().min(8).required()
})
const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    user_id: joi.number().integer().min(0).required()
});
const expenseSchema=joi.object({
    amount:joi.number().integer().required(),
    description:joi.string().required(),
    payer:joi.array().items(userSchema).min(1).required(),
    group_id:joi.number().integer().required()
    
})

const groupSchema=joi.object({
    name:joi.string().required(),
    users:joi.array().items(userSchema).required(),
})


module.exports={
    loginSchema,signupSchema,expenseSchema,groupSchema
}