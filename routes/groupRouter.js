const express=require('express');
const{groupCreate,getallparticularGroup,getAllGroup} = require('../controllers/groupController');
const auth=require('../middleware/auth');



const groupRouter=express.Router();


// creation of group
groupRouter.post('/create',auth,groupCreate)


   

 // get all expense of that group;
groupRouter.get('/:id',auth,getallexpenseGroup)




module.exports=groupRouter;