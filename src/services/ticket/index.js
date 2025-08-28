const Ticket = require("../../models/Ticket");
const Servico = require("../../models/Servico");
const FiltersUtils = require("../../utils/pagination/filter");
const PaginationUtils = require("../../utils/pagination");
const { aprovar } = require("./aprovar");
const { reprovar } = require("./reprovar");
const TicketNaoEncontradoError = require("../errors/ticket/ticketNaoEncontrado");
const GenericError = require("../errors/generic");
const Arquivo = require("../../models/Arquivo");
const ServicoNaoEncontradoError = require("../errors/servico/servicoNaoEncontrado");
const { criarNomePersonalizado } = require("../../utils/formatters");
const ArquivoNaoEncontradoError = require("../errors/arquivo/arquivoNaoEncontradoError");
const EtapaService = require("../etapa");
const DocumentoFiscal = require("../../models/DocumentoFiscal");
const DocumentoFiscalNaoEncontradoError = require("../errors/documentoFiscal/documentoFiscalNaoEncontradaError");
const Comentario = require("../../models/Comentario");

const criar = async ({ ticket, usuario }) => {
  const etapas = await EtapaService.listarEtapasAtivasPorEsteira({
    esteira: "suporte",
  });

  return await Ticket.create({
    ...ticket,
    usuario_solicitante: usuario,
    etapa: etapas[0]?.codigo,
  });
};

const listar = async ({ time = 1, usuario }) => {
  const umDiaEmMilissegundos = 1000 * 60 * 60 * 24;

  const tickets = await Ticket.find({
    status: { $nin: ["arquivado"] },
    "usuario_solicitante._id": usuario?._id,
    updatedAt: {
      $gte: new Date(Date.now() - Number(time) * umDiaEmMilissegundos),
    },
  }).populate("arquivos", "-buffer");

  return tickets;
};

const atualizar = async ({ id, ticket }) => {
  const ticketAtualizado = await Ticket.findByIdAndUpdate(id, ticket, {
    new: true,
  });

  if (!ticketAtualizado) throw new TicketNaoEncontradoError();

  return ticketAtualizado;
};

const obterPorId = async ({ id }) => {
  const ticket = await Ticket.findById(id).populate("arquivos").populate({
    path: "comentarios",
    populate: "arquivos",
  });

  if (!ticket || !id) throw new TicketNaoEncontradoError();
  return ticket;
};

const excluir = async ({ id }) => {
  const ticket = await Ticket.findById(id);

  if (!ticket || !id) throw new TicketNaoEncontradoError();

  ticket.status = "arquivado";
  await ticket.save();
  return ticket;
};

const listarComPaginacao = async ({
  filtros,
  pessoaFiltros,
  searchTerm,
  pageIndex,
  pageSize,
}) => {
  const queryTicket = FiltersUtils.buildQuery({
    filtros,
    schema: Ticket.schema,
    searchTerm,
    camposBusca: ["titulo", "createdAt"],
  });

  const queryCombinada = {
    $and: [...queryTicket, { status: "arquivado" }],
  };

  const { page, skip, limite } = PaginationUtils.buildPaginationQuery({
    pageIndex,
    pageSize,
  });

  const [tickets, totalDeTickets] = await Promise.all([
    Ticket.find(queryCombinada).skip(skip).limit(limite),
    Ticket.countDocuments(queryCombinada),
  ]);

  return { tickets, totalDeTickets, page, limite };
};

const adicionarServico = async ({ ticketId, servicoId }) => {
  const servico = await Servico.findById(servicoId);
  const ticket = await Ticket.findById(ticketId);

  if (!servico) throw new ServicoNaoEncontradoError();
  if (!ticket) throw new TicketNaoEncontradoError();

  servico.statusProcessamento = "processando";
  await servico.save();

  ticket.servicos = [...ticket?.servicos, servico?._id];
  await ticket.save();

  const ticketPopulado = await Ticket.findById(ticket._id).populate("servicos");

  return ticketPopulado;
};

const removerServico = async ({ servicoId }) => {
  const servico = await Servico.findByIdAndUpdate(
    servicoId,
    { statusProcessamento: "aberto" },
    { new: true }
  );

  if (!servico) throw new ServicoNaoEncontradoError();

  const ticket = await Ticket.findOneAndUpdate(
    { servicos: servicoId }, // Busca o ticket que contém este serviço
    { $pull: { servicos: servicoId } }, // Remove o serviço do array
    { new: true }
  ).populate("servicos");

  if (!ticket) throw new TicketNaoEncontradoError();

  return ticket;
};

