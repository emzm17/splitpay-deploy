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
// const friendUpdate = async (userIds) => {
//   try {
//     await db.query('update users set friend_list=? where user_id=?', [
//       JSON.stringify(userIds),
//       userIds[0], // Assuming the first element of the array is the user_id
//     ]);

//     return { message: 'Friend list updated successfully' };
//   } catch (error) {
//     console.error(error);
//     throw new Error('Error updating friend list');
//   }
// };

const specificUser=async(userId)=>{
  try {
     const specUser= await db.query(`select * from users where user_id=$1`, [
       userId
    ]);

    return specUser;
  } catch (error) {
    console.error(error);
    throw new Error('No user present');
  }
}

const getAlluser=async=>{
   try{
    const allUser=db.query('select * from users')
    return allUser
   }catch(error){
     throw new Error('something went wrong')
   }
   
}
module.exports = {
  getUserByEmail,
  createUser,
  getAlluser,
  specificUser
};
