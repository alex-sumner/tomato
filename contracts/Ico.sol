// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import {Tomato} from "./Tomato.sol";

contract Ico {

    Tomato public tomato;

    address owner;
    mapping(address => uint) contributions;
    address[] contributors;
    mapping(address => bool) approvedInvestors;
    bool paused;
    Phase currentPhase = Phase.SEED;
    uint totalRaised;
    
    enum Phase {SEED, GENERAL, OPEN}

    event Contribute(address indexed contributor, uint amount);
    event AddApprovedInvestor(address indexed investor);
    event RemoveApprovedInvestor(address indexed investor);
    event MoveToPhase(Phase indexed phase);

    uint constant TOMATOES_PER_ETH = 5;
    uint constant MAX_INDIVIDUAL_SEED_CONTRIBUTION = 1500 ether;
    uint constant MAX_TOTAL_SEED_CONTRIBUTION = 15000 ether;
    uint constant MAX_INDIVIDUAL_GENERAL_CONTRIBUTION = 1000 ether;
    uint constant MAX_TOTAL_CONTRIBUTION = 30000 ether;
    uint constant MIN_CONTRIBUTION = 0.01 ether;

    constructor(address treasury) {
        owner = msg.sender;
        tomato = new Tomato(treasury);
    }

    // rejects with request to use the contribute function
    receive() external payable {
        revert("Please call contribute");
    }
    
    function contribute() external payable {
        require(msg.value >= MIN_CONTRIBUTION, "Contribution must be at least 0.01 ETH.");
        require(!paused, "Fundraising is paused.");
        if (currentPhase == Phase.SEED) {
            require(approvedInvestors[msg.sender], "Approved investors only during seed phase.");
            require(contributions[msg.sender] + msg.value <= MAX_INDIVIDUAL_SEED_CONTRIBUTION, "Max individual seed contribution is 1,500");
            require(totalRaised + msg.value <= MAX_TOTAL_SEED_CONTRIBUTION, "Max seed contribution exceeded");
        }
        if (currentPhase == Phase.GENERAL) {
            require(contributions[msg.sender] + msg.value <= MAX_INDIVIDUAL_GENERAL_CONTRIBUTION, "Max individual contribution is 1,000");
        }
        require(totalRaised + msg.value <= MAX_TOTAL_CONTRIBUTION, "Max contribution exceeded");
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        if (currentPhase == Phase.OPEN) {
            tomato.mint(msg.sender, msg.value * TOMATOES_PER_ETH);
        }
        emit Contribute(msg.sender, msg.value);
    }

    function getContribution(address contributor) external view returns (uint contribution) {
        return contributions[contributor];
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    function addApprovedInvestor(address investor) external onlyOwner {
        approvedInvestors[investor] = true;
        emit AddApprovedInvestor(investor);
    }
    
    function removeApprovedInvestor(address investor) external onlyOwner {
        approvedInvestors[investor] = false;
        emit RemoveApprovedInvestor(investor);
    }

    function moveToNextPhase() external onlyOwner {
        if (currentPhase == Phase.SEED) {
            currentPhase = Phase.GENERAL;
            emit MoveToPhase(Phase.GENERAL);
        }
        else if (currentPhase == Phase.GENERAL) {
            currentPhase = Phase.OPEN;
            emit MoveToPhase(Phase.OPEN);
            releaseTheTomatoes();
        }
    }

    function releaseTheTomatoes() private {
        for (uint i=0; i<contributors.length; i++) {
            address contributor = contributors[i];
            tomato.mint(contributor, contributions[contributor] * TOMATOES_PER_ETH);
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Must be owner");
        _;
    }

}
