// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Tomato} from "./Tomato.sol";
import "hardhat/console.sol";

abstract contract TomatoInterface {
    function balanceOf(address holder) public virtual returns (uint);
    function transfer(address recipient, uint256 amount) external virtual returns (bool);
}

contract TomatoPool is ERC20, ReentrancyGuard {

    uint private prevEthBalance;
    uint private prevTmtoBalance;
    address private ico;
    address private treasury;

    TomatoInterface private tomato;

    event Deposit(address indexed contributor, uint eth, uint tmto);
    event Withdraw(address indexed contributor, uint eth, uint tmto);
    event SwapEthForTmto(address indexed contributor, uint eth, uint tmto);
    event SwapTmtoForEth(address indexed contributor, uint eth, uint tmto);
    
    constructor(address _tomato, address _ico, address _treasury) ERC20("TomatoLP", "TOLP"){
        tomato = TomatoInterface(_tomato);
        // if _ico is zero nobody can call icoDeposit, which is ok, and then we won't need _treasury either
        require(_treasury != address(0) || _ico == address(0), "no treasury specified");
        ico = _ico;
        treasury = _treasury;
    }
    
    function deposit() external payable nonReentrant {
        _deposit(msg.sender);
    }

    function icoDeposit() external payable onlyIco {
        _deposit(treasury);
    }

    function _deposit(address lpTokenRecipient) private {
        (uint ethAmount, uint tmtoAmount) = findAmounts();
        require(ethAmount > 0, "no ETH supplied");
        require(tmtoAmount > 0, "no Tomato coins supplied");
        mint(lpTokenRecipient, ethAmount, tmtoAmount);
        emit Deposit(msg.sender, ethAmount, tmtoAmount);
        sync();
    }

    function findAmounts() private returns (uint ethAmount, uint tmtoAmount) {
        uint ethBalance = address(this).balance;
        ethAmount = ethBalance > prevEthBalance ? ethBalance - prevEthBalance : 0;
        uint tmtoBalance = tomato.balanceOf(address(this));
        tmtoAmount = tmtoBalance > prevTmtoBalance ? tmtoBalance - prevTmtoBalance : 0;
    }
    
    function withdraw() external nonReentrant {
        sync();
        uint liquidity = balanceOf(address(this));
        uint _totalSupply = totalSupply();
        uint amountEth = (liquidity * address(this).balance) / _totalSupply;
        uint amountTmto = (liquidity * tomato.balanceOf(address(this))) / _totalSupply; 
        require(amountEth > 0 && amountTmto > 0, "insufficient liquidity burned");
        _burn(address(this), liquidity);
        tomato.transfer(msg.sender, amountTmto);
        (bool sent, ) = msg.sender.call{value: amountEth}("");
        require(sent, "Failed to send Ether");
        emit Withdraw(msg.sender, amountEth, amountTmto);
        sync();
    }
    
    function mint(address lpTokenRecipient, uint ethAmount, uint tmtoAmount) private {
        uint _totalSupply = totalSupply();
        uint liquidity;
        if (_totalSupply == 0) {
            liquidity = sqrt(ethAmount * tmtoAmount);
        } else {
            liquidity = Math.min((ethAmount * _totalSupply) / prevEthBalance, (tmtoAmount * _totalSupply) / prevTmtoBalance);
        }
        require(liquidity > 0, "insufficient liquidity provided");
        _mint(lpTokenRecipient, liquidity);
    }

    function swap() external payable nonReentrant {
        (uint ethAmount, uint tmtoAmount) = findAmounts();
        require(ethAmount > 0 || tmtoAmount > 0, "nothing supplied");
        if (ethAmount > 0) {
            (uint tmtoOut, uint fee) = calcTradeAmtAndFee(ethAmount, prevEthBalance, prevTmtoBalance);
            tomato.transfer(msg.sender, tmtoOut);
            tomato.transfer(treasury, fee);
            emit SwapEthForTmto(msg.sender, ethAmount, tmtoOut);
        }
        if (tmtoAmount > 0) {
            (uint ethOut, uint fee) = calcTradeAmtAndFee(tmtoAmount, prevTmtoBalance, prevEthBalance);
            bool sent;
            (sent, ) = msg.sender.call{value: ethOut}("");
            require(sent, "Failed to send Ether");
            (sent, ) = treasury.call{value: fee}("");
            require(sent, "Failed to send Ether");
            emit SwapTmtoForEth(msg.sender, ethOut, tmtoAmount);
        }
        sync();
    }

    function calcTradeAmtAndFee(uint xAmt, uint xReserve, uint yReserve) private pure returns (uint tradeAmt, uint fee) {
        require(xReserve > 0 && yReserve > 0, "liquidity pool has no reserve");
        //xAmt > 0 is checked by the calling function swap()
        uint newYreserve = (xReserve * yReserve) / (xReserve + xAmt);
        if (yReserve > newYreserve) {
            fee = (yReserve - newYreserve) / 100;
            tradeAmt = yReserve - (newYreserve + fee);
        } else {
            tradeAmt = 0;
            fee = 0;
        }
        //check slippage
        uint noSlippage = (xAmt * yReserve) / xReserve;
        require(noSlippage - (tradeAmt + fee) <= noSlippage / 10, "slippage is over 10%");
    }
    
    function sync() private {
        prevEthBalance = address(this).balance;
        prevTmtoBalance = tomato.balanceOf(address(this));
    }

    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    
    }

    modifier onlyIco {
        require(msg.sender == ico, "ICO only");
        _;
    }

}
