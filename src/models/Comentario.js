const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema(
  {
    usuario: { type: { nome: String, email: String, _id: String } },
    mensagem: String,
    arquivos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Arquivo" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comentario", comentarioSchema);
