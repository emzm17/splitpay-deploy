const db = require("../utils/database");
const redisclient = require("../utils/redis");
const dotenv = require("dotenv");
dotenv.config();

// Function to fetch all expenses from the database
const getAllExpenses = async () => {
  const expense = await db.query(`SELECT * FROM expenses`);
  return expense.rows;
};

// Function to fetch expenses of a particular group from the database
const getParticularGroupExpense = async (id) => {
    const expense = await db.query(`SELECT * FROM expenses where group_id=$1`, [
      id,
    ]);
    return expense.rows;
};

// create expense
const createExpense = async (amount,description,payer,group_id) => {
  try {
    const groupQuery = `SELECT * FROM group_s WHERE id = $1`;
    const groupResult = await db.query(groupQuery, [group_id]);
    // console.log(groupResult.rows.length);
    if (groupResult.rows.length == 0) {
      throw new Error("No group present");
    }
    // console.log(amount,description,payer,group_id);
    const newExpenseQuery = `
      INSERT INTO expenses (amount, description,payer,group_id)
      VALUES ($1, $2, $3, $4)
    `;
    await db.query(newExpenseQuery, [amount, description,JSON.stringify(payer),group_id]);
    const payerUser=JSON.stringify(payer);
    // for (let i = 0; i < groupResult.rows.length; i++) {
      const currgroup = groupResult.rows[0].users;
      let sz = currgroup.length;

      // console.log(sz);
      const eachContribute = amount / sz;
      const eachContributeRound = eachContribute.toFixed(2);
      // console.log(eachContributeRound);
      const totalAmount = amount - eachContributeRound;
      const currentUserAmount = await db.query(
        `SELECT * from users where user_id =$1`,
        [payer[0].user_id]
      );
      

      const totalAmountUser = parseInt(currentUserAmount.rows[0].total_amount) + amount;
      const totalOwedUser=parseInt(currentUserAmount.rows[0].total_owed) + totalAmount;
      // console.log(currentUserAmount.rows[0].total_amount,currentUserAmount.rows[0].total_owed);

      const updateUserAmount = await db.query(
        "UPDATE users set total_amount=$1,total_owed=$2 where user_id=$3",
        [totalAmountUser, totalOwedUser, payer[0].user_id]
      );

      for (let j = 0; j < currgroup.length; j++) {
        if (payer[0].user_id != currgroup[j].user_id) {
          const currentUserOweAmount = await db.query(
            `SELECT * from users where user_id =$1`,
            [currgroup[j].user_id]
          );
          const owe=parseInt(currentUserOweAmount.rows[0].total_owe)+parseInt(eachContributeRound)
          // console.log(typeof owe);
          const youOwe = await db.query(
            `UPDATE users set total_owe=$1 where user_id=$2`,
            [owe,currgroup[j].user_id]
          );
        }
    }

    return { message: "new expense created" };
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong");
  }
};

// get particular expense
const getParticularExpense = async (id) => {
  const keyname = `getParticularexpense:${id}`; // Use a unique key per expense
  const cached = await redisclient.get(keyname);

  if (cached) {
    return JSON.parse(cached);
  } else {
    try {
      const expense = await db.query(
        `SELECT * FROM expenses WHERE expense_id = $1`,
        [id]
      );

      if (expense.rows.length == 0) {
        return null
      }

      const particularExpense = expense.rows[0];
      redisclient.set(keyname, JSON.stringify(particularExpense), { EX: 30 });
      return particularExpense;
    } catch (error) {
      console.error(error);
      throw new Error("Something went wrong while fetching the expense");
    }
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getParticularGroupExpense,
  getParticularExpense,
};
