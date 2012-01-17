
(function($) {

  /*************************************************************************** 
   * Local (private) functions                                               *
   ***************************************************************************/

  function unserialize(val) {
    if (!val) return "";
    try {
      return $.datepicker.parseDate(dateFormat, val);
    } catch (dateErr) {
      return $.isNaN(Number(val)) ? String(val) : Number(val);
    }
  }

  function serialize(val) {
    return $.type(val) === "date" 
      ? $.datepicker.formatDate(dateFormat, val)
      : String(val);
  }

  function d() {
    console.log("===>");
    map(function(x) {
      console.log(x);
    }, arguments);
    console.log("===>");
  }
        
  function htmlAttrFlag(flag) {
    return function() {
      if (arguments.length) {
        if (arguments[0])
          this.attr(flag, flag);
        else
          this.removeAttr(flag);
        return this;
      }
      return this.is("["+flag+"]");
    }
  }

  /*************************************************************************** 
   * TFD-UI constructorish functions                                         *
   ***************************************************************************/

  function actsLikeInput(elem) {
    switch(elem.attr("type")) {
      case "checkbox":
        return actsLikeInputCheckbox(elem);
      case "radio":
        return actsLikeInputRadio(elem);
      case "button":
        return actsLikeInputButton(elem);
      case "hidden":
        return actsLikeInputHidden(elem);
    }
  }

  function actsLikeInputCheckbox(elem) {
    elem.each(function() {
      var jself = $(this);
      jself.click(function() {
        if (! jself.is("[disabled]")) {
          jself.checked(! jself.checked());
          jself.trigger("change");
        }
      }).css("cursor", "pointer");

      jself.checked(jself.is("[checked]"));
    });
    return elem;
  }

  function actsLikeInputRadio(elem) {
    elem.each(function() {
      var jself = $(this);
      jself.click(function() {
        var name = jself.attr("name");
        if (! jself.is("[disabled]")) {
          $("[name='"+name+"']").each(function() {
            $(this).checked(false);
          });
          jself.checked(true);
          jself.trigger("change");
        }
      }).css("cursor", "pointer");

      jself.checked(jself.is("[checked]"));
    });
    return elem;
  }

  function actsLikeInputButton(elem) {
    elem.each(function() {
      var jself = $(this),
          name  = jself.attr("name");

      jself.click(function() {
        jself.trigger("change");
      }).css("cursor", "pointer");
    });
    return elem;
  }

  function actsLikeInputHidden(elem) {
    return elem;
  }

  function actsLikeSelect(elem) {
    function getSelected(options) {
      var selected = options.filter(function() {
        return $(this).selected();
      });

      return (selected.size())
        ? selected
        : options.first().selected(true);
    }

    function doSelect(eselect, edropdown, options, selecteds, selected) {
      eselect.val(selected.attr("value"));
      options.each(function() {
        $(this).selected(false);
      });
      selected.selected(true);
      edropdown.hide2();
      selecteds.each(function() {
        if ($(this).attr("value") == selected.attr("value"))
          $(this).selected(true).show2();
        else
          $(this).selected(false).hide2();
      });
    }

    elem.each(function() {
      var jself     = $(this),
          disabled  = jself.is("[disabled]"),
          dropdown  = $("[options-for='"+jself.attr("name")+"']"),
          options   = jself.options(),
          selecteds = jself.find("[acts-like='option']"),
          selected  = getSelected(options);

      doSelect(jself, dropdown, options, selecteds, selected);

      dropdown.click(function(event) {
        var target    = $(event.target),
            tactslike = target.attr("acts-like"),
            ttype     = target.attr("type"),
            disabled  = jself.is("[disabled]"),
            tdisabled = target.is("[disabled]");

        if (! disabled && $.inArray(event.target, options) != -1) {
          doSelect(jself, dropdown, options, selecteds, target);
          jself.trigger("change");
        }
      });

      jself.click(function(event) {
        if (! disabled)
          dropdown.toggle2();
      });
    
      options.css("cursor", "pointer");
      selecteds.css("cursor", "pointer");
      
      $(document).click(function() {
        if ($.inArray(event.target, selecteds) < 0)
          dropdown.hide2();
      });
    });
  }

  function mkDatePicker(elem) {
    elem.datepicker({
      inline:       true,
      dateFormat:   dateFormat
    });
  }

  function getVal(elem) {
    switch(elem.attr("type")) {
      case "radio":
        return elem
          .filter(elem.is("[acts-like]") ? "[checked]" : ":checked")
          .attr("value");
      case "button":
      case "checkbox":
        return elem.checked() ? 1 : 0;
      default:
        return elem.val();
    }
  }

  /*************************************************************************** 
   * Local variables                                                         *
   ***************************************************************************/

  var einputs       = ["input", "select", "textarea"],
      inputs        = reduce(function(x, xs) {
                        return xs.concat([x, "[acts-like='"+x+"']"]);
                      }, [], einputs),
      dateFormat    = "yy-mm-dd",
      validateSetup = {};

  /*************************************************************************** 
   * TFD-UI object                                                           *
   ***************************************************************************/

  var TFD_UI = {

    attrHandler: {
      "type":
        function(elem, match, val) {
          switch(val) {
            case "date":
              if (elem[0].nodeName == "INPUT")
                mkDatePicker(elem);
              break;
          }
        },

      "modal":
        function(elem, match, val) {
          elem.dialog({
            autoOpen: false,
            modal: true,
            title: elem.attr("title"),
          });

          switch(val) {
            case "plain":
              elem.dialog("option", {
                buttons: {},
                close: function() {}
              });
              break;
            case "form":
              break;
            case "confirm":
              elem.dialog("option", {
                buttons: {
                  "Yes": function() {
                    elem.val("1");
                    elem.trigger("change");
                    elem.dialog("close");
                  },
                  "No": function() { 
                    elem.val("0");
                    elem.trigger("change");
                    elem.dialog("close");
                  }
                },
                close: function() {}
              });
              break;
            case "alert":
              elem.dialog("option", {
                buttons: {
                  "Ok": function() { elem.dialog("close") }
                },
                close: function() {}
              });
              break;
          }
        },

      "depends-guard": 
        function(elem, match, val) {
          var dep = $("[name='"+val+"']");
          dep.change(function() {
            if ($(this).val() == 1)
              elem.click();
          });
          elem.click(function(event) {
            if (! dep.is(":visible")) {
              dep.show2();
              event.stopImmediatePropagation();
            }
          });
        },

      "acts-like": 
        function(elem, match, val) {
          switch(val) {
            case "input":
              return actsLikeInput(elem);
            case "select":
              return actsLikeSelect(elem);
          }
        },

      "depends-val-(.*)": 
        function(elem, match, val) {
          var dep = $("[name='"+elem.attr("depends-on")+"']"),
              tst = window[match[1].replace("-","_")];

          function doTest() {
            var f = elem.attr("depends-do") || "toggle",
                v = getVal(dep);
            f = TFD_UI.dependsAction[f];
            return f(elem, (tst(unserialize(v), unserialize(val))), v);
          }

          dep.change(function() {
            doTest();
          });

          doTest();
        },

      "val-(.*)": 
        function(elem, match, val) {
        },

      "template":
        function(elem, match, val) {
          if (! templatesEnabled)
            return;
          var p = elem.parent();
          elem.hide2();
          if (! p.data("actslike_bound_show"))
            p.data("actslike_bound_show", true).bind("show", function() {
              console.log("show "+val);
            });
        },
    },

    dependsAction: {
      "toggle": function(elem, test, val) {
        return elem[test ? "show2" : "hide2"]();
      },
      "setval": function(elem, test, val) {
        if (test)
          elem.val(val);
        return elem;
      },
      "setval": function(elem, test, val) {
        if (test)
          elem.val(val);
        return elem;
      },
      "setattr": function(elem, test, val) {
      }
    },

    processElem: function(elem) {
      elem.find("*").each(function() {
        var jself = $(this), attrs;
        map(function(x, i) {
          map(function(x2, i2, m) {
            if (m = (new RegExp("^"+i2+"$")).exec(i))
              x2(jself, m, x);
          }, TFD_UI.attrHandler);
        }, jself.attrMap());
      });
    }

  };

  /*************************************************************************** 
   * Global functions                                                        *
   ***************************************************************************/

  window.TFD_UI = TFD_UI;

  /*************************************************************************** 
   * jQuery domready event handler                                           *
   ***************************************************************************/

  $(function() {
    $("form").submit(function(event) {
      event.preventDefault();
    });
    TFD_UI.processElem($(document));

    $("*").filter(":visible").trigger("show");
  });

  /*************************************************************************** 
   * jQuery plugins                                                          *
   ***************************************************************************/

  $.fn.attrMap = function() {
    var ret = {};
    $.each(this.get(0).attributes, function(i,attr) {
      ret[attr.nodeName] = attr.nodeValue;
    });
    return ret;
  };

  $.fn.paramsVisible = function() {
    var ret = {};
    $.each(this.find(inputs).filter(":visible").filter("[name]"), function() {
      var input = $(this);
      ret[input.attr("name")] = input.val();
    });
    return ret;
  };

  $.fn.reset = function() {
    this.find(inputs).val(null);
    return this;
  };

  $.fn.mkOptions = function(opts) {
    var jself = this;
    $.each(opts, function(i,v) {
      jself.append($("<option/>").attr("value", v[0]).text(v[1]));
    });
    return this;  
  };

  $.fn.nodeName = function(n) {
    return (n = $(this).attr("acts-like")) ? n.toUpperCase() : this.nodeName;
  }

  $.fn.options = function() {
    if ($(this).is("[acts-like='select']"))
      return $("[options-for='"+$(this).attr("name")+"']").find("[acts-like='option']");
    else
      return $(this).find("option");
  };

  $.fn.val = (function(orig) {
    return function() {
      var args      = arraycp(arguments),
          actslike  = this.attr("acts-like");
      if (actslike)
        if (args.length) {
          if (this.is("[value]"))
            this.attr("value", arguments[0]);
          else
            this.data("actslike_value", arguments[0]);
          return this;
        } else {
          return this.is("[value]") 
            ? this.attr("value")
            : this.data("actslike_value");
        }
      else
        return orig.apply(this, args);
    };
  })($.fn.val);

  $.each(
    ["show", "toggle", "toggleClass", "addClass", "removeClass"],
    function() {
      $.fn[this] = (function(orig) {
        return function() {
          var hidden = this.find(":hidden").add(this.filter(":hidden")),
              args   = arraycp(arguments),
              result = orig.apply(this, args);
          hidden.filter(":visible").each(function(){
              $(this).triggerHandler("show");
          });
          return result;
        };
      })($.fn[this]);
    }
  );

  $.fn.show2 = function() {
    var args = arraycp(arguments);
    return this.is("[modal]") ? this.dialog("open") : $.fn.show.apply(this, args);
  };

  $.fn.hide2 = function() {
    var args = arraycp(arguments);
    return this.is("[modal]") ? this.dialog("close") : $.fn.hide.apply(this, args);
  };

  $.fn.toggle2 = function() {
    var args = arraycp(arguments), viz = this.is(":visible");
    return $.fn[viz ? "hide2" : "show2"].apply(this, args);
  };

  $.fn.checked = function() {
    if (arguments.length) {
      this.data("actslike_checked", arguments[0]);
      if (arguments[0])
        this.attr("checked", "checked");
      else
        this.removeAttr("checked");
      return this;
    }
    return this.is(":checked") || this.data("actslike_checked");
  };

  $.fn.toggleChecked = function() {
    this.checked(! this.checked());
    return this;
  };

  $.fn.selected = htmlAttrFlag("selected");

  $.fn.disabled = htmlAttrFlag("disabled");

  $.fn.initialVal = function() {
    if (arguments.length) {
      this.data("initial-val", arguments[0]);
      return this;
    }
    return this.data("initial-val");
  };

  var templatesEnabled  = false;
  var templates         = {};
  var defaultTemplateFn = function(data) {
    var jself = $(this);
    map(function(x, i) {
      jself.find("*").each(function() {
        var e = $(this);
        map(function(x2, i2) {
          var m = i2.match(/^data-fill(-(.*))?$/);
          if (!m || x2 != i)
            return;
          if (! m[2])
            e.text(serialize(x));
          else
            e.attr(m[2], x);
        }, e.attrMap());
      });
    }, data);
  };


  $.template = function(name, f) {
    if ($.isBool(name))
      templatesEnabled = name;
    else
      templates[name] = f;
  };

  $.fillTemplate = function(name, data) {
    if (! templatesEnabled)
      return;

    var f = templates[name] || defaultTemplateFn;

    $("[template='"+name+"'][filled]").remove();
    map(function(x) {
      var t = $("[template='"+name+"']").not("[filled]").eq(0),
          e = t.clone(true).attr("filled","filled");
      f.call(e, x);
      t.before(e);
      e.show2();
    }, data);
  };

  $.setInterval = function(f, t, start) {
    if (start)
      f();
    return setInterval(f, t);
  };

  $.clearInterval = function(id) {
    return clearInterval(id);
  }

  $.isBool = function(x) {
    return x===true || x===false;
  }

})(jQuery);
