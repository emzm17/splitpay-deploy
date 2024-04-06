// services/friendService.js
const db = require('../database');
const redisClient=require('../utils/redis');
const getFriendRequests = async (userId) => {
  const keyName = 'friendfriends';
  const cached = await redisClient.get(keyName);

  if (cached) {
    return JSON.parse(cached);
  } else {
    try {
      const friendRequests = await db.query('SELECT * FROM friendships WHERE user2_id = $1', [userId]);

      redisClient.set(keyName, JSON.stringify(friendRequests.rows), { EX: 30 });
      return friendRequests.rows;
    } catch (error) {
      console.log(error);
      throw new Error('internal server error');
    }
  }
};

const acceptFriendRequest = async (userId, friendId) => {
  try {
    const currentUser = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    const friendUser = await db.query('SELECT * FROM users WHERE user_id = $1', [friendId]);

    let friendlist=currentUser.rows[0].friend_list;
    let friendlist1=friendUser.rows[0].friend_list;

  
    friendlist.push(parseInt(friendId));
    friendlist1.push(parseInt(userId));


    await db.query('UPDATE users SET friend_list = $1 WHERE user_id = $2', [
      JSON.stringify(friendlist),
      userId,
    ]);
    await db.query('UPDATE users SET friend_list = $1 WHERE user_id = $2', [
      JSON.stringify(friendlist1),
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
  const keyName = 'allfriends';
  const cached = await redisClient.get(keyName);

  if (cached) {
    return JSON.parse(cached);
  } else {
    try {
      const friends = await db.query('SELECT * FROM users WHERE user_id =$1', [userId]);
      let friendlist=[]
      for(let i=0;i<friends.rows[0].friend_list.length;i++){
         const friendID=friends.rows[0].friend_list[i];
         if(friendID!=userId){
            const user=await db.query('select * from users where user_id=$1',[friendID])
            const currUser=user.rows[0];
            const modifiedUsers ={
                user_id: currUser.user_id,
                name: currUser.name,
                email: currUser.email
            };
            
            friendlist.push(modifiedUsers);
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

const sendFriendRequest = async (userId, friendId) => {
  try {
    const checkUser = await db.query('SELECT * FROM users WHERE user_id = $1', [friendId]);

    if (checkUser.rows.length == 0) {
      return { message: 'no user found' };
    }

    const userList = await db.query('SELECT * FROM friendships WHERE user1_id = $1 AND user2_id = $2', [userId,friendId]);
//     console.log(userList.rows[0]);
    // const friendList = userList.rows[0].friend_list;

    if(userList.rows.length>0){
       return {message:'already sent friend request'}
    }
    await db.query('INSERT INTO friendships (user1_id, user2_id) VALUES ($1, $2)', [
      userId,
      friendId,
    ]);

    return { message: 'friend request sent successfully' };
  } catch (error) {
    console.log(error);
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
  friendUpdate
};
