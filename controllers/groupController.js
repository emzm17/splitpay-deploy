// controllers/groupController.js
const groupService = require('../services/groupService');
const { apiError } = require('../utils/apiError');
const { apiResponse } = require('../utils/apiResponse');
const { groupSchema } = require('../utils/validator');

const groupCreate = async (req, res) => {
  const { name, users} = req.body;
  // const created_by=req.user_id

  const request={name:name,users:users}
  const result=await groupSchema.validateAsync(request)
  try {
    const message=await groupService.createGroup(result.name, result.users,req.user_id);
  
    res.status(201).json(new apiResponse("success",message,"new group created Successfully"));
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

const getallusergroup = async (req, res) => {
  try {
    const groups = await groupService.getAllUserGroups(req.user_id);
    if(groups.length == 0){
      throw new apiError(404,"no group found");
    }
   
    res.status(200).json(new apiResponse("success",groups,"current users groups"));
  } catch (error) {
    error.status=error.statusCode || 600
    res.status(error.status).json({
      status: "error",
      data: null,
      message:error.message
    })
  }
};

const getAll = async (req,res)=>{
   try{
    const groups=await groupService.getAllgroups();
    if(groups.length == 0){
      throw new apiError(404,"no group found")
    }
    res.status(200).json(new apiResponse("success",groups,"all groups"));

   }catch(error){
    error.status=error.statusCode || 500
    res.status(error.status).json({
      status: "error",
      data: null,
      message:error.message
    })
   }
  }

const getparticulargroup=async(req,res)=>{
    try{
       const groups=await groupService.getparticulargroup(req.params.id)
       if(groups.length == 0){
         throw new apiError(404,"no group found");
       }
       res.status(200).json(new apiResponse("success",groups,"your particular group"))
    }catch(error){
    error.status=error.statusCode || 500
    res.status(error.status).json({
      status: "error",
      data: null,
      message:error.message
    })
    }
}


module.exports = {
  groupCreate,
  getallusergroup,
  getAll,
  getparticulargroup
};

