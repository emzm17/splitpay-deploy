const db=require('../database');
const dotenv=require('dotenv');
const redis=require('redis');
dotenv.config({ path: '.env.prod' });

const redisconnection = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});
redisconnection.connect();

const getallExpense = async(req,res)=>{
    try {
      
        const group = await db.query(
            `SELECT * FROM expenses`
        );
    
        // console.log("Group Length:", group);
        if (group.rows.length===0) {
            return res.status(404).json({ message: "No expense found" });
        }

        res.status(201).json(group.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
}


const getparticularExpense=async(req,res)=>{


    let keyname='getexpense';
    let cached=await  redisconnection.get(keyname);
    // redisclient.disconnect();

    if(cached){
        //  console.log('cached');
        //  const result = await redisclient.get(keyname);
        //  console.log(result);

        return res.status(201).json(JSON.parse(cached));
    }
    else{
        try {
            // console.log('first time cached');
            const id=req.params.id;
            const group = await db.query(
                `SELECT * FROM expenses where group_id=$1`,[id]
            );
        
            // console.log("Group Length:", group);
            if (group.rows.length===0) {
                return res.status(404).json({ message: "No expense found" });
            }
            redisconnection.set(keyname,JSON.stringify((group.rows)),{EX:30});
           return  res.json(group.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Something went wrong" });
        }
    }
    //  redisconnection.disconnect();
}

const createExpense=async(req,res)=>{
    // destructure the amount,description,payer_id,group_id
   const {amount,description,payer_id,group_id}=req.body;
        
   try{
      const new_expense=await db.query(
         `INSERT INTO expenses (amount,description,payer_id,group_id) values ($1,$2,$3,$4)`,[amount,description,payer_id,group_id]
      );
      const group=await db.query(
        `SELECT * FROM group_s where id=$1`,[group_id]
      );
      if(group.rows.length===0){
        return res.json({message:"no group present"});
    }

    
    for(let i=0;i<group.rows.length;i++){
              const currgroup=JSON.stringify(group.rows[0].users_id);
              let sz=0;
              for(let i=0;i<currgroup.length;i++){
                 if(currgroup[i]!=',' && currgroup[i]!=']' && currgroup[i]!='[') sz++;
              }
            //   console.log(sz);
              const eachContribute=amount/sz;
              const eachContributeRound=eachContribute.toFixed(2);
            //   console.log(eachContribute);
              const totalAmount=amount-eachContributeRound;
              const currentUserAmount = await db.query(
                `SELECT total_amount from users where user_id =$1`,[payer_id]
              );


            const totalAmountUser=parseInt(currentUserAmount.rows[0].total_amount)+amount
            // console.log(currentUserAmount.rows[0]+toa );
           
              const updateUserAmount= await db.query(
                'UPDATE users set total_amount=$1,total_owed=$2 where user_id=$3',[totalAmountUser,totalAmount,payer_id]
              );

               for(let j=0;j<currgroup.length;j++){
                      if(payer_id!=currgroup[j] && currgroup[j]!=',' && currgroup[j]!='[' && currgroup[j]!=']'){
                        const currentUserAmount = await db.query(
                            `SELECT total_amount from users where user_id =$1`,[currgroup[j]]
                          );
                          const totalAmountUser=parseInt(currentUserAmount.rows[0].total_amount)+eachContribute
            
                          const youOwe= await db.query(
                            `UPDATE users set total_owe=$1,total_amount=$2 where user_id=$3`,[eachContributeRound,totalAmountUser,currgroup[j]]
                          );
                      }
               }
    }

      res.send({message:"new expense created"});

   }catch(error){
      console.log(error);
      res.status(500).json({message:"something went wrong"});
   }
   
}
// redisclient.disconnect();
module.exports={
    createExpense,getallExpense,getparticularExpense
};