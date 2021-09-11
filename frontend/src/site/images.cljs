(ns site.images)

(def img-list ["tomato1.jpg" "tomato2.jpg" "tomato3.jpg" "tomato4.jpg" "tomato5.jpg" ])

(defn random-img []
  (str "/images/" (rand-nth img-list)))
