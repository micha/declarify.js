
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

  $UI.m.lisp = {
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

  function elems(sexps) {
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

  function box(val) {
    return { name: "val", attr: {}, chld: [
      { name: "#text", attr: {}, chld: [], text: val }
    ] };
  }

  function unbox(sexp) {
    return sexp.chld[0].text;
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
        arg = elems(arg);
        map(function(x,i) {
          var expr = $.type(x) === "array"
            ? { name: "list", attr: {}, chld: arg.slice(i) }
            : arg[i];
          sym.env[x] = { type: T_DEFINED, expr: expr };
        }, sym.free);
        return evalSexp(sym.env, sym.expr);
      case T_FUNCTION:
      case T_SPECIAL_FORM:
        return sexp.chld.length
          ? apply(val, [env, sexp.attr].concat(elems(arg)))
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

  $UI.m.lisp.fm("define", function mdefine(env, meta, sym, val) {
    var v = evalSexp(env, dup(val));
    env[sym.name] = { type: T_DEFINED, expr: v };
    return null;
  });

  $UI.m.lisp.fm("quote", function mquote(env, meta, sym) {
    return sym;
  });

  $UI.m.lisp.fm("lambda", function mlambda(env, meta, sym, body) {
    function mkfree(sexp) {
      return "..." in sexp.attr ? [sexp.name] : sexp.name;
    }

    var name  = gensym(),
        e     = dup(env),
        free  = mapn(mkfree, elems(sym.chld));

    env[name] = {
      type: T_LAMBDA,
      expr: body,
      free: free,
      env:  e
    };

    return { name: name, attr: {}, chld: [] };
  });

  $UI.m.lisp.fm("defn", function mdefn(env, meta, sym, body) {
    return evalSexp(env, { name: "define", attr: {}, chld: [
      { name: sym.name, attr: {}, chld: [] },
      { name: "lambda", attr: {}, chld: [
        { name: "list", attr: sym.attr, chld: elems(sym.chld) },
        body
      ] }
    ] });
  });

  $UI.m.lisp.fm("apply", function mapply(env, meta, fn, args) {
    args    = evalSexp(env, args);
    fn.chld = fn.chld.concat(elems(args.chld));
    fn.attr = dup(fn.attr, args.attr);
    return evalSexp(env, fn);
  });

  /***************************************************************************
   * Functions                                                               *
   ***************************************************************************/

  $UI.m.lisp.fn("identity", function midentity(env, meta, sym) {
    return sym;
  });

  $UI.m.lisp.fn("get", function mget(env, meta, sym, attr) {
    return box(sym.attr[unbox(attr)]);
  });

  $UI.m.lisp.fn("set", function mset(env, meta, sym) {
    var attrs = vec(arguments).slice(3);
    while (attrs.length > 1)
      sym.attr[unbox(attrs.shift())] = unbox(attrs.shift());
    return sym;
  });

  $UI.m.lisp.fn("cat", function mcat(env, meta, coll1, coll2) {
    coll1.chld = coll1.chld.concat(coll2.chld);
    console.log("cat", coll1.chld);
    return coll1;
  });

  $UI.m.lisp.fn("cons", function mcons() {
    var arg   = mapn(dup, arguments),
        env   = arg[0],
        meta  = arg[1],
        par   = evalSexp(env, arg[2]);
    par.chld = mapn(partial(evalSexp, env), arg.slice(3)).concat(par.chld);
    return par;
  });

  $UI.m.lisp.fn("conj", function mconj() {
    var arg   = mapn(dup, arguments),
        env   = arg[0],
        meta  = arg[1],
        par   = evalSexp(env, arg[2]);
    par.chld = par.chld.concat(mapn(partial(evalSexp, env), arg.slice(3)));
    return par;
  });


  $UI.m.lisp.fn("comp", function mcomp(env, meta) {

  });

  $UI.m.lisp.fn("depends", function mdepends(env, meta, sexp) {
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

  $UI.m.lisp.fn("map", function mmap(env, meta, fn, list) {
    return assoc(list, "chld", mapn(function(x) {
      var f = dup(fn);
      f.chld = f.chld.concat([x]);
      return evalSexp(env, f);
    }, elems(list.chld)));
  });

})();
