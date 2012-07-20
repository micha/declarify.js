
(function() {
  
  var T_OBJECT        = 1,
      T_DEFINED       = 2,
      T_FUNCTION      = 3,
      T_SPECIAL_FORM  = 4,
      T_LAMBDA        = 5,
      T_NLAMBDA       = 6,
      T_NIL           = 7,
      genv;
      
  var gensym = (function(count) {
    return function() {
      return "gensym_"+String(count++);
    };
  })(1);

  genv = {
    nil: { type: T_NIL, expr: mkSexp("nil") }
  };

  window.genv = function() { return dup(genv) };

  /***************************************************************************
   * Declarify.js module                                                     *
   ***************************************************************************/

  $UI.m.hlisp = {
    fn : regSym(T_FUNCTION),
    fm : regSym(T_SPECIAL_FORM)
  };

  function regSym(type) {
    return function(name, val) {
      if ($.type(name) === "object")
        mapn(partial(apply, regSym(type)), outof(name));
      else
        genv[name] = { type: type, expr: val };
    };
  }

  function fetchSync(url, type, nocache) {
    var ret;

    $.ajax(url, {
      async:    false,
      cache:    ! nocache,
      dataType: type,
      success:  function(data) { ret = data }
    });

    return ret;
  }

  function isElemNode(sexp) {
    return sexp.name.substr(0,1) !== "#";
  }

  function elems(sexps) {
    return keep(mapn(function(x) {
      return isElemNode(x) ? x : null;
    }, sexps));
  }

  function mkSexp(name) {
    var attr={}, chld=[], text;
    map(function(x) {
      switch ($.type(x)) {
        case "object":  attr = x; break;
        case "array":   chld = x; break;
        case "string":  text = x; break;
      }
    }, vec(arguments).slice(1));
    return { name: name, attr: attr, chld: chld, text: text };
  }

  mkSexp.text = function(text) {
    return mkSexp("#text", ""+text);
  };

  mkSexp.nil = function() {
    return dup(genv.nil.expr);
  };

  function isBoxed(sexp) {
    return sexp.name === "list" || sexp.name === "hash" ||
      sexp.name === "val" || sexp.name === "true" || sexp.name === "false";
  }

  function box(val) {
    switch ($.type(val)) {
      case "null":
        return mkSexp.nil();
      case "boolean":
        return mkSexp(String(val));
      case "array":
        return mkSexp("list", map(box, val));
      case "object":
        return mkSexp("hash", map(box, outof(val)));
      default:
        return mkSexp("val", [ mkSexp.text(val) ]);
    }
  }

  function unbox(sexp) {
    if (sexp.name === "true" || sexp.name === "false")
      return sexp.name === "true";
    else if (sexp.name === "nil")
      return null;
    else if (sexp.name === "val")
      return sexp.chld[0].text;
    else if (sexp.name === "list")
      return map(unbox, elems(sexp.chld));
    else if (sexp.name === "hash")
      return into({}, map(unbox, elems(sexp.chld)));
    else
      return sexp;
  }

  function seq2vec(seq) {
    var arr = new Array(seq.length), i;
    for (i=0; i<seq.length; i++)
      arr[i]= seq[i];
    return arr;
  };

  function tr(txt) {
    var x;
    while ( (x = /^\s*[;][^\n]*[\n]/.exec(txt)) ) {
      txt = txt.substr(x[0].length);
      if (x && x[0])
        tr.line += x[0].match(/\n/g).length;
    }

    if (x = /^\s*/.exec(txt)) {
      txt = txt.substr(x[0].length);
      if (x = x[0].match(/[\n]/g))
        tr.line += x.length;
    }

    return txt;
  }

  function HLispParseError(message) {
    this.message  = message;
    this.name     = "HLispParseError";
    this.toString = function() {
      return this.name+" in "+tr.file+", line "+tr.line+": "+this.message;
    };
  }

  function parseSexp(txt) {
    var ret = mkSexp(""), t, k, v;

    txt = tr(txt);

    if (! txt)
      return;

    txt = txt.replace(/^([a-zA-Z0-9_-]+)/, "($1)");

    if (txt[0] === "[")
      txt = "(list "+txt.substr(1);

    if (txt[0] === "^")
      txt = txt.replace(/^[\^]("[^"]*")/, "(val $1)");

    if (txt[0] !== "(")
      throw new HLispParseError("expected (, got: \n"+txt);

    txt = tr(txt.substr(1));

    t = /^[a-zA-Z0-9_-]+/.exec(txt);

    if (! (t && (ret.name = t[0])))
      throw new HLispParseError("expected tag, got: \n"+txt);

    txt = tr(txt.substr(ret.name.length));

    if (txt[0] === "{") {
      txt = tr(txt.substr(1));
      while (txt[0] !== "}") {
        t = /^[a-zA-Z0-9_:.-]+/.exec(txt);
        if (! (t && (k = t[0])))
          throw new HLispParseError("expected attribute key, got: \n"+txt);
        txt = tr(txt.substr(k.length));

        t = /^"[^"]*"/.exec(txt);
        v = t ? t[0].substr(1,t[0].length-2) : "";
        txt = t ? tr(txt.substr(t[0].length)) : txt;

        ret.attr[k] = v;
      }

      if (txt[0] !== "}")
        throw new HLispParseError("expected }, got: \n"+txt);

      txt = tr(txt.substr(1));
    }

    if (txt[0] === '"') {
      t = /^"[^"]*"/.exec(txt);
      if (! t)
        throw new HLispParseError("expected string, got: \n"+txt);
      ret.chld.push(mkSexp.text(t[0].substr(1,t[0].length-2)));
      txt = tr(txt.substr(t[0].length));
    } else 
      while (txt[0] !== ")" && txt[0] !== "]") {
        t = parseSexp(txt);
        if (! t)
          throw new HLispParseError("unexpected EOF");
        ret.chld.push(t[0]);
        txt = tr(t[1]);
      }

    if (txt[0] === "]")
      txt = ")" + txt.substr(1);

    if (txt[0] !== ")")
      throw new HLispParseError("expected ), got: \n"+txt);

    txt = tr(txt.substr(1));

    return [ret, txt];
  }

  function toSexp(elem) {
    var ret = mkSexp(elem.nodeName.toLowerCase(), ''+elem.nodeValue),
        s, p, t;

    if ($(elem).is("script[type='text/hlisp']")) {
      s       = $(elem).attr("src");
      t       = s ? fetchSync(s, "text") : $(elem).text();
      ret     = [];
      tr.line = 1;
      tr.file = s || "<script>";
      while ( (p = parseSexp(t)) ) {
        ret.push(p[0]);
        t = p[1];
      }
    } else if (isElemNode(ret)) {
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
      ret.chld = semiflat(mapn(toSexp, seq2vec(elem.childNodes)));
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
    sexp    = dup(sexp || { type: T_NIL, expr: null });

    var sym = dup(env[sexp.name] || genv[sexp.name] ||
                  { type: T_OBJECT, expr: sexp }),
        typ = sym.type,
        val = sym.expr,
        arg = sexp.chld,
        f, e, i;
    
    if (typ !== T_SPECIAL_FORM && typ !== T_NLAMBDA && typ !== T_DEFINED)
      arg = keep(mapn(partial(evalSexp, env), arg));

    switch (typ) {
      case T_NIL:
        return val;
      case T_NLAMBDA:
      case T_LAMBDA:
        if (sym.free.length && ! elems(sexp.chld).length)
          return sexp;

        arg = elems(arg);

        map(function(x) {
          if (x[0] in sexp.attr)
            sym.env[x[1]] = { type: T_DEFINED, expr: box(sexp.attr[x[0]]) };
        }, outof(sym.freeAttr));

        map(function(x,i) {
          var expr = $.type(x) === "array"
            ? mkSexp("list", arg.slice(i))
            : arg[i];
          sym.env[x] = { type: T_DEFINED, expr: expr || mkSexp.nil() };
        }, sym.free);

        sym.env.arguments = {
          type: T_DEFINED,
          expr: mkSexp("list", sexp.attr)
        };

        return evalSexp(sym.env, sym.expr);
      case T_FUNCTION:
      case T_SPECIAL_FORM:
        return sexp.chld.length
          ? apply(val, [env, sexp.attr].concat(elems(arg)))
          : sexp;
      case T_DEFINED:
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
    return this.replaceWith($.fromSexp(this.evalSexps()));
  };

  $.fn.evalSexps = function() {
    return reduce(partial(evalSexp, genv), null, wraparr(this.toSexp()));
  }

  /***************************************************************************
   * Declarify.js hooks                                                      *
   ***************************************************************************/

  $UI.init.push(function() {
    console.time("hlisp xhr");
    $("head script[type='text/hlisp']").each($.invoke("evalSexp"));
    console.timeEnd("hlisp xhr");
    console.time("hlisp eval");
    $("body").evalSexp();
    console.timeEnd("hlisp eval");
  });

  /***************************************************************************
   * Special forms                                                           *
   ***************************************************************************/

  function mkLambda(type) {
    return function mlambda(env, meta, sym, body) {
      function mkfree(sexp) {
        return "..." in sexp.attr ? [sexp.name] : sexp.name;
      }

      function mkFreeAttr(obj) {
        return into({}, map(function(x) {
          return [x[0], x[1] || x[0]];
        }, outof(obj)));
      }

      var name      = gensym(),
          e         = dup(env),
          free      = mapn(mkfree, elems(sym.chld)),
          freeAttr  = mkFreeAttr(sym.attr);

      genv[name] = {
        type:     type,
        expr:     body,
        free:     free,
        freeAttr: freeAttr,
        env:      e
      };

      return mkSexp(name);
    };
  }

  $UI.m.hlisp.fm({

    def :
      function mdef(env, meta, sym, val) {
        var v = evalSexp(env, dup(val));
        env[sym.name] = { type: T_DEFINED, expr: v };
        return null;
      },

    quote :
      function mquote(env, meta, sym) {
        return sym;
      },

    fn :
      mkLambda(T_LAMBDA),

    nlambda :
      mkLambda(T_NLAMBDA),

    defn :
      function mdefn(env, meta, sym, args, body) {
        var e, l;
        
        args.attr = sym.attr;
        l = evalSexp(env, mkSexp("fn", [ args, body ]));

        env[sym.name] = { type: T_DEFINED, expr: l };
        genv[l.name].env[sym.name] = dup(env[sym.name]);
      },

    cond :
      function mcond(env, meta) {
        var args = vec(arguments).slice(2), x;
        while (x = args.shift()) {
          if (x.chld[0].name === "else" || unbox(evalSexp(env, x.chld[0])))
            return evalSexp(env, x.chld[1]);
        }
      },

    time :
      function mtime(env, meta, str, form) {
        var ret, s = unbox(str);
        console.time(s);
        ret = evalSexp(env, form);
        console.timeEnd(s);
        return ret;
      }
  });

  /***************************************************************************
   * Functions                                                               *
   ***************************************************************************/

  $UI.m.hlisp.fn({

    apply :
      function mapply(env, meta, fn, args) {
        fn.chld = fn.chld.concat(elems(args.chld));
        fn.attr = dup(fn.attr, args.attr);
        return evalSexp(env, fn);
      },

    "do" :
      function mdo(env, meta) {
        return reduce(identity, null, vec(arguments).slice(2));
      },

    identity :
      function midentity(env, meta, sym) {
        return sym;
      },

    attr :
      function mattr(env, meta, sym) {
        var attrs = vec(arguments).slice(3);
        if (attrs.length == 1)
          return box(sym.attr[unbox(attrs[0])]);
        while (attrs.length > 1)
          sym.attr[unbox(attrs.shift())] = unbox(attrs.shift());
        return sym;
      },

    attrs :
      function mattrs(env, meta, sym) {
        return mkSexp("list", mapn(box, outof(sym.attr)));
      },

    text :
      function mtext(env, meta, sym, txt) {
        if (!txt)
          return box($.fromSexp(sym).text());
        sym.chld = [ mkSexp.text(unbox(txt)) ];
        return sym;
      },

    cat :
      function mcat(env, meta) {
        return reduce(function(x, xs) {
          xs.chld = xs.chld.concat(x.chld);
        }, arguments[2], vec(arguments).slice(3));
      },

    cons :
      function mcons() {
        var arg   = mapn(dup, arguments),
            env   = arg[0],
            meta  = arg[1],
            par   = evalSexp(env, arg[2]);
        par.chld = mapn(partial(evalSexp, env), arg.slice(3)).concat(par.chld);
        return par;
      },

    conj :
      function mconj() {
        var arg   = mapn(dup, arguments),
            env   = arg[0],
            meta  = arg[1],
            par   = evalSexp(env, arg[2]);
        par.chld = par.chld.concat(mapn(partial(evalSexp, env), arg.slice(3)));
        return par;
      },

    gensym :
      function mgensym(env, meta, sexp) {
        return box(gensym());
      },

    comp :
      function mcomp(env, meta) {

      },

    ddepends :
      function mdepends(env, meta, sexp) {
        var sym = gensym(), attr;
        attr = into({}, keep(mapn(function(x) {
          return x[0].substr(0,1) === ":"
            ? [ "data-"+sym+"::"+x[0].substr(1), x[1] ]
            : null;
        }, outof(meta))));
        attr["data-dep::"+meta.ref+":"+meta.attr] = sym;
        return assoc(dup(sexp), "attr", dup(sexp.attr, attr));
      },

    map :
      function mmap(env, meta, fn, list) {
        return assoc(list, "chld", mapn(function(x) {
          var f = dup(fn);
          f.chld = f.chld.concat([x]);
          return evalSexp(env, f);
        }, elems(list.chld)));
      },

    ins :
      function mins(env, meta, fn, list, dfl) {
        var x;
        switch (list.chld.length) {
          case 0:
            fn = dfl;
            break;
          case 1:
            fn      = dup(fn);
            fn.chld = fn.chld.concat([first(list.chld), dfl]);
            break;
          default:
            fn = dup(fn);
            x = mins(env, meta, fn, mkSexp("list", rest(list.chld)), dfl);
            fn.chld = fn.chld.concat([first(list.chld), x]);
            break;
        }
        return evalSexp(env, fn);
      },

    first :
      function mfirst(env, meta, list) {
        return first(list.chld);
      },

    rest :
      function mrest(env, meta, list) {
        return mkSexp(list.name, rest(list.chld));
      },

    count :
      function mcount(env, meta, list) {
        return box(elems(list.chld).length);
      },

    eq :
      function meq(env, meta, x, y) {
        return box(unbox(x) == unbox(y));
      },

    log :
      function mlog(env, meta) {
        console.log.apply(
          console,
          map(function(x) {
            return "name" in x && isBoxed(x)
              ? unbox(x)
              : x;
          }, vec(arguments).slice(2)));
        return mkSexp.nil();
      },

    strcat :
      function mstrcat(env, meta) {
        return box(mapn(unbox, vec(arguments).slice(2)).join(""));
      },

    js :
      function mjs(env, meta, js) {
        var jsenv, defs;

        function isDef(x) { return x[1] && x[1].type === T_DEFINED }

        defs = keep(map(function(x) {
          var name = x[0], n;
          while (x[1].expr && (n = x[1].expr.name) in env && isDef([n, env[n]]))
            x = [n, env[n]];
          return env[n] ? null : x;
        }, filter(isDef, outof(env))));

        jsenv = into({}, keep(map(function bar(x) {
          return isBoxed(x[1].expr)
            ? [x[0], unbox(x[1].expr)]
            : [x[0], x[1].expr];
        }, defs)));

        return box(evalenv(unbox(js), jsenv));
      }

  });

})();
