
const db=require('../database');

const groupCreate= async (req,res)=>{
        // destructure the name
         const {name,users_id,created_by}=req.body;
        
         const users_id_json=JSON.stringify(users_id);
         // console.log(users_id_json);
         try{
            const new_group=await db.query(
               `INSERT INTO group_s (name,users_id,created_by) value (?,?,?)`,[name,users_id_json,created_by]
            );
            
            res.send({message:"new group created"});

         }catch(error){
            console.log(error);
            res.status(500).json({message:"something went wrong"});
         }
         
}

const getallexpenseGroup=async (req,res)=>{
    try{

        const id=req.params.id;

        const expense_list=await db.query(`select * from expenses where group_id=?`, [id])

        if(expense_list[0].length===0){
         res.status(404).json({message:"no expense record is there"});
        }
            
        res.json(expense_list[0]);      
     }catch(error){
             res.status(500).json({message:"something went wrong"});
     }
}



module.exports={
     groupCreate,getallexpenseGroup
}