(do
  (def square (lambda (x)
    (* x x)))

  (def average (lambda (x y)
    (/ (+ x y) 2)))

  (def square-root (lambda (x)
    (do
      (def tolerance 0.000001)

      (def good-enough? (lambda (guess)
        (< (abs (- x (square guess))) tolerance)))

      (def improve-guess (lambda (guess)
        (average guess (/ x guess))))

      (def square-root-iter (lambda (guess)
        (if (good-enough? guess)
          guess
          (square-root-iter (improve-guess guess)))))

      (square-root-iter 1))))

  (print-line (square-root 25)))
