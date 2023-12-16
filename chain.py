import hashlib
import time
from eth_keys import keys
from eth_utils import keccak
from typing import Any, List

# Ethereum Private Key (for demonstration purposes only, use a test key)
private_key_hex = "dd90e8b1feba61b9f6b13f18a940574f01f6aa7d1dd645b4bcfa9f2fbaa51b7f"
private_key = keys.PrivateKey(bytes.fromhex(private_key_hex))
public_key = private_key.public_key
address = public_key.to_checksum_address()


class BlockBlake2bOnly:
    def __init__(
        self,
        index: int,
        timestamp: float,
        data: Any,
        previous_hash: str,
        key: keys.PrivateKey,
    ):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.signature = self.sign_block(key)
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        blk2b = hashlib.blake2b()
        blk2b.update(
            str(self.index).encode("utf-8")
            + str(self.timestamp).encode("utf-8")
            + str(self.data).encode("utf-8")
            + str(self.previous_hash).encode("utf-8")
        )
        return blk2b.hexdigest()

    def sign_block(self, key: keys.PrivateKey):
        message_hash = keccak(text=self.calculate_hash())
        signature = key.sign_msg_hash(message_hash)
        return signature

    def __repr__(self):
        return f"Block(Index: {self.index}, Hash: {self.hash}, Previous Hash: {self.previous_hash}, Signature: {self.signature}, Data: {self.data})"


class SimplePatriciaTree:
    def __init__(self):
        self.tree = {}

    def insert(self, key: str, value: Any):
        self.tree[key] = value

    def retrieve(self, key: str):
        return self.tree.get(key, None)


class Blockchain:
    def __init__(self):
        self.chain: List[BlockBlake2bOnly] = []
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis_block = BlockBlake2bOnly(
            0, time.time(), "Genesis Block", "0", private_key
        )
        self.chain.append(genesis_block)

    def add_block(self, data: Any):
        last_block = self.chain[-1]
        new_block = BlockBlake2bOnly(
            len(self.chain), time.time(), data, last_block.hash, private_key
        )
        self.chain.append(new_block)

    def is_valid(self):
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]

            if current_block.hash != current_block.calculate_hash():
                return False

            if current_block.previous_hash != previous_block.hash:
                return False

        return True

    def __repr__(self):
        return f"Blockchain({self.chain})"


class AdvancedBlockchainBlake2bOnly(Blockchain):
    def __init__(self):
        super().__init__()
        self.patricia_tree = SimplePatriciaTree()

    def add_block(self, data: Any):
        last_block = self.chain[-1]
        new_block = BlockBlake2bOnly(
            len(self.chain), time.time(), data, last_block.hash, private_key
        )
        self.chain.append(new_block)
        self.patricia_tree.insert(new_block.hash, data)

    def retrieve_data_from_patricia(self, block_hash: str):
        return self.patricia_tree.retrieve(block_hash)


# Creating and testing the blockchain with Blake2b only (no Merkle Tree)
advanced_blockchain_blake2b = AdvancedBlockchainBlake2bOnly()
for i in range(1, 11):
    advanced_blockchain_blake2b.add_block(f"Block {i} Data")

# Displaying the blockchain
print(advanced_blockchain_blake2b)
