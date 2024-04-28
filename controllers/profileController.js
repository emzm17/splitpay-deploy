// controllers/profileController.js
const userService = require('../services/profileService');
const bcryptjs = require('bcryptjs');
const {apiError}=require('../utils/apiError')
const {apiResponse}=require('../utils/apiResponse')
const { signupSchema } = require('../utils/validator');


const updateInfo = async (req, res) => {
  try {
    const result= await signupSchema.validateAsync(req.body)
    const id = req.user_id;
    const hashedPassword = await bcryptjs.hash(result.password, 10);
    const emailList = await userService.getUserByEmail(result.email);

    if (emailList.rows.length > 0) {
      throw new apiError(404,"already email exists")
    }

    // Update user information
    const data=await userService.updateUser(id, result.name, result.email, hashedPassword);
    res.status(202).json(new apiResponse("success",data,"profile updated"));
  } catch (error) {
    if(error.isJoi===true)error.status = 422
    else error.status=error.statusCode || 500
    res.status(error.status).json({
      status: "error",
      data: null,
      message:error.message
    })
  }
};

module.exports = {
  updateInfo,
};
