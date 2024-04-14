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

const expenseSchema=joi.object({
    amount:joi.number().integer().required(),
    description:joi.string().required(),
    payer_id:joi.number().integer().required(),
    group_id:joi.number().integer().required()
    
})

const groupSchema=joi.object({
    name:joi.string().required(),
    users_id:joi.array().required(),
    created_by:joi.number().integer().required()
})


module.exports={
    loginSchema,signupSchema,expenseSchema,groupSchema
}