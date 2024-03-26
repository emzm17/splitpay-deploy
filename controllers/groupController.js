
// const db=require('../database');

// const groupCreate= async (req,res)=>{
//         // destructure the name
//          const {name,users_id,created_by}=req.body;
        
//         users_id.push(parseInt(req.user_id));
//          // console.log(temp_string);
//          try{
//             const new_group = await db.query(
//                `INSERT INTO group_s (name,users_id,created_by) values ($1,$2,$3)`,[name,JSON.stringify(users_id),created_by]
//             );
            
//           res.status(201).json({message:"new group created"});

//          }catch(error){
//             console.log(error);
//             res.status(500).json({message:"something went wrong"});
//          }
         
// }


// const getAllGroup=async(req,res)=>{
//        try{
//            const allgroup=await db.query(`select * from group_s`);
//            if(allgroup.rows.length<1){
//             return res.status(201).json({message:"no group present"});
//            }
         
//            return res.status(201).json(allgroup.rows)
//        }catch(error){
//          res.status(500).json({message:"something went wrong"});
//        }      
// }


// const getallparticularGroup=async (req,res)=>{
//     try{

//         const id=req.params.id;
//       //   console.log('exit'); 
//         const groups=await db.query(`select * from group_s where id=$1`, [id])
        
//         if(groups.rows.length<1){
//          res.status(404).json({message:"no group present with id"});
//         }
            
//         res.status(201).json(groups.rows[0]);      
//      }catch(error){
//              res.status(500).json({message:"something went wrong"});
//      }
// }



// module.exports={
//      groupCreate,getallparticularGroup,getAllGroup
// }




// controllers/groupController.js
const groupService = require('../services/groupService');

const groupCreate = async (req, res) => {
  const { name, users_id} = req.body;
  const created_by=req.user_id

  try {
    await groupService.createGroup(name, users_id, created_by);
    res.status(200).json({ message: 'New group created' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const getallusergroup = async (req, res) => {
  try {
    const groups = await groupService.getAllUserGroups(req.user_id);
    res.status(200).json(groups);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'something went wrong' });
  }
};

const getAll = async (req,res)=>{
   try{

    const groups=await groupService.getAllgroups();
    res.status(201).json(groups);

   }catch(error){
    res.status(500).json({ message:"something went wrong" });
   }
}

const getparticulargroup=async(req,res)=>{
    try{
       const groups=await groupService.getparticulargroup(req.params.id)
       res.status(201).json(groups)

    }catch(error){
      res.status(500).json({ message:"something went wrong" });
    }
}

module.exports = {
  groupCreate,
  getallusergroup,
  getAll,
  getparticulargroup
  // getAllExpenseGroup
};
