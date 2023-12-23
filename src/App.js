import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import blakejs from 'blakejs';
import './App.css';

// const { ethers } = ethers;

const { blake2bHex } = blakejs;

class BlockBlake2bOnly {
	constructor(index, timestamp, data, previousHash, signature) {
		this.index = index;
		this.timestamp = timestamp;
		this.data = data;
		this.previousHash = previousHash;
		this.signature = signature;
		this.hash = this.calculateHash();
	}

	calculateHash() {
		return blake2bHex(this.index + this.timestamp + this.data + this.previousHash);
	}

	toString() {
		return `Block(Index: ${this.index}, Hash: ${this.hash}, Previous Hash: ${this.previousHash}, Signature: ${this.signature}, Data: ${this.data})`;
	}
}

class SimplePatriciaTree {
	constructor() {
		this.tree = {};
	}

	insert(key, value) {
		this.tree[key] = value;
	}

	retrieve(key) {
		return this.tree[key];
	}
}

class Blockchain {
	constructor() {
		this.chain = [];
		this.createGenesisBlock();
	}

	createGenesisBlock() {
		const genesisBlock = new BlockBlake2bOnly(0, Date.now(), "Genesis Block", "0", "0x0");
		this.chain.push(genesisBlock);
	}

	addBlock(data, signature) {
		const lastBlock = this.chain[this.chain.length - 1];
		const newBlock = new BlockBlake2bOnly(
			this.chain.length,
			Date.now(),
			data,
			lastBlock.hash,
			signature
		);
		this.chain.push(newBlock);
	}

	isValid() {
		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				return false;
			}

			if (currentBlock.previousHash !== previousBlock.hash) {
				return false;
			}
		}

		return true;
	}

	toString() {
		return `Blockchain(${this.chain.map(block => block.toString()).join(', ')})`;
	}
}

export class AdvancedBlockchainBlake2bOnly extends Blockchain {
	constructor() {
		super();
		this.patriciaTree = new SimplePatriciaTree();
	}

	addBlock(data, signature) {
		super.addBlock(data, signature);
		const newBlock = this.chain[this.chain.length - 1];
		this.patriciaTree.insert(newBlock.hash, data);
	}

	retrieveDataFromPatricia(blockHash) {
		return this.patriciaTree.retrieve(blockHash);
	}
}

