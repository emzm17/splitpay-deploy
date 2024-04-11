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




module.exports={
    loginSchema,signupSchema
}