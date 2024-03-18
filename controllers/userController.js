const db=require('../database');
const jwt=require('jsonwebtoken');
const bcryptjs=require('bcryptjs');
const redis=require('redis');
const dotenv=require('dotenv');
dotenv.config({ path: '.env.dev' });
const redisclient = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});
redisclient.connect();




const getallUser = async (req,res)=>{
    let keyname='alluser';
    let cached=await redisclient.get(keyname);
    if(cached){
        return res.status(201).json(JSON.parse(cached));

    }
    else{

    try{
        const users= await db.query(
            `SELECT * FROM users`
           )
        redisclient.set(keyname,JSON.stringify((users.rows)),{EX:30});
        return res.status(201).json(users.rows);

    }catch(error){
         return res.status(501).json({message:"something went wrong"});
    }
 }
   
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
      
        if(groups.rows.length==0){
            return res.json({message:"no group present"});
        }
         const total_groups=[];
        //  console.log(groups.rows.length);
        for(let i=0;i<groups.rows.length;i++){
                  const currgroup=JSON.stringify(groups.rows[i].users_id);
                   for(let j=0;j<currgroup.length;j++){
                    // console.log(currgroup[j]);
                     if(id===parseInt(currgroup[j])){
                         total_groups.push(groups.rows[i]);
                         break;
                     }
                   }
        }
        
        redisclient.set(keyname,JSON.stringify((total_groups)),{EX:30});
        res.status(201).json(total_groups);
     }catch(error){
        console.log(error);
        res.status(500).json({message:"something went wrong"});
     }
     
    }
    
}

const signup=async(req,res)=>{


      const {name,email,password}=req.body;
      
      try{
         const existingUser= await db.query(
            `SELECT * FROM users WHERE email=$1`,[email]
         );
         if(existingUser.rows.length > 0){
            console.log(existingUser.rows)
            return res.status(400).json({message:"user already exist"});
         } 
         const hashedpassword=await bcryptjs.hash(password,10);
         
         
         const user=await db.query(
            `INSERT INTO users(name,email,password,total_amount,total_owe,total_owed) values($1,$2,$3,$4,$5,$6)`,[name,email,hashedpassword,0.0,0.0,0.0]
         );

       
         // Generate the token with Payload+SECRET_KEY
         const token=jwt.sign({
            email:user.email,id:user.user_id   // Payload create 
         },process.env.SECRET_KEY);
         res.status(201).json({
            result:token
         });
;
         
      } catch(error){
          console.log(error);
          res.status(500).json({message:"something went wrong"});
      }
}


const signin=async(req,res)=>{
    const { email, password } = req.body;
try {
   
   
   const existingUser = await db.query(
      `SELECT * FROM users WHERE email=$1`, [email]
  );
   
    if (existingUser.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    const existingCurrUser = existingUser.rows[0]
    // console.log(existingCurrUser);

    const updateUserFriend = await db.query(
        'update users set friend_list=$1 where user_id=$2',[JSON.stringify([existingCurrUser.user_id]),existingCurrUser.user_id]
     );
  
    bcryptjs.compare(password, existingCurrUser.password ,(err,result)=>{
        if(err){
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        else if (result) {
            const token = jwt.sign({
                email: existingCurrUser.email, id: existingCurrUser.user_id
            }, process.env.SECRET_KEY);
        
           return res.status(201).json({
              
                User:existingCurrUser,
                result: token,
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
const sendRequest=async(req,res)=>{
    const user=req.user_id;
    const friend=req.params.userId;
    try{
        const checkUser= await db.query(
            `SELECT * FROM users where user_id=$1`,[friend]
           );
           if(checkUser.rows.length===0){
             return res.status(404).json({message: "no user found"});
           }
           const userList= await db.query(
            `SELECT * FROM users where user_id=$1`,[user]
           );
           const friendlist=userList.rows[0].friend_list;
            for(let j=0;j<friendlist.length;j++){
              if(friend==parseInt(friendlist[j])){
                return res.status(404).json({message:"user already in friend list"});
              }  
        } 
         const friendrequest=await db.query(
        `insert into friendships (user1_id,user2_id) values($1,$2)`,[user,friend]
    );
   return  res.status(201).json({message:"friend request sent successfully"});


} catch(error){
     res.status(501).json({message:"internal server error"});
}
}
const acceptRequest=async(req,res)=>{
    try{
     const friend=req.params.userId;    
     const currentuser=await db.query(
        `select * from users where user_id=$1`,[req.user_id]
    )
    const currentuser1=await db.query(
        `select * from users where user_id=$1`,[friend]
    )
    let friendlist=currentuser.rows[0].friend_list;
    let friendlist1=currentuser1.rows[0].friend_list;
  
    friendlist.push(parseInt(friend));
    friendlist1.push(parseInt(req.user_id));
    console.log(friendlist);
    console.log(friendlist1);
    
     const updateFriendlist=await db.query(
        'update users set friend_list=$1 where user_id=$2',[JSON.stringify(friendlist),req.user_id]
     );

     const updateFriendlist1=await db.query(
        'update users set friend_list=$1 where user_id=$2',[JSON.stringify(friendlist1),friend]
     );

     
     const deleterequest=await db.query(
        `delete from friendships where user1_id=$1 and user2_id=$2`,[friend,req.user_id]
     );
     return res.status(201).json({message:"friend accept"});
   }
   catch(error){
     return res.status(501).json({message:"internal server error"});
   }
}
const getAllfriend=async(req,res)=>{
    let keyname='allfriends';
    let cached=await redisclient.get(keyname);
    if(cached){
        return res.status(201).json(JSON.parse(cached));
    }
    else{
      try{
         const friends=await db.query(
            `select * from users where user_id=$1`,[req.user_id]
         );
         redisclient.set(keyname,JSON.stringify((friends.rows[0].friend_list)),{EX:30});
         return res.status(201).json(friends.rows[0].friend_list);
      }
      catch(error){
        return res.status(501).json({message:"internal server error"});
      }
    }
}

const getrequestfriendList=async(req,res)=>{
    let keyname='friendfriends';
    let cached=await redisclient.get(keyname);
    if(cached){
        return res.status(201).json(JSON.parse(cached));
    }
    else{
        try{
            const friendrequest=await db.query(
               `select * from friendships where user2_id=$1`,[req.user_id]
            );
            redisclient.set(keyname,JSON.stringify((friendrequest.rows)),{EX:30});
            return res.status(201).json(friendrequest.rows);
        }
        catch(error){
             return res.status(501).json({message:"internal server error"});
        }
    }
    
}
    



















module.exports={
    getallUser,getallgroup,signup,signin,sendRequest,acceptRequest,getAllfriend,getrequestfriendList
}