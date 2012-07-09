
(function() {
  
  var T_OBJECT        = 1,
      T_DEFINED       = 2,
      T_FUNCTION      = 3,
      T_SPECIAL_FORM  = 4,
      T_NIL           = 5,
      genv            = {};

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
        return [x.nodeName.toLowerCase(), x.nodeValue];
      }, filter(partial(assoc, _, "specified"), seq2vec(elem.attributes))));
      // ie7 doesn't have a value attribute for form elements
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
    var s   = sexp ? dup(sexp) : { type: T_NIL, expr: null },
        e   = dup(genv, env),
        sym = e[s.name] || { type: T_OBJECT, expr: s },
        typ = sym.type,
        val = sym.expr,
        c, t;
    
    c = typ === T_SPECIAL_FORM
          ? s.chld
          : keep(map(partial(evalSexp, e), s.chld));

    switch (typ) {
      case T_NIL:
        return val;
      case T_SPECIAL_FORM:
      case T_FUNCTION:
        return apply(val, [e, s.attr].concat(onlyElems(c)));
      case T_DEFINED:
        t = dup(val);
        return evalSexp(
          e, assoc(t, "attr", dup(t.attr, s.attr), "chld", t.chld.concat(c)));
      default:
        return assoc(s, "chld", c);
    }
  }

  $.fromSexp = function(sexp) {
    return sexp ? $(fromSexp(sexp)) : $();
  };

  $.fn.toSexp = function() {
    return toSexp(this[0]);
  };

  $.fn.evalSexp = function() {
    return this.replaceWith($.fromSexp(evalSexp(null, this.toSexp())));
  };

  $UI.init.push(function() {
    map(function(x) { $(x[0]).hide() }, outof(genv));
    $("body").evalSexp();
  });

  $UI.m.macro.fm("define", function mdefine(env, meta, sym, val) {
    var v = evalSexp(env, dup(val));
    genv[sym.name] = { type: T_DEFINED, expr: v };
    return null;
  });

  $UI.m.macro.fn("conj", function mconj() {
    var arg   = map(dup, arguments),
        env   = arg[0],
        meta  = arg[1],
        par   = evalSexp(env, arg[2]);
    par.chld = par.chld.concat(map(partial(evalSexp, env), arg.slice(3)));
    return par;
  });

  $UI.m.macro.fn("depends", function mdepends(env, meta, sexp) {
    var sym = gensym(), attr;
    attr = into({}, keep(map(function(x) {
      return x[0] === "ref"
        ? [ "data-dep::"+x[1], sym ]
        : (x[0].substr(0,1) === ":"
            ? [ "data-"+sym+"::"+x[0].substr(1), x[1] ]
            : null);
    }, outof(meta))));
    return assoc(dup(sexp), "attr", dup(sexp.attr, attr));
  });

})();
