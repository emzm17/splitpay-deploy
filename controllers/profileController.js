const db = require("../database");
const bcryptjs = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const updateInfo = async (req, res) => {
  const { name, email, password } = req.body;
  const id = req.user_id; 

  const hashedpassword = await bcryptjs.hash(password, 10);
  try {
    const emailList=await db.query(
      `select * from users where email=$1`,[email]
    );
    if(emailList.rows.length>0){  
        return res.status(400).json({message:"this email already exist please choose another one"});
    }  
    const existingUser = await db.query(
      `UPDATE users SET name = $1,email = $2,password = $3  where user_id = $4`,
      [name, email, hashedpassword, id]
    );

    if (existingUser.rowCount > 0) {
      res.json({ message: "User data updated" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

module.exports = {
  updateInfo,
};
