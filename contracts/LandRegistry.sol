// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LandRegistry
 * @notice Decentralized property registry with government authority verification
 * @dev Manages property registration, verification, transfer, and ownership history
 */
contract LandRegistry {
    // ───────────────────────── State ─────────────────────────

    address public governmentAuthority;
    uint256 public propertyCount;

    struct Property {
        uint256 id;
        address owner;
        string registryId;
        string ipfsHash;
        bool verified;
        bool exists;
        uint256 timestamp;
        string ownerName;
        string plotNumber;
        string area;
        string propertyAddress;
    }

    mapping(uint256 => Property) public properties;
    mapping(uint256 => address[]) public ownershipHistory;
    mapping(address => uint256[]) public ownerProperties;

    // ───────────────────────── Events ─────────────────────────

    event PropertyRegistered(
        uint256 indexed propertyId,
        address indexed owner,
        string registryId,
        string ipfsHash,
        uint256 timestamp
    );

    event PropertyVerified(
        uint256 indexed propertyId,
        address indexed authority,
        uint256 timestamp
    );

    event PropertyRejected(
        uint256 indexed propertyId,
        address indexed authority,
        uint256 timestamp
    );

    event PropertyTransferred(
        uint256 indexed propertyId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    // ───────────────────────── Modifiers ─────────────────────────

    modifier onlyAuthority() {
        require(
            msg.sender == governmentAuthority,
            "Only government authority can perform this action"
        );
        _;
    }

    modifier onlyOwner(uint256 _propertyId) {
        require(
            properties[_propertyId].owner == msg.sender,
            "Only the property owner can perform this action"
        );
        _;
    }

    modifier propertyExists(uint256 _propertyId) {
        require(
            properties[_propertyId].exists,
            "Property does not exist"
        );
        _;
    }

    // ───────────────────────── Constructor ─────────────────────────

    constructor(address _authority) {
        governmentAuthority = _authority;
    }

    // ───────────────────────── Functions ─────────────────────────

    /**
     * @notice Register a new property on the blockchain
     * @param _registryId Government registry identifier
     * @param _ipfsHash IPFS content identifier for the document
     * @param _ownerName Name of the property owner
     * @param _plotNumber Plot/survey number
     * @param _area Property area
     * @param _propertyAddress Physical address of the property
     */
    function registerProperty(
        string memory _registryId,
        string memory _ipfsHash,
        string memory _ownerName,
        string memory _plotNumber,
        string memory _area,
        string memory _propertyAddress
    ) external returns (uint256) {
        propertyCount++;
        uint256 newPropertyId = propertyCount;

        properties[newPropertyId] = Property({
            id: newPropertyId,
            owner: msg.sender,
            registryId: _registryId,
            ipfsHash: _ipfsHash,
            verified: false,
            exists: true,
            timestamp: block.timestamp,
            ownerName: _ownerName,
            plotNumber: _plotNumber,
            area: _area,
            propertyAddress: _propertyAddress
        });

        ownershipHistory[newPropertyId].push(msg.sender);
        ownerProperties[msg.sender].push(newPropertyId);

        emit PropertyRegistered(
            newPropertyId,
            msg.sender,
            _registryId,
            _ipfsHash,
            block.timestamp
        );

        return newPropertyId;
    }

    /**
     * @notice Verify a property (government authority only)
     * @param _propertyId ID of the property to verify
     */
    function verifyProperty(
        uint256 _propertyId
    ) external onlyAuthority propertyExists(_propertyId) {
        require(
            !properties[_propertyId].verified,
            "Property is already verified"
        );

        properties[_propertyId].verified = true;

        emit PropertyVerified(_propertyId, msg.sender, block.timestamp);
    }

    /**
     * @notice Reject a property (government authority only)
     * @param _propertyId ID of the property to reject
     */
    function rejectProperty(
        uint256 _propertyId
    ) external onlyAuthority propertyExists(_propertyId) {
        require(
            !properties[_propertyId].verified,
            "Cannot reject a verified property"
        );

        properties[_propertyId].exists = false;

        emit PropertyRejected(_propertyId, msg.sender, block.timestamp);
    }

    /**
     * @notice Transfer property ownership to a new address
     * @param _propertyId ID of the property to transfer
     * @param _newOwner Address of the new owner
     */
    function transferProperty(
        uint256 _propertyId,
        address _newOwner
    ) external onlyOwner(_propertyId) propertyExists(_propertyId) {
        require(
            properties[_propertyId].verified,
            "Property must be verified before transfer"
        );
        require(
            _newOwner != address(0),
            "Invalid new owner address"
        );
        require(
            _newOwner != msg.sender,
            "Cannot transfer to yourself"
        );

        address previousOwner = properties[_propertyId].owner;
        properties[_propertyId].owner = _newOwner;

        ownershipHistory[_propertyId].push(_newOwner);
        ownerProperties[_newOwner].push(_propertyId);

        // Remove property from previous owner's list
        _removePropertyFromOwner(previousOwner, _propertyId);

        emit PropertyTransferred(
            _propertyId,
            previousOwner,
            _newOwner,
            block.timestamp
        );
    }

    /**
     * @notice Get full property details
     * @param _propertyId ID of the property
     */
    function getProperty(
        uint256 _propertyId
    ) external view propertyExists(_propertyId) returns (Property memory) {
        return properties[_propertyId];
    }

    /**
     * @notice Get ownership history of a property
     * @param _propertyId ID of the property
     */
    function getOwnershipHistory(
        uint256 _propertyId
    ) external view returns (address[] memory) {
        return ownershipHistory[_propertyId];
    }

    /**
     * @notice Get all property IDs owned by an address
     * @param _owner Address to query
     */
    function getPropertiesByOwner(
        address _owner
    ) external view returns (uint256[] memory) {
        return ownerProperties[_owner];
    }

    /**
     * @notice Get the total number of registered properties
     */
    function getPropertyCount() external view returns (uint256) {
        return propertyCount;
    }

    // ───────────────────────── Internal ─────────────────────────

    function _removePropertyFromOwner(
        address _owner,
        uint256 _propertyId
    ) internal {
        uint256[] storage props = ownerProperties[_owner];
        for (uint256 i = 0; i < props.length; i++) {
            if (props[i] == _propertyId) {
                props[i] = props[props.length - 1];
                props.pop();
                break;
            }
        }
    }
}
