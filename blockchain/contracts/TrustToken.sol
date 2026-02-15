// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TrustToken is ERC20, Ownable {
    constructor() ERC20("TrustLance Token", "TRT") Ownable(msg.sender) {
        // Mint initial supply to the deployer (e.g., 1 Million Tokens)
        // 18 decimals by default, so 1,000,000 * 10^18
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /**
     * @dev Function to mint new tokens. Only the owner (platform admin) can call this.
     * Useful for distributing tokens to users for testing/faucet.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens (optional, for deflationary mechanics or cleanup)
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
