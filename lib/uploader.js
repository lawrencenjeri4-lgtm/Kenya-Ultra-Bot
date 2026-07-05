const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function upload(file) {

    const form = new FormData();

    form.append("file", fs.createReadStream(file));

    const { data } = await axios.post(
        "https://catbox.moe/user/api.php",
        form,
        {
            headers: form.getHeaders()
        }
    );

    return data;

}

module.exports = {
    upload
};
