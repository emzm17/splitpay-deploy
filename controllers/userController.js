const db=require('../database');
const jwt=require('jsonwebtoken');
const bcryptjs=require('bcryptjs');
const redis=require('redis');
const dotenv=require('dotenv');
dotenv.config();
const redisclient = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});
redisclient.connect();




const getallUser = async (req,res)=>{
    const users= await db.query(
        `SELECT * FROM users`
       )
    res.send(users[0]);
}

const getallgroup= async(req,res)=>{
 
    let keyname='getappGroups';
    let cached=await redisclient.get(keyname);

    if(cached){
           return  res.json(JSON.parse(cached));
    }
    else{

        const id=req.user_id;
        
    try{
        const groups=await db.query(
           `SELECT * FROM group_s`
        );
        if(groups[0].length===0){
            return res.json({message:"no group present"});
        }
         const total_groups=[];
        for(let i=0;i<groups[0].length;i++){
                  const currgroup=JSON.stringify(groups[0][i].users_id);
                   for(let j=0;j<currgroup.length;j++){
                    // console.log(currgroup[j]);
                     if(id===parseInt(currgroup[j])){
                         total_groups.push(groups[0][i]);
                         break;
                     }
                   }
        }
        
        redisclient.set(keyname,JSON.stringify((total_groups)),{EX:30});
        res.send(total_groups);
     }catch(error){
        console.log(error);
        res.status(500).json({message:"something went wrong"});
     }
     
    }
    
}

const signup=async(req,res)=>{
    // Existing user check
      // hash password
      // user creation 
      // token generate

      const {name,email,password}=req.body;
      
      try{
         const existingUser=await db.query(
            `SELECT * FROM users WHERE email=?`,[email]
         );
         if(existingUser[0].length > 0){
            return res.status(400).json({message:"user already exist"});
         } 


         const hashedpassword=await bcryptjs.hash(password,10);
         
         
         const user=await db.query(
            `INSERT INTO users(name,email,password) values(?,?,?)`,[name,email,hashedpassword]
         );

         const token=jwt.sign({
            email:user.email,id:user.user_id
         },process.env.SECRET_KEY);
         res.status(201).json({
            user:user,result:token
           
         });
         
      } catch(error){
          console.log(error);
          res.status(500).json({message:"something went wrong"});
      }
}


const signin=async(req,res)=>{
    const { email, password } = req.body;
try {
   
   
   const existingUser = await db.query(
      `SELECT * FROM users WHERE email=?`, [email]
  );
   
    if (existingUser[0].length === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    const existingCurrUser = existingUser[0][0];
    // console.log(existingCurrUser);


  
    bcryptjs.compare(password, existingCurrUser.password ,(err,result)=>{
        if(err){
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        else if (result) {
            const token = jwt.sign({
                email: existingCurrUser.email, id: existingCurrUser.user_id
            }, process.env.SECRET_KEY);
        
           return res.status(201).json({
                user: existingCurrUser, result: token
            });
        
        }
        else{
            return res.status(401).json({ message: 'Authentication failed. Incorrect password.' });
        }
        
    });

   
} catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
}


}


















module.exports={
    getallUser,getallgroup,signup,signin,
}