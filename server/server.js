const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const PANDA_API_KEY = "PRwcos10HtknJ57rjSLMKeLkk3jwZP1EGpBxmKEnnWqG44VlvoI";

app.get('/api/match/furia', async (req, res) => {
  try {
    const response = await axios.get('https://api.pandascore.co/csgo/matches/upcoming', {
      headers: {
        Authorization: `Bearer ${PANDA_API_KEY}`
      }
    });

    const partidasFuria = response.data.filter(match =>
      match.opponents.some(o => o.opponent && o.opponent.name.toLowerCase().includes("furia"))
    );

    res.json(partidasFuria);
  } catch (error) {
    console.error("Erro ao buscar partidas:", error.message);
    res.status(500).send("Erro ao buscar partidas");
  }
});

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('send_message', (data) => {
    console.log('Mensagem recebida:', data);
    io.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });

  socket.on("request_match_update", () => {
    socket.emit("match_update", placar);
  });

});

let placar = {
  time1: 'FURIA',
  time2: 'NAVI',
  score1: 0,
  score2: 0
};

setInterval(() => {
  placar.score1 += Math.random() > 0.7 ? 1 : 0;
  placar.score2 += Math.random() > 0.7 ? 1 : 0;

  io.emit('placarAtualizado', placar);
}, 5000);


server.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});