const adicionarArquivo = async ({ id, arquivos }) => {
  const ticket = await Ticket.findById(id);

  if (!ticket) throw new TicketNaoEncontradoError();
  if (!Array.isArray(arquivos) || arquivos.length === 0)
    throw new GenericError(
      "Nenhum arquivo enviado para adicionar ao ticket.",
      400
    );

  const arquivosSalvos = await Promise.all(
    arquivos.map(async (file) => {
      const arquivo = new Arquivo({
        nome: criarNomePersonalizado({ nomeOriginal: file.originalname }),
        nomeOriginal: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        ticket: ticket._id,
        buffer: file.buffer,
      });

      await arquivo.save();
      return arquivo;
    })
  );

  ticket.arquivos.push(...arquivosSalvos.map((a) => a._id));
  await ticket.save();
  return arquivosSalvos;
};

const adicionarComentario = async ({ mensagem, arquivos, id, usuario }) => {
  const ticket = await Ticket.findById(id);

  if (!ticket) throw new TicketNaoEncontradoError();

  const arquivosSalvos = await Promise.all(
    arquivos.map(async (file) => {
      const arquivo = new Arquivo({
        nome: criarNomePersonalizado({ nomeOriginal: file.originalname }),
        nomeOriginal: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      });

      await arquivo.save();
      return arquivo;
    })
  );

  const comentario = await Comentario.create({
    arquivos: arquivosSalvos.map((a) => a._id),
    mensagem,
    usuario,
  });

  ticket.comentarios.push(comentario._id);
  return await ticket.save();
};

const excluirComentario = async ({ ticketId, comentarioId }) => {
  const ticket = await Ticket.findById(ticketId).populate("comentarios");

  if (!ticket) {
    throw new TicketNaoEncontradoError();
  }

  const comentario = await Comentario.findById(comentarioId).populate(
    "arquivos"
  );

  if (!comentario) {
    throw new GenericError("Comentário não encontrado", 404);
  }

  for (const arquivo of comentario.arquivos) {
    try {
      await Arquivo.findByIdAndDelete(arquivo._id);
    } catch (err) {
      console.error("Erro ao remover arquivo:", err);
    }
  }

  await Comentario.findByIdAndDelete(comentarioId);

  ticket.comentarios = ticket.comentarios.filter(
    (cId) => cId.toString() !== comentarioId.toString()
  );

  return await ticket.save();
};

const removerArquivo = async ({ ticketId, arquivoId }) => {
  const arquivo = await Arquivo.findByIdAndDelete(arquivoId);
  if (!arquivo) throw new ArquivoNaoEncontradoError();

  const ticket = await Ticket.findByIdAndUpdate(ticketId, {
    $pull: { arquivos: arquivoId },
  });
  if (!ticket) throw new TicketNaoEncontradoError();

  return arquivo;
};

const listarTicketsPorEtapa = async () => {
  const pipeline = [
    { $match: { status: { $ne: "arquivado" } } },
    { $group: { _id: "$etapa", count: { $sum: 1 } } },
    { $project: { _id: 0, etapa: "$_id", count: 1 } },
  ];

  return await Ticket.aggregate(pipeline);
};

const listarTicketsPorStatus = async () => {
  const pipeline = [
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: 1 } },
  ];

  return await Ticket.aggregate(pipeline);
};

const adicionarDocumentoFiscal = async ({ ticketId, documentoFiscalId }) => {
  const documentoFiscal = await DocumentoFiscal.findById(documentoFiscalId);
  const ticket = await Ticket.findById(ticketId);

  if (!documentoFiscal) throw new DocumentoFiscalNaoEncontradoError();
  if (!ticket) throw new TicketNaoEncontradoError();

  documentoFiscal.statusPagamento = "processando";
  await documentoFiscal.save();

  ticket.documentosFiscais = [
    ...ticket?.documentosFiscais,
    documentoFiscal?._id,
  ];

  await ticket.save();

  const ticketPopulado = await Ticket.findById(ticket._id).populate(
    "documentosFiscais"
  );

  return ticketPopulado;
};

const removerDocumentoFiscal = async ({ documentoFiscalId }) => {
  const documentoFiscal = await DocumentoFiscal.findByIdAndUpdate(
    documentoFiscalId,
    { statusPagamento: "aberto" },
    { new: true }
  );

  if (!documentoFiscal) throw new DocumentoFiscalNaoEncontradoError();

  const ticket = await Ticket.findOneAndUpdate(
    { documentosFiscais: documentoFiscalId }, // Busca o ticket que contém este documento fiscal
    { $pull: { documentosFiscais: documentoFiscalId } }, // Remove o documento fiscal do array
    { new: true }
  ).populate("documentosFiscais");

  if (!ticket) throw new TicketNaoEncontradoError();

  return ticket;
};

module.exports = {
  criar,
  listar,
  aprovar,
  excluir,
  reprovar,
  atualizar,
  obterPorId,
  removerArquivo,
  removerServico,
  adicionarArquivo,
  adicionarServico,
  excluirComentario,
  listarComPaginacao,
  adicionarComentario,
  listarTicketsPorEtapa,
  listarTicketsPorStatus,
  removerDocumentoFiscal,
  adicionarDocumentoFiscal,
};
