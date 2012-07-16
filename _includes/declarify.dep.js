
(function() {
  
  var mods  = {},
      flags = {};

  $UI.m.dep       = partial(assoc, mods);
  $UI.m.dep.flags = partial(assoc, mods, _, true);

  function processDep(elem, tag, name, attr) {
    var deps = $("["+$.sq("data-dep::"+name+":"+attr.substr(5))+"]");

    deps.each(function() {
      processDepElem($(this), elem, tag, name, attr);
    });
  }

  function processDepElem(dep, ref, tag, name, attr) {
    var depset = dep.attr("data-dep::"+name+":"+attr.substr(5));

    if (! depset)
      return;

    map(function(x) {
      map(function(y) {
        var same = {},
            opts = { "$val" : ref.attr(attr) },
            expr = dep.tfdEval(y[1], ref, same, opts),
            tmp;
        if (expr !== same) {
          if (y[0] in mods)
            mods[y[0]](dep, expr);
          else if (y[0] in flags)
            dep.attr("data-"+y[0], !!expr);
          else if ( (tmp = y[0].split(".")).length > 1 && tmp[0] in mods) {
            mods[tmp[0]](dep, expr, tmp.slice(1).join("."));
          } else
            dep.attr("data-"+y[0], expr);
        }
      }, outof(dep.tfdAttrMap()[x]));
    }, depset.split(" "));
  }

  function asMap(name) {
    var ret = function(name) { return asMap(name) },
        obj = $.type(name) == "string"
                ? $("body").byName(name).tfdAsMap()
                : name;
    ret.toMap = function() { return obj };
    return $.extend({}, ret, obj);
  }

  $.fn.tfdEval = function(expr, ref, same, opts) {
    var env = {
      "$this":  this,
      "$same":  same,
      "$$":     $(ref).tfdAsMapFn()
    };
    return evalenv(expr, $.extend({}, env, opts));
  };

  $.fn.tfdAsMapFn = function() {
    return asMap(this.tfdAsMap());
  };

  $.fn.tfdAsMap = function() {
    return into({}, keep(map(function(x) {
      return x[0].indexOf("::") >= 0 || x[0].substr(0, 5) !== "data-"
        ? null
        : [x[0].substr(5), x[1]];
    }, outof(this.attrMap()))));
  };

  $.fn.tfdAttrMap = function(name) {
    return reduce(function(x, xs) {
      var y = x[0].replace(/^data-/, '');

      if (y.length == x[0].length)
        return xs;

      var m = y.match(/^([a-z0-9-\._]+)::(.*)$/i),
          j = m ? m[1] : "",
          k = m ? m[2] : y;

      return assoc(xs, j, assoc(xs[j], k, x[1]));
    }, {}, outof(this.attrMap()));
  };

  $.fn.tfdGetDeps = function() {
    //(tag, name, attr)
    return map(function(x) {
      var y = x[0].split(":");
      return [x[0], y[0], "data-"+y[1]];
    }, outof(this.tfdAttrMap().dep));
  };

  $.fn.tfdInitDep = function() {
    var jself = this, ref;
    if (this.size() > 1)
      return this.each($.invoke("tfdInitDep"));
    map(function(x) {
      ref = $("body").byName(x[1]);
      if (ref.size())
        processDepElem.apply(window, [jself, ref].concat(x));
    }, this.tfdGetDeps());
  };

  $UI.prepare.push(function prepareDep(ctx) {
    console.time("init state");

    var deps = ctx.find("[data-declarify-init]");

    if (! deps.size())
      deps = ctx.find("*");
      
    console.log("# of deps:", deps.size());

    deps.tfdInitDep();

    console.timeEnd("init state");
  });

  $UI.process.push(function processDeps(q) {
    map(partial(apply, processDep), q);
  });

})();
