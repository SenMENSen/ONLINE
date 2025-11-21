const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.end(fs.readFileSync('index.html'));
  }
});
const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on('connection', ws => {
  clients.add(ws);
  ws.on('message', message => {
    for (let client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });
  ws.on('close', () => { clients.delete(ws); });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
