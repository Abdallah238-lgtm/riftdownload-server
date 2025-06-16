const express = require('express');
const ytdl = require('ytdl-core');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const MAX_VIDEO_LENGTH = 600;

const cookies = fs.existsSync('cookies.txt') ? fs.readFileSync('cookies.txt', 'utf8') : '';

app.get('/', (req, res) => {
  res.send(`<h1>Servidor OK</h1>`);
});

app.get('/download', async (req, res) => {
  // lógica aqui
});

const PORT = process.env.PORT;
console.log('🟢 Servidor ouvindo na porta:', PORT); // importante mostrar!
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

