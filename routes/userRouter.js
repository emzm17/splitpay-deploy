const express=require('express');
const {allUser,signup,signin,specificUser} = require('../controllers/userController')
const auth=require('../middleware/auth');
const userRouter = express.Router();



userRouter.get('/',auth,allUser);
userRouter.get('/:userId',auth,specificUser);


//signup
userRouter.post('/signup',signup);
//signin
userRouter.post('/signin',signin);




module.exports=userRouter;