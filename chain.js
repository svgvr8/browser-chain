import ethers from 'ethers';
import blakejs from 'blakejs';

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
