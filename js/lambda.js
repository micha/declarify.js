
var _       = {},
    _0      = {},
    _1      = {},
    _2      = {},
    _3      = {},
    _4      = {},
    _5      = {},
    _6      = {},
    _7      = {},
    _8      = {};

/***************************************************************************
 * OPERATORS                                                               *
 ***************************************************************************/

function constant(val) {
  return function() {
    return val;
  }
}

function identity(x) {
  return x;
}

function eq(x, y) {
  return x == y;
};

neq = comp(not, eq);

function eqq(x, y) {
  return x === y;
};

neqq = comp(not, eqq);

lt = arityfn(
  true,
  true, 
  function(x, y) { return x > y },
  function(x, y) { return lt(x, y) ? apply(lt, rest(arguments)) : false }
);

gt = arityfn(
  true,
  true, 
  function(x, y) { return x > y },
  function(x, y) { return gt(x, y) ? apply(gt, rest(arguments)) : false }
);

le = comp(not, gt);

ge = comp(not, lt);

function re(x, y) {
  return !!(new RegExp(y)).test(x);
};

nre = comp(not, re);

function not(x) {
  return ! x;
};

and = collect(partial(reduce, function(x, y) { return !!x && !!y }));

or  = collect(partial(reduce, function(x, y) { return !!x || !!y }));

function dot(obj, x) {
  var thing = obj[x];
  return $.isFunction(thing) ? collect(partial(apply, obj , thing)) : thing;
};

set = arityfn(
  false,
  false,
  function(prop, val) { return set(window, prop, val) },
  function(thing, prop, val) { thing[prop] = val; return thing }
);

/***************************************************************************
 * FUNCTIONLIKE SYMBOLS                                                    *
 ***************************************************************************/

function _throw(err) {
  throw err;
};

/***************************************************************************
 * STRING FUNCTIONS                                                        *
 ***************************************************************************/

function strcmp(x, y) {
  return ((x == y) ? 0 : (( x > y) ? 1 : -1));
};

function strncmp(x, y, len) {
  return strcmp(x.substr(0, len), y.substr(0, len));
}

/***************************************************************************
 * ARRAY FUNCTIONS                                                         *
 ***************************************************************************/

function vec(arr) {
  return Array.prototype.slice.call(arr);
};

function first(arr) {
  return arr[0];
};

function rest(arr) {
  return Array.prototype.slice.call(arr, 1);
};

function range(start, end, step) {
  var k   = arguments.length == 3 ? arguments[2] : 1,
      i   = (arguments.length >= 2 ? arguments[0] : 0) - k,
      j   = arguments.length >= 2 ? arguments[1] : arguments[0],
      ret = [];
  while ((i += k) < j)
    ret.push(i);
  return ret;
};

/***************************************************************************
 * OBJECT FUNCTIONS                                                        *
 ***************************************************************************/

obj = partial(reduce, function(x, xs) { return apply(partial(set, xs), x) }, {});

/***************************************************************************
 * FUNDAMENTS                                                              *
 ***************************************************************************/

function arityfn() {
  var args = vec(arguments),
      len1 = args.length;
  args = arr_tmpl(args, args);
  return function() {
    var len2 = arguments.length,
        rule = args[Math.min(len2, len1)];
    return $.isFunction(rule) ? rule.apply(window, vec(arguments)) : rule;
  }
};

apply = arityfn(
  false,
  function(f) { return f() },
  function(f, args) { return f.apply(window, args) },
  function(obj, f, args) { 
    return $.isFunction(obj)
      ? obj.apply(window, f)
      : f.apply(obj, args);
  }
);

function argrev(f) {
  return function() {
    return apply(f, reverse(vec(arguments)));
  }
}

function applyto(args) {
  return partial(apply, _, args);
}

function comp() {
  var f   = first(arguments),
      fns = rest(arguments);

  return function() {
    return fns.length
      ? f(apply(apply(comp, fns), vec(arguments)))
      : apply(f, vec(arguments));
  };
};

function trampoline() {
  var f = first(arguments), args = rest(arguments);
  if (args.length)
    f = trampoline(f.apply(window, args));
  else
    while (typeof(f) === "function")
      f = f();
  return f;
};

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
};

function filter(test, arr) {
  return map(function(x) {
    return test(x) ? x : _;
  }, arr);
};

function induce(f) {
  return function(x, y) {
    return f(x, y) ? apply(f, rest(arguments)) : false;
  }
};

function reduce(f, val, arr) {
  var tmp;
  if (arguments.length < 3) {
    arr = vec(val);
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
    arr = vec(arr);
    if (! arr.length)
      return val;
  }
  while (arr.length)
    val = f(arr.shift(), val);
  return val;
};

function reverse(arr) {
  return arr.reverse();
};

function take(num, arr) {
  return arr.slice(num);
};

function collect(f) {
  return function() {
    return f(arguments);
  }
};

function arr_tmpl(tmpl, arr) {
  return map(function(x) {
    switch (x) {
      case _:
        return arr.shift();
      case _0:
        return arr[0];
      case _1:
        return arr[1];
      case _2:
        return arr[2];
      case _3:
        return arr[3];
      case _4:
        return arr[4];
      case _5:
        return arr[5];
      case _6:
        return arr[6];
      case _7:
        return arr[7];
      case _8:
        return arr[8];
      default:
        return x;
    }
  }, tmpl);
};

function partial() {
  var f    = first(arguments),
      args = rest(arguments);

  return function() {
    var args1 = vec(args),
        args2 = vec(arguments);
    args1 = arr_tmpl(args1, args2);
    return f.apply(window, args1.concat(args2));
  }
};

function partiar() {
  var f    = first(arguments),
      args = rest(arguments);

  return function() {
    var args1 = vec(args),
        args2 = vec(arguments);
    return f.apply(window, args2.concat(args1));
  }
};

pn = partial;
