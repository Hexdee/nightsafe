import * as net from 'node:net';

const host = '127.0.0.1';
const port = 6300;

const ok = await new Promise<boolean>((resolve) => {
  const socket = net.createConnection({ host, port });
  socket.setTimeout(3000);
  socket.once('connect', () => {
    socket.end();
    resolve(true);
  });
  socket.once('timeout', () => {
    socket.destroy();
    resolve(false);
  });
  socket.once('error', () => resolve(false));
});

if (!ok) {
  console.error(`❌ Proof server is not reachable at http://${host}:${port}`);
  process.exit(1);
}

console.log(`✓ Proof server reachable at http://${host}:${port}`);
