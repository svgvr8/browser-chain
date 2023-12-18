import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AdvancedBlockchainBlake2bOnly } from './chain.js'; // Adjust path as necessary

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const blockchain = new AdvancedBlockchainBlake2bOnly();

app.use(express.static('public'));

io.on('connection', (socket) => {
	socket.on('createBlock', ({ data, signature, publicKey }) => {
		if (publicKey) {
			// Handle block creation with Ethereum keys
			blockchain.addBlock(data, signature);
		} else {
			// Handle block creation with MetaMask
			blockchain.addBlock(data, signature);
		}
		io.emit('newBlock', { blocks: blockchain.chain });
	});
});

const port = 3000;
httpServer.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
