const db = require("../database");
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
  const keyname = "getexpense";
  const cached = await redisclient.get(keyname);

  if (cached) {
    return JSON.parse(cached);
  } else {
    const expense = await db.query(`SELECT * FROM expenses where group_id=$1`, [
      id,
    ]);
    redisclient.set(keyname, JSON.stringify(expense.rows), { EX: 30 });
    return expense.rows;
  }
};

// create expense
const createExpense = async (amount, description, payer_id, group_id) => {
  try {
    const groupQuery = `SELECT * FROM group_s WHERE id = $1`;
    const groupResult = await db.query(groupQuery, [group_id]);
    // console.log(groupResult.rows.length);
    if (groupResult.rows.length == 0) {
      throw new Error("No group present");
    }
    const newExpenseQuery = `
      INSERT INTO expenses (amount, description, payer_id, group_id)
      VALUES ($1, $2, $3, $4)
    `;
    await db.query(newExpenseQuery, [amount, description, payer_id, group_id]);

    // for (let i = 0; i < groupResult.rows.length; i++) {
      const currgroup = groupResult.rows[0].users_id;
      let sz = currgroup.length;

      // console.log(sz);
      const eachContribute = amount / sz;
      const eachContributeRound = eachContribute.toFixed(2);
      // console.log(eachContributeRound);
      const totalAmount = amount - eachContributeRound;
      const currentUserAmount = await db.query(
        `SELECT total_amount from users where user_id =$1`,
        [payer_id]
      );

      const totalAmountUser = parseInt(currentUserAmount.rows[0].total_amount) + amount;
      // console.log(currentUserAmount.rows[0].total_amount );

      const updateUserAmount = await db.query(
        "UPDATE users set total_amount=$1,total_owed=$2 where user_id=$3",
        [totalAmountUser, totalAmount, payer_id]
      );

      for (let j = 0; j < currgroup.length; j++) {
        if (payer_id != currgroup[j]) {
          const currentUserOweAmount = await db.query(
            `SELECT * from users where user_id =$1`,
            [currgroup[j]]
          );
          const owe=parseInt(currentUserOweAmount.rows[0].total_owe)+parseInt(eachContributeRound)
          // console.log(typeof owe);
          const youOwe = await db.query(
            `UPDATE users set total_owe=$1 where user_id=$2`,
            [owe,currgroup[j]]
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
        return null;
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
