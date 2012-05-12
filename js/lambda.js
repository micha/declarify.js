
(function($) {

  var F = {

    load :
      function() {
        for (var i in F)
          window[i] = F[i];
      },

    _  : {},
    _0 : {},
    _1 : {},
    _2 : {},
    _3 : {},
    _4 : {},
    _5 : {},
    _6 : {},
    _7 : {},
    _8 : {},

    /*************************************************************************
     * OPERATORS                                                             *
     *************************************************************************/

    eq :
      function(x, y) {
        switch(arguments.length) {
          case 0:
          case 1:
            return true;
          case 2:
            return x == y;
          default:
            return F.eq(x, y) ? F.apply(F.eq, F.rest(arguments)) : false;
        }
      },

    neq : 
      function() { return ! F.apply(F.eq, F.vec(arguments)) },

    eqq :
      function(x, y) {
        switch(arguments.length) {
          case 0:
          case 1:
            return true;
          case 2:
            return x === y;
          default:
            return F.eqq(x, y) ? F.apply(F.eqq, F.rest(arguments)) : false;
        }
      },

    neqq :
      function() { return ! F.apply(F.eqq, F.vec(arguments)) },

    lt : 
      function(x, y) {
        switch(arguments.length) {
          case 0:
          case 1:
            return true;
          case 2:
            return x < y;
          default:
            return F.lt(x, y) ? F.apply(F.lt, F.rest(arguments)) : false;
        }
      },

    gt :
      function(x, y) {
        switch(arguments.length) {
          case 0:
          case 1:
            return true;
          case 2:
            return x > y;
          default:
            return F.gt(x, y) ? F.apply(F.gt, F.rest(arguments)) : false;
        }
      },

    le :
      function() { return ! F.apply(F.gt, F.vec(arguments)) },


    ge :
      function() { return ! F.apply(F.lt, F.vec(arguments)) },


    re :
      function (x, y) { return !!(new RegExp(y)).test(x) },

    nre :
      function() { return ! F.apply(F.re, F.vec(arguments)) },


    not :
      function (x) { return ! x },

    and :
      function() {
        return !!F.reduce(function(x, y) { return !!x && !!y }, F.vec(arguments));
      },

    or :
      function() {
        return !!F.reduce(function(x, y) { return !!x || !!y }, F.vec(arguments));
      },

    inc :
      function(x) {
        return x + 1;
      },

    /*************************************************************************
     * FUNCTIONLIKE SYMBOLS                                                  *
     *************************************************************************/

    _throw :
      function(err) { throw err },

    _try :
      function(proc, _catch, _finally) {
        var ret;
        try {
          ret = proc();
        } catch (e) {
          ret = _catch(e);
        } finally {
          return _finally
            ? _finally(ret)
            : ret;
        }
      },

    _typeof :
      function(x) { return typeof(x) },

    _instanceof :
      function(x, y) { return x instanceof y },

    /*************************************************************************
     * STRING FUNCTIONS                                                      *
     *************************************************************************/

    strcmp :
      function(x, y) { return ((x == y) ? 0 : (( x > y) ? 1 : -1)) },

    strncmp :
      function(x, y, len) {
        return F.strcmp(x.substr(0, len), y.substr(0, len));
      },

    split :
      function(x, y) {
        return x ? x.split(y) : [];
      },

    requote :
      function(str) {
        return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
      },

    /*************************************************************************
     * ARRAY FUNCTIONS                                                       *
     *************************************************************************/

    vec :
      function(arr) { return arr ? Array.prototype.slice.call(arr) : [] },

    count :
      function(arr) { return arr.length },

    first :
      function(arr) { return arr ? arr[0] : undefined },

    last :
      function(arr) { return arr ? arr.slice(-1) : undefined },

    rest :
      function(arr) { return Array.prototype.slice.call(arr, 1) },

    nth :
      function(arr, i) { return arr[i] },

    inarray :
      function(arr, v) { return $.inArray(v, arr) != -1 },

    appendl :
      function(arr, x) { return rest(arguments).concat(arr) },

    appendr :
      function(arr, x) { return arr.concat(rest(arguments)) },

    trans :
      function(arr) {
        return arr && arr.length && arr[0].length
          ? [ map(first, arr) ].concat(trans(map(rest, arr)))
          : [];
      },

    pick :
      function(arr, i, v) {
        return filter(comp(partial(eq, v), partial(nth, _, i)), arr);
      },

    concat :
      function() {
        return arguments.length == 1
          ? arguments[0]
          : (arguments.length == 2
              ? arguments[0].concat(arguments[1])
              : concat(arguments[0], apply(concat, rest(arguments))));
      },

    takewhile :
      function(f, arr) {
        var i, a=vec(arr);
        for (i=0; i<a.length; i++)
          if (! f(a[i]))
            a.length = i;
        return a;
      },

    range :
      function(start, end, step) {
        var k   = arguments.length == 3 ? arguments[2] : 1,
            i   = (arguments.length >= 2 ? arguments[0] : 0) - k,
            j   = arguments.length >= 2 ? arguments[1] : arguments[0],
            ret = [];
        while ((i += k) < j)
          ret.push(i);
        return ret;
      },

    /*************************************************************************
     * OBJECT FUNCTIONS                                                      *
     *************************************************************************/

    outof :
      function(obj) {
        var ret=[], i;
        for (i in obj)
          ret.push([i, obj[i]]);
        return ret;
      },

    into :
      function(obj, arr) {
        return F.reduce(function(x, xs) {
          return F.apply(F.partial(F.set, xs), x);
        }, obj, arr);
      },

    deepinto :
      function(obj, arr) {
        return reduce(function(x, xs) {
          var v = x.pop(),
              k = x.pop(),
              t = xs, w;

          while ( (w = x.shift()) )
            t = t[w] = t[w] || {};

          t[k] = v;

          return xs;
        }, obj, arr);
      },

    assoc :
      function() {
        var obj = first(arguments) || {},
            kvs = rest(arguments),
            k, v, t;
        while (kvs.length >= 2) {
          k = kvs.shift();
          v = kvs.shift();
          t = $.type(k);
          if (t != "null" && t != "undefined")
            obj[k] = v;
        }
        return obj;
      },

    keys :
      function(obj) { return F.map(F.first, F.outof(obj)) },

    values :
      function(obj) { return F.map(F.partial(F.nth, F._, 1), F.outof(obj)) },

    dot :
      function(obj, x) {
        var thing = obj[x];
        return $.isFunction(thing) 
          ? F.collect(F.partial(F.applyon, obj, thing))
          : thing;
      },

    dotre :
      function(obj, regex) {
        return map(partial(dot, obj), F.filter(partial(re, _, regex), keys(obj)));
      },

    dotis :
      function(pred, key, val) {
        return F.comp(F.partial(pred, val), F.partial(F.dot, F._, key));
      },

    set :
      function(x, y, z) {
        switch(arguments.length) {
          case 0:
          case 1:
            return false;
          case 2:
            return window[x] = y;
          default:
            x[y] = z;
            return x;
        }
      },


    /*************************************************************************
     * FUNDAMENTS                                                            *
     *************************************************************************/

    constant :
      function(val) { return function() { return val } },

    identity :
      function(x) { return x },

    arityfn :
      function() {
        var args = F.vec(arguments),
            len1 = args.length;
            args = F.arr_tmpl(args, args);
        return function() {
          var len2 = arguments.length,
              rule = args[Math.min(len2, len1)];
          return $.isFunction(rule) ? rule.apply(window, F.vec(arguments)) : rule;
        }
      },

    apply :
      function(x, y) {
        y = $.isArray(y) ? y : [];
        switch(arguments.length) {
          case 0:
            return false;
          case 1:
            return x();
          default:
            return x.apply(window, y);
        }
      },

    applyon :
      function(x, y, z) {
        z = z || [];
        return y.apply(x, z);
      },

    argrev :
      function(f) {
        return function() { return F.apply(f, F.reverse(F.vec(arguments))) };
      },

    applyto :
      function(args) { return F.partial(F.apply, F._, args) },

    comp :
      function() {
        var f   = F.first(arguments),
            fns = F.rest(arguments);
        return function() {
          return fns.length
            ? f(F.apply(F.apply(F.comp, fns), F.vec(arguments)))
            : F.apply(f, F.vec(arguments));
        };
      },

    trampoline :
      function() {
        var f     = F.first(arguments),
            args  = F.rest(arguments);
        if (args.length)
          f = F.trampoline(f.apply(window, args));
        else
          while (typeof(f) === "function")
            f = f();
        return f;
      },

    map :
      function (f, arr) {
        var i, j, ret=[];
        if ($.isArray(arr)) {
          for (i=0; i<arr.length; i++)
            if ((j = f(arr[i], i)) !== F._)
              ret.push(j);
        } else {
          for (i in arr)
            if ((j = f(arr[i], i)) !== F._)
              ret.push(j);
        }
        return ret;
      },

    mapn :
      function() {
        var f     = F.first(arguments),
            arrs  = F.map(F.vec, F.rest(arguments)),
            maxl  = F.reduce(function(x, xs) {
                      return Math.max(x.length, xs);
                    }, 0, arrs),
            ret   = [], i;

        for (i=0; i<maxl; i++)
          ret.push(f.apply(window, F.map(F.partial(F.nth, F._, i), arrs)));

        return ret;
      },

    mapargs :
      function(f, g) {
        return function() { return F.apply(f, F.map(g, F.vec(arguments))) };
      },

    filter :
      function(pred, arr) {
        return F.map(function(x) {
          return pred(x) ? x : F._;
        }, arr);
      },

    keep :
      function() {
        return F.apply(filter, [F.identity].concat(vec(arguments)));
      },

    induce :
      function(f) {
        return function(x, y) {
          return f(x, y) ? F.apply(f, F.rest(arguments)) : false;
        }
      },

    reduce :
      function(f, val, arr) {
        var tmp;
        if (arguments.length < 3) {
          arr = F.vec(val);
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
          arr = F.vec(arr);
          if (! arr.length)
            return val;
        }
        while (arr.length)
          val = f(arr.shift(), val);
        return val;
      },

    reverse :
      function(arr) { return arr.reverse() },

    take :
      function(num, arr) { return arr.slice(num) },

    collect :
      function(f) { return function() { return f(F.vec(arguments)) } },

    arr_tmpl :
      function(tmpl, arr) {
        return F.map(function(x) {
          switch (x) {
            case F._:
              return arr.shift();
            case F._0:
              return arr[0];
            case F._1:
              return arr[1];
            case F._2:
              return arr[2];
            case F._3:
              return arr[3];
            case F._4:
              return arr[4];
            case F._5:
              return arr[5];
            case F._6:
              return arr[6];
            case F._7:
              return arr[7];
            case F._8:
              return arr[8];
            default:
              return x;
          }
        }, tmpl);
      },

    partial :
      function() {
        var f    = F.first(arguments),
            args = F.rest(arguments);

        return function() {
          var args1 = F.vec(args),
              args2 = F.vec(arguments);
          args1 = F.arr_tmpl(args1, args2);
          return f.apply(window, args1.concat(args2));
        }
      },

    partiar :
      function partiar() {
        var f    = F.first(arguments),
            args = F.rest(arguments);

        return function() {
          var args1 = F.vec(args),
              args2 = F.vec(arguments);
          return f.apply(window, args2.concat(args1));
        }
      },

  };

  var mathfns = ["cos", "pow", "log", "tan", "sqrt", "ceil", "asin", "abs",
                 "max", "exp", "atan2", "random", "round", "floor", "acos",
                 "atan", "min", "sin"];

  F.map(function(x) {
    F[x] = function() { return Math[x].apply(window, F.vec(arguments)) };
  }, mathfns);

  window.Fundaments = F;

})(jQuery);
