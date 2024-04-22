const settlementService = require('../services/settlementService');
const { apiResponse } = require('../utils/apiResponse');

const settlement = async (req, res) => {
  const groupId = req.params.id;
  try {
    const result = await settlementService.settlement(groupId);
    res.status(200).json(new apiResponse("success",result,"successfully generated"));
  } catch (error) {
    error.status=error.statusCode
    res.status(error.status).json({
      status: "error",
      data: null,
      message:error.message
    })
  }
};

module.exports = {
  settlement,
};