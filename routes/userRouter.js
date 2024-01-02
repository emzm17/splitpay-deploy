const express=require('express');
const {getallUser,getallgroup,signup,signin} = require('../controllers/userController')
const auth=require('../middleware/auth');
const userRouter = express.Router();



userRouter.get('/',auth,getallUser);

userRouter.get('/groups',auth,getallgroup);



//signup
userRouter.post('/signup',signup);
//signin
userRouter.post('/signin',signin);




module.exports=userRouter;