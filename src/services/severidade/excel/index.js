const { excelToJson } = require("../../../utils/excel.js");
const { registrarAcao } = require("../../controleService.js");
const {
  ACOES,
  ENTIDADES,
  ORIGENS,
} = require("../../../constants/controleAlteracao.js");
const { mapImporter } = require("./mapImporter.js");
const { mapExporter } = require("./mapExporter");
const Severidade = require("../../../models/Severidade.js");
const SeveridadeService = require("../../severidade");
// const Lista = require("../../../models/Lista.js");
// const Pessoa = require("../../../models/Pessoa");

// const criarNovoTipoDeSeveridade = async ({ tipo, usuario }) => {
//   const tipos = await Lista.findOne({ codigo: "tipo-severidade-tomado" });
//   const tipoExistente = tipos.data.some(
//     (e) => e?.valor?.trim() === tipo?.trim()
//   );

//   if (!tipoExistente) {
//     tipos.data.push({ valor: tipo?.trim() });
//     await tipos.save();

//     registrarAcao({
//       acao: ACOES.ADICIONADO,
//       entidade: ENTIDADES.CONFIGURACAO_LISTA_TIPO_SEVERIDADE_TOMADO,
//       origem: ORIGENS.IMPORTACAO,
//       dadosAtualizados: tipos,
//       idRegistro: tipos._id,
//       usuario: usuario,
//     });
//   }
// };

const criarNovaSeveridade = async ({ severidade, usuario }) => {
  const novaSeveridade = new Severidade(severidade);

  registrarAcao({
    acao: ACOES.ADICIONADO,
    entidade: ENTIDADES.SEVERIDADE,
    origem: ORIGENS.IMPORTACAO,
    dadosAtualizados: novaSeveridade,
    idRegistro: novaSeveridade._id,
    usuario: usuario,
  });

  await novaSeveridade.save();
  return novaSeveridade;
};

// const criarNovaPessoa = async ({ pessoa, usuario }) => {
//   const novaPessoa = new Pessoa(pessoa);

//   registrarAcao({
//     acao: ACOES.ADICIONADO,
//     entidade: ENTIDADES.PESSOA,
//     origem: ORIGENS.IMPORTACAO,
//     dadosAtualizados: novaPessoa,
//     idRegistro: novaPessoa._id,
//     usuario: usuario,
//   });

//   await novaPessoa.save();
//   return novaPessoa;
// };

// const buscarPessoaPorDocumento = async ({ documento }) => {
//   if (!documento) return null;

//   const pessoaExistente = await Pessoa.findOne({
//     documento,
//     status: { $ne: "arquivado" },
//   });

//   if (!pessoaExistente) return null;
//   return pessoaExistente;
// };

// const buscarSeveridadePorDocumentoEAtualizar = async ({
//   documento,
//   severidade,
//   usuario,
// }) => {
//   if (!documento || !severidade) return null;

//   const severidadeExistente = await Severidade.findOne({
//     documento,
//     status: { $ne: "arquivado" },
//   });
//   if (!severidadeExistente) return null;

//   const severidadeAtualizada = await Severidade.findByIdAndUpdate({
//     id: severidadeExistente._id,
//     severidade,
//   });

//   registrarAcao({
//     acao: ACOES.ALTERADO,
//     entidade: ENTIDADES.SEVERIDADE,
//     origem: ORIGENS.IMPORTACAO,
//     dadosAtualizados: severidadeAtualizada,
//     idRegistro: severidadeAtualizada._id,
//     usuario: usuario,
//   });

//   return severidadeAtualizada;
// };

const processarJsonSeveridades = async ({ json, usuario }) => {
  const detalhes = {
    totalDeLinhasLidas: json.length - 1,
    linhasLidasComErro: 0,
    novosSeveridades: 0,
    errors: "",
  };

  const arquivoDeErro = [];

  for (const [i, row] of json.entries()) {
    try {
      if (i === 0) {
        arquivoDeErro.push(row);
        continue;
      }

      const severidadeObj = await mapImporter({ row });

      // let pessoa = await buscarPessoaPorDocumento({
      //   documento: severidadeObj?.pessoa?.documento,
      // });

      // if (!pessoa) {
      //   pessoa = await criarNovaPessoa({
      //     pessoa: severidadeObj.pessoa,
      //     usuario,
      //   });
      // }

      // let severidade = await buscarSeveridadePorDocumentoEAtualizar({
      //   documento: severidadeObj?.documento,
      //   severidade: severidadeObj,
      //   usuario,
      // });

      // await criarNovoTipoDeSeveridade({ tipo: severidadeObj?.tipo, usuario });

      await criarNovaSeveridade({
        severidade: severidadeObj,
        usuario,
      });

      detalhes.novosSeveridades += 1;
    } catch (error) {
      arquivoDeErro.push(row);
      detalhes.linhasLidasComErro += 1;
      detalhes.errors += `❌ [ERROR AO PROCESSAR LINHA]: ${
        i + 1
      }  - \nDETALHES DO ERRO: ${error}\n\n`;
    }
  }

  return { detalhes, arquivoDeErro };
};

const importarSeveridade = async ({ arquivo, usuario }) => {
  const json = excelToJson({ arquivo });

  const { detalhes, arquivoDeErro } = await processarJsonSeveridades({
    json,
    usuario,
  });

  return { detalhes, arquivoDeErro };
};

const exportarSeveridade = async ({
  filtros,
  pageIndex,
  pageSize,
  searchTerm,
}) => {
  const { severidades } = await SeveridadeService.listarComPaginacao({
    filtros,
    pageIndex,
    pageSize,
    searchTerm,
  });

  const json = severidades.map((severidade) => {
    const newRow = {};

    Object.entries(mapExporter()).forEach(([header, key]) => {
      const accessor = key?.split(".") || [];
      const value = accessor.reduce((acc, curr) => acc?.[curr], severidade);
      newRow[header] = value ?? "";
    });

    return newRow;
  });

  return { json };
};

module.exports = {
  exportarSeveridade,
  importarSeveridade,
};
