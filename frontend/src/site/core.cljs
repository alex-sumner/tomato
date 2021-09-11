(ns site.core
  (:require [reagent.dom :as r]
            [re-frame.core :as rf]
            [site.router :as router]
            [site.nav.events]
            [site.nav.subs]
            [site.db]
            [site.views.main :refer [layout]]
            [site.eth :as eth]))

(defn app []
  [:div (layout)])

(defn ^:dev/after-load start []
  ;; (eth/init)
  (r/render [app] (.getElementById js/document "app")))

(defn ^:export init []
  (router/start!)
  (rf/dispatch-sync [:initialize-db])
  (start))
