
(function() {
  
  var T_OBJECT        = 1,
      T_DEFINED       = 2,
      T_FUNCTION      = 3,
      T_SPECIAL_FORM  = 4,
      T_LAMBDA        = 5,
      T_NIL           = 6,
      genv            = {};

  /***************************************************************************
   * Declarify.js module                                                     *
   ***************************************************************************/

  $UI.m.macro = {
    fn : function(name, fn) {
      genv[name] = { type: T_FUNCTION, expr: fn };
    },
    fm : function(name, fn) {
      genv[name] = { type: T_SPECIAL_FORM, expr: fn };
    }
  };

  var gensym = (function(count) {
    return function() {
      return "gensym_"+String(count++);
    };
  })(1);

  function dup(x) {
    return $.extend.apply(
      $, [true, $.type(x)==="array" ? [] : {}].concat(vec(arguments)));
  }

  function isElemNode(sexp) {
    return sexp.name.substr(0,1) !== "#";
  }

  function onlyElems(sexps) {
    return keep(mapn(function(x) {
      return isElemNode(x) ? x : null;
    }, sexps));
  }

  function a() {
    var x = 1;

    function b() {
      return x;
    }
  }

  function seq2vec(seq) {
    var arr = new Array(seq.length), i;
    for (i=0; i<seq.length; i++)
      arr[i]= seq[i];
    return arr;
  };

  function toSexp(elem) {
    var ret = {
      name: elem.nodeName.toLowerCase(),
      attr: {},
      chld: [],
      text: elem.nodeValue
    };

    if (isElemNode(ret)) {
      ret.attr = into({}, mapn(function(x) {
        var n = x.nodeName.toLowerCase();
        switch (n) {
          case "style": v = elem.style.cssText; break;
          default     : v = x.nodeValue;
        }
        return [n, v];
      }, filter(partial(assoc, _, "specified"), seq2vec(elem.attributes))));
      // ie7 workaround
      ret.attr.value = elem.value;
      ret.chld = mapn(toSexp, seq2vec(elem.childNodes));
    }

    return ret;
  }

  function createElem(sexp) {
    return $(sexp.name === "#text"
      ? document.createTextNode(sexp.text)
      : (sexp.name === "#comment"
          ? document.createComment(sexp.text)
          : document.createElement(sexp.name)));
  }

  function fromSexp(sexp) {
    var ret = createElem(sexp);
    
    return isElemNode(sexp)
      ? reduce(function(x, xs) {
          return xs.append(fromSexp(x));
        }, ret.attr(sexp.attr), sexp.chld)
      : ret;
  }

  function evalSexp(env, sexp) {
    sexp = dup(sexp || { type: T_NIL, expr: null });

    var sym   = dup(env[sexp.name] || { type: T_OBJECT, expr: sexp }),
        typ   = sym.type,
        val   = sym.expr,
        arg   = sexp.chld,
        f, e, i;
    
    if (typ !== T_SPECIAL_FORM)
      arg = keep(mapn(partial(evalSexp, (env = dup(env))), arg));

    switch (typ) {
      case T_NIL:
        return val;
      case T_LAMBDA:
        arg = onlyElems(arg);
        map(function(x,i) {
          sym.env[x] = { type: T_DEFINED, expr: arg[i] };
        }, sym.free);
        return evalSexp(sym.env, sym.expr);
      case T_FUNCTION:
      case T_SPECIAL_FORM:
        return sexp.chld.length
          ? apply(val, [env, sexp.attr].concat(onlyElems(arg)))
          : sexp;
      case T_DEFINED:
        t = dup(val);
        return evalSexp(env, assoc(val, "attr", dup(val.attr, sexp.attr),
                                        "chld", val.chld.concat(arg)));
      default:
        return assoc(sexp, "chld", arg);
    }
  }

  /***************************************************************************
   * JQuery modules                                                          *
   ***************************************************************************/

  $.fromSexp = function(sexp) {
    return sexp ? $(fromSexp(sexp)) : $();
  };

  $.fn.toSexp = function() {
    return toSexp(this[0]);
  };

  $.fn.evalSexp = function() {
    return this.replaceWith($.fromSexp(evalSexp(genv, this.toSexp())));
  };

  /***************************************************************************
   * Declarify.js hooks                                                      *
   ***************************************************************************/

  $UI.init.push(function() {
    $("body").evalSexp();
  });

  /***************************************************************************
   * Special forms                                                           *
   ***************************************************************************/

  $UI.m.macro.fm("define", function mdefine(env, meta, sym, val) {
    var v = evalSexp(env, dup(val));
    env[sym.name] = { type: T_DEFINED, expr: v };
    return null;
  });

  $UI.m.macro.fm("quote", function mquote(env, meta, sym) {
    return sym;
  });

  $UI.m.macro.fm("lambda", function mquote(env, meta, sym, body) {
    var name  = gensym(),
        e     = dup(env),
        free  = mapn(partial(assoc, _, "name"), onlyElems(sym.chld));
    env[name] = {
      type: T_LAMBDA,
      expr: body,
      free: free,
      env:  e
    };
    return { name: name, attr: {}, chld: [] };
  });

  /***************************************************************************
   * Functions                                                               *
   ***************************************************************************/

  $UI.m.macro.fn("identity", function mquote(env, meta, sym) {
    return sym;
  });

  $UI.m.macro.fn("conj", function mconj() {
    var arg   = mapn(dup, arguments),
        env   = arg[0],
        meta  = arg[1],
        par   = evalSexp(env, arg[2]);
    par.chld = par.chld.concat(mapn(partial(evalSexp, env), arg.slice(3)));
    return par;
  });

  $UI.m.macro.fn("depends", function mdepends(env, meta, sexp) {
    var sym = gensym(), attr;
    attr = into({}, keep(mapn(function(x) {
      return x[0] === "ref"
        ? [ "data-dep::"+x[1], sym ]
        : (x[0].substr(0,1) === ":"
            ? [ "data-"+sym+"::"+x[0].substr(1), x[1] ]
            : null);
    }, outof(meta))));
    return assoc(dup(sexp), "attr", dup(sexp.attr, attr));
  });

  $UI.m.macro.fn("map", function mdepends(env, meta, fn, list) {
    return assoc(list, "chld", mapn(function(x) {
      var f = dup(fn);
      f.chld = f.chld.concat([x]);
      return evalSexp(env, f);
    }, onlyElems(list.chld)));
  });

})();
