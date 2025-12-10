// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Example
 * @notice Example FHE contract for the base template
 * @dev Replace this with your own contract implementation
 */
contract Example is SepoliaConfig {

    /// @notice Example encrypted value
    euint32 private encryptedValue;

    /// @notice Event emitted when value is updated
    event ValueUpdated(address indexed updater, uint256 timestamp);

    /// @notice Initialize contract
    constructor() {
        encryptedValue = FHE.asEuint32(0);
    }

    /**
     * @notice Update encrypted value
     * @param newValue New encrypted value
     */
    function updateValue(euint32 newValue) external {
        encryptedValue = newValue;
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);

        emit ValueUpdated(msg.sender, block.timestamp);
    }

    /**
     * @notice Get public info
     * @return Current timestamp
     */
    function getInfo() external view returns (uint256) {
        return block.timestamp;
    }
}
