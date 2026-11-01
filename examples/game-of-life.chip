; Conway's Game of Life

(def initial-grid
  [
    [0 0 0 1 1 0 0 0]
    [0 0 1 0 0 1 0 0]
    [0 1 0 0 0 0 1 0]
    [1 0 0 0 0 0 0 1]
    [1 0 0 0 0 0 0 1]
    [0 1 0 0 0 0 1 0]
    [0 0 1 0 0 1 0 0]
    [0 0 0 1 1 0 0 0]
  ])

(def turn-cell-to-string (lambda (cell)
  (if (= cell 0) "  " "* ")))

(def turn-row-to-string (lambda (row)
  (reduce concat "" (map turn-cell-to-string row))))

(def print-grid (lambda (grid)
  (map (lambda (row) (print-line (turn-row-to-string row))) grid)))

(def get-adjacent-points (lambda (point)
  (do
    (def x (nth point 0))
    (def y (nth point 1))
    [
      [(- x 1) (- y 1)]
      [(- x 1) y]
      [(- x 1) (+ y 1)]
      [x (- y 1)]
      [x (+ y 1)]
      [(+ x 1) (- y 1)]
      [(+ x 1) y]
      [(+ x 1) (+ y 1)]
    ])))

(def get-value-at-point (lambda (grid point)
  (do
    (def x (nth point 0))
    (def y (nth point 1))
    (if (and (and (>= x 0) (< x (length grid)))
             (and (>= y 0) (< y (length (head grid)))))
      (nth (nth grid x) y)
      0))))

(def get-adjacent-values (lambda (grid point)
  (map (lambda (adjacent-point) (get-value-at-point grid adjacent-point))
       (get-adjacent-points point))))

(def compute-new-value (lambda (grid point)
  (do
    (def living-neighbors (sum (get-adjacent-values grid point)))
    (if (= 1 (get-value-at-point grid point))
      (if (or (= living-neighbors 2) (= living-neighbors 3))
        1
        0)
      (if (= living-neighbors 3)
        1
        0)))))

(def generate-next-grid (lambda (grid)
  (do
    (def rows (length grid))
    (def cols (length (head grid)))
    (map (lambda (row) (map (lambda (col) (compute-new-value grid [row col]))
                            (range cols)))
         (range rows)))))

(def generate-n-grids (lambda (grid count)
  (if (= 0 count)
    nil
    (do
      (print-grid grid)
      (print-line)
      (generate-n-grids (generate-next-grid grid) (- count 1))))))

(generate-n-grids initial-grid 11)
