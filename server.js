// server.js
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  let path = req.url === '/' ? '/index.html' : req.url;
  fs.readFile(__dirname + path, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});

const wss = new WebSocket.Server({ server });

let clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('message', (msg) => {
    // просто пересылаем всем остальным
    for (let client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
