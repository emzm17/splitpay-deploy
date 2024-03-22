const express=require('express');
const{groupCreate,getallparticularGroup,getAllGroup} = require('../controllers/groupController');
const auth=require('../middleware/auth');



const groupRouter=express.Router();


// creation of group
groupRouter.post('/create',auth,groupCreate)


groupRouter.get('/',auth,getAllGroup)   

// get particular group by id
groupRouter.get('/:id',auth,getallparticularGroup)




module.exports=groupRouter;