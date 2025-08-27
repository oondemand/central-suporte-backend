const axios = require("axios");

const listar = async ({ token }) => {
  const { data } = await axios.get(
    `${process.env.MEUS_APPS_BACKEND_URL}/aplicativos`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data.aplicativos;
};

module.exports = { listar };
