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
       throw new apiError(404,"no expense found")
    }
    return res.status(200).json(new apiResponse("success",expenses,"all expense"));
  } catch (error) {
    res.status(error.status).json({
      status: "error",
      data: null,
      message:error.message
    })
  }
};

// Handler for fetching expenses of a particular group
const getParticularExpenseHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const expenses = await getParticularGroupExpense(id);
    if (expenses.length < 1) {
      throw new apiError(404,"no expense found")
    }
    return res.status(200).json(new apiResponse("success",expenses,"get particular group expense"));
  } catch (error) {
    error.status=error.statusCode || 500
    res.status(error.status).json({
      status: "error",
      data: null,
      message:error.message
    })
  }
};

const particularExpenseController = async (req, res) => {
  try {
    const id = req.params.id;
    const particularExpense = await getParticularExpense(id);

    if (!particularExpense) {
      throw new apiError(404,"no expense found")
    }

    return res.status(200).json(new apiResponse("success",particularExpense,"get particular expense"));
  } catch (error) {
    res.status(error.statusCode).json({
      status: "error",
      data: null,
      message:error.message
    })
  }
};

const createExpenseController = async (req, res) => {
  try {
    const { amount, description, payer, group_id } = req.body;
    const requestBody={amount:amount,description:description,payer:payer,group_id:group_id}
    const result=await expenseSchema.validateAsync(requestBody)
    const message = await createExpense(
      result.amount,
      result.description,
      result.payer,
      result.group_id
    );
    res.status(201).json(new apiResponse("success",message,"new expense created"));
  } catch (error) {
    if(error.isJoi===true)error.status = 422
    else error.status=error.statusCode || 500
    res.status(error.status).json({
      status: "error",
      data: null,
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
