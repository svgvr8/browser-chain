import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AdvancedBlockchainBlake2bOnly } from './chain.js'; // Assume your blockchain code is in 'chain.mjs'

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Initialize blockchain
const blockchain = new AdvancedBlockchainBlake2bOnly();

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Socket.io for real-time communication
io.on('connection', (socket) => {
	socket.on('createBlock', (data) => {
		blockchain.addBlock(data);
		io.emit('newBlock', { blocks: blockchain.chain });
	});
});

const port = 3000;
httpServer.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
