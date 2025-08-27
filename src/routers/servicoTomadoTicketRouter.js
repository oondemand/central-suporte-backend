const express = require("express");
const router = express.Router();
const Ticket = require("../controllers/ticket");
const multer = require("multer");
const {
  registrarAcaoMiddleware,
} = require("../middlewares/registrarAcaoMiddleware");
const { ACOES, ENTIDADES } = require("../constants/controleAlteracao");
const { asyncHandler } = require("../utils/helpers");
const storage = multer.memoryStorage({});

const fileFilter = (req, file, cb) => {
  return cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 }, // Limite de 1MB por arquivo
});

router.post(
  "/:id/upload",
  upload.array("arquivos", 10),
  asyncHandler(Ticket.anexarArquivos)
);

router.delete("/arquivo/:ticketId/:id", asyncHandler(Ticket.removerArquivo));

// router.get("/:id/arquivos", Ticket.listFilesFromTicket);
// router.get("/arquivo/:id", Ticket.getArquivoPorId);

router.post(
  "/",
  registrarAcaoMiddleware({
    acao: ACOES.ADICIONADO,
    entidade: ENTIDADES.SERVICO_TOMADO_TICKET,
  }),
  asyncHandler(Ticket.createTicket)
);

router.get("/", asyncHandler(Ticket.getAllTickets));
router.get("/arquivados", asyncHandler(Ticket.getArchivedTickets));

// router.get("/pagos", Ticket.getTicketsPago);
// router.get(
//   "/usuario-prestador/:usuarioId",
//   Ticket.getTicketsByUsuarioPrestador
// );
// router.get("/:id", Ticket.getTicketById);

router.post(
  "/arquivar/:id",
  registrarAcaoMiddleware({
    acao: ACOES.ARQUIVADO,
    entidade: ENTIDADES.SERVICO_TOMADO_TICKET,
  }),
  asyncHandler(Ticket.excluir)
);

router.patch(
  "/:id",
  registrarAcaoMiddleware({
    acao: ACOES.ALTERADO,
    entidade: ENTIDADES.SERVICO_TOMADO_TICKET,
  }),
  asyncHandler(Ticket.updateTicket)
);

router.post(
  "/:id/aprovar",
  registrarAcaoMiddleware({
    acao: ACOES.APROVADO,
    entidade: ENTIDADES.SERVICO_TOMADO_TICKET,
  }),
  asyncHandler(Ticket.aprovar)
);

router.post(
  "/:id/reprovar",
  registrarAcaoMiddleware({
    acao: ACOES.REPROVADO,
    entidade: ENTIDADES.SERVICO_TOMADO_TICKET,
  }),
  asyncHandler(Ticket.reprovar)
);

// router.delete(
//   "/:id",
//   registrarAcaoMiddleware({
//     acao: ACOES.DELETADO,
//     entidade: ENTIDADES.SERVICO_TOMADO_TICKET,
//   }),
//   Ticket.deleteTicket
// );

router.post(
  "/adicionar-servico/:ticketId/:servicoId/",
  registrarAcaoMiddleware({
    acao: ACOES.ALTERADO,
    entidade: ENTIDADES.SERVICO_TOMADO_TICKET,
  }),
  asyncHandler(Ticket.adicionarServico)
);

router.post(
  "/remover-servico/:servicoId",
  registrarAcaoMiddleware({
    acao: ACOES.ALTERADO,
    entidade: ENTIDADES.SERVICO_TOMADO_TICKET,
  }),
  asyncHandler(Ticket.removerServico)
);

router.post(
  "/adicionar-documento-fiscal/:ticketId/:documentoFiscalId/",
  registrarAcaoMiddleware({
    acao: ACOES.ALTERADO,
    entidade: ENTIDADES.SERVICO_TOMADO_TICKET,
  }),
  asyncHandler(Ticket.addDocumentoFiscal)
);

router.post(
  "/remover-documento-fiscal/:documentoFiscalId",
  registrarAcaoMiddleware({
    acao: ACOES.ALTERADO,
    entidade: ENTIDADES.SERVICO_TOMADO_TICKET,
  }),
  asyncHandler(Ticket.removeDocumentoFiscal)
);

router.get("/:id", asyncHandler(Ticket.obterTicket));

module.exports = router;
