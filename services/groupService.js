// services/groupService.js
const db = require('../database');
const redisClient=require('../utils/redis');
redisClient.connect()

const getAllUserGroups = async (userId) => {
  const keyName = 'getappGroups'+userId;
  const cached = await redisClient.get(keyName);
  if (cached) {
    return JSON.parse(cached);
  } else {
    try {
     const groups = await db.query('SELECT * FROM group_s');
      const allgroups=[];
      for(let i=0;i<groups.rows.length;i++){
         const currgroup=groups.rows[i];
            for(let j=0;j<currgroup.users.length;j++){
              // console.log(currgroup.users[j])
               if(currgroup.users[j].user_id==userId){
                allgroups.push(currgroup);
                break;
               }
            }
      }
      redisClient.set(keyName, JSON.stringify(allgroups), { EX: 30 });
      return allgroups
    } catch (error) {
      throw new Error('something went wrong');
    }
  }
};
const createGroup = async (name, users, createdBy) => {
  const ownUser=await db.query('select * from users where user_id=$1',[createdBy])
  const user={name:ownUser.rows[0].name,email:ownUser.rows[0].email,user_id:ownUser.rows[0].user_id}
  const updatedUsers = [...users, user];
    try {
      await db.query('INSERT INTO group_s (name,created_by,users) VALUES ($1, $2, $3)', [
        name,
        JSON.stringify(user),
        JSON.stringify(updatedUsers),
      ]);
      return { message: 'New group created' };
    } catch (error) {
      console.log(error);
      throw new Error('Something went wrong');
    }
  };

  const getAllgroups= async()=> {
  const keyName = 'getAllGroups';
  const cached = await redisClient.get(keyName);
  if (cached) {
    return JSON.parse(cached);
  } else {
      try{
         const groups= await db.query('SELECT * FROM group_s');
         redisClient.set(keyName, JSON.stringify(groups.rows), { EX: 30 });
         return groups.rows;
      }catch(error){
         throw new Error('Something went wrong');
      }
  }
}

  const getparticulargroup=async(id)=>{
    try{
        const groups= await db.query('SELECT * FROM group_s where id=$1',[id]);
        return groups.rows;
    }
    catch(error){
        throw new Error('Something went wrong');
    }
  }

module.exports = {
  getAllUserGroups,createGroup,getAllgroups,getparticulargroup
};
