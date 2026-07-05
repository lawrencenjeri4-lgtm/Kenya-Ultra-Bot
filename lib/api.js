const axios = require("axios");

module.exports = async function api(url) {

    const { data } = await axios.get(url);

    return data;

};
