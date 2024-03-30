// services/groupService.js
const db = require('../database');
const redisClient=require('../utils/redis');
redisClient.connect()

const getAllUserGroups = async (userId) => {
  const keyName = 'getappGroups';
  const cached = await redisClient.get(keyName);

  if (cached) {
    return JSON.parse(cached);
  } else {
    try {
     const groups = await db.query('SELECT * FROM group_s');
      if (groups.rows.length == 0) {
        return { message: 'no group present' };
      }
    
      // console.log(groups.rows);
      const allgroups=[];
      for(let i=0;i<groups.rows.length;i++){
         const currgroup=groups.rows[i];
            for(let j=0;j<currgroup.users_id.length;j++){
               if(currgroup.users_id[j]==userId){
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
const createGroup = async (name, usersId, createdBy) => {
  const updatedUsersId = [...usersId, createdBy];
    try {
      await db.query('INSERT INTO group_s (name, users_id, created_by) VALUES ($1, $2, $3)', [
        name,
        JSON.stringify(updatedUsersId),
        createdBy,
      ]);
      return { message: 'New group created' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  };


  const getAllgroups= async()=> {
      try{
         const groups= await db.query('SELECT * FROM group_s');
        //  console.log(groups[0]);
         if(groups.rows.length == 0)
         return {message:"no group present"}
         return groups.rows;
        
      }catch(error){
         throw new Error('Something went wrong');
      }
  }

  const getparticulargroup=async(id)=>{
    try{
        const groups= await db.query('SELECT * FROM group_s where id=$1',[id]);
        //  console.log(groups[0]);
         if(groups.rows.length == 0)
         return {message:"no group present"}
         
         return groups.rows;
        
    }
    catch(error){
        throw new Error('Something went wrong');
    }
  }

module.exports = {
  getAllUserGroups,createGroup,getAllgroups,getparticulargroup
};
