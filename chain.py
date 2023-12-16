import hashlib
import time
from typing import Any, List

# Block class
class Block:
    def __init__(self, index: int, timestamp: float, data: Any, previous_hash: str):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()
        self.merkle_root = None

    def calculate_hash(self):
        blk2b = hashlib.blake2b()
        blk2b.update(str(self.index).encode('utf-8') +
                     str(self.timestamp).encode('utf-8') +
                     str(self.data).encode('utf-8') +
                     str(self.previous_hash).encode('utf-8'))
        return blk2b.hexdigest()

    def __repr__(self):
        return f"Block(Index: {self.index}, Hash: {self.hash}, Previous Hash: {self.previous_hash}, Merkle Root: {self.merkle_root}, Data: {self.data})"

# Basic Blockchain class
class Blockchain:
    def __init__(self):
        self.chain: List[Block] = []
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis_block = Block(0, time.time(), "Genesis Block", "0")
        self.chain.append(genesis_block)

    def add_block(self, data: Any):
        last_block = self.chain[-1]
        new_block = Block(len(self.chain), time.time(), data, last_block.hash)
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

# Merkle Tree class
class MerkleTree:
    def __init__(self, data_list):
        self.tree = []
        self.create_tree(data_list)

    def create_tree(self, data_list):
        tree_layer = [hashlib.blake2b(data.encode()).hexdigest() for data in data_list]
        self.tree.append(tree_layer)

        while len(tree_layer) > 1:
            tree_layer = self.create_parent_layer(tree_layer)
            self.tree.append(tree_layer)

    def create_parent_layer(self, child_layer):
        parent_layer = []
        for i in range(0, len(child_layer), 2):
            combined_hash = hashlib.blake2b((child_layer[i] + child_layer[i + 1]).encode()).hexdigest() if i + 1 < len(child_layer) else child_layer[i]
            parent_layer.append(combined_hash)
        return parent_layer

    def get_root(self):
        return self.tree[-1][0] if self.tree else None

# Redefining the necessary classes and creating an instance of the blockchain

class SimplePatriciaTree:
    def __init__(self):
        self.tree = {}

    def insert(self, key: str, value: Any):
        self.tree[key] = value

    def retrieve(self, key: str):
        return self.tree.get(key, None)

class MerkleTree:
    def __init__(self, data_list):
        self.tree = []
        self.create_tree(data_list)

    def create_tree(self, data_list):
        tree_layer = [hashlib.blake2b(data.encode()).hexdigest() for data in data_list]
        self.tree.append(tree_layer)
        while len(tree_layer) > 1:
            tree_layer = self.create_parent_layer(tree_layer)
            self.tree.append(tree_layer)

    def create_parent_layer(self, child_layer):
        parent_layer = []
        for i in range(0, len(child_layer), 2):
            combined_hash = hashlib.blake2b((child_layer[i] + child_layer[i + 1]).encode()).hexdigest() if i + 1 < len(child_layer) else child_layer[i]
            parent_layer.append(combined_hash)
        return parent_layer

    def get_root(self):
        return self.tree[-1][0] if self.tree else None

class AdvancedBlockchain(Blockchain):
    def __init__(self):
        super().__init__()
        self.patricia_tree = SimplePatriciaTree()

    def add_block(self, data: Any):
        last_block = self.chain[-1]
        merkle_tree = MerkleTree(data) if isinstance(data, list) else MerkleTree([data])
        new_block = Block(len(self.chain), time.time(), data, last_block.hash)
        new_block.merkle_root = merkle_tree.get_root()
        self.chain.append(new_block)
        self.patricia_tree.insert(new_block.hash, data)

    def retrieve_data_from_patricia(self, block_hash: str):
        return self.patricia_tree.retrieve(block_hash)

# Creating and testing the blockchain
advanced_blockchain = AdvancedBlockchain()
for i in range(1, 11):
    advanced_blockchain.add_block([f"Block {i} Data"])
print(advanced_blockchain)
# Measure the speed of Merkle Tree creation and data retrieval from the Patricia Tree for the last block
last_block_data = advanced_blockchain.chain[-1].data
last_block_hash = advanced_blockchain.chain[-1].hash

# Measure Merkle Tree creation time
start_time = time.time()
last_block_merkle_tree = MerkleTree(last_block_data)
merkle_root = last_block_merkle_tree.get_root()
end_time = time.time()
merkle_tree_creation_time = end_time - start_time

# Measure Patricia Tree data retrieval time
start_time = time.time()
retrieved_data = advanced_blockchain.retrieve_data_from_patricia(last_block_hash)
end_time = time.time()
patricia_tree_retrieval_time = end_time - start_time

# Output the results
merkle_tree_speed_result = f"Merkle Tree Creation Time: {merkle_tree_creation_time:.6f} seconds"
patricia_tree_speed_result = f"Patricia Tree Data Retrieval Time: {patricia_tree_retrieval_time:.6f} seconds"

print (merkle_tree_speed_result, patricia_tree_speed_result)

