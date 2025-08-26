const { sendPaginatedResponse, sendResponse } = require("../../utils/helpers");
const SeveridadeService = require("../../services/severidade");
const SeveridadeExcel = require("../../services/severidade/excel");
const { arrayToExcelBuffer } = require("../../utils/excel");
const ImportacaoService = require("../../services/importacao");

const criar = async (req, res) => {
  const severidade = await SeveridadeService.criar({ severidade: req.body });
  sendResponse({ res, statusCode: 201, severidade });
};

const atualizar = async (req, res) => {
  const severidade = await SeveridadeService.atualizar({
    id: req.params.id,
    severidade: req.body,
  });
  sendResponse({ res, statusCode: 200, severidade });
};

const excluir = async (req, res) => {
  const severidadeExcluida = await SeveridadeService.excluir({
    id: req.params.id,
  });
  sendResponse({ res, statusCode: 200, severidade: severidadeExcluida });
};

// const obterPorId = async (req, res) => {
//   const severidade = await SeveridadeService.buscarPorId({ id: req.params.id });
//   return severidade;
// };

const listar = async (req, res) => {
  const { pageIndex, pageSize, searchTerm, ...rest } = req.query;
  const { limite, page, severidades, totalDeSeveridades } =
    await SeveridadeService.listarComPaginacao({
      filtros: rest,
      pageIndex,
      pageSize,
      searchTerm,
    });

  sendPaginatedResponse({
    res,
    statusCode: 200,
    results: severidades,
    pagination: {
      currentPage: page,
      itemsPerPage: limite,
      totalItems: totalDeSeveridades,
      totalPages: Math.ceil(totalDeSeveridades / limite),
    },
  });
};

const importarSeveridade = async (req, res) => {
  const importacao = await ImportacaoService.criar({
    arquivo: req.files[0],
    tipo: "severidade",
  });

  sendResponse({
    res,
    statusCode: 200,
    importacao,
  });

  const { arquivoDeErro, detalhes } = await SeveridadeExcel.importarSeveridade({
    arquivo: req.files[0],
    usuario: req.usuario,
  });

  importacao.arquivoErro = arrayToExcelBuffer({
    array: arquivoDeErro,
    title: "errors",
  });

  importacao.arquivoLog = Buffer.from(detalhes.errors);
  importacao.detalhes = detalhes;

  await importacao.save();
};

const exportar = async (req, res) => {
  const { pageIndex, pageSize, searchTerm, ...rest } = req.query;

  const { json } = await SeveridadeExcel.exportarSeveridade({
    filtros: rest,
    pageIndex,
    pageSize,
    searchTerm,
  });

  const buffer = arrayToExcelBuffer({ array: json, title: "exported" });

  sendResponse({
    res,
    statusCode: 200,
    buffer,
  });
};

// const listarSeveridadePorPessoa = async (req, res) => {
//   const severidades = await SeveridadeService.listarTodosPorPessoa({
//     pessoaId: req.params.pessoaId,
//   });

//   sendResponse({
//     res,
//     statusCode: 200,
//     severidades,
//   });
// };

module.exports = {
  listar,
  criar,
  atualizar,
  // obterPorId,
  excluir,
  exportar,
  importarSeveridade,
  // listarSeveridadePorPessoa,
};
