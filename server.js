const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", async (req, res) => {

  const target = req.query.url;

  if (!target) {
    return res.send("Proxy working. Use ?url=");
  }

  try {

    const response = await axios({
      method: "get",
      url: target,
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": target,
        "Origin": target
      }
    });

    res.setHeader("Access-Control-Allow-Origin", "*");

    response.data.pipe(res);

  } catch (error) {
    res.send("Error: " + error.message);
  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Proxy running");
});
