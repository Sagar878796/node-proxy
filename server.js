const express = require("express");
const fetch = require("node-fetch");

const app = express();

const PORT = process.env.PORT || 3000;

// Home
app.get("/", (req, res) => {
  res.send("Proxy running OK");
});

// Playlist proxy
app.get("/playlist", async (req, res) => {
  try {

    const playlistUrl =
      "https://raw.githubusercontent.com/Sagar878796/Stvlive/main/playlist.m3u";

    const response = await fetch(playlistUrl);

    if (!response.ok) {
      return res.status(500).send("Failed to fetch playlist");
    }

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    res.send(text);

  } catch (err) {

    console.log(err);
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

    if (!response.ok) {
      return res.status(500).send("Stream fetch failed");
    }

    const contentType =
      response.headers.get("content-type") ||
      "application/vnd.apple.mpegurl";

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);

    // Rewrite m3u8 playlist
    if (contentType.includes("mpegurl")) {

      let text = await response.text();

      const base =
        streamUrl.substring(
          0,
          streamUrl.lastIndexOf("/") + 1
        );

      text = text.replace(
        /^([^#][^\n]*)$/gm,
        (line) => {

          if (line.startsWith("http")) {
            return `/proxy?url=${encodeURIComponent(line)}`;
          }

          return `/proxy?url=${encodeURIComponent(base + line)}`;

        }
      );

      res.send(text);

    } else {

      const buffer = await response.buffer();
      res.send(buffer);

    }

  } catch (err) {

    console.log(err);
    res.status(500).send("Proxy error");

  }

});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
