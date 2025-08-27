const express = require("express");
const router = express.Router();

const AplicativoController = require("../controllers/aplicativo");
const { asyncHandler } = require("../utils/helpers");

router.get("/", asyncHandler(AplicativoController.listarTodos));

module.exports = router;
