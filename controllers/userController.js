// controllers/userController.js
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { loginSchema,signupSchema}=require('../utils/validator');
const { apiError } = require('../utils/apiError');
const { apiResponse } = require('../utils/apiResponse');



const signup = async(req,res) => {
  try {
    const result=await signupSchema.validateAsync(req.body)
    const existingUser = await userService.getUserByEmail(result.email);
    if (existingUser.rows.length > 0) {
      throw new apiError(400,"user already exist")
}
    const hashedPassword = await bcryptjs.hash(result.password, 10);
    const user = await userService.createUser(result.name, result.email, hashedPassword);
    if(!user){
      throw new apiError(500,"something went wrong while registering the user")
    } 
    const token = jwt.sign({ email: user.email, id: user.user_id }, process.env.SECRET_KEY);

    return res.status(200).json(
      new apiResponse(token,"user successfully register")
    ) 
  } catch (error) {
      if(error.isJoi===true)error.status = 422
      else error.status=error.statusCode || 500
      res.status(error.status).json({
        message:error.message
      })
  }
};

const signin = async (req, res) => {
  try {
    const result= await loginSchema.validateAsync(req.body)
    const existingUser = await userService.getUserByEmail(result.email);
    if (existingUser.rows.length == 0) {
      throw new apiError(404,"user not found");
    }
    const existingCurrUser = existingUser.rows[0]
    if(existingCurrUser.friend_list==null){
      const updateUserFriend = await userService.updateFriendlist(([existingCurrUser.user_id]),existingCurrUser.user_id);
    }
  
    bcryptjs.compare(result.password, existingCurrUser.password, (err, result) => {
      if (err) {
        throw new apiError(500,"Internal Server Error")
      } else if (result) {
        const token = jwt.sign(
          {
            email: existingCurrUser.email,
            id: existingCurrUser.user_id,
          },
          process.env.SECRET_KEY
        );
       return res.status(201).json(new apiResponse({user_id:existingCurrUser.user_id,name: existingCurrUser.name,
          email: existingCurrUser.email,
          result: token},"user successfully logged In"))

      } else {
        throw new apiError(401,"authentication failed. Incorrect password")
      }
    });
  } catch (error) {
    console.log(error);
    if(error.isJoi===true)error.status = 422
    else error.status=error.statusCode || 500
    res.status(error.status).json({
      message:error.message
    })
  }
};

const allUser=async(req,res)=>{
  try{
     const getAlluser=await userService.getAlluser();
     if(getAlluser.rows.length < 1){
      return res.status(201).json(new apiResponse([],"all users generated successfully"));  
     }
     let allUser=[];
     for(let i=0;i<getAlluser.rows.length;i++){
       const tempUser=getAlluser.rows[i];
       const currUser=await userService.specificUser(req.user_id)
       const friend_list=currUser.rows[0].friend_list
       if(tempUser.user_id!=req.user_id && !friend_list.includes(tempUser.user_id)){
        const user={user_id:tempUser.user_id,name: tempUser.name,email:tempUser.email
        }
          allUser.push(user);
       }
     
     }
     res.status(200).json(new apiResponse(allUser,"all users generate successfull"));
  }
  catch(error){
    error.status=error.statusCode || 500
    res.status(error.status).json({
      message:error.message
    })
  }
}

const specificUser=async(req,res)=>{
   try{
    const userId=req.params.userId
    const specUser=await userService.specificUser(userId);
    if(specUser.rows.length==0){
      return res.status(201).json(new apiResponse([],"required specific user"));   
    }
    const tempUser=specUser.rows[0];

    if(userId==req.user_id){
      const user={user_id:tempUser.user_id,name: tempUser.name,email:tempUser.email,
      friend_list:tempUser.friend_list,total_amount:tempUser.total_amount,total_owe:tempUser.total_owe,
      total_owed:tempUser.total_owed}
      return res.status(201).json(new apiResponse(user,"required specific user"));   
    }
    else{
      const user={user_id:tempUser.user_id,name: tempUser.name,email:tempUser.email,
      }
      return res.status(201).json(new apiResponse(user,"required specific user"));    
    }
   }catch(error){
    error.status=error.statusCode || 500
    res.status(error.status).json({
      message:error.message
    })
   }
}






module.exports = {
  signup,
  signin,
  allUser,
  specificUser,
};

