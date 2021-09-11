(ns site.router
  (:require [bidi.bidi :as bidi]
            [pushy.core :as pushy]
            [re-frame.core :as rf]))

(def routes ["/" {"" :home
                  "home" :home
                  "music-group" :music-group
                  "instrument-loan" :instrument-loan
                  "strings-in-schools" :strings-in-schools      
                  "sheet-music" :sheet-music
                  "soundcloud" :soundcloud
                  "facebook" :facebook
                  "treble-clef" :treble-clef
                  "bass-clef" :bass-clef
                  "b-flat" :b-flat}])

(def history
  (let [dispatch #(rf/dispatch [:route-changed %])
        match #(bidi/match-route routes %)]
    (pushy/pushy dispatch match)))

(defn start!
  []
  (pushy/start! history))

(defn path-for
  [route]
  (bidi/path-for routes route))

(defn set-token!
  [token]
  (pushy/set-token! history token))
