const GenericError = require("../generic");

class SeveridadeNaoEncontradoError extends GenericError {
  constructor() {
    super("Severidade não encontrada!", 404);
  }
}

module.exports = SeveridadeNaoEncontradoError;
