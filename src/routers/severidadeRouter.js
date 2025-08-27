const express = require("express");
const SeveridadeController = require("../controllers/severidade");
const {
  registrarAcaoMiddleware,
} = require("../middlewares/registrarAcaoMiddleware");
const router = express.Router();
const { asyncHandler } = require("../utils/helpers");
const { ACOES, ENTIDADES } = require("../constants/controleAlteracao");
const { uploadExcel } = require("../config/multer");

router.get("/", asyncHandler(SeveridadeController.listar));
router.get("/todas", asyncHandler(SeveridadeController.listarTodasSeveridades));

router.post(
  "/",
  registrarAcaoMiddleware({
    acao: ACOES.ADICIONADO,
    entidade: ENTIDADES.SEVERIDADE,
  }),
  asyncHandler(SeveridadeController.criar)
);

router.get("/exportar", asyncHandler(SeveridadeController.exportar));
// router.get("/:id", asyncHandler(SeveridadeController.obterPorId));

router.patch(
  "/:id",
  registrarAcaoMiddleware({
    acao: ACOES.ALTERADO,
    entidade: ENTIDADES.SEVERIDADE,
  }),
  asyncHandler(SeveridadeController.atualizar)
);

router.delete(
  "/:id",
  registrarAcaoMiddleware({
    acao: ACOES.EXCLUIDO,
    entidade: ENTIDADES.SEVERIDADE,
  }),
  asyncHandler(SeveridadeController.excluir)
);

router.post(
  "/importar",
  uploadExcel.array("file"),
  asyncHandler(SeveridadeController.importarSeveridade)
);

module.exports = router;
