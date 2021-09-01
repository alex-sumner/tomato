// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Tomato is ERC20 {

    address treasury;
    address ico;
    bool taxing;
    uint constant SUPPLY_CAP = 500000000000000000000000;
    uint constant INITIAL_SUPPLY = SUPPLY_CAP/10;
    
    constructor(address _treasury) ERC20("Tomato", "TOM") {
        ico = msg.sender;
        treasury = _treasury;
        _mint(_treasury, INITIAL_SUPPLY);
    }

    function mint(address to, uint256 amount) external onlyIco{
        require(ERC20.totalSupply() + amount <= SUPPLY_CAP, "Supply cap exceeded");
        _mint(to, amount);
    }

    function setTaxing(bool _taxing) external onlyIco{
        taxing = _taxing;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        if (taxing) {
            uint tax = amount / 50;
            super._transfer(sender, treasury, tax);
            super._transfer(sender, recipient, amount - tax);
        }
        else {
            super._transfer(sender, recipient, amount);
        }
    }

    modifier onlyIco {
        require(msg.sender == ico, "ICO only");
        _;
    }
}

