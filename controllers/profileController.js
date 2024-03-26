// controllers/profileController.js
const userService = require('../services/profileService');
const bcryptjs = require('bcryptjs');

const updateInfo = async (req, res) => {
  const { name, email, password } = req.body;
  const id = req.user_id;

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Check if the new email already exists
    const emailList = await userService.getUserByEmail(email);

    if (emailList.rows.length > 0) {
      return res.status(400).json({ message: 'This email already exists. Please choose another one.' });
    }

    // Update user information
    const result = await userService.updateUser(id, name, email, hashedPassword);

    // if (result[0].affectedRows > 0) {
    //   res.status(201).json({ message: 'User data updated' });
    // } else {
    //   res.status(404).json({ message: 'User not found' });
    // }
    res.status(201).json({message:"user data updated"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = {
  updateInfo,
};
