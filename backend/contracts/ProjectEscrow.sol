// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProjectEscrow
 * @dev Milestone-based escrow contract for freelance projects
 * @notice Supports dispute resolution and automatic payouts
 */
contract ProjectEscrow is ReentrancyGuard, Ownable {
    
    enum EscrowStatus { CREATED, FUNDED, COMPLETED, REFUNDED, DISPUTED }
    enum DisputeOutcome { PENDING, FREELANCER, CLIENT, PARTIAL }
    
    struct Escrow {
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 releasedAmount;
        EscrowStatus status;
        bool inDispute;
        DisputeOutcome disputeOutcome;
        uint256 createdAt;
    }
    
    struct Milestone {
        uint256 amount;
        bool approved;
        uint256 approvedAt;
    }
    
    // State variables
    mapping(bytes32 => Escrow) public escrows;
    mapping(bytes32 => Milestone[]) public milestones;
    
    // Platform admin address (for dispute resolution)
    address public platformAdmin;
    
    // Events
    event EscrowCreated(
        bytes32 indexed projectId,
        address indexed client,
        address indexed freelancer,
        uint256 totalAmount
    );
    
    event EscrowFunded(
        bytes32 indexed projectId,
        uint256 amount
    );
    
    event MilestoneApproved(
        bytes32 indexed projectId,
        uint256 milestoneIndex,
        uint256 amount
    );
    
    event FundsReleased(
        bytes32 indexed projectId,
        address indexed to,
        uint256 amount
    );
    
    event DisputeRaised(bytes32 indexed projectId);
    
    event DisputeResolved(
        bytes32 indexed projectId,
        DisputeOutcome outcome
    );
    
    // Modifiers
    modifier onlyPlatformAdmin() {
        require(msg.sender == platformAdmin, "Only platform admin");
        _;
    }
    
    modifier escrowExists(bytes32 projectId) {
        require(escrows[projectId].client != address(0), "Escrow does not exist");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _platformAdmin Address that can resolve disputes
     */
    constructor(address _platformAdmin) Ownable(msg.sender) {
        require(_platformAdmin != address(0), "Invalid admin address");
        platformAdmin = _platformAdmin;
    }
    
    /**
     * @dev Create escrow with milestones
     * @param projectId Unique project identifier
     * @param freelancer Freelancer wallet address
     * @param milestoneAmounts Array of milestone amounts
     */
    function createEscrow(
        bytes32 projectId,
        address freelancer,
        uint256[] memory milestoneAmounts
    ) external payable {
        require(escrows[projectId].client == address(0), "Escrow already exists");
        require(freelancer != address(0), "Invalid freelancer");
        require(milestoneAmounts.length > 0, "Need milestones");
        require(freelancer != msg.sender, "Cannot escrow to self");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneAmounts[i] > 0, "Invalid milestone amount");
            totalAmount += milestoneAmounts[i];
            milestones[projectId].push(Milestone({
                amount: milestoneAmounts[i],
                approved: false,
                approvedAt: 0
            }));
        }
        
        require(msg.value == totalAmount, "Incorrect amount sent");
        
        escrows[projectId] = Escrow({
            client: msg.sender,
            freelancer: freelancer,
            totalAmount: totalAmount,
            releasedAmount: 0,
            status: EscrowStatus.FUNDED,
            inDispute: false,
            disputeOutcome: DisputeOutcome.PENDING,
            createdAt: block.timestamp
        });
        
        emit EscrowCreated(projectId, msg.sender, freelancer, totalAmount);
        emit EscrowFunded(projectId, totalAmount);
    }
    
    /**
     * @dev Approve milestone and release funds
     * @param projectId Project identifier
     * @param milestoneIndex Index of milestone to approve
     */
    function approveMilestone(bytes32 projectId, uint256 milestoneIndex) 
        external
        nonReentrant
        escrowExists(projectId)
    {
        Escrow storage escrow = escrows[projectId];
        require(msg.sender == escrow.client, "Only client");
        require(escrow.status == EscrowStatus.FUNDED, "Invalid status");
        require(!escrow.inDispute, "Escrow disputed");
        require(milestoneIndex < milestones[projectId].length, "Invalid milestone");
        
        Milestone storage milestone = milestones[projectId][milestoneIndex];
        require(!milestone.approved, "Already approved");
        
        milestone.approved = true;
        milestone.approvedAt = block.timestamp;
        escrow.releasedAmount += milestone.amount;
        
        // Transfer to freelancer
        (bool success, ) = escrow.freelancer.call{value: milestone.amount}("");
        require(success, "Transfer failed");
        
        emit MilestoneApproved(projectId, milestoneIndex, milestone.amount);
        emit FundsReleased(projectId, escrow.freelancer, milestone.amount);
        
        // Mark as completed if all funds released
        if (escrow.releasedAmount == escrow.totalAmount) {
            escrow.status = EscrowStatus.COMPLETED;
        }
    }
    
    /**
     * @dev Raise a dispute
     * @param projectId Project identifier
     */
    function raiseDispute(bytes32 projectId) 
        external
        escrowExists(projectId)
    {
        Escrow storage escrow = escrows[projectId];
        require(
            msg.sender == escrow.client || msg.sender == escrow.freelancer,
            "Not authorized"
        );
        require(escrow.status == EscrowStatus.FUNDED, "Invalid status");
        require(!escrow.inDispute, "Already disputed");
        
        escrow.inDispute = true;
        escrow.status = EscrowStatus.DISPUTED;
        emit DisputeRaised(projectId);
    }
    
    /**
     * @dev Resolve dispute (admin only)
     * @param projectId Project identifier
     * @param outcome Resolution outcome
     * @param freelancerPercentage Percentage to freelancer (for PARTIAL)
     */
    function resolveDispute(
        bytes32 projectId,
        DisputeOutcome outcome,
        uint256 freelancerPercentage
    ) 
        external
        onlyPlatformAdmin
        nonReentrant
        escrowExists(projectId)
    {
        Escrow storage escrow = escrows[projectId];
        require(escrow.inDispute, "No active dispute");
        require(outcome != DisputeOutcome.PENDING, "Invalid outcome");
        
        uint256 remainingAmount = escrow.totalAmount - escrow.releasedAmount;
        require(remainingAmount > 0, "No funds to distribute");
        
        escrow.inDispute = false;
        escrow.disputeOutcome = outcome;
        
        if (outcome == DisputeOutcome.FREELANCER) {
            // All remaining funds to freelancer
            escrow.releasedAmount = escrow.totalAmount;
            (bool success, ) = escrow.freelancer.call{value: remainingAmount}("");
            require(success, "Transfer failed");
            emit FundsReleased(projectId, escrow.freelancer, remainingAmount);
            escrow.status = EscrowStatus.COMPLETED;
            
        } else if (outcome == DisputeOutcome.CLIENT) {
            // Refund all remaining funds to client
            (bool success, ) = escrow.client.call{value: remainingAmount}("");
            require(success, "Refund failed");
            emit FundsReleased(projectId, escrow.client, remainingAmount);
            escrow.status = EscrowStatus.REFUNDED;
            
        } else if (outcome == DisputeOutcome.PARTIAL) {
            require(freelancerPercentage <= 100, "Invalid percentage");
            
            uint256 freelancerAmount = (remainingAmount * freelancerPercentage) / 100;
            uint256 clientAmount = remainingAmount - freelancerAmount;
            
            if (freelancerAmount > 0) {
                (bool success1, ) = escrow.freelancer.call{value: freelancerAmount}("");
                require(success1, "Freelancer transfer failed");
                emit FundsReleased(projectId, escrow.freelancer, freelancerAmount);
            }
            
            if (clientAmount > 0) {
                (bool success2, ) = escrow.client.call{value: clientAmount}("");
                require(success2, "Client refund failed");
                emit FundsReleased(projectId, escrow.client, clientAmount);
            }
            
            escrow.releasedAmount += freelancerAmount;
            escrow.status = EscrowStatus.COMPLETED;
        }
        
        emit DisputeResolved(projectId, outcome);
    }
    
    /**
     * @dev Get escrow details
     */
    function getEscrow(bytes32 projectId)
        external
        view
        returns (
            address client,
            address freelancer,
            uint256 totalAmount,
            uint256 releasedAmount,
            EscrowStatus status,
            bool inDispute
        )
    {
        Escrow memory escrow = escrows[projectId];
        return (
            escrow.client,
            escrow.freelancer,
            escrow.totalAmount,
            escrow.releasedAmount,
            escrow.status,
            escrow.inDispute
        );
    }
    
    /**
     * @dev Get all milestones for a project
     */
    function getMilestones(bytes32 projectId)
        external
        view
        returns (Milestone[] memory)
    {
        return milestones[projectId];
    }
    
    /**
     * @dev Update platform admin
     */
    function updatePlatformAdmin(address newAdmin) external onlyOwner {
        require(newAdmin != address(0), "Invalid address");
        platformAdmin = newAdmin;
    }
    
    /**
     * @dev Get contract version
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
 