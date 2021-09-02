https://github.com/alex-sumner/tomato

The following is a micro audit of git commit bf9467afd264f43308c3616430cfbd9956779ba7


## issue-1

**[Medium]** releaseTheTomatoes() may release too many tomatoes

In ico.sol:97, the `contributors` array has an upper bound of 3 million entries.
That can get expensive, and could exceed the max configurable gas limit for a transaction.


## Nitpicks

- Consider combining addApprovedInvestor and removeApprovedInvestor into one function to save on deploy costs.
