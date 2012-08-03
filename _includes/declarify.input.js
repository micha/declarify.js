
(function() {

  $UI.m.stateAttr = function stateAttr(name, fn) {
    $UI.attr(name, function(elem, ini, fin, op) {
      $(elem)[(fin ? "add" : "remove")+"Class"](name.replace(/^data-/,""));
      if (fn)
        fn(elem, ini, fin, op);
    });
  };

  $UI.m.stateAttr("data-checked");
  $UI.m.stateAttr("data-selected");
  $UI.m.stateAttr("data-active");
  $UI.m.stateAttr("data-focused");
  $UI.m.stateAttr("data-disabled");
  $UI.m.stateAttr("data-readonly");

  function dataAttrs(elem, sel, attrs, flag) {
    map(function(x) {
      elem
        .andSelf()
        .find(sel)
        .filter("["+$.sq(x)+"]")
        .each(function() {
          $UI._attr(this, "data-"+x, flag ? "data-"+x : $(this).attr(x));
        })
        .end()
        .filter("[data-"+$.sq(x)+"]")
        .each(function() {
          if (flag)
            $UI._attr(this, "data-"+x, "data-"+x);
        })
        .filter("input,select,textarea")
        .not("["+$.sq(x)+"]")
        .each(function() {
          $UI._attr(this, x, flag ? x : $(this).attr("data-"+x));
        });
    }, attrs);
  }

  function linkedAttrs(names) {
    map(function(x) {
      $UI.attr("data-"+x, function(elem, ini, fin, op) {
        if (op === $UI.REMOVE) {
          if (x === "value")
            $(elem).attr(x, "");
          else
            $(elem).removeAttr(x);
        } else {
          $(elem).attr(x, fin);
        }
      });
    }, names);
  }

  var dAttrs = {
    "input,select,textarea":  ["name", "type", "value"]
  };

  var fAttrs = {
    "input,select,textarea":  ["checked", "disabled", "readonly"],
    "option":                 ["selected"]
  };

  $UI.init.push(function() {
    var radios  = "input[type='radio'],[data-type='radio']",
        checks  = "input[type='checkbox']",
        others  = "input[type!='radio'][type!='checkbox'],select,textarea",
        i;

    for (i in dAttrs)
      linkedAttrs(dAttrs[i]);

    function radioClick(elem, event) {
      var jself = $(elem),
          nm    = jself.attr("data-name") || jself.attr("name");
      $("[data-name='"+$.sq(nm)+"']").not(jself).removeAttr("data-checked");
      jself.attr("data-checked", true);
      $UI.run(0);
    }

    function checkboxClick(elem, event) {
      var jself = $(elem),
          fin   = jself.is("input")
                    ? jself.is(":checked")
                    : ! jself.is("[data-checked]");
      jself.attr("data-checked", fin);
      $UI.run(0);
    }

    function othersChange(elem, event) {
      var jself = $(elem);
      jself.attr("data-value", jself.val());
      $UI.run(0);
    }

    $(document)
      .on("click", function(event) {
        if ($(event.target).is(radios))
          radioClick(event.target, event);
        else if ($(event.target).is(checks))
          checkboxClick(event.target, event);
      })
      .on("change", function(event) {
        if ($(event.target).is(others))
          othersChange(event.target, event);
      });
  });

  $UI.prepare.push(function prepareAttrs(ctx) {
    var i;

    for (i in dAttrs)
      dataAttrs(ctx, i, dAttrs[i], false);

    for (i in fAttrs)
      dataAttrs(ctx, i, fAttrs[i], true);
  });

})();
