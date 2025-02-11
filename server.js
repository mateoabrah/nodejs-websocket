const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Pals amb símbols
const pals = ['♥', '♠', '♣', '♦'];

const baralla = [];
for (let valor = 2; valor <= 14; valor++) {
  pals.forEach(pal => {
    baralla.push({ valor, pal });
  });
}

let jugadors = [];
let cartesJugadors = {};
let seleccions = {};

function repartirCartes() {
  let barallaMezclada = [...baralla].sort(() => Math.random() - 0.5);
  return [barallaMezclada.slice(0, 5), barallaMezclada.slice(5, 10)];
}

function iniciarNovaPartida() {
  const [cartesJ1, cartesJ2] = repartirCartes();
  cartesJugadors[1] = cartesJ1;
  cartesJugadors[2] = cartesJ2;
  seleccions = {};

  jugadors.forEach((jug, index) => {
    jug.send(JSON.stringify({ cartes: index === 0 ? cartesJ1 : cartesJ2, reiniciat: true }));
  });
}

wss.on('connection', (ws) => {
  if (jugadors.length >= 2) {
    ws.send(JSON.stringify({ error: "Ja hi ha dos jugadors" }));
    ws.close();
    return;
  }

  const id = jugadors.length + 1;
  jugadors.push(ws);
  ws.send(JSON.stringify({ missatge: `Ets el Jugador ${id}` }));

  if (jugadors.length === 2) {
    iniciarNovaPartida();
  }

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.accion === 'reiniciar') {
      iniciarNovaPartida();
      return;
    }

    if (data.carta) {
      seleccions[id] = data.carta;
      ws.send(JSON.stringify({ cartaSeleccionada: seleccions[id] }));

      if (seleccions[1] && seleccions[2]) {
        const guanyador = seleccions[1].valor > seleccions[2].valor
          ? "Jugador 1"
          : seleccions[1].valor < seleccions[2].valor
            ? "Jugador 2"
            : "Empat";
        jugadors.forEach((jug) =>
          jug.send(JSON.stringify({ guanyador, cartesRevelades: seleccions }))
        );
        seleccions = {}; // Reset per a la següent partida
      }
    }
  });

  ws.on('close', () => {
    jugadors = [];
    cartesJugadors = {};
    seleccions = {};
  });
});

server.listen(8082, () => {
  console.log('Servidor WebSocket i HTTP en marxa a ws://localhost:8082');
});
