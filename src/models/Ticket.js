const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    aplicativo: { type: mongoose.Schema.Types.ObjectId },
    usuario_solicitante: { type: { nome: String, email: String, _id: String } },
    prioridade: {
      type: String,
      enum: ["baixa", "media", "alta"],
      default: "baixa",
    },
    categoria: { type: String },
    assunto: { type: String },
    detalhamento: { type: String },
    etapa: { type: String },
    arquivos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Arquivo" }],
    severidade: { type: mongoose.Schema.Types.ObjectId, ref: "Severidade" },
    primeira_resposta_em: Date,
    ultima_interacao_em: Date,
    resolvido_em: Date,
    fechado_em: Date,
    status: {
      type: String,
      enum: ["trabalhando", "arquivado", "concluido"],
      default: "trabalhando",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
