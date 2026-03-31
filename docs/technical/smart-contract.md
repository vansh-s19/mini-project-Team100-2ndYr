# Smart Contract Details

The core logic of ownership, verification, and transfers is enforced by the `LandRegistry.sol` smart contract.

## Data Structures

```solidity
struct Property {
    uint id;
    address owner;
    string registryId;
    string ipfsHash;
    bool verified;
}
```

## State Variables
* `mapping(uint => Property) public properties`: Stores property details.
* `mapping(uint => address[]) public ownershipHistory`: Tracks previous owners.
* `address public authority`: The deployer account authorized to verify properties.

## Core Functions

### `registerProperty(uint _id, string memory _registryId, string memory _ipfsHash)`
Creates a new property record. Starts with `verified = false`. The caller becomes the `owner`.

### `verifyProperty(uint _id)`
Callable **only** by the `authority` address. Updates the property `verified` status to `true`.

### `transferProperty(uint _id, address _newOwner)`
Transfers the property to `_newOwner`. 
* **Requirement**: The caller must be the current owner.
* **Requirement**: The property must be `verified` by the authority.
* **Action**: Updates the `ownershipHistory` mapping.

### `getProperty(uint _id)`
Returns the full `Property` struct for the given property ID.

### `getOwnershipHistory(uint _id)`
Returns the array of addresses that have owned the property, tracking its lineage over time.
