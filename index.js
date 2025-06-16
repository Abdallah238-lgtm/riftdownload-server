const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const MAX_VIDEO_LENGTH = 600; // 10 minutos
const TEMP_FOLDER = path.join(__dirname, 'downloads');

if (!fs.existsSync(TEMP_FOLDER)) fs.mkdirSync(TEMP_FOLDER);

// Página inicial
app.get('/', (req, res) => {
  res.send(`<h1>Servidor OK</h1>`);
});

// Rota para baixar áudio MP3
app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('URL do vídeo ausente.');

  const output = path.join(TEMP_FOLDER, `audio_${Date.now()}.mp3`);
  const cmd = `yt-dlp -x --audio-format mp3 --max-downloads 1 --no-playlist -o "${output}" "${videoUrl}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).send('Erro ao baixar áudio.');
    }

    res.download(output, 'audio.mp3', (err) => {
      fs.unlinkSync(output); // Apaga após envio
    });
  });
});

// Rota para baixar vídeo MP4
app.get('/video', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('URL do vídeo ausente.');

  const output = path.join(TEMP_FOLDER, `video_${Date.now()}.mp4`);
  const cmd = `yt-dlp -f mp4 --max-downloads 1 --no-playlist -o "${output}" "${videoUrl}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).send('Erro ao baixar vídeo.');
    }

    res.download(output, 'video.mp4', (err) => {
      fs.unlinkSync(output); // Apaga após envio
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor rodando na porta ${PORT}`);
});