const App = () => {
	const [userAddress, setUserAddress] = useState(null);
	const [keys, setKeys] = useState({ publicKey: '', privateKey: '' });
	const [blockchain, setBlockchain] = useState(new AdvancedBlockchainBlake2bOnly());
	const [blocks, setBlocks] = useState([]);
	const [verificationMessages, setVerificationMessages] = useState({});


	useEffect(() => {
		setBlocks(blockchain.chain);
	}, [blockchain]);

	const connectMetaMask = async () => {
		if (window.ethereum) {
			try {
				const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
				setUserAddress(accounts[0]);
				console.log('Connected with address:', accounts[0]);
			} catch (error) {
				console.error('User denied account access', error);
			}
		} else {
			console.log('MetaMask is not installed!');
		}
	};

	const generateKeys = () => {
		const wallet = ethers.Wallet.createRandom();
		setKeys({ publicKey: wallet.address, privateKey: wallet.privateKey });
	};

	const createBlockWithKeys = async () => {
		if (!keys.privateKey || !keys.publicKey) {
			alert('Please generate Ethereum keys first.');
			return;
		}
		const dataToSign = `Block created at ${new Date().toISOString()}`;
		const wallet = new ethers.Wallet(keys.privateKey);
		const signature = await wallet.signMessage(dataToSign);
		blockchain.addBlock(dataToSign, signature);
		setBlocks([...blockchain.chain]);
	};

	const createBlockWithMetaMask = async () => {
		if (!userAddress) {
			alert('Please connect to MetaMask first.');
			return;
		}
		const dataToSign = `Block created at ${new Date().toISOString()}`;
		const signature = await window.ethereum.request({
			method: 'personal_sign',
			params: [dataToSign, userAddress]
		});
		blockchain.addBlock(dataToSign, signature);
		setBlocks([...blockchain.chain]);
	};
	const verifyBlock = (block) => {
		const recalculatedHash = blake2bHex(block.index + block.timestamp + block.data + block.previousHash);
		let message;

		if (recalculatedHash === block.hash) {
			message = `Block #${block.index} is valid.`;
		} else {
			message = `Block #${block.index} is not valid!`;
		}

		setVerificationMessages(prevMessages => ({
			...prevMessages,
			[block.index]: message
		}));
	};


	const verifySignature = async (block) => {
		try {
			let recoveredAddress;

			if (window.ethereum) {
				// Use MetaMask for signature verification
				const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
				const currentUserAddress = accounts[0];

				recoveredAddress = await window.ethereum.request({
					method: 'personal_ecRecover',
					params: [block.data, block.signature]
				});

				let message = `${recoveredAddress} is the signer of block #${block.index}`;
				if (recoveredAddress.toLowerCase() === currentUserAddress.toLowerCase()) {
					message += " (verified by you)";
				}

				setVerificationMessages(prevMessages => ({
					...prevMessages,
					[block.index]: message
				}));
			} else {
				// Use Ethers.js for signature verification
				console.error('MetaMask is not installed! Using Ethers.js for signature verification.');
				setVerificationMessages(prevMessages => ({
					...prevMessages,
					[block.index]: 'MetaMask is not installed! Using Ethers.js for signature verification.'
				}));

				recoveredAddress = ethers.verifyMessage(block.data, block.signature);
				setVerificationMessages(prevMessages => ({
					...prevMessages,
					[block.index]: `${recoveredAddress} is the signer of block #${block.index}`
				}));
			}
		} catch (error) {
			console.error('Error verifying signature:', error);
			setVerificationMessages(prevMessages => ({
				...prevMessages,
				[block.index]: `Error verifying block #${block.index}`
			}));
		}
	};


	return (
		<div>
			<h1>BrowserChain</h1>
			<section className="executive-summary">
				<p>Welcome to BrowserChain! This application is a blockchain running in your browser.</p>
				<ul>
					<li>Creating and verifying blocks using BLAKE2b hashing.</li>
					<li>Integrating with MetaMask for Ethereum-based transactions.</li>
					<li>Signature verification using Ethereum keys.</li>
					<li>A Patricia tree implementation for rapid data retrieval.</li>
				</ul>
				<p>Explore and interact with blockchain technology right from your browser!</p>
			</section>
			<button id="connectMetaMask" onClick={connectMetaMask} title="Connect to your MetaMask wallet">Connect MetaMask</button>
			<button id="generateKeys" onClick={generateKeys} title="Create your key pair to sign blocks">Get Ethereum Keys</button>
			<button id="createBlockWithKeys" onClick={createBlockWithKeys} title="Create your ethereum key pairs, if you don't have metamask">Create Block (Ethereum)</button>
			<button id="createBlockWithMetaMask" onClick={createBlockWithMetaMask} title="Create a block using your metamask keys">Create Block (MetaMask)</button>
			<pre id="keys">{`Public Key: ${keys.publicKey}\nPrivate Key: ${keys.privateKey}`}</pre>
			<div id="blocks-container">
				{blocks.map((block, index) => (
					<div key={index} className="block-card">
						<div className="card-header">Block #{block.index}</div>
						<div className="card-body">
							<p><strong>Timestamp:</strong> {new Date(block.timestamp).toLocaleString()}</p>
							<p><strong>Data:</strong> {block.data}</p>
							<p><strong>Previous Hash:</strong> {block.previousHash}</p>
							<p><strong>Signature:</strong> {block.signature}</p>
							<p><strong>Hash:</strong> {block.hash}</p>
							<button onClick={() => verifyBlock(block)}>Verify Block</button>
							<button onClick={() => verifySignature(block)}>Verify Signature</button>
							<div className="verification-message">
								{verificationMessages[block.index]}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default App;
