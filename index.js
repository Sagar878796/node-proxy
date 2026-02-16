const express = require("express");
const fetch = require("node-fetch");
const app = express();

const PORT = process.env.PORT || 10000;

const PLAYLIST = "https://raw.githubusercontent.com/Sagar878796/Stvlive/main/playlist.m3u";

app.get("/", (req, res) => {
  res.send("Proxy running");
});

app.get("/playlist", async (req, res) => {
  try {
    const response = await fetch(PLAYLIST);
    const text = await response.text();

    const modified = text.replace(/https?:\/\/[^\s]+/g, url =>
      `https://node-proxy-ys4g.onrender.com/proxy?url=${encodeURIComponent(url)}`
    );

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(modified);

  } catch {
    res.send("Playlist error");
  }
});

app.get("/proxy", async (req, res) => {
  try {
    const url = req.query.url;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    res.setHeader("Content-Type", response.headers.get("content-type"));
    response.body.pipe(res);

  } catch {
    res.send("Proxy error");
  }
});

app.listen(PORT, () => console.log("Proxy running"));
