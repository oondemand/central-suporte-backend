const mapExporter = () => {
  const servico = {
    Titulo: "titulo",
    Impacto: "impacto",
    Exemplo: "exemplo",
    "Tempo resposta (horas)": "tempo_horas_resposta",
    "Tempo resolução (horas)": "tempo_resolucao_resposta",
    "Apenas dias uteis": "apenas_dia_util",
  };

  return servico;
};

module.exports = { mapExporter };
