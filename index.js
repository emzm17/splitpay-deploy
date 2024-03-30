const express = require("express");
const bodyparser=require('body-parser');
const dotenv = require("dotenv");
dotenv.config({ path: '.env.prod' });
const path = require('path');
const app = express();
const PORT = process.env.PORT
app.use(express.json()); // request body convert into Json 


const userRouter = require("./routes/userRouter");
const groupRouter = require("./routes/groupRouter");
const expensesRouter = require("./routes/expensesRouter");
const settlementRouter = require("./routes/settlementRouter");  
const friendRouter=require('./routes/friendRouter');
const profileRouter = require("./routes/profileRouter");

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

 app.use("/users", userRouter);
 app.use("/groups", groupRouter);
 app.use("/expenses", expensesRouter);
 app.use("/settlement", settlementRouter);
 app.use("/profile", profileRouter);
 app.use("/friends",friendRouter);




app.listen(PORT, () => {
  console.log("server is running at port no 8080");
});
