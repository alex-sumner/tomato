(ns site.views.content
  (:require [re-frame.core :as rf]
            [site.menu-items :refer [items]]
            [site.images :refer [random-img]]))

(defn ico-page []
  [:<>
   [:div "Current phase"]
   [:div "Current ETH balance"]
   [:div "Current TMTO balance"]
   [:div "Deposit ETH"]])

(defn lp-page []
  [:<>[:div "Deposit"]
   [:div "ETH amount, TMTO amount"]
   [:div "Withdraw"]
   [:div "percentage slider"]])

(defn swap-page []
  [:<>
   [:div "Swap amount, dropdown currency"]
   [:div "Return amount, return currency"]])

(defn not-found []
  [:div "Not Found"])

(defn menu-item-page [active-id]
  [:<>
   [:h2 {:class "text-lg tracking-tight leading-10 font-extrabold text-gray-900 sm:text-xl sm:leading-none md:text-xl"} (get-in items [active-id :caption])]
   [:div {:class "mt-3 max-w-md mx-auto text-sm text-gray-500 sm:text-md md:mt-5 md:max-w-3xl"}
    (get-in items [active-id :description])]
   (case active-id
     :ico (ico-page)
     :lp (lp-page)
     :swap (swap-page)
     (not-found))])

(defn active-page []
  (let [active-id @(rf/subscribe [:active-page])
        image (random-img)]
    [:div {:class "relative bg-gray-50"}
     [:main {:class "lg:relative"}
      [:div {:class "mx-auto max-w-7xl w-full pt-16 pb-20 text-center lg:py-48 lg:text-left"}
       [:div {:class "px-4 lg:w-1/2 sm:px-8 xl:pr-16"}
        [menu-item-page active-id]]]
      [:div {:class "relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full"}
       [:img {:class "absolute inset-0 w-full h-full object-cover" :src image :alt image}]]]]))
