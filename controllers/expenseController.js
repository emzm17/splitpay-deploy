// expenseController.js

const {
  getAllExpenses,
  getParticularExpense,
  getParticularGroupExpense,
  createExpense,
} = require("../services/expenseService");


const { apiError } = require('../utils/apiError');
const { apiResponse } = require('../utils/apiResponse');
const { expenseSchema } = require("../utils/validator");

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
      return res.status(404).json(new apiResponse([],"no expense found"));
    }

    return res.status(200).json(new apiResponse(particularExpense,"get particular expense"));
  } catch (error) {
    error.status=error.statusCode || 500
    res.status(error.status).json({
      message:error.message
    })
  }
};

const createExpenseController = async (req, res) => {
  try {
    const result=await expenseSchema.validateAsync(req.body)
    const message = await createExpense(
      result.amount,
      result.description,
      result.payer_id,
      result.group_id
    );
    res.status(201).json(new apiResponse(message,"new expense created"));
  } catch (error) {
    if(error)
    if(error.isJoi===true)error.status = 422
    else error.status=error.statusCode || 500
    res.status(error.status).json({
      message:error.message
    })
  }
};

module.exports = {
  getAllExpense,
  getParticularExpenseHandler,
  particularExpenseController,
  createExpenseController,
};
