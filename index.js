const express = require('express');
const ytdl = require('ytdl-core');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);
const app = express();
const MAX_VIDEO_LENGTH = 600; // 10 minutos

const cookies = fs.existsSync('cookies.txt') ? fs.readFileSync('cookies.txt', 'utf8') : '';

// Página inicial
app.get('/', (req, res) => {
  res.send(`<h1>Servidor OK</h1>`);
});

// 🔊 Rota para baixar áudio MP3
app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('URL do vídeo ausente.');

  try {
    const info = await ytdl.getInfo(videoUrl);
    const duration = parseInt(info.videoDetails.lengthSeconds);
    if (duration > MAX_VIDEO_LENGTH) {
      return res.status(400).send('Vídeo muito longo. Máximo permitido: 10 minutos.');
    }

    res.setHeader('Content-Disposition', 'attachment; filename=audio.mp3');
    res.setHeader('Content-Type', 'audio/mpeg');

    const stream = ytdl(videoUrl, {
      quality: 'highestaudio',
      requestOptions: { headers: { Cookie: cookies } },
    });

    ffmpeg(stream)
      .audioBitrate(128)
      .toFormat('mp3')
      .pipe(res, { end: true });
  } catch (err) {
    res.status(500).send('Erro ao baixar áudio');
  }
});

// 🎥 Rota para baixar vídeo MP4
app.get('/video', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('URL do vídeo ausente.');

  try {
    const info = await ytdl.getInfo(videoUrl);
    const duration = parseInt(info.videoDetails.lengthSeconds);
    if (duration > MAX_VIDEO_LENGTH) {
      return res.status(400).send('Vídeo muito longo. Máximo permitido: 10 minutos.');
    }

    res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');
    res.setHeader('Content-Type', 'video/mp4');

    ytdl(videoUrl, {
      format: 'mp4',
      requestOptions: { headers: { Cookie: cookies } },
    }).pipe(res);
  } catch (err) {
    res.status(500).send('Erro ao baixar vídeo');
  }
});

const PORT = process.env.PORT || 3000;
console.log('🟢 Servidor ouvindo na porta:', PORT);
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
