// expenseController.js

const {
  getAllExpenses,
  getParticularExpense,
  getParticularGroupExpense,
  createExpense,
} = require("../services/expenseService");


const { apiError } = require('../utils/apiError');
const { apiResponse } = require('../utils/apiResponse');

// Handler for fetching all expenses
const getAllExpense = async (req, res) => {
  try {
    const expenses = await getAllExpenses();
    if (expenses.length < 1) {
      return res.status(404).json(new apiResponse([],"no expense found"));
    }
    return res.status(200).json(new apiResponse(expenses,"all expense"));
  } catch (error) {
    error.status=error.statusCode || 500
    res.status(error.status).json({
      message:error.message
    })
  }
};

// Handler for fetching expenses of a particular group
const getParticularExpenseHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const expenses = await getParticularGroupExpense(id);
    if (expenses.length === 0) {
      return res.status(404).json(new apiResponse([],"no expense found"));
    }
    return res.status(200).json(new apiResponse(expenses,"get particular expense"));
  } catch (error) {
    error.status=error.statusCode || 500
    res.status(error.status).json({
      message:error.message
    })
  }
};

const particularExpenseController = async (req, res) => {
  try {
    const id = req.params.id;
    const particularExpense = await getParticularExpense(id);

    if (!particularExpense) {
      return res.status(404).json({ message: "No expense found" });
    }

    return res.status(200).json(particularExpense);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const createExpenseController = async (req, res) => {
  try {
    const { amount, description, payer_id, group_id } = req.body;
    const message = await createExpense(
      amount,
      description,
      payer_id,
      group_id
    );
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getAllExpense,
  getParticularExpenseHandler,
  particularExpenseController,
  createExpenseController,
};
