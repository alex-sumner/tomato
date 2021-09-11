(ns site.nav.subs
  (:require [re-frame.core :as rf]))

(rf/reg-sub
 :nav
 (fn [db _]
   (get db :nav)))

(rf/reg-sub
 :off-canvas-menu-showing
 :<- [:nav]
 (fn [nav _]
   (get nav :off-canvas-menu-showing)))

(rf/reg-sub
 :dropdown-menu-showing
 :<- [:nav]
 (fn [nav _]
   (get nav :dropdown-menu-showing)))
   
(rf/reg-sub
 :active-page
 :<- [:nav]
 (fn [nav _]
   (get nav :active-page)))
