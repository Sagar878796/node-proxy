const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;


// Home
app.get("/", (req, res) => {
  res.send("Proxy running");
});


// Playlist proxy
app.get("/playlist", async (req, res) => {

  try {

    const url =
      "https://raw.githubusercontent.com/Sagar878796/Stvlive/main/playlist.m3u";

    const response = await fetch(url);
    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    res.send(text);

  } catch {

    res.send("Playlist error");

  }

});


// Stream proxy with rewrite
app.get("/proxy", async (req, res) => {

  try {

    const url = req.query.url;

    if (!url) {
      return res.send("Missing URL");
    }

    const response = await fetch(url, {

      headers: {

        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",

        "Referer": "https://www.hotstar.com/",

        "Origin": "https://www.hotstar.com"

      }

    });

    const contentType = response.headers.get("content-type");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);


    // If m3u8 playlist → rewrite URLs
    if (contentType.includes("mpegurl")) {

      let text = await response.text();

      const base = url.substring(0, url.lastIndexOf("/") + 1);

      text = text.replace(
        /^([^#][^\n]*)$/gm,
        (line) => {

          if (line.startsWith("http")) {

            return `/proxy?url=${encodeURIComponent(line)}`;

          } else {

            return `/proxy?url=${encodeURIComponent(base + line)}`;

          }

        }
      );

      res.send(text);

    } else {

      // send video segment
      const buffer = await response.buffer();
      res.send(buffer);

    }

  } catch (err) {

    console.log(err);
    res.send("Proxy error");

  }

});


app.listen(PORT, () => {

  console.log("Server running on port " + PORT);

});
