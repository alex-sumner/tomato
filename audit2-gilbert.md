https://github.com/alex-sumner/tomato

The following is a micro audit of git commit 4c93129d62e28a035b829f22938cc9050a20111d

## issue-1

**[Code Quality]** Unnecessary condition

In TomatoPool.sol:112, the `if` condition always returns true. Since xAmt is positive, (xReserve / (xReserve + xAmt)) will always be less than 1, making newYreserve always a fraction of yReserve.
