(ns site.views.main
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [site.nav.events]
            [site.nav.subs]
            [site.db]
            [site.menu-items :refer [items]]
            [site.views.content :refer [active-page]]
            ["@tailwindui/react" :refer [Transition Transition.Child]]))

(defn item-anchor [item]
  (let [{:keys [text ref dispatch]} item]
    ^{:key (:id item)} [:a {:id text
                            :href ref
                            :class "group flex items-center px-2 py-2 text-base md:text-sm leading-6 md:leading-5 font-medium text-green-100 rounded-md hover:text-white hover:bg-green-700 focus:outline-none focus:text-white focus:bg-green-700 transition ease-in-out duration-150"
                            :on-click #(rf/dispatch [:close-off-canvas-menu])}
                        text]))

(defn menu-items []
  [:nav {:class "md:flex-1 px-2 md:bg-green-800 space-y-1"}
   (for [item (vals items)]
     (item-anchor item))])

(defn off-canvas-menu []
  (let [menu-showing @(rf/subscribe [:off-canvas-menu-showing])]
    [:div {:class "md:hidden"}
     [:> Transition {:class "fixed inset-0 flex z-40"
                     :show menu-showing}
      [:> Transition.Child {:class "fixed inset-0"
                            :enter "transition-opacity ease-linear duration-300"
                            :enterFrom "opacity-0"
                            :enterTo "opacity-50"
                            :leave "transition-opacity ease-linear duration-300"
                            :leaveFrom "opcacity-50"
                            :leaveTo "opacity-0"}
       [:div {:class "absolute inset-0 bg-green-800"}]] 
      [:> Transition.Child {:class "relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-green-800"
                            :enter "transition ease-in-out duration-300 transform"
                            :enterFrom "-translate-x-full"
                            :enterTo "translate-x-0"
                            :leave "transition ease-in-out duration-300 transform"
                            :leaveFrom "translate-x-0"
                            :leaveTo "-translate-x-full"}
       [:div {:class "absolute top-0 right-0 -mr-14 p-1"}
        [:button {:class "flex items-center justify-center h-12 w-12 rounded-full focus:outline-none focus:bg-gray-600", :aria-label "Close sidebar"
                  :on-click #(rf/dispatch [:close-off-canvas-menu])}
         [:svg {:class "h-6 w-6 text-white", :stroke "currentColor", :fill "none", :viewBox "0 0 24 24"}
          [:path {:stroke-linecap "round", :stroke-linejoin "round", :stroke-width "2", :d "M6 18L18 6M6 6l12 12"}]]]]
       [:div {:class "mt-5 flex-1 h-0 overflow-y-auto"}
        (menu-items)
        [:div {:class "flex-shrink-0 w-14"} ;; "<!-- Dummy element to force sidebar to shrink to fit close icon -->"
         ]]]]]))

(defn desktop-sidebar []
  [:div {:class "md:flex md:flex-shrink-0 hidden"}
   [:div {:class "flex flex-col w-64"}  
    [:div {:class "flex flex-col flex-grow bg-green-800 pt-5 pb-4 overflow-y-auto"}
     [:div {:class "mt-5 flex-1 flex flex-col"}
      (menu-items)]]]])

(defn open-sidebar-btn []
  [:button {:class "px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-600 md:hidden",
            :aria-label "Open sidebar"
            :on-click #(rf/dispatch [:open-off-canvas-menu])}
   [:svg {:class "h-6 w-6", :stroke "currentColor", :fill "none", :viewBox "0 0 24 24"}
    [:path {:stroke-linecap "round", :stroke-linejoin "round", :stroke-width "2", :d "M4 6h16M4 12h16M4 18h7"}]]])

(defn central-panel []
  [:div {:class "flex flex-col w-0 flex-1 overflow-hidden"}
   [:div {:class "md:hidden relative z-10 flex-shrink-0 flex h-16 bg-white shadow"}
    (open-sidebar-btn)]
   [:main {:class "flex-1 relative overflow-y-auto focus:outline-none", :tabIndex "0"}
    [active-page]]])

(defn layout []
  [:<>
   [:h1 {:class "text-center text-green-100 text-4xl bg-green-800"} "Tomato Coin"]
   [:div {:class "h-screen flex overflow-hidden bg-gray-100"}  
    ;; Off-canvas menu for mobile
    (off-canvas-menu)
    ;; static sidebar for desktop
    (desktop-sidebar)
    (central-panel)
    ]]
  )
