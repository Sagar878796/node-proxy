const express = require("express");
const fetch = require("node-fetch");

const app = express();

const PORT = process.env.PORT || 3000;



// HOME
app.get("/", (req, res) => {
  res.send("Proxy running OK");
});



// PLAYLIST PROXY
app.get("/playlist", async (req, res) => {

  try {

    const playlistUrl =
      "https://raw.githubusercontent.com/Sagar878796/Stvlive/main/playlist.m3u";

    const response =
      await fetch(playlistUrl);

    if (!response.ok)
      return res.status(500)
        .send("Playlist fetch failed");

    const text =
      await response.text();

    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.apple.mpegurl"
    );

    res.send(text);

  }
  catch (err) {

    console.log(err);

    res.status(500)
      .send("Playlist error");

  }

});




// STREAM PROXY
app.get("/proxy", async (req, res) => {

  try {

    const streamUrl =
      req.query.url;

    if (!streamUrl)
      return res.status(400)
        .send("Missing URL");



    const response =
      await fetch(streamUrl, {

        headers: {

          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",

          "Referer":
            "https://www.hotstar.com/",

          "Origin":
            "https://www.hotstar.com"

        }

      });



    if (!response.ok)
      return res.status(500)
        .send("Stream fetch failed");



    const contentType =
      response.headers.get("content-type")
      || "application/vnd.apple.mpegurl";



    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    res.setHeader(
      "Content-Type",
      contentType
    );



    // PLAYLIST REWRITE
    if (contentType.includes("mpegurl")) {

      let text =
        await response.text();

      const base =
        streamUrl.substring(
          0,
          streamUrl.lastIndexOf("/") + 1
        );

      const host =
        req.protocol +
        "://" +
        req.get("host");



      text = text.replace(
        /^([^#][^\n]*)$/gm,
        (line) => {

          if (!line.trim())
            return line;

          if (line.startsWith("http"))
            return host +
              "/proxy?url=" +
              encodeURIComponent(line);

          return host +
            "/proxy?url=" +
            encodeURIComponent(base + line);

        }
      );



      res.send(text);

    }



    // VIDEO SEGMENT
    else {

      const buffer =
        await response.buffer();

      res.send(buffer);

    }



  }
  catch (err) {

    console.log(err);

    res.status(500)
      .send("Proxy error");

  }

});




// START SERVER
app.listen(PORT, () => {

  console.log(
    "Server running on port " + PORT
  );

});
