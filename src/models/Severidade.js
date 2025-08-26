const mongoose = require("mongoose");

const severidadeSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    impacto: { type: String, required: true },
    exemplo: { type: String, required: true },
    tempo_horas_resposta: { type: Number, required: true },
    tempo_resolucao_resposta: { type: Number, required: true },
    apenas_dia_util: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Sistema = mongoose.model("Severidade", severidadeSchema);

module.exports = Sistema;
