const mapImporter = async ({ row }) => {
  const severidade = {
    titulo: row[0],
    impacto: row[1],
    exemplo: row[2],
    tempo_horas_resposta: row[3],
    tempo_resolucao_resposta: row[4],
    apanas_dia_util: row[5],
  };

  return severidade;
};

module.exports = { mapImporter };
