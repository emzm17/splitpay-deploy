// services/friendService.js
const db = require('../database');
const redisClient=require('../utils/redis');


const getFriendRequests = async (userId) => {
    try {
      const friendRequests = await db.query('SELECT * FROM friendships WHERE user2_id = $1', [userId]);
      let friend=[]
      for(let i=0;i<friendRequests.rows.length;i++){
             const userid=friendRequests.rows[i].user1_id
             const friendrequest=await db.query('select * from users where user_id=$1',[userid])
             const User={
                user_id:friendrequest.rows[0].user_id,
                email:friendrequest.rows[0].email,
                name:friendrequest.rows[0].name
             }
             friend.push(User)
      }
      return friend;
    } catch (error) {
      console.log(error);
      throw new Error('internal server error');
    }
};

const acceptFriendRequest = async (userId, friendId) => {
  try {
    const currentUser = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    const friendUser = await db.query('SELECT * FROM users WHERE user_id = $1', [friendId]);

    let friendlist1=[]
    if(currentUser.rows[0].friend_list==null){
             const friend={
                    user_id:friendUser.rows[0].user_id,
                    name:friendUser.rows[0].name,
                    email:friendUser.rows[0].email
             }
            
             friendlist1.push(friend)
    }
    else{
      const friend={
        user_id:friendUser.rows[0].user_id,
        name:friendUser.rows[0].name,
        email:friendUser.rows[0].email
    }
    friendlist1 = [...currentUser.rows[0].friend_list];
    friendlist1.push(friend)

    }
    let friendlist2=[]
    if(friendUser.rows[0].friend_list==null){
      const friend={
             user_id:currentUser.rows[0].user_id,
             name:currentUser.rows[0].name,
             email:currentUser.rows[0].email
      }
     
      friendlist2.push(friend)
    }
    else{
      const friend={
             user_id:currentUser.rows[0].user_id,
             name:currentUser.rows[0].name,
             email:currentUser.rows[0].email
      }
      friendlist2 = [...friendUser.rows[0].friend_list];
      friendlist2.push(friend)
    }

    // console.log(friendlist1,friendlist2)
    await db.query('UPDATE users SET friend_list = $1 WHERE user_id = $2', [
      JSON.stringify(friendlist1),
      userId,
    ]);
    await db.query('UPDATE users SET friend_list = $1 WHERE user_id = $2', [
      JSON.stringify(friendlist2),
      friendId,
    ]);

    await db.query('DELETE FROM friendships WHERE user1_id = $1 AND user2_id = $2', [
      friendId,
      userId,
    ]);

    return { message: 'friend accept' };
  } catch (error) {
    console.log(error);
    throw new Error('internal server error');
  }
};

const getAllFriends = async (userId) => {
  const keyName = 'getallfriends'+userId;
  const cached = await redisClient.get(keyName);
  if (cached) {
    return JSON.parse(cached);
  } else {
    try {
      const friends = await db.query('SELECT * FROM users WHERE user_id =$1', [userId]);
      let friendlist=[]
      if(friends.rows[0].friend_list!=null){
      for(let i=0;i<friends.rows[0].friend_list.length;i++){
         const friend=friends.rows[0].friend_list[i]
            friendlist.push(friend);
         }
      }
      redisClient.set(keyName, JSON.stringify(friendlist), { EX: 30 });
      return friendlist;
    } catch (error) {
      console.log(error);
      throw new Error('internal server error');
    }
  }
};

const checkUser= async(friendId)=>{
 return await db.query('SELECT * FROM users WHERE user_id = $1', [friendId]);
}


const checkRequest=async(userId,friendId)=>{
  return await db.query('SELECT * FROM friendships WHERE user1_id = $1 AND user2_id = $2', [userId,friendId]);
}

const sendFriendRequest = async (userId, friendId) => {
  try {
    const user1=await db.query('select * from users where user_id=$1',[userId])
    const user2=await db.query('select * from users where user_id=$1',[friendId]);
    const sender={name:user1.rows[0].name,email:user1.rows[0].email,user_id:user1.rows[0].user_id}
    const recevier={name:user2.rows[0].name,email:user2.rows[0].email,user_id:user2.rows[0].user_id}
    await db.query('INSERT INTO friendships (user1_id,user2_id,user1, user2) VALUES ($1, $2,$3,$4)', [
      userId,
      friendId,
      JSON.stringify(sender),
      JSON.stringify(recevier)
    ]);
    return { message: 'friend request sent successfully' };
  } catch (error) {
    throw new Error('internal server error');
  }
};
const friendUpdate=async (friendlist,user_id)=>{
  return db.query('update users set friend_list=? where user_id=?', [
    friendlist,
    user_id,
  ]);
}

module.exports = {
  getFriendRequests,
  acceptFriendRequest,
  getAllFriends,
  sendFriendRequest,
  friendUpdate,
  checkUser,
  checkRequest
};
