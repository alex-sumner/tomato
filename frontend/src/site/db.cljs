(ns site.db
  (:require [re-frame.core :as rf]))

(def initial-app-db {:nav {:off-canvas-menu-showing false
                           :dropdown-menu-showing false}})

(rf/reg-event-db
 :initialize-db
 (fn [_ _]
   initial-app-db))

