// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ShardeumNativeEscrow
 * @dev Securely locks native SHM for freelance projects.
 */
contract Escrow is Ownable {
    
    event FundsLocked(string projectId, address indexed client, uint256 amount);
    event FundsReleased(string projectId, address indexed freelancer, uint256 amount);

    struct Project {
        uint256 amount;
        address client;
        bool active;
    }

    mapping(string => Project) public projects;

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Lock native SHM for a project.
     * @param projectId Unique identifier for the project.
     */
    function lockFunds(string memory projectId) public payable {
        require(msg.value > 0, "SHM amount must be greater than zero");
        require(!projects[projectId].active, "Project already exists");

        projects[projectId] = Project({
            amount: msg.value,
            client: msg.sender,
            active: true
        });

        emit FundsLocked(projectId, msg.sender, msg.value);
    }

    /**
     * @dev Emergency withdraw (owner only, in case of trapped funds).
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    // Function to check contract balance
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
