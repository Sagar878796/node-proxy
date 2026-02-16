const express = require("express");
const fetch = require("node-fetch");

const app = express();

const PORT = process.env.PORT || 10000;

// Home route
app.get("/", (req, res) => {
  res.send("Proxy running successfully");
});

// Playlist route
app.get("/playlist", async (req, res) => {
  try {
    const response = await fetch("https://raw.githubusercontent.com/Sagar878796/Stvlive/main/playlist.m3u");

    if (!response.ok) {
      return res.send("Failed to fetch playlist");
    }

    const data = await response.text();

    res.setHeader("Content-Type", "text/plain");
    res.send(data);

  } catch (error) {
    res.send("Error: " + error.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
