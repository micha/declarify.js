
var global  = this,
    car     = first,
    cdr     = rest,
    _       = {};

function strcmp(x, y) {
  return ((x == y) ? 0 : (( x > y) ? 1 : -1));
}

function eq(x, y) {
  return x == y;
}

function neq(x, y) {
  return ! eq(x, y);
}

function eqq(x, y) {
  return x === y;
}

function neqq(x, y) {
  return ! eqq(x, y);
}

function lt(x, y) {
  return x < y;
}

function gt(x, y) {
  return x > y;
}

function le(x, y) {
  return x <= y;
}

function ge(x, y) {
  return x >= y;
}

function re(x, y) {
  return !!(new RegExp(y)).test(x);
}

function nre(x, y) {
  return ! re(x, y);
}

function not(x) {
  return ! x;
}

function thrw(err) {
  throw err;
}

function comp() {
  var f   = first(arguments),
      fns = rest(arguments);

  return function() {
    return fns.length
      ? f(comp.apply(global, fns).apply(global, arraycp(arguments)))
      : f.apply(global, arraycp(arguments));
  };
}

function arraycp(arr) {
  return Array.prototype.slice.call(arr);
}

function first(arr) {
  return arr[0];
}

function rest(arr) {
  return Array.prototype.slice.call(arr, 1);
}

function trampoline() {
  var f = first(arguments), args = rest(arguments);
  if (args.length)
    f = trampoline(f.apply(global, args));
  else
    while (typeof(f) === "function")
      f = f();
  return f;
}

function range(start, end, step) {
  var k   = arguments.length == 3 ? arguments[2] : 1,
      i   = (arguments.length >= 2 ? arguments[0] : 0) - k,
      j   = arguments.length >= 2 ? arguments[1] : arguments[0],
      ret = [];
  while ((i += k) < j)
    ret.push(i);
  return ret;
}

function map(f, arr) {
  var i, j, ret=[];
  if ($.isArray(arr)) {
    for (i=0; i<arr.length; i++)
      if ((j = f(arr[i], i)) !== _)
        ret.push(j);
  } else {
    for (i in arr)
      if ((j = f(arr[i], i)) !== _)
        ret.push(j);
  }
  return ret;
}

function filter(test, arr) {
  return map(function(x) {
    return test(x) ? x : _;
  }, arr);
}

function reduce(f, val, arr) {
  var tmp;
  if (arguments.length < 3) {
    arr = arraycp(val);
    if (!arr.length)
      return f();
    else if (arr.length == 1)
      return arr[0];
    else {
      tmp     = arr.shift();
      val     = arr[0];
      arr[0]  = tmp;
    }
  } else {
    arr = arraycp(arr);
    if (! arr.length)
      return val;
  }
  while (arr.length)
    val = f(arr.shift(), val);
  return val;
}

function foldr(f, xs, arr) {
  var i, j, ret=[];
  for (i=arr.length; i; i--)
    xs = f(arr[i-1], xs);
  return xs;
}

function reverse(arr) {
  return arr.reverse();
}

function take(num, arr) {
  return arr.slice(num);
}

function partial() {
  var f    = first(arguments),
      args = rest(arguments);

  return function() {
    var args1 = arraycp(args),
        args2 = arraycp(arguments);
    args1 = map(function(x) { return x === _ ? args2.shift() : x }, args1);
    return f.apply(global, args1.concat(args2));
  }
}
