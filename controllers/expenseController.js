const db=require('../database');
const dotenv=require('dotenv');
const redis=require('redis');
dotenv.config();

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
        if (group[0].length===0) {
            return res.status(404).json({ message: "No expense found" });
        }
    
        res.status(201).json(group[0]);
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
                `SELECT * FROM expenses where  group_id=?`,[id]
            );
        
            // console.log("Group Length:", group);
            if (group[0].length===0) {
                return res.status(404).json({ message: "No expense found" });
            }
            redisconnection.set(keyname,JSON.stringify((group[0])),{EX:30});
           return  res.json(group[0]);
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
         `INSERT INTO expenses (amount,description,payer_id,group_id) value (?,?,?,?)`,[amount,description,payer_id,group_id]
      );
      const group=await db.query(
        `SELECT * FROM group_s where id=?`,[group_id]
      );
      if(group[0].length===0){
        return res.json({message:"no group present"});
    }

    
    for(let i=0;i<group[0].length;i++){
              const currgroup=JSON.stringify(group[0][i].users_id);
              let sz=0;
              for(let i=0;i<currgroup.length;i++){
                 if(currgroup[i]!=',' && currgroup[i]!=']'&& currgroup[i]!='[') sz++;
              }
            //   console.log(sz);
              const eachContribute=amount/sz;
              const eachContributeRound=eachContribute.toFixed(2);
            //   console.log(eachContribute);
              const totalAmount=amount-eachContributeRound;
              const currentUserAmount=await db.query(
                `SELECT totalAmount from users where user_id =?`,[payer_id]
              );

            const totalAmountUser=parseInt(currentUserAmount[0][0].totalAmount)+totalAmount;
            console.log(totalAmountUser);
           
              const updateUserAmount= await db.query(
                'UPDATE users set totalAmount=?,totalOwed=? where user_id=?',[totalAmountUser,totalAmount,payer_id]
              );

               for(let j=0;j<currgroup.length;j++){
                      if(payer_id!=currgroup[j] && currgroup[j]!=',' && currgroup[j]!='[' && currgroup[j]!=']'){
                          const youOwe= await db.query(
                            `UPDATE users set totalOwe=? where user_id=?`,[eachContributeRound,currgroup[j]]
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