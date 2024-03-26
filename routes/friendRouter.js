const express=require('express');
const auth=require('../middleware/auth');
const { getFriendRequests,acceptFriendRequest,getAllFriends,sendFriendRequest} = require('../controllers/friendController')
const friendRouter = express.Router();


friendRouter.get('/',auth,getAllFriends);
friendRouter.post('/send-friend-request/:userId',auth,sendFriendRequest);
friendRouter.post('/accept-friend-request/:userId',auth,acceptFriendRequest);
friendRouter.get('/friend-request/',auth,getFriendRequests);



module.exports=friendRouter;