// services/userService.js
const db = require('../database');
const bcryptjs = require('bcryptjs');

const getUserByEmail = async (email) => {
  return db.query('SELECT * FROM users WHERE email = $1', [email]);
};

const createUser = async (name, email, hashedPassword) => {
  return db.query('INSERT INTO users(name, email, password, total_Amount, total_Owe, total_Owed) VALUES ($1, $2, $3, $4, $5, $6)', [
    name,
    email,
    hashedPassword,
    0,
    0,
    0,
  ]);
};

const specificUser=async(userId)=>{
  try {
     const specUser= await db.query(`select * from users where user_id=$1`, [
       userId
    ]);

    return specUser;
  } catch (error) {
    console.error(error);
    throw new Error('something went wrong');
  }
}

const getAlluser=async(userId)=>{
   try{
    const allUser=await db.query('select * from users')
    const specificUser=await db.query(`select * from users where user_id=$1`, [
      userId
   ]);
   const users=[]
   let friendMap={}
   for(let i=0;i<specificUser.rows[0].friend_list.length;i++){
           const friendUser=specificUser.rows[0].friend_list[i]
           friendMap[friendUser.email]=true
   }
   console.log(friendMap);
   for(let i=0;i<allUser.rows.length;i++){
         const user=allUser.rows[i]
         if(!friendMap.hasOwnProperty(user.email) && user.user_id!=userId){
           users.push(user)
         }
   }
    return users
   }catch(error){
     throw new Error('something went wrong')
   }
   
}
const updateFriendlist=async(friendlist,userid)=>{
   return db.query(
    'update users set friend_list=$1 where user_id=$2',[JSON.stringify(friendlist),userid]
   )
}

async function comparePasswords(password, hashedPassword) {
  return new Promise((resolve, reject) => {
    bcryptjs.compare(password, hashedPassword, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}


module.exports = {
  getUserByEmail,
  createUser,
  getAlluser,
  specificUser,
  updateFriendlist,
  comparePasswords
};
