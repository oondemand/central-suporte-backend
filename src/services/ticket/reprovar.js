const Ticket = require("../../models/Ticket");
const GenericError = require("../errors/generic");
const EtapaService = require("../etapa");

const reprovar = async ({ id }) => {
  const ticket = await Ticket.findById(id);

  const etapas = await EtapaService.listarEtapasAtivasPorEsteira({
    esteira: "suporte",
  });

  const etapaAtualIndex = etapas.findIndex((e) => e.codigo === ticket.etapa);

  if (etapaAtualIndex < 0) {
    throw new GenericError("Não foi possível reprovar ticket, etapa inválida");
  }

  ticket.etapa = etapas[etapaAtualIndex - 1].codigo;
  // ticket.status = "revisao";
  await ticket.save();

  return ticket;
};

module.exports = {
  reprovar,
};
