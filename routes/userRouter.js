const express=require('express');
const {getallUser,getallgroup,signup,signin,sendRequest,acceptRequest,getAllfriend,getrequestfriendList} = require('../controllers/userController')
const auth=require('../middleware/auth');
const userRouter = express.Router();



userRouter.get('/',auth,getallUser);

userRouter.get('/groups',auth,getallgroup);

userRouter.post('/send-friend-request/:userId',auth,sendRequest);

userRouter.post('/accept-friend-request/:userId',auth,acceptRequest);

userRouter.get('/friends',auth,getAllfriend);
userRouter.get('/friend-request/',auth,getrequestfriendList);

//signup
userRouter.post('/signup',signup);
//signin
userRouter.post('/signin',signin);




module.exports=userRouter;