(do
  (def fibonacci-sequence (lambda (count)
    (do
      (def fibonacci-sequence-iter (lambda (a b sequence)
        (if (= (length sequence) count)
          sequence
          (fibonacci-sequence-iter b (+ a b) (join sequence [a])))))
      (fibonacci-sequence-iter 1 1 []))))
  (print-line (fibonacci-sequence 10)))
