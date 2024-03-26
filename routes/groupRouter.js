const express=require('express');
const{groupCreate,getallusergroup,getAll,getparticulargroup} = require('../controllers/groupController');
const auth=require('../middleware/auth');
const groupRouter=express.Router();


// creation of group
groupRouter.post('/create',auth,groupCreate)



// get all groups where current user involve
groupRouter.get('/',auth,getallusergroup)

// get all groups
groupRouter.get('/all',auth,getAll);


// get particular group
groupRouter.get('/:id',auth,getparticulargroup)





module.exports=groupRouter;