
(function() {
  
  /***************************************************************************
   * Hlisp expression data structure                                         *
   ***************************************************************************/

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
    var attr={}, chld=[], text="", cargs=[], aargs={}, env={}, proc, meta={};
    map(function(x) {
      switch ($.type(x)) {
        case "object":  attr = x; break;
        case "array":   chld = x; break;
        case "string":  text = x; break;
      }
    }, vec(arguments).slice(1));
    return { name: name, attr: attr, chld: chld, text: text, aargs: aargs,
             cargs: cargs, env: env, proc: proc };
  }

  mkSexp.text = function(text) {
    return mkSexp("#text", ""+text);
  };

  mkSexp.nil = function() {
    return dup(genv.nil.expr);
  };

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
    var ret = mkSexp(""), quoted=false, t, k, v;

    txt = tr(txt);

    if (! txt)
      return;

    if (txt === "#text")
      return [mkSexp("#text"), ""];

    if (txt.charAt(0) === "'") {
      quoted  = true;
      txt     = txt.substr(1);
    }

    txt = txt.replace(/^([a-zA-Z0-9_-]+)/, "($1)");

    if (txt.charAt(0) === "[")
      txt = "(list "+txt.substr(1);

    if (txt.charAt(0) === "^")
      txt = txt.replace(/^[\^]("[^"]*")/, "(val $1)");

    if (txt.charAt(0) !== "(")
      throw new HLispParseError("expected (, got: \n"+txt);

    txt = tr(txt.substr(1));

    t = /^[a-zA-Z0-9_-]+/.exec(txt);

    if (! (t && (ret.name = t[0])))
      throw new HLispParseError("expected tag, got: \n"+txt);

    txt = tr(txt.substr(ret.name.length));

    if (txt.charAt(0) === "{") {
      txt = tr(txt.substr(1));
      while (txt.charAt(0) !== "}") {
        t = /^[a-zA-Z0-9_:.-]+/.exec(txt);
        if (! (t && (k = t[0])))
          throw new HLispParseError("expected attribute key, got: \n"+txt);
        txt = tr(txt.substr(k.length));

        t = /^"[^"]*"/.exec(txt);
        v = t ? t[0].substr(1,t[0].length-2) : "";
        txt = t ? tr(txt.substr(t[0].length)) : txt;

        ret.attr[k] = v;
      }

      if (txt.charAt(0) !== "}")
        throw new HLispParseError("expected }, got: \n"+txt);

      txt = tr(txt.substr(1));
    }

    if (txt.charAt(0) === '"') {
      t = /^"[^"]*"/.exec(txt);
      if (! t)
        throw new HLispParseError("expected string, got: \n"+txt);
      ret.chld.push(mkSexp.text(t[0].substr(1,t[0].length-2)));
      txt = tr(txt.substr(t[0].length));
    } else 
      while (txt.charAt(0) !== ")" && txt.charAt(0) !== "]") {
        t = parseSexp(txt);
        if (! t)
          throw new HLispParseError("unexpected EOF");
        ret.chld.push(t[0]);
        txt = tr(t[1]);
      }

    if (txt.charAt(0) === "]")
      txt = ")" + txt.substr(1);

    if (txt.charAt(0) !== ")")
      throw new HLispParseError("expected ), got: \n"+txt);

    txt = tr(txt.substr(1));

    if (quoted)
      ret = mkSexp("quote", [ret]);

    return [ret, txt];
  }

  /***************************************************************************
   * HLisp expression wrapper                                                *
   ***************************************************************************/

  function hl(exp) {
    return new hl.fn.init(exp);
  }

  window.hl = hl;

  $.extend(hl, {

    invoke :
      function(meth) {
        var args = rest(arguments);
        return function() {
          return hl(this)[meth].apply(hl(this), args);
        }
      },

    accessor :
      function(key) {
        return function() {
          if (arguments.length) {
            this[0][key] = arguments[0];
            return this;
          } else
            return this[0][key];
        };
      },

    /* --- */

    genv : {},

    gensym :
      (function(count) {
        return function() {
          return "gensym_"+String(count++);
        };
      })(1),

    toExps :
      function(coll) {
        return semiflat(mapn(function(x) {
          return x instanceof hl ? x.get() : hl(x).get();
        }, coll));
      },

    parse :
      function(txt) {
        var ret, p;
        ret     = [];
        tr.line = 1;
        while ( (p = parseSexp(txt)) ) {
          ret.push(p[0]);
          txt = p[1];
        }
        return ret;
      },

    box :
      function(val) {
        switch ($.type(val)) {
          case "undefined":
          case "function":
            return hl.box("");
          case "null":
            return hl("nil");
          case "boolean":
            return hl(String(val));
          case "array":
            return hl("list").appendChld(hl.toExps(map(hl.box, val)));
          case "object":
            return hl("hash").appendChld(hl.toExps(map(hl.box, outof(val))));
          default:
            return hl('^"'+val+'"');
        }
      },

    eval :
      function(txt) {
        ret = $();
        hl(txt).each(function() {
          (hl(this).eval(hl.genv) || hl("nil")).each(function() {
            ret = ret.add(hl(this).toElem());
          });
        });
        return ret;
      }

  });

  hl.fn = hl.prototype = {

    init :
      function(exp) {
        if (exp instanceof hl)
          return exp;
        this.setArray($.type(exp) === "string" ? hl.parse(exp) : exp);
      },

    setArray :
      function(exps) {
        this.length = 0;
        [].push.apply(this, wraparr(exps));
        return this;
      },

    size :
      function() {
        return this.length;
      },

    eq :
      function(i) {
        i = +i;
        return this.slice(i, (i===-1 ? undefined : i+1));
      },

    get :
      function(i) {
        if (arguments.length > 0)
          return this[i];
        else
          return [].slice.call(this);
      },

    first :
      function() {
        return this.eq(0);
      },

    rest :
      function() {
        return this.slice(1);
      },

    last :
      function() {
        return this.eq(-1);
      },

    butlast :
      function() {
        return this.slice(0, this.size()-1);
      },

    push    : [].push,
    pop     : [].pop,
    shift   : [].shift,
    unshift : [].unshift,
    splice  : [].splice,

    slice :
      function() {
        return hl([].slice.apply(this, arguments));
      },

    map :
      function(fn) {
        return hl(mapn(function(x) {
          return fn.call(x, x);
        }, this.get()));
      },

    each :
      function(fn) {
        mapn(function(x) {
          return fn.call(x, x);
        }, this.get());
        return this;
      },

    filter :
      function() {
        var fn = arguments[0] || identity;
        return hl(filter(function(x) {
          return fn.call(x, x);
        }, this.get()));
      },

    append :
      function() {
        this.setArray(this.get().concat(hl.toExps(arguments)));
        return this;
      },

    prepend :
      function() {
        this.setArray(hl.toExps(arguments).concat(this.get()));
        return this;
      },

    /* --- */

    hlisp   : "0.1",
    tag     : hl.accessor("name"),
    text    : hl.accessor("text"),
    proc    : hl.accessor("proc"),
    aargs   : hl.accessor("aargs"),
    cargs   : hl.accessor("cargs"),
    env     : hl.accessor("env"),
    attrMap : hl.accessor("attr"),

    clone :
      function() {
        var ret = hl("");
        this.each(function(x) {
          x = hl(x);
          var e = hl(x.tag()).attrMap(dup(x.attrMap()))
                             .text(x.text()),
              c = x.chld().clone();
          ret.append(e.appendChld(c));
        });
        return ret;
      },

    elems :
      function() {
        return this.filter(hl.invoke("isElem"));
      },

    isElem :
      function() {
        return this.tag().charAt(0) !== "#";
      },

    attr :
      function(key) {
        if (arguments.length > 1) {
          this[0].attr[key] = arguments[1];
          return this;
        } else
          return this[0].attr[key];
      },

    echld :
      function(i) {
        return arguments.length == 0
          ? this.chld().elems()
          : this.echld().eq(i);
      },

    chld :
      function(i) {
        return arguments.length == 0
          ? hl(this[0].chld)
          : hl(this[0].chld[i]);
      },

    emptyChld :
      function(c) {
        this[0].chld = [];
        return this;
      },

    appendChld :
      function() {
        this[0].chld = this[0].chld.concat(hl.toExps(arguments));
        return this;
      },

    prependChld :
      function() {
        this[0].chld = hl.toExps(arguments).concat(this[0].chld);
        return this;
      },

    replaceChld :
      function() {
        return this.emptyChld().appendChld.apply(this, arguments);
      },

    wrap :
      function(p) {
        return hl(p).appendChld(this);
      },

    unbox :
      function() {
        if (this.tag() === "true" || this.tag() === "false")
          return this.tag() === "true";
        else if (this.tag() === "nil")
          return null;
        else if (this.tag() === "val")
          return this.chld(0).text() || "";
        else if (this.tag() === "list")
          return this.echld().map(hl.invoke("unbox"));
        else if (this.tag() === "hash")
          return into({}, this.echld().map(hl.invoke("unbox")));
        else
          return sexp;
      },

    boxed :
      function() {
        switch(this.tag()) {
          case "list":
          case "hash":
          case "val":
          case "true":
          case "false":
            return true;
          default:
            return false;
        }
      },

    isElemNode :
      function(sexp) {
        return this.tag().substr(0,1) !== "#";
      },

    toElem :
      function() {
        function createElem(sexp) {
          var tag = sexp.tag(),
              txt = sexp.text();
          return $(tag === "#text"
            ? document.createTextNode(txt)
            : (tag === "#comment"
                ? document.createComment(txt)
                : document.createElement(tag)));
        }

        if (! this[0])
          return $();

        var ret = createElem(this.eq(0));
        
        return isElemNode(this[0])
          ? reduce(function(x, xs) {
              return xs.append(hl(x).toElem());
            }, ret.attr(this.attrMap()), this.chld().get())
          : ret;
      },

    eval :
      function(env) {
        return (this.analyze())(env);
      },

    evalAll :
      function(env) {
        var ret = hl("");
        this.each(function(x) { ret.append(x(env)) });
        return ret;
      },

    analyze :
      function() {
        return this.analyzeObject()       ||
               this.analyzeQuoted()       ||
               this.analyzeDefinition()   ||
               this.analyzeFnDefinition() ||
               this.analyzeIf()           ||
               this.analyzeCond()         ||
               this.analyzeBegin()        ||
               this.analyzeEval()         ||
               this.analyzeApply()        ||
               this.analyzeCall()         ||
               this.analyzeLambda()       ||
               this.analyzeApplication()  ||
               this.analyzeVariable()     ||
               this.analyzeError();
      },

    analyzeError :
      function() {
        throw "hlisp: unknown expression type: '"+this.tag()+"'";
      },

    analyzeObject :
      function() {
        if (! (this.tag() in this.analyzeObject.tags) && this.isElem())
          return;

        var jself = this,
            chlds = this.chld().map(hl.invoke("analyze"));

        return function(env) {
          return jself.replaceChld(chlds.evalAll(env));
        };
      },

    analyzeQuoted :
      function() {
        if (this.tag() !== "quote")
          return;

        var jself = this;

        return function(env) { return jself.echld() };
      },

    analyzeDefinition :
      function() {
        if (this.tag() !== "def")
          return;

        var jself = this,
            c     = this.echld(),
            name  = c.eq(0).tag(),
            proc  = c.eq(1).analyze();

        return function(env) { env[name] = proc(env) };
      },

    analyzeFnDefinition :
      function() {
        if (this.tag() !== "defn")
          return;

        var jself   = this,
            c       = this.echld(),
            aparam  = c.eq(0).attrMap(),
            cparam  = c.eq(1),
            proc    = c.slice(2),
            name    = hl(c.eq(0).tag())
            fn      = hl("fn").attrMap(aparam).appendChld(cparam, proc);

        return hl("def").appendChld(name, fn).analyze();
      },

    analyzeLambda :
      function() {
        if (this.tag() !== "fn")
          return;

        function mkParam() {
          var jself = hl(this);
          return "..." in jself.attrMap() ? [jself.tag()] : jself.tag();
        }

        var cargs = this.echld(0).echld().map(mkParam).get(),
            aargs = this.attrMap(),
            proc  = this.echld().slice(1).analyzeSequence();

        return function(env) {
          return hl("procedure").proc(proc)
                                .cargs(cargs)
                                .aargs(aargs)
                                .env(env);
        };
      },

    analyzeSequence :
      function() {
        function sequentially(proc1, proc2) {
          return hl(function(env) {
            proc1[0](env);
            return proc2[0](env);
          });
        }

        function loop(proc, procs) {
          return procs.size()
            ? loop(sequentially(proc, procs.first()), procs.rest())
            : proc[0];
        }

        var procs = this.map(hl.invoke("analyze"));

        if (! procs.size())
          throw "hlisp: empty sequence of expressions";

        return loop(procs.first(), procs.rest());
      },

    cond2if :
      function() {
        var pred = this.first().echld(0),
            cons = this.first().echld(1);

        return pred.tag() === "else"
          ? cons
          : hl("if").appendChld(pred)
                    .appendChld(cons)
                    .appendChld(this.rest().cond2if());
      },

    analyzeCond :
      function() {
        if (this.tag() !== "cond")
          return;

        return this.echld().cond2if().analyze();
      },

    analyzeIf :
      function() {
        if (this.tag() !== "if")
          return;

        var c    = this.echld(),
            pred = c.eq(0).analyze(),
            cons = c.eq(1).analyze(),
            altr = (c.size() > 2 ? c.eq(2) : hl("false")).analyze();

        return function(env) {
          return ((pred(env)).tag() === "true" ? cons : altr)(env);
        }
      },

    analyzeBegin :
      function() {
        if (this.tag() !== "do")
          return;

        return this.echld().analyzeSequence();
      },

    analyzeEval :
      function() {
        if (this.tag() !== "eval")
          return;

        var proc = this.echld(0).analyze();

        return function(env) {
          return (proc(env)).eval(env);
        };
      },

    analyzeApply :
      function() {
        if (this.tag() !== "apply")
          return;

        var c     = this.echld(),
            proc  = c.eq(0).analyze(),
            aargs = dup(this.attrMap()),
            cargs = c.eq(1).echld().map(hl.invoke("analyze"));

        return function(env) {
          return (proc(env)).exec(cargs.evalAll(env), aargs);
        };
      },

    analyzeCall :
      function() {
        if (this.tag() !== "call")
          return;

        var c     = this.echld(),
            proc  = c.first().analyze(),
            aargs = this.attrMap(),
            cargs = c.rest().map(hl.invoke("analyze"));

        return function(env) {
          return (proc(env)).exec(cargs.evalAll(env), aargs);
        };
      },

    analyzeVariable :
      function() {
        if (this.echld().size())
          return;

        var name  = this.tag(),
            jself = this;

        return function(env) {
          var ret;

          while (env && ! (ret = env[name]))
            env = env.prnt;

          if (! env)
            throw "hlisp: unbound variable: '"+name+"'";

          return env[name];
        };
      },

    analyzeApplication :
      function() {
        if (! this.echld().size())
          return;

        var proc  = hl(this.tag()).analyze(),
            cargs = this.echld().map(hl.invoke("analyze")),
            aargs = dup(this.attrMap());

        return function(env) {
          return (proc(env)).exec(cargs.evalAll(env), aargs);
        };
      },

    extendEnv :
      function(cargs, aargs) {
        var ret = { prnt: this.env() };

        map(function(x, i) {
          var more  = $.type(x) === "array",
              x     = more ? x[0] : x,
              args  = hl(cargs.splice(0, more ? cargs.size() : 1));
          ret[x] = more ? hl("list").appendChld(args) : args;
        }, this.cargs());

        mapn(function(x) {
          if (x[0] in aargs)
            ret[x[1] || x[0]] = hl.box(aargs[x[0]]);
        }, outof(this.aargs()));

        ret.callee = hl("list").attrMap(aargs);

        return ret;
      },

    execCall :
      function() {
        var cargs = hl(""),
            aargs = {};
        cargs.append.apply(cargs, arguments);
        return this.exec(cargs, aargs);
      },

    exec :
      function(cargs, aargs) {
        if (this.tag() === "primitive")
          return (this.proc())(cargs, aargs);
        else if (this.tag() === "procedure")
          return (this.proc())(this.extendEnv(cargs, aargs));
        else
          throw "hlisp: unknown procedure type: '"+this.tag()+"'";
      }

  };

  hl.fn.init.prototype = hl.fn;

  /***************************************************************************
   * HLisp self-evaluating tags                                              *
   ***************************************************************************/

  hl.fn.analyzeObject.tags = {
    // Union of HTML 4.01 and HTML 5 tags //
    "a": true, "abbr": true, "acronym": true, "address": true, "applet":
    true, "area": true, "article": true, "aside": true, "audio": true,
    "b": true, "base": true, "basefont": true, "bdi": true, "bdo": true,
    "big": true, "blockquote": true, "body": true, "br": true, "button":
    true, "canvas": true, "caption": true, "center": true, "cite": true,
    "code": true, "col": true, "colgroup": true, "command": true, "data":
    true, "datalist": true, "dd": true, "del": true, "details": true,
    "dfn": true, "dir": true, "div": true, "dl": true, "dt": true,
    "em": true, "embed": true, "eventsource": true, "fieldset": true,
    "figcaption": true, "figure": true, "font": true, "footer": true,
    "form": true, "frame": true, "frameset": true, "h1": true, "h2":
    true, "h3": true, "h4": true, "h5": true, "h6": true, "head": true,
    "header": true, "hgroup": true, "hr": true, "html": true, "i": true,
    "iframe": true, "img": true, "input": true, "ins": true, "isindex":
    true, "kbd": true, "keygen": true, "label": true, "legend": true,
    "li": true, "link": true, "map": true, "mark": true, "menu":
    true, "meta": true, "meter": true, "nav": true, "noframes": true,
    "noscript": true, "object": true, "ol": true, "optgroup": true,
    "option": true, "output": true, "p": true, "param": true, "pre": true,
    "progress": true, "q": true, "rp": true, "rt": true, "ruby": true,
    "s": true, "samp": true, "script": true, "section": true, "select":
    true, "small": true, "source": true, "span": true, "strike": true,
    "strong": true, "style": true, "sub": true, "summary": true, "sup":
    true, "table": true, "tbody": true, "td": true, "textarea": true,
    "tfoot": true, "th": true, "thead": true, "time": true, "title":
    true, "tr": true, "track": true, "tt": true, "u": true, "ul": true,
    "var": true, "video": true, "wbr": true,

    // HLisp-specific self-evaluating symbols //
    "#text":true, "#comment":true, "val":true, "list":true, "hash":true,
    "true":true, "false":true, "nil":true, "null":true
  };

  hl.primitive = {

    attr :
      function(cargs, aargs) {
        var ret;
        if (cargs.size() === 2 && cargs.eq(1).tag() === "val")
          return hl.box(cargs.eq(0).attr(cargs.eq(1).unbox()));
        else {
          ret = cargs.eq(0).clone();
          cargs.rest().each(function() {
            var y = hl(this).unbox();
            ret.attr(y[0], y[1]);
          });
        }
        return ret;
      },

    attrs :
      function(cargs, aargs) {
        var ret;
        if (cargs.size() === 1)
          return reduce(function(x, xs) {
            return xs.appendChld(
              hl("list").appendChld(hl.box(x[0]), hl.box(x[1])));
          }, hl("list"), outof(cargs.eq(0).attrMap()));
        else {
          ret = cargs.eq(0).clone();
          return cargs.eq(1).tag() === "nil"
            ? cargs.eq(0).attrMap({})
            : reduce(function(x, xs) {
                return xs.attr(x[0], x[1]);
              }, ret, cargs.eq(1).echld().map(hl.invoke("unbox")));
        }
      },

    cat :
      function(cargs, aargs) {
        return reduce(function(x, xs) {
          return xs.appendChld(hl(x).echld());
        }, cargs.eq(0).clone(), cargs.rest().clone().get());
      },

    conj :
      function(cargs, aargs) {
        var p = cargs.first().clone(),
            c = cargs.rest().clone();
        return p.appendChld(c);
      },

    cons :
      function(cargs, aargs) {
        var p = cargs.first().clone(),
            c = cargs.rest().clone();
        return p.prependChld(c);
      },

    count :
      function(cargs, aargs) {
        return hl.box(cargs.eq(0).echld().size());
      },

    eq :
      function(cargs, aargs) {
        return hl.box(cargs.eq(0).unbox() === cargs.eq(1).unbox());
      },

    first :
      function(cargs, aargs) {
        return cargs.eq(0).echld(0).clone();
      },

    fmap :
      function(cargs, aargs) {
        var proc = cargs.eq(0),
            coll = cargs.eq(1).clone(),
            c    = coll.echld().clone();

        coll.emptyChld();

        c.each(function(x) {
          coll.appendChld(proc.exec(hl(x),{}));
        });

        return coll;
      },

    gensym :
      function(cargs, aargs) {
        return hl.box(hl.gensym());
      },

    id :
      function(cargs, aargs) {
        return cargs.eq(0).clone();
      },

    insert :
      function insert(cargs, aargs) {
        var proc = cargs.eq(0),
            coll = cargs.eq(1).echld().clone(),
            dfl  = cargs.eq(2).clone(),
            x, xs, rst;

        if (dfl.size())
          coll.append(dfl);

        if (coll.size() === 0)
          return hl("nil");
        else if (coll.size() === 1)
          return coll;
        else {
          x   = coll.first();
          rst = hl("list").appendChld(coll.rest());
          xs  = insert(proc.append(rst), aargs);
          return proc.execCall(x, xs);
        }
      },

    isnull :
      function(cargs, aargs) {
        return hl.box(cargs.eq(0).echld().size() === 0);
      },

    log :
      function(cargs, aargs) {
        console.log.apply(console, cargs.map(hl.invoke("unbox")).get());
      },

    times :
      function(cargs, aargs) {
        var n   = aargs.n,
            ret = hl("");
        while (n-- > 0)
          ret.append(cargs.clone());
        return ret;
      },

    range :
      function(cargs, aargs) {
        var start = cargs.size() === 2 ? cargs.eq(0).unbox() : 0,
            end   = (cargs.size() === 2 ? cargs.eq(1) : cargs.eq(0)).unbox(),
            ret   = hl("list"), i;

        for (i=start; i<end; i++)
          ret.appendChld(hl.box(i));

        return ret;
      },

    rest :
      function(cargs, aargs) {
        return hl("list").appendChld(cargs.eq(0).echld().slice(1).clone());
      },

    strcat :
      function(cargs, aargs) {
        return hl.box(cargs.map(hl.invoke("unbox")).get().join(""));
      },

    text :
      function(cargs, aargs) {
        return cargs.size() === 1
          ? hl.box(cargs.eq(0).toElem().text())
          : cargs.eq(0).clone().replaceChld(mkSexp.text(cargs.eq(1).unbox()));
      }

  };

  /***************************************************************************
   * HLisp initial global environment setup                                  * 
   ***************************************************************************/

  hl.setenv = function() {
    mapn(function(x) {
      if (x[0] in hl.fn.analyzeObject.tags)
        console.warn("hlisp: primitive shadowed by DOM element: '"+x[0]+"'");
      hl.genv[x[0]] = hl("primitive").proc(x[1]);
    }, outof(hl.primitive));
  };

  /***************************************************************************
   * HLisp <--> DOM element conversion functions                             * 
   ***************************************************************************/

  function toSexp(elem) {
    var ret = mkSexp(elem.nodeName.toLowerCase(), ''+elem.nodeValue),
        s, p, t;

    if ($(elem).is("script[type='text/hlisp']")) {
      s       = $(elem).attr("src");
      t       = s ? fetchSync(s, "text") : $(elem).text();
      ret     = [];
      tr.line = 1;
      tr.file = s || "#<script>";
      ret = t;
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

    return hl(ret);
  }

  function createElem(sexp) {
    return $(sexp.name === "#text"
      ? document.createTextNode(sexp.text)
      : (sexp.name === "#comment"
          ? document.createComment(sexp.text)
          : document.createElement(sexp.name)));
  }

  function evalSexp(env, sexp) {
    var ret;
    hl(sexp).each(function() { ret = hl(this).eval(env) });
    return ret;
  }

  /***************************************************************************
   * JQuery modules                                                          *
   ***************************************************************************/

  $.fromSexp = function(sexp) {
    return sexp ? hl(sexp).toElem() : $();
  };

  $.fn.toSexp = function() {
    return toSexp(this[0]);
  };

  $.fn.evalSexp = function() {
    var ret;
    this.toSexp().each(function() { ret = hl(this).eval(hl.genv) });
    this.replaceWith(ret ? ret.toElem() : $());
    return ret;
  };

  /***************************************************************************
   * Declarify.js hooks                                                      *
   ***************************************************************************/

  $UI.init.push(function() {
    console.time("hlisp init");
    hl.setenv();
    console.time("hlisp xhr");
    $("head script[type='text/hlisp']").each($.invoke("evalSexp"));
    console.timeEnd("hlisp xhr");
    console.time("hlisp eval");
    $("body").evalSexp();
    console.timeEnd("hlisp eval");
    console.timeEnd("hlisp init");
  });

})();
