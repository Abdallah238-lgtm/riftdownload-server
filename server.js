const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());

app.get("/audio/:id", (req, res) => {
  const videoId = req.params.id;
  const command = `yt-dlp -f bestaudio -g https://www.youtube.com/watch?v=${videoId}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr.toString() });
    }
    const url = stdout.trim();
    return res.json({ url });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Servidor rodando na porta", port);
});
