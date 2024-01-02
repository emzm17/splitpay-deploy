const express=require('express');
const auth=require('../middleware/auth');
const profileRouter = express.Router();
const {updateInfo}=require('../controllers/profileController');





profileRouter.put('/',auth,updateInfo);



module.exports=profileRouter;