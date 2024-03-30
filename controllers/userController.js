// controllers/userController.js
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await userService.getUserByEmail(email);
   

    if (existingUser.rows.length > 1) {
      return res.status(400).json({ message: 'user already exists' });
}
    const hashedPassword = await bcryptjs.hash(password, 10);
  
    const user = await userService.createUser(name, email, hashedPassword);
    

    const token = jwt.sign({ email: user.email, id: user.user_id }, process.env.SECRET_KEY);
    res.status(201).json({
      result: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'something went wrong' });
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const existingCurrUser = existingUser.rows[0]
    const updateUserFriend = await userService.updateFriendlist(([existingCurrUser.user_id]),existingCurrUser.user_id);
    bcryptjs.compare(password, existingCurrUser.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
      } else if (result) {
        const token = jwt.sign(
          {
            email: existingCurrUser.email,
            id: existingCurrUser.user_id,
          },
          process.env.SECRET_KEY
        );

        return res.status(201).json({
          user_id:existingCurrUser.user_id,
          name: existingCurrUser.name,
          email: existingCurrUser.email,  
          result: token,
        });
      } else {
        return res.status(401).json({ message: 'Authentication failed. Incorrect password.' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const allUser=async(req,res)=>{
  try{
     const getAlluser=await userService.getAlluser();
     let allUser=[];
     console.log(getAlluser.rows.length);
     for(let i=0;i<getAlluser.rows.length;i++){
       const tempUser=getAlluser.rows[i];
      const user={user_id:tempUser.user_id,name: tempUser.name,email:tempUser.email,friend_list:tempUser.friend_list}
       allUser.push(user);
     }
     res.status(200).json(allUser);
  }
  catch(error){
    res.status(500).json({ message: 'Something went wrong' });
  }
}

const specificUser=async(req,res)=>{
   try{
    const userId=req.params.userId
    const specUser=await userService.specificUser(userId);
    const tempUser=specUser.rows[0];
    const user={user_id:tempUser.user_id,name: tempUser.name,email:tempUser.email,friend_list:tempUser.friend_list}
    return res.status(201).json(user);    
   }catch(error){
    res.status(500).json({ message: 'Something went wrong' });
   }
}





module.exports = {
  signup,
  signin,
  allUser,
  specificUser
};

