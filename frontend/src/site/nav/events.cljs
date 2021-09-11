(ns site.nav.events
  (:require [re-frame.core :as rf]
            [site.router :as router]
            [site.eth :as eth]))

(def nav-interceptors [(rf/path :nav)])

(rf/reg-fx
 :navigate-to
 (fn [{:keys [path]}]
   (router/set-token! path)))

(rf/reg-event-fx
 :route-changed
 nav-interceptors
 (fn [{nav :db} [_ handler]]
   {:db (assoc nav :active-page handler)}))

(rf/reg-event-db
 :close-off-canvas-menu
 nav-interceptors
 (fn [nav _] (assoc nav :off-canvas-menu-showing false)))

(rf/reg-event-db
 :open-off-canvas-menu
 nav-interceptors
 (fn [nav _] (assoc nav :off-canvas-menu-showing true)))

(rf/reg-event-db
 :toggle-dropdown-menu
 nav-interceptors
 (fn [nav _] (update nav :dropdown-menu-showing not)))

(rf/reg-fx
 :eth-connect
 (fn [_] (eth/init)))

(rf/reg-event-fx
 :metamask-connect
 (fn [{:keys [db]} _]
   {:db (assoc-in db [:nav :dropdown-menu-showing] false)
    :eth-connect nil}))

