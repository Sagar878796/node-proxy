const express = require("express");
const fetch = require("node-fetch");

const app = express();

const PORT = process.env.PORT || 3000;


// Home route
app.get("/", (req, res) => {
  res.send("Proxy running");
});


// Playlist proxy
app.get("/playlist", async (req, res) => {

  try {

    const response = await fetch(
      "https://raw.githubusercontent.com/Sagar878796/Stvlive/main/playlist.m3u"
    );

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");

    res.setHeader(
      "Content-Type",
      "application/vnd.apple.mpegurl"
    );

    res.send(text);

  } catch {

    res.status(500).send("Playlist error");

  }

});


// Stream proxy
app.get("/proxy", async (req, res) => {

  try {

    const streamUrl = req.query.url;

    if (!streamUrl) {
      return res.status(400).send("Missing URL");
    }

    const response = await fetch(streamUrl, {

      headers: {

        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",

        "Referer": "https://www.hotstar.com/",

        "Origin": "https://www.hotstar.com"

      }

    });

    const buffer = await response.buffer();

    res.setHeader("Access-Control-Allow-Origin", "*");

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") ||
      "application/vnd.apple.mpegurl"
    );

    res.send(buffer);

  } catch (err) {

    console.log(err);

    res.status(500).send("Proxy error");

  }

});


// Start server
app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
