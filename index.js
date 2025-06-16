const express = require('express');
const ytdl = require('ytdl-core');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const MAX_VIDEO_LENGTH = 600; // 10 minutos

// ✅ Leitura segura e filtrada dos cookies
const rawCookies = fs.existsSync('cookies.txt') ? fs.readFileSync('cookies.txt', 'utf8') : '';
const cookies = rawCookies
  .split('\n')
  .filter(line => line.trim() && !line.startsWith('#'))
  .map(line => line.split('\t'))
  .filter(parts => parts.length >= 7)
  .map(parts => `${parts[5]}=${parts[6]}`)
  .join('; ');

app.get('/', (req, res) => {
  res.send(`
    <h1>Baixar Músicas do YouTube</h1>
    <form action="/download" method="get">
      <input type="text" name="url" placeholder="URL do YouTube" required>
      <select name="format">
        <option value="mp3">MP3 (áudio)</option>
        <option value="mp4">MP4 (vídeo)</option>
      </select>
      <button type="submit">Baixar</button>
    </form>
    <p><small>Vídeos limitados a ${MAX_VIDEO_LENGTH / 60} minutos.</small></p>
  `);
});

app.get('/download', async (req, res) => {
  const { url, format } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send('URL inválida ou faltando.');
  }

  const requestOptions = cookies
    ? { headers: { cookie: cookies } }
    : {};

  try {
    const info = await ytdl.getInfo(url, { requestOptions });

    if (parseInt(info.videoDetails.lengthSeconds) > MAX_VIDEO_LENGTH) {
      return res.status(400).send(`Vídeo muito longo (limite: ${MAX_VIDEO_LENGTH / 60} minutos).`);
    }

    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    if (format === 'mp4') {
      res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
      res.header('Content-Type', 'video/mp4');

      ytdl(url, {
        quality: 'highest',
        requestOptions,
      }).pipe(res);
    } else {
      res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
      res.header('Content-Type', 'audio/mpeg');

      ffmpeg(ytdl(url, {
        quality: 'highestaudio',
        requestOptions,
      }))
        .audioBitrate(128)
        .format('mp3')
        .on('error', (err) => {
          console.error('Erro no FFmpeg:', err);
          res.status(500).send('Erro ao converter o áudio.');
        })
        .pipe(res);
    }
  } catch (error) {
    console.error('Erro geral:', error);
    res.status(500).send('Erro ao processar o vídeo: ' + error.message);
  }
});

// ✅ Porta obrigatória para funcionar no Render
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
