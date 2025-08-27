const GenericError = require("../generic");

class AplicativoNaoEncontradoError extends GenericError {
  constructor() {
    super("Aplicativo não encontrado!", 404);
  }
}

module.exports = AplicativoNaoEncontradoError;
