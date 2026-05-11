# Core Functions

## Table of Contents

- [Arithmetic Functions](#arithmetic-functions)
- [Comparison Functions](#comparison-functions)
- [Vector Functions](#vector-functions)
- [String Functions](#string-functions)
- [I/O Functions](#i-o-functions)
- [Other Functions](#other-functions)

## Arithmetic Functions

### + (addition)

`(+ x y)`

Returns the sum of `x` and `y`.

```
(+ 1 2) ; => 3
```

### - (subtraction)

`(- x y)`

Subtracts `y` from `x` and returns the result.

```
(- 3 2) ; => 1
```

### * (multiplication)

`(* x y)`

Returns the product of `x` and `y`.

```
(* 2 3) ; => 6
```

### / (division)

`(/ x y)`

Returns the quotient of `x` and `y`.

```
(/ 6 3)  ; => 2
(/ 22 7) ; => 3.142857142857143
```

### % (remainder)

`(% x y)`

Divides `x` by `y` and returns the remainder.

```
(% 5 2)  ; => 1
(% -5 2) ; => -1
```

### pow

`(pow x y)`

Returns the result of raising `x` to the power of `y`.

```
(pow 2 3) ; => 8
```

# Comparison Functions

### = (equality)

`(= x y)`

Returns `true` if `x` equals `y`, otherwise `false`.

```
(= 1 1) ; => true
(= 1 2) ; => false
```

### < (less than)

`(< x y)`

Returns `true` if `x` is less than `y`, otherwise `false`.

```
(< 2 1) ; => false
(< 2 2) ; => false
(< 2 3) ; => true
```

### > (greater than)

`(> x y)`

Returns `true` if `x` is greater than `y`, otherwise `false`.

```
(> 2 1) ; => true
(> 2 2) ; => false
(> 2 3) ; => false
```

## Vector Functions

### length

`(length vec)`

Returns the number of items in `vec`.

```
(length [1 2 3]) ; => 3
```

### nth

`(nth vec n)`

Returns the `nth` item of `vec`. Indexing is zero-based.

```
(nth [1 2 3] 2) ; => 3
```

### slice

`(slice vec begin end)`

Returns a slice of `vec` from index `begin` up to but not including index `end`.
Indices are zero-based.

```
(slice [1 2 3 4 5] 1 4) ; => [2 3 4]
```

### join

`(join vec1 vec2)`

Returns a new vector containing the items of `vec1` followed by the items of
`vec2`.

```
(join [1 2] [3]) ; => [1 2 3]
```

## String Functions

### length

`(length string)`

Returns the number of characters in the string.

```
(length "hello") ; => 5
```

### nth

`(nth string n)`

Returns the `nth` character of the string. Indexing is zero-based.

```
(nth "hello" 1) ; => "e"
```

### concat

`(concat string1 string2 ...)`

Returns the result of concatenating two or more strings.

```
(concat "good" "bye") ; => "goodbye"
(concat "foo" "bar" "baz") ; => "foobarbaz"
```

### to-string

`(to-string value)`

Returns a string representation of the value that will produce the value when
entered into the shell.

```
(to-string true)           ; => "true"
(to-string false)          ; => "false"
(to-string (lambda (x) x)) ; => "(lambda (x) x)"
(to-string '(1 2 3))       ; => "(1 2 3)"
(to-string nil)            ; => "nil"
(to-string 3)              ; => "3"
(to-string 3.14)           ; => "3.14"
(to-string "hello")        ; => "\"hello\""
(to-string "hello\nworld") ; => "\"hello\\nworld\""
(to-string "\"hello\"")    ; => "\"\\\"hello\\\"\""
(to-string "\\hello\\")    ; => "\"\\\\hello\\\\\""
(to-string 'x)             ; => "x"
```

### parse-integer

`(parse-integer string)`

Converts the string to an integer.

```
(parse-integer "3") ; => 3
```

### parse-float

`(parse-float string)`

Converts the string to a floating-point number.

```
(parse-float "3.14") ; => 3.14
```

## I/O Functions

## print

`(print value)`

Prints the value to stdout and returns `nil`.

```
(print "Hello, World!\n")
```

## print-line

`(print-line value)`

Prints the value to stdout followed by a newline and returns `nil`.

```
(print-line "Hello, World!")
```

### read-file

`(read-file path)`

Returns the contents of the file as a string.

## Other Functions

## do

`(do expression...)`

Groups multiple expressions into a single expression. The expressions are
evaluated and the value of the last one is returned.

```
(do
  (def pi 3.14)
  (* pi 2)) ; => 6.28
```

### parse-string

`(parse-string string)`

Parses the string as a Chipmunk program and returns the resulting Chipmunk
expression.

```
(parse-string "(+ 1 2)") ; => (+ 1 2)
```

### eval

`(eval expression)`

Evaluates the expression. Useful for evaluating a Chipmunk expression parsed by
the `parse-string` function.

```
(eval (parse-string "(+ 1 2)")) ; => 3
```
