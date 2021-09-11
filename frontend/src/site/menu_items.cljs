(ns site.menu-items
  (:require [site.router :as router]))

(def items  {:ico {:id :ico
                   :ico :ico
                   :text "ICO"
                   :caption "Participate in our Initial Coin Offering."
                   :description "During the ICO you can contribute ETH to receive TMTO tokens at the rate of 5 TMTO per ETH."
                   :ref (router/path-for :ico)}
             :lp {:id :lp
                  :ico :lp
                  :text "Liquidity"
                  :caption "Add or withdraw liquidity"
                  :description "Add liquidity by providing a matched TMTO/ETH deposit to receive liquidity tokens, or burn liquidity tokens to retrieve your share of the liquidity pool."
                  :ref (router/path-for :lp)}
             :swap {:id :swap
                    :ico :swap
                    :text "Swap"
                    :caption "Trade TMTO coins and ETH"
                    :description "Trades are subject to a 1% fee which goes to the liquidity providers."
                    :ref (router/path-for :swap)}})

;; The ICO is in 3 phases: Seed, General and Open. During the initial seed phase only approved investors may contribute and the maximum individual investment is 1500 ETH. During the general phase all can contribute and the maximum individual investment is 1000 ETH. At the end of the general phase investors' ETH are minted and unlimited individual contributions are allowed up to an ICO wide ceiling of 30000 ETH total contributions.
