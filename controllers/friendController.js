const friendService = require('../services/friendService');
const { apiError } = require('../utils/apiError');
const { apiResponse } = require('../utils/apiResponse');

const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user_id; // Assuming user_id is available in the request
    const friendRequests = await friendService.getFriendRequests(userId);
    if(friendRequests.length==0){
       throw new apiError(404,"no friend request")
    }
    res.status(200).json(new apiResponse("success",friendRequests,"friend request"));
  } catch (error) {
    error.status=error.statusCode
    res.status(error.status).json({
      status: "error",
      data: null,
      message:error.message
    })
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user_id; // Assuming user_id is available in the request
    const friendId = req.params.userId;
    const confriendId=Number(friendId);
    const result = await friendService.acceptFriendRequest(userId, confriendId);
    res.status(201).json(new apiResponse("success",result,"friend request accepted"));
  } catch (error) {
    error.status=error.statusCode || 500
    res.status(error.status).json({
      status: "error",
      data: null,
      message:error.message
    })
  }
};

const getAllFriends = async (req, res) => {
  try {
    const userId = req.user_id; // Assuming user_id is available in the request
    const friends = await friendService.getAllFriends(userId);
    if(friends.length==0){
      throw new apiError(404,"no friends")
    }
    res.status(200).json(new apiResponse("success",friends,"all friends"))
  } catch (error) {
    error.status=error.statusCode
    res.status(error.status).json({
      status: "error",
      data: null,
      message:error.message
    })
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user_id; // Assuming user_id is available in the request
    const friendId = req.params.userId;
    const checkuser = await friendService.checkUser(friendId);
    if(checkuser.rows.length == 0 ){
      throw new apiError(404,"user not found")
    }
    const checkrequest=await friendService.checkRequest(userId,friendId)
    if(checkrequest.rows.length !=0){
       throw new apiError(404,"already sent friend request");
    }
    const result=await friendService.sendFriendRequest(userId,friendId);
    res.status(201).json(new apiResponse("success",result,"send friend request"));
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
  getFriendRequests,
  acceptFriendRequest,
  getAllFriends,
  sendFriendRequest,
};
