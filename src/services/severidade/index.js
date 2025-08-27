const Severidade = require("../../models/Severidade");
const FiltersUtils = require("../../utils/pagination/filter");
const PaginationUtils = require("../../utils/pagination");
const SeveridadeNaoEncontradaError = require("../errors/severidade/severidadeNaoEncontrado");

const criar = async ({ severidade }) => {
  const novoSeveridade = new Severidade(severidade);
  await novoSeveridade.save();
  return novoSeveridade;
};

const atualizar = async ({ id, severidade }) => {
  const severidadeAtualizada = await Severidade.findByIdAndUpdate(
    id,
    severidade,
    { new: true }
  );

  if (!severidadeAtualizada) throw new SeveridadeNaoEncontradaError();
  return severidadeAtualizada;
};

// const buscarPorId = async ({ id }) => {
//   const severidade = await Severidade.findById(id);
//   if (!severidade || !id) throw new SeveridadeNaoEncontradaError();
//   return severidade;
// };

const excluir = async ({ id }) => {
  const severidade = await Severidade.findByIdAndDelete(id);
  return severidade;
};

const listarComPaginacao = async ({
  filtros,
  searchTerm,
  pageIndex,
  pageSize,
}) => {
  const [filters, or] = FiltersUtils.buildQuery({
    filtros,
    schema: Severidade.schema,
    searchTerm,
    camposBusca: [
      "titulo",
      "exemplo",
      "impacto",
      "tempo_horas_resposta",
      "tempo_resolucao_resposta",
    ],
  });

  const { page, limite, skip } = PaginationUtils.buildPaginationQuery({
    pageIndex,
    pageSize,
  });

  const [severidades, totalDeSeveridades] = await Promise.all([
    Severidade.find({
      $and: [filters, or, { status: { $ne: "arquivado" } }],
    })
      .skip(skip)
      .limit(limite),

    Severidade.countDocuments({
      $and: [filters, or, { status: { $ne: "arquivado" } }],
    }),
  ]);

  return {
    severidades,
    totalDeSeveridades,
    page,
    limite,
  };
};

const listarTodos = async () => {
  const severidades = await Severidade.find();
  return severidades;
};

// const valoresPorStatus = async () => {
//   const aggregationPipeline = [
//     // 1. Join com a coleção de moedas
//     {
//       $lookup: {
//         from: "moedas", // nome da collection no MongoDB
//         localField: "moeda",
//         foreignField: "_id",
//         as: "moedaInfo",
//       },
//     },

//     // 2. Desestrutura o array moedaInfo
//     {
//       $unwind: {
//         path: "$moedaInfo",
//         preserveNullAndEmptyArrays: true,
//       },
//     },

//     // ✅ 3. Ignora serviços arquivados
//     {
//       $match: {
//         status: { $ne: "arquivado" },
//       },
//     },

//     // 4. Calcula o valor real (valorMoeda * moeda.cotacao)
//     {
//       $addFields: {
//         valorCalculado: {
//           $multiply: [
//             { $ifNull: ["$valorMoeda", 0] },
//             { $ifNull: ["$moedaInfo.cotacao", 1] },
//           ],
//         },
//       },
//     },

//     // 5. Agrupa por status
//     {
//       $group: {
//         _id: "$status",
//         total: { $sum: "$valorCalculado" },
//         count: { $sum: 1 },
//       },
//     },

//     // 6. Projeta resultado final
//     {
//       $project: {
//         _id: 0,
//         status: "$_id",
//         total: 1,
//         count: 1,
//       },
//     },
//   ];

//   return await Severidade.aggregate(aggregationPipeline);
// };

// const adicionarCotacao = async ({ severidades }) => {
//   return severidades.map((severidade) => {
//     return {
//       ...severidade.toObject(),
//       valor:
//         severidade.valorMoeda *
//         (severidade.cotacao ? severidade.cotacao : severidade?.moeda?.cotacao ?? 1),
//     };
//   });
// };

// const fixarCotacao = async ({ severidades }) => {
//   return await Promise.all(
//     severidades.map(async (severidade) => {
//       severidade.cotacao = severidade?.moeda?.cotacao;
//       await severidade.save();

//       return {
//         ...severidade.toObject(),
//         valor: severidade.valorMoeda * severidade.cotacao,
//       };
//     })
//   );
// };

module.exports = {
  criar,
  excluir,
  atualizar,
  listarTodos,
  // buscarPorId,
  // fixarCotacao,
  // valoresPorStatus,
  // adicionarCotacao,
  listarComPaginacao,
};
