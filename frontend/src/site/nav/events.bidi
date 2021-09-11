(ns site.nav.events
  (:require [re-frame.core :as rf]
            [site.router :as router]))

(def nav-interceptors [(rf/path :nav)])

(rf/reg-fx
 :navigate-to
 (fn [{:keys [path]}]
   (router/set-token! path)))

(rf/reg-event-fx
 :route-changed
 nav-interceptors
 (fn [{nav :db} [_ {:keys [handler route-params]}]]
   {:db (assoc nav :active-page handler)}))

(rf/reg-event-db
 :close-off-canvas-menu
 nav-interceptors
 (fn [nav _] (assoc nav :off-canvas-menu-showing false)))

(rf/reg-event-db
 :open-off-canvas-menu
 nav-interceptors
 (fn [nav _] (assoc nav :off-canvas-menu-showing true)))

