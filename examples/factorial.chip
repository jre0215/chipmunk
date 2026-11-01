; print the factorial of a number
(do
  (def factorial (lambda (x)
    (if (= x 0)
      1
      (* x (factorial (- x 1))))))
  (def x (parse-integer (head argv)))
  (print-line (concat (to-string x) "! = " (to-string (factorial x)))))
