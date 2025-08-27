const express = require("express");
const router = express.Router();
const Helpers = require("../utils/helpers");

router.get(
  "/",
  Helpers.asyncHandler(async (req, res) => {
    const options = [
      { label: "Solicitante", value: "padrao" },
      { label: "Agente", value: "agente" },
      { label: "Admin", value: "admin" },
    ];

    Helpers.sendResponse({
      res,
      statusCode: 200,
      options,
    });
  })
);

module.exports = router;
