const AplicativoService = require("../../services/aplicativo");
const Helpers = require("../../utils/helpers");

const listarTodos = async (req, res) => {
  const aplicativos = await AplicativoService.listar({
    usuario: req.usuario,
    token: req.token,
  });

  Helpers.sendResponse({ res, statusCode: 200, aplicativos });
};

module.exports = { listarTodos };
