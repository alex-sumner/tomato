(ns site.eth
  (:require ["/ethersWeb3" :refer [connect phase contributions tokens]]
            [cljs.core.async :refer [go]]
            [cljs.core.async.interop :refer-macros [<p!]]))

(defn init []
  (.log js/console "eth.init was called")
  (go (<p! (connect))))

(defn ico-phase []
  (go (let [current-phase (<p! (phase))]
        (.log js/console (str "current phase is: " current-phase)))))

(defn ico-contributions []
  (go (let [current-contributions (<p! (contributions))]
        (.log js/console (str "contributions: " current-contributions)))))

(defn tokens-held []
  (go (let [current-tokens (<p! (tokens))]
        (.log js/console (str "tokens: " current-tokens)))))
