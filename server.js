const express = require("express");
const fetch = require("node-fetch");

const app = express();

const PORT = process.env.PORT || 3000;


// Playlist proxy
app.get("/playlist", async (req, res) => {

  try {

    const response = await fetch(
      "https://raw.githubusercontent.com/Sagar878796/Stvlive/main/playlist.m3u"
    );

    const text = await response.text();

    res.setHeader("Content-Type", "text/plain");

    res.send(text);

  } catch (err) {

    res.status(500).send("Playlist error");

  }

});



// Stream proxy (FIXED VERSION)
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

    if (!response.ok) {

      return res.status(response.status).send("Stream fetch failed");

    }

    const buffer = await response.buffer();

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/vnd.apple.mpegurl"
    );

    res.send(buffer);

  } catch (err) {

    console.log(err);

    res.status(500).send("Proxy error");

  }

});



app.get("/", (req, res) => {

  res.send("Proxy running");

});


app.listen(PORT, () => {

  console.log("Server running");

});
