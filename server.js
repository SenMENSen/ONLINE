const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('./index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
});

const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on('connection', ws => {
  const id = Math.random().toString(36).substr(2, 9);
  clients.set(ws, { id, snake: [] });

  ws.on('message', msg => {
    const data = JSON.parse(msg);
    clients.get(ws).snake = data.snake;
    broadcast();
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcast();
  });

  function broadcast() {
    const allSnakes = [];
    clients.forEach(client => {
      if(client.snake.length) {
        allSnakes.push({ id: client.id, snake: client.snake });
      }
    });
    const msg = JSON.stringify(allSnakes);
    clients.forEach((_, clientWs) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(msg);
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
