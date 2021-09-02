Theo Telonis

https://github.com/alex-sumner/tomato

The following is a micro audit of git commit ee91faeeb187a5ae90b740ab78ebc2d600f0a8fd

Comments: Really good work! Your code is very clean and organized well. I like how you consolidated the code into three contracts, instead of breaking the erc20s out into their own to save gas. Overall the contract logic is stout. 

## issue-1

**[High]** The contract requires liquidity providers to deposit eth and tmto seperately into the pool in order to recieve lp tokens. This is fine as we found out in lecture, but this transaction needs to be bundled by some sort of router. Check out how Uniswap does this: https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/UniswapV2Router02.sol

## issue-2

**[Low]** Contract ignores return value from ERC20.transfer() function

TomatoPool.sol lines #70, #94, and #95

https://github.com/crytic/slither/wiki/Detector-Documentation#unchecked-transfer

##  Nitpicks 

- Instead of lines #11-14 writing the abstract contract, you could import the IERC20.sol interface from openzepplin, or actually write an interface instead of an abstract contract. For more information on this distinction read here: https://ethereum.stackexchange.com/questions/42448/what-is-the-difference-between-an-abstract-contract-and-an-interface
TLDR: It is stricter and more explicit