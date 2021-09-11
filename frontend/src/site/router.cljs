(ns site.router
  (:require [reitit.core :as re]
            [pushy.core :as pushy]
            [re-frame.core :as rf]))

(def router
  (re/router
   [["/" :ico]
    ["/liquidity" :lp]
    ["/swap" :swap]]))

(def history
  (let [dispatch #(rf/dispatch [:route-changed %])
        match #(->
                (re/match-by-path router %)
                :data
                :name)]
    (pushy/pushy dispatch match)))

(defn start!
  []
  (pushy/start! history))

(defn path-for
  [route]
  (:path (re/match-by-name router route)))

(defn set-token!
  [token]
  (pushy/set-token! history token))
