// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import {Tomato} from "./Tomato.sol";
import {TomatoPool} from "./TomatoPool.sol";

contract Ico {

    Tomato public tomato;
    TomatoPool public pool;

    address owner;
    mapping(address => uint) public contributions;
    mapping(address => bool) approvedInvestors;
    bool public paused;
    Phase public currentPhase = Phase.SEED;
    uint public totalRaised;
    
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
        pool = new TomatoPool(address(tomato), address(this), treasury);
        tomato.mint(address(this), MAX_TOTAL_CONTRIBUTION * TOMATOES_PER_ETH);
    }

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
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        emit Contribute(msg.sender, msg.value);
    }

    function getContribution(address contributor) external view returns (uint) {
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

    function currentPhaseDesc() external view returns (string memory) {
        if (currentPhase == Phase.SEED) {
            return "seed";
        }
        if (currentPhase == Phase.GENERAL) {
            return "general";
        }
        return "open";
    }
    
    function moveToGeneral() external onlyOwner {
        require(currentPhase == Phase.SEED, "Not in seed phase");
        currentPhase = Phase.GENERAL;
        emit MoveToPhase(Phase.GENERAL);
    }

    function moveToOpen() external onlyOwner {
        require(currentPhase == Phase.GENERAL, "Not in general phase");
        currentPhase = Phase.OPEN;
        emit MoveToPhase(Phase.OPEN);
    }

    function redeem() external {
        require(currentPhase == Phase.OPEN, "Not authorized");
        uint available = contributions[msg.sender];
        require(available > 0, "Nothing to redeem");
        contributions[msg.sender] = 0;
        tomato.transfer(msg.sender, available * TOMATOES_PER_ETH);
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        tomato.mint(address(pool), balance * TOMATOES_PER_ETH);
        pool.icoDeposit{value: balance}();
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Must be owner");
        _;
    }

}
