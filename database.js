const pool=require('pg').Pool
const dotenv = require("dotenv");
dotenv.config({ path: '.env.prod' });

const connection = new pool({
   host: process.env.DB_HOST,
   user: process.env.DB_user,
   password:process.env.DB_password,
   database:process.env.DB_database,
   port: process.env.DB_PORT,
   ssl:{}
   
})



console.log("Connecting to database");

module.exports = connection;
