const friendService = require('../services/friendService');

const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user_id; // Assuming user_id is available in the request
    const friendRequests = await friendService.getFriendRequests(userId);
    res.status(200).json(friendRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user_id; // Assuming user_id is available in the request
    // console.log(typeof friendId);
    const friendId = req.params.userId;
    const confriendId=Number(friendId);
    // console.log(typeof confriendId);
    // console.log(typeof userId); 
    const result = await friendService.acceptFriendRequest(userId, confriendId);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const getAllFriends = async (req, res) => {
  try {
    const userId = req.user_id; // Assuming user_id is available in the request
    const friends = await friendService.getAllFriends(userId);
    res.status(200).json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user_id; // Assuming user_id is available in the request

    const friendId = req.params.userId;

    console.log(parseInt(userId));
    console.log(friendId);
    const result = await friendService.sendFriendRequest(userId, friendId);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

module.exports = {
  getFriendRequests,
  acceptFriendRequest,
  getAllFriends,
  sendFriendRequest,
};
