const express = require("express");
const {
  getAllExpense,
  getParticularExpenseHandler,
  particularExpenseController,
  createExpenseController,
} = require("../controllers/expenseController");
const auth = require("../middleware/auth");
const expensesRouter = express.Router();

// get all expense from table
expensesRouter.get("/", auth, getAllExpense);

// get all expense from particular group id
expensesRouter.get("/:id", auth, getParticularExpenseHandler);
// create the a expense
expensesRouter.post("/create", auth, createExpenseController);

// get particular expense from expenses
expensesRouter.get("/particular/:id", auth, particularExpenseController);

module.exports = expensesRouter;
