// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title EncryptedCounter
 * @notice A simple encrypted counter demonstrating basic FHE operations
 * @dev This example shows how to use FHE.add and FHE.sub on encrypted values
 *
 * @chapter Basic Operations
 *
 * Key Concepts:
 * - Encrypted state variables (euint32)
 * - FHE arithmetic (add, subtract)
 * - Access control (allowThis, allow)
 *
 * Learn how to:
 * - Declare encrypted state variables
 * - Perform arithmetic on encrypted data
 * - Manage access permissions
 */
contract EncryptedCounter is SepoliaConfig {

    /// @notice Encrypted counter value
    /// @dev Stored as euint32, never visible in plaintext on-chain
    euint32 private _count;

    /// @notice Total number of operations performed
    uint256 public operationCount;

    /// @notice Event emitted when counter is incremented
    /// @param user Address that incremented the counter
    /// @param timestamp Block timestamp
    event Incremented(address indexed user, uint256 timestamp);

    /// @notice Event emitted when counter is decremented
    /// @param user Address that decremented the counter
    /// @param timestamp Block timestamp
    event Decremented(address indexed user, uint256 timestamp);

    /**
     * @notice Initialize counter to zero
     */
    constructor() {
        _count = FHE.asEuint32(0);
        operationCount = 0;
    }

    /**
     * @notice Increment counter by a specified value
     * @param value Amount to increment (plaintext input)
     *
     * @dev This example omits overflow checks for simplicity.
     * In production, implement proper range validation.
     *
     * Steps:
     * 1. Convert plaintext value to encrypted euint32
     * 2. Add encrypted value to encrypted counter
     * 3. Grant access permissions
     * 4. Emit event
     */
    function increment(uint32 value) external {
        // Convert plaintext to encrypted value
        euint32 encryptedValue = FHE.asEuint32(value);

        // Perform encrypted addition
        _count = FHE.add(_count, encryptedValue);

        // Grant access permissions
        FHE.allowThis(_count);        // Allow contract to access
        FHE.allow(_count, msg.sender); // Allow caller to decrypt

        operationCount++;
        emit Incremented(msg.sender, block.timestamp);
    }

    /**
     * @notice Decrement counter by a specified value
     * @param value Amount to decrement (plaintext input)
     *
     * @dev This example omits underflow checks for simplicity.
     * In production, validate that count >= value before subtracting.
     *
     * Steps:
     * 1. Convert plaintext value to encrypted euint32
     * 2. Subtract encrypted value from encrypted counter
     * 3. Grant access permissions
     * 4. Emit event
     */
    function decrement(uint32 value) external {
        // Convert plaintext to encrypted value
        euint32 encryptedValue = FHE.asEuint32(value);

        // Perform encrypted subtraction
        _count = FHE.sub(_count, encryptedValue);

        // Grant access permissions
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        operationCount++;
        emit Decremented(msg.sender, block.timestamp);
    }

    /**
     * @notice Get the encrypted counter value
     * @return The encrypted counter (euint32)
     *
     * @dev Returns encrypted value - only addresses with permission can decrypt
     * To decrypt, the caller must have been granted access via FHE.allow()
     */
    function getCount() external view returns (euint32) {
        return _count;
    }

    /**
     * @notice Get total number of operations performed
     * @return Count of increment and decrement operations
     */
    function getOperationCount() external view returns (uint256) {
        return operationCount;
    }
}
