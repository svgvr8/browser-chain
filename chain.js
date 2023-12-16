import ethLib from 'eth-lib';
import jsSha3 from 'js-sha3';
import blakejs from 'blakejs';

const { keccak256 } = jsSha3;
const { blake2bHex } = blakejs;

class BlockBlake2bOnly {
	constructor(index, timestamp, data, previousHash, key) {
		this.index = index;
		this.timestamp = timestamp;
		this.data = data;
		this.previousHash = previousHash;
		this.signature = this.signBlock(key);
		this.hash = this.calculateHash();
	}

	calculateHash() {
		return blake2bHex(this.index + this.timestamp + this.data + this.previousHash);
	}

	signBlock(key) {
		const messageHash = keccak256(this.calculateHash());
		return ethLib.Account.sign(messageHash, key);
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
		const genesisBlock = new BlockBlake2bOnly(0, Date.now(), "Genesis Block", "0", privateKey);
		this.chain.push(genesisBlock);
	}

	addBlock(data) {
		const lastBlock = this.chain[this.chain.length - 1];
		const newBlock = new BlockBlake2bOnly(this.chain.length, Date.now(), data, lastBlock.hash, privateKey);
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

	addBlock(data) {
		super.addBlock(data);
		const newBlock = this.chain[this.chain.length - 1];
		this.patriciaTree.insert(newBlock.hash, data);
	}

	retrieveDataFromPatricia(blockHash) {
		return this.patriciaTree.retrieve(blockHash);
	}
}

// Ethereum Private Key (for demonstration purposes only, use a test key)
const privateKeyHex = "dd90e8b1feba61b9f6b13f18a940574f01f6aa7d1dd645b4bcfa9f2fbaa51b7f";
const privateKey = ethLib.Account.fromPrivate(privateKeyHex).privateKey;