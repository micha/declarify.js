
/**
 * Table of contents module
 */
(function($) {

  $.fn.siblingsUntil = function(selector) {
    var flag = true;
    return this.siblings().filter(function() {
      return $(this).is(selector) ? (flag = false) : flag;
    });
  };

  var toc = {
    "make-sections" :
      function(match, val, elem) {
        elem.find("h1").each(function() {
          var id    = $(this).text().toLowerCase().replace(/[^a-z]/g, '-'),
              wrap  = $("<div></div>")
                        .attr("depends-on", "section")
                        .attr("depends-val-eq", id);
          $(this).add(
            $(this).siblingsUntil("h1").not("div[depends-on='section']")
          ).wrapAll(wrap);
        });
      }
  };

  var prepare = {
    "make-sections" :
      function(match, val, elem) {
        $("form[name='"+val+"']")
          .find("[name='section']")
          .val($("[depends-on='section']").eq(0).attr("depends-val-eq"));
      }
  };

  $UI.init.unshift(function() {
    $("body").find("[make-sections]").each(function() {
      $UI.dispatch(toc, $(this));
    });
  });

  $UI.prepare.push(function(elem) {
    $UI.dispatch(prepare, elem);
  });

})(jQuery);

