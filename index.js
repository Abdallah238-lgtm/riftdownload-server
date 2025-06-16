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
  if (!videoUrl) {
    console.error('[download] URL do vídeo ausente');
    return res.status(400).send('URL do vídeo ausente.');
  }

  try {
    console.log('[download] Pedido para URL:', videoUrl);
    const info = await ytdl.getInfo(videoUrl);
    const duration = parseInt(info.videoDetails.lengthSeconds);
    console.log('[download] Duração do vídeo:', duration);

    if (duration > MAX_VIDEO_LENGTH) {
      console.warn('[download] Vídeo muito longo');
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
      .on('error', (err) => {
        console.error('[download] Erro no ffmpeg:', err);
        if (!res.headersSent) {
          res.status(500).send('Erro no processamento do áudio.');
        }
      })
      .pipe(res, { end: true });

  } catch (err) {
    console.error('[download] Erro geral:', err);
    if (!res.headersSent) {
      res.status(500).send('Erro ao baixar áudio: ' + err.message);
    }
  }
});

// 🎥 Rota para baixar vídeo MP4
app.get('/video', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    console.error('[video] URL do vídeo ausente');
    return res.status(400).send('URL do vídeo ausente.');
  }

  try {
    console.log('[video] Pedido para URL:', videoUrl);
    const info = await ytdl.getInfo(videoUrl);
    const duration = parseInt(info.videoDetails.lengthSeconds);
    console.log('[video] Duração do vídeo:', duration);

    if (duration > MAX_VIDEO_LENGTH) {
      console.warn('[video] Vídeo muito longo');
      return res.status(400).send('Vídeo muito longo. Máximo permitido: 10 minutos.');
    }

    res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');
    res.setHeader('Content-Type', 'video/mp4');

    const stream = ytdl(videoUrl, {
      quality: 'highest',
      filter: 'audioandvideo',
      requestOptions: { headers: { Cookie: cookies } },
    });

    stream.on('error', (err) => {
      console.error('[video] Erro no ytdl:', err);
      if (!res.headersSent) {
        res.status(500).send('Erro no download do vídeo.');
      }
    });

    stream.pipe(res);

  } catch (err) {
    console.error('[video] Erro geral:', err);
    if (!res.headersSent) {
      res.status(500).send('Erro ao baixar vídeo: ' + err.message);
    }
  }
});

const PORT = process.env.PORT || 3000;
console.log('🟢 Servidor ouvindo na porta:', PORT);
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
