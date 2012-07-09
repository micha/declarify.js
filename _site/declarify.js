
//console.time implementation for IE
if(window.console && typeof(window.console.time) == "undefined") {
  console.time = function(name, reset) {
    if(!name)
      return;
    var time = new Date().getTime();
    if(!console.timeCounters)
      console.timeCounters = {};
    var key = "KEY" + name.toString();
    if(!reset && console.timeCounters[key])
      return;
    console.timeCounters[key] = time;
  };

  console.timeEnd = function(name){
    var time = new Date().getTime();
    if(!console.timeCounters)
      return;
    var key = "KEY" + name.toString();
    var timeCounter = console.timeCounters[key];
    if(timeCounter) {
      var diff = time - timeCounter;
      var label = name + ": " + diff + "ms";
      console.info(label);
      delete console.timeCounters[key];
    }
    return diff;
  };
}


/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   emk <VYV03354@nifty.ne.jp>
 *   Daniel Glazman <glazman@netscape.com>
 *   L. David Baron <dbaron@dbaron.org>
 *   Boris Zbarsky <bzbarsky@mit.edu>
 *   Mats Palmgren <mats.palmgren@bredband.net>
 *   Christian Biesinger <cbiesinger@web.de>
 *   Jeff Walden <jwalden+code@mit.edu>
 *   Jonathon Jongsma <jonathon.jongsma@collabora.co.uk>, Collabora Ltd.
 *   Siraj Razick <siraj.razick@collabora.co.uk>, Collabora Ltd.
 *   Daniel Glazman <daniel.glazman@disruptive-innovations.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var kCHARSET_RULE_MISSING_SEMICOLON = "Missing semicolon at the end of @charset rule";
var kCHARSET_RULE_CHARSET_IS_STRING = "The charset in the @charset rule should be a string";
var kCHARSET_RULE_MISSING_WS = "Missing mandatory whitespace after @charset";
var kIMPORT_RULE_MISSING_URL = "Missing URL in @import rule";
var kURL_EOF = "Unexpected end of stylesheet";
var kURL_WS_INSIDE = "Multiple tokens inside a url() notation";
var kVARIABLES_RULE_POSITION = "@variables rule invalid at this position in the stylesheet";
var kIMPORT_RULE_POSITION = "@import rule invalid at this position in the stylesheet";
var kNAMESPACE_RULE_POSITION = "@namespace rule invalid at this position in the stylesheet";
var kCHARSET_RULE_CHARSET_SOF = "@charset rule invalid at this position in the stylesheet";
var kUNKNOWN_AT_RULE = "Unknow @-rule";

/* FROM http://peter.sh/data/vendor-prefixed-css.php?js=1 */

var kENGINES = [
  "webkit",
  "presto",
  "trident",
  "generic"
];

var kCSS_VENDOR_VALUES = {
  "-moz-box":             {"webkit": "-webkit-box",        "presto": "", "trident": "", "generic": "box" },
  "-moz-inline-box":      {"webkit": "-webkit-inline-box", "presto": "", "trident": "", "generic": "inline-box" },
  "-moz-initial":         {"webkit": "",                   "presto": "", "trident": "", "generic": "initial" },
  "-moz-linear-gradient": {"webkit20110101": FilterLinearGradientForOutput,
                           "webkit": FilterLinearGradientForOutput,
                           "presto": "",
                           "trident": "",
                           "generic": FilterLinearGradientForOutput },
  "-moz-radial-gradient": {"webkit20110101": FilterRadialGradientForOutput,
                           "webkit": FilterRadialGradientForOutput,
                           "presto": "",
                           "trident": "",
                           "generic": FilterRadialGradientForOutput },
  "-moz-repeating-linear-gradient": {"webkit20110101": "",
                           "webkit": FilterRepeatingGradientForOutput,
                           "presto": "",
                           "trident": "",
                           "generic": FilterRepeatingGradientForOutput },
  "-moz-repeating-radial-gradient": {"webkit20110101": "",
                           "webkit": FilterRepeatingGradientForOutput,
                           "presto": "",
                           "trident": "",
                           "generic": FilterRepeatingGradientForOutput }
};

var kCSS_VENDOR_PREFIXES = {"lastUpdate":1304175007,"properties":[{"gecko":"","webkit":"","presto":"","trident":"-ms-accelerator","status":"P"},
{"gecko":"","webkit":"","presto":"-wap-accesskey","trident":"","status":""},
{"gecko":"-moz-animation","webkit":"-webkit-animation","presto":"","trident":"","status":"WD"},
{"gecko":"-moz-animation-delay","webkit":"-webkit-animation-delay","presto":"","trident":"","status":"WD"},
{"gecko":"-moz-animation-direction","webkit":"-webkit-animation-direction","presto":"","trident":"","status":"WD"},
{"gecko":"-moz-animation-duration","webkit":"-webkit-animation-duration","presto":"","trident":"","status":"WD"},
{"gecko":"-moz-animation-fill-mode","webkit":"-webkit-animation-fill-mode","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-animation-iteration-count","webkit":"-webkit-animation-iteration-count","presto":"","trident":"","status":"WD"},
{"gecko":"-moz-animation-name","webkit":"-webkit-animation-name","presto":"","trident":"","status":"WD"},
{"gecko":"-moz-animation-play-state","webkit":"-webkit-animation-play-state","presto":"","trident":"","status":"WD"},
{"gecko":"-moz-animation-timing-function","webkit":"-webkit-animation-timing-function","presto":"","trident":"","status":"WD"},
{"gecko":"-moz-appearance","webkit":"-webkit-appearance","presto":"","trident":"","status":"CR"},
{"gecko":"","webkit":"-webkit-backface-visibility","presto":"","trident":"","status":"WD"},
{"gecko":"background-clip","webkit":"-webkit-background-clip","presto":"background-clip","trident":"background-clip","status":"WD"},
{"gecko":"","webkit":"-webkit-background-composite","presto":"","trident":"","status":""},
{"gecko":"-moz-background-inline-policy","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"background-origin","webkit":"-webkit-background-origin","presto":"background-origin","trident":"background-origin","status":"WD"},
{"gecko":"","webkit":"background-position-x","presto":"","trident":"-ms-background-position-x","status":""},
{"gecko":"","webkit":"background-position-y","presto":"","trident":"-ms-background-position-y","status":""},
{"gecko":"background-size","webkit":"-webkit-background-size","presto":"background-size","trident":"background-size","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-behavior","status":""},
{"gecko":"-moz-binding","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-block-progression","status":""},
{"gecko":"","webkit":"-webkit-border-after","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-border-after-color","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-border-after-style","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-border-after-width","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-border-before","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-border-before-color","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-border-before-style","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-border-before-width","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-border-bottom-colors","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"border-bottom-left-radius","webkit":"-webkit-border-bottom-left-radius","presto":"border-bottom-left-radius","trident":"border-bottom-left-radius","status":"WD"},
{"gecko":"","webkit":"-webkit-border-bottom-left-radius = border-bottom-left-radius","presto":"","trident":"","status":""},
{"gecko":"border-bottom-right-radius","webkit":"-webkit-border-bottom-right-radius","presto":"border-bottom-right-radius","trident":"border-bottom-right-radius","status":"WD"},
{"gecko":"","webkit":"-webkit-border-bottom-right-radius = border-bottom-right-radius","presto":"","trident":"","status":""},
{"gecko":"-moz-border-end","webkit":"-webkit-border-end","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-border-end-color","webkit":"-webkit-border-end-color","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-border-end-style","webkit":"-webkit-border-end-style","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-border-end-width","webkit":"-webkit-border-end-width","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-border-fit","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-border-horizontal-spacing","presto":"","trident":"","status":""},
{"gecko":"-moz-border-image","webkit":"-webkit-border-image","presto":"-o-border-image","trident":"","status":"WD"},
{"gecko":"-moz-border-left-colors","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"border-radius","webkit":"-webkit-border-radius","presto":"border-radius","trident":"border-radius","status":"WD"},
{"gecko":"-moz-border-right-colors","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"-moz-border-start","webkit":"-webkit-border-start","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-border-start-color","webkit":"-webkit-border-start-color","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-border-start-style","webkit":"-webkit-border-start-style","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-border-start-width","webkit":"-webkit-border-start-width","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-border-top-colors","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"border-top-left-radius","webkit":"-webkit-border-top-left-radius","presto":"border-top-left-radius","trident":"border-top-left-radius","status":"WD"},
{"gecko":"","webkit":"-webkit-border-top-left-radius = border-top-left-radius","presto":"","trident":"","status":""},
{"gecko":"border-top-right-radius","webkit":"-webkit-border-top-right-radius","presto":"border-top-right-radius","trident":"border-top-right-radius","status":"WD"},
{"gecko":"","webkit":"-webkit-border-top-right-radius = border-top-right-radius","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-border-vertical-spacing","presto":"","trident":"","status":""},
{"gecko":"-moz-box-align","webkit":"-webkit-box-align","presto":"","trident":"-ms-box-align","status":"WD"},
{"gecko":"-moz-box-direction","webkit":"-webkit-box-direction","presto":"","trident":"-ms-box-direction","status":"WD"},
{"gecko":"-moz-box-flex","webkit":"-webkit-box-flex","presto":"","trident":"-ms-box-flex","status":"WD"},
{"gecko":"","webkit":"-webkit-box-flex-group","presto":"","trident":"","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-box-line-progression","status":""},
{"gecko":"","webkit":"-webkit-box-lines","presto":"","trident":"-ms-box-lines","status":"WD"},
{"gecko":"-moz-box-ordinal-group","webkit":"-webkit-box-ordinal-group","presto":"","trident":"-ms-box-ordinal-group","status":"WD"},
{"gecko":"-moz-box-orient","webkit":"-webkit-box-orient","presto":"","trident":"-ms-box-orient","status":"WD"},
{"gecko":"-moz-box-pack","webkit":"-webkit-box-pack","presto":"","trident":"-ms-box-pack","status":"WD"},
{"gecko":"","webkit":"-webkit-box-reflect","presto":"","trident":"","status":""},
{"gecko":"box-shadow","webkit":"-webkit-box-shadow","presto":"box-shadow","trident":"box-shadow","status":"WD"},
{"gecko":"-moz-box-sizing","webkit":"box-sizing","presto":"box-sizing","trident":"","status":"CR"},
{"gecko":"","webkit":"-webkit-box-sizing = box-sizing","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-epub-caption-side = caption-side","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-color-correction","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-column-break-after","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-column-break-before","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-column-break-inside","presto":"","trident":"","status":""},
{"gecko":"-moz-column-count","webkit":"-webkit-column-count","presto":"column-count","trident":"column-count","status":"CR"},
{"gecko":"-moz-column-gap","webkit":"-webkit-column-gap","presto":"column-gap","trident":"column-gap","status":"CR"},
{"gecko":"-moz-column-rule","webkit":"-webkit-column-rule","presto":"column-rule","trident":"column-rule","status":"CR"},
{"gecko":"-moz-column-rule-color","webkit":"-webkit-column-rule-color","presto":"column-rule-color","trident":"column-rule-color","status":"CR"},
{"gecko":"-moz-column-rule-style","webkit":"-webkit-column-rule-style","presto":"column-rule-style","trident":"column-rule-style","status":"CR"},
{"gecko":"-moz-column-rule-width","webkit":"-webkit-column-rule-width","presto":"column-rule-width","trident":"column-rule-width","status":"CR"},
{"gecko":"","webkit":"-webkit-column-span","presto":"column-span","trident":"column-span","status":"CR"},
{"gecko":"-moz-column-width","webkit":"-webkit-column-width","presto":"column-width","trident":"column-width","status":"CR"},
{"gecko":"","webkit":"-webkit-columns","presto":"columns","trident":"columns","status":"CR"},
{"gecko":"","webkit":"-webkit-dashboard-region","presto":"-apple-dashboard-region","trident":"","status":""},
{"gecko":"filter","webkit":"","presto":"filter","trident":"-ms-filter","status":""},
{"gecko":"-moz-float-edge","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"","presto":"-o-focus-opacity","trident":"","status":""},
{"gecko":"-moz-font-feature-settings","webkit":"","presto":"","trident":"","status":""},
{"gecko":"-moz-font-language-override","webkit":"","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-font-size-delta","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-font-smoothing","presto":"","trident":"","status":""},
{"gecko":"-moz-force-broken-image-icon","webkit":"","presto":"","trident":"","status":""},
{"gecko":"","webkit":"","presto":"","trident":"-ms-grid-column","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-grid-column-align","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-grid-column-span","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-grid-columns","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-grid-layer","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-grid-row","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-grid-row-align","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-grid-row-span","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-grid-rows","status":"WD"},
{"gecko":"","webkit":"-webkit-highlight","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-hyphenate-character","presto":"","trident":"","status":"WD"},
{"gecko":"","webkit":"-webkit-hyphenate-limit-after","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-hyphenate-limit-before","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-hyphens","presto":"","trident":"","status":"WD"},
{"gecko":"","webkit":"-epub-hyphens = -webkit-hyphens","presto":"","trident":"","status":""},
{"gecko":"-moz-image-region","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"ime-mode","webkit":"","presto":"","trident":"-ms-ime-mode","status":""},
{"gecko":"","webkit":"","presto":"-wap-input-format","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-wap-input-required","trident":"","status":""},
{"gecko":"","webkit":"","presto":"","trident":"-ms-interpolation-mode","status":""},
{"gecko":"","webkit":"","presto":"-xv-interpret-as","trident":"","status":""},
{"gecko":"","webkit":"","presto":"","trident":"-ms-layout-flow","status":""},
{"gecko":"","webkit":"","presto":"","trident":"-ms-layout-grid","status":""},
{"gecko":"","webkit":"","presto":"","trident":"-ms-layout-grid-char","status":""},
{"gecko":"","webkit":"","presto":"","trident":"-ms-layout-grid-line","status":""},
{"gecko":"","webkit":"","presto":"","trident":"-ms-layout-grid-mode","status":""},
{"gecko":"","webkit":"","presto":"","trident":"-ms-layout-grid-type","status":""},
{"gecko":"","webkit":"-webkit-line-box-contain","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-line-break","presto":"","trident":"-ms-line-break","status":""},
{"gecko":"","webkit":"-webkit-line-clamp","presto":"","trident":"","status":""},
{"gecko":"","webkit":"","presto":"","trident":"-ms-line-grid-mode","status":""},
{"gecko":"","webkit":"","presto":"-o-link","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-o-link-source","trident":"","status":""},
{"gecko":"","webkit":"-webkit-locale","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-logical-height","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-logical-width","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-margin-after","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-margin-after-collapse","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-margin-before","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-margin-before-collapse","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-margin-bottom-collapse","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-margin-collapse","presto":"","trident":"","status":""},
{"gecko":"-moz-margin-end","webkit":"-webkit-margin-end","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-margin-start","webkit":"-webkit-margin-start","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-margin-top-collapse","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-marquee","presto":"","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-wap-marquee-dir","trident":"","status":""},
{"gecko":"","webkit":"-webkit-marquee-direction","presto":"","trident":"","status":"WD"},
{"gecko":"","webkit":"-webkit-marquee-increment","presto":"","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-wap-marquee-loop","trident":"","status":"WD"},
{"gecko":"","webkit":"-webkit-marquee-repetition","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-marquee-speed","presto":"-wap-marquee-speed","trident":"","status":"WD"},
{"gecko":"","webkit":"-webkit-marquee-style","presto":"-wap-marquee-style","trident":"","status":"WD"},
{"gecko":"mask","webkit":"-webkit-mask","presto":"mask","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-attachment","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-box-image","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-clip","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-composite","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-image","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-origin","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-position","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-position-x","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-position-y","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-repeat","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-repeat-x","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-repeat-y","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-mask-size","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-match-nearest-mail-blockquote-color","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-max-logical-height","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-max-logical-width","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-min-logical-height","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-min-logical-width","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"","presto":"-o-mini-fold","trident":"","status":""},
{"gecko":"","webkit":"-webkit-nbsp-mode","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"","presto":"-o-object-fit","trident":"","status":"ED"},
{"gecko":"","webkit":"","presto":"-o-object-position","trident":"","status":"ED"},
{"gecko":"opacity","webkit":"-webkit-opacity","presto":"opacity","trident":"opacity","status":"WD"},
{"gecko":"","webkit":"-webkit-opacity = opacity","presto":"","trident":"","status":""},
{"gecko":"-moz-outline-radius","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"-moz-outline-radius-bottomleft","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"-moz-outline-radius-bottomright","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"-moz-outline-radius-topleft","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"-moz-outline-radius-topright","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"overflow-x","webkit":"overflow-x","presto":"overflow-x","trident":"-ms-overflow-x","status":"WD"},
{"gecko":"overflow-y","webkit":"overflow-y","presto":"overflow-y","trident":"-ms-overflow-y","status":"WD"},
{"gecko":"","webkit":"-webkit-padding-after","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-padding-before","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-padding-end","webkit":"-webkit-padding-end","presto":"","trident":"","status":"ED"},
{"gecko":"-moz-padding-start","webkit":"-webkit-padding-start","presto":"","trident":"","status":"ED"},
{"gecko":"","webkit":"-webkit-perspective","presto":"","trident":"","status":"WD"},
{"gecko":"","webkit":"-webkit-perspective-origin","presto":"","trident":"","status":"WD"},
{"gecko":"","webkit":"-webkit-perspective-origin-x","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-perspective-origin-y","presto":"","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-xv-phonemes","trident":"","status":""},
{"gecko":"","webkit":"-webkit-rtl-ordering","presto":"","trident":"","status":"P"},
{"gecko":"-moz-script-level","webkit":"","presto":"","trident":"","status":""},
{"gecko":"-moz-script-min-size","webkit":"","presto":"","trident":"","status":""},
{"gecko":"-moz-script-size-multiplier","webkit":"","presto":"","trident":"","status":""},
{"gecko":"","webkit":"","presto":"scrollbar-3dlight-color","trident":"-ms-scrollbar-3dlight-color","status":"P"},
{"gecko":"","webkit":"","presto":"scrollbar-arrow-color","trident":"-ms-scrollbar-arrow-color","status":"P"},
{"gecko":"","webkit":"","presto":"scrollbar-base-color","trident":"-ms-scrollbar-base-color","status":"P"},
{"gecko":"","webkit":"","presto":"scrollbar-darkshadow-color","trident":"-ms-scrollbar-darkshadow-color","status":"P"},
{"gecko":"","webkit":"","presto":"scrollbar-face-color","trident":"-ms-scrollbar-face-color","status":"P"},
{"gecko":"","webkit":"","presto":"scrollbar-highlight-color","trident":"-ms-scrollbar-highlight-color","status":"P"},
{"gecko":"","webkit":"","presto":"scrollbar-shadow-color","trident":"-ms-scrollbar-shadow-color","status":"P"},
{"gecko":"","webkit":"","presto":"scrollbar-track-color","trident":"-ms-scrollbar-track-color","status":"P"},
{"gecko":"-moz-stack-sizing","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"-webkit-svg-shadow","presto":"","trident":"","status":""},
{"gecko":"-moz-tab-size","webkit":"","presto":"-o-tab-size","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-o-table-baseline","trident":"","status":""},
{"gecko":"","webkit":"-webkit-tap-highlight-color","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-text-align-last","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-text-autospace","status":"WD"},
{"gecko":"-moz-text-blink","webkit":"","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-text-combine","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-epub-text-combine = -webkit-text-combine","presto":"","trident":"","status":""},
{"gecko":"-moz-text-decoration-color","webkit":"","presto":"","trident":"","status":""},
{"gecko":"-moz-text-decoration-line","webkit":"","presto":"","trident":"","status":""},
{"gecko":"-moz-text-decoration-style","webkit":"","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-text-decorations-in-effect","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-text-emphasis","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-epub-text-emphasis = -webkit-text-emphasis","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-text-emphasis-color","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-epub-text-emphasis-color = -webkit-text-emphasis-color","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-text-emphasis-position","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-text-emphasis-style","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-epub-text-emphasis-style = -webkit-text-emphasis-style","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-webkit-text-fill-color","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-text-justify","status":"WD"},
{"gecko":"","webkit":"","presto":"","trident":"-ms-text-kashida-space","status":"P"},
{"gecko":"","webkit":"-webkit-text-orientation","presto":"","trident":"","status":""},
{"gecko":"","webkit":"-epub-text-orientation = -webkit-text-orientation","presto":"","trident":"","status":""},
{"gecko":"","webkit":"text-overflow","presto":"text-overflow","trident":"-ms-text-overflow","status":"WD"},
{"gecko":"","webkit":"-webkit-text-security","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"-webkit-text-size-adjust","presto":"","trident":"-ms-text-size-adjust","status":""},
{"gecko":"","webkit":"-webkit-text-stroke","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"-webkit-text-stroke-color","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"-webkit-text-stroke-width","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"-epub-text-transform = text-transform","presto":"","trident":"","status":""},
{"gecko":"","webkit":"","presto":"","trident":"-ms-text-underline-position","status":"P"},
{"gecko":"","webkit":"-webkit-touch-callout","presto":"","trident":"","status":"P"},
{"gecko":"-moz-transform","webkit":"-webkit-transform","presto":"-o-transform","trident":"-ms-transform","status":"WD"},
{"gecko":"-moz-transform-origin","webkit":"-webkit-transform-origin","presto":"-o-transform-origin","trident":"-ms-transform-origin","status":"WD"},
{"gecko":"","webkit":"-webkit-transform-origin-x","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"-webkit-transform-origin-y","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"-webkit-transform-origin-z","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"-webkit-transform-style","presto":"","trident":"","status":"WD"},
{"gecko":"-moz-transition","webkit":"-webkit-transition","presto":"-o-transition","trident":"","status":"WD"},
{"gecko":"-moz-transition-delay","webkit":"-webkit-transition-delay","presto":"-o-transition-delay","trident":"","status":"WD"},
{"gecko":"-moz-transition-duration","webkit":"-webkit-transition-duration","presto":"-o-transition-duration","trident":"","status":"WD"},
{"gecko":"-moz-transition-property","webkit":"-webkit-transition-property","presto":"-o-transition-property","trident":"","status":"WD"},
{"gecko":"-moz-transition-timing-function","webkit":"-webkit-transition-timing-function","presto":"-o-transition-timing-function","trident":"","status":"WD"},
{"gecko":"","webkit":"-webkit-user-drag","presto":"","trident":"","status":"P"},
{"gecko":"-moz-user-focus","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"-moz-user-input","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"-moz-user-modify","webkit":"-webkit-user-modify","presto":"","trident":"","status":"P"},
{"gecko":"-moz-user-select","webkit":"-webkit-user-select","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"","presto":"-xv-voice-balance","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-xv-voice-duration","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-xv-voice-pitch","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-xv-voice-pitch-range","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-xv-voice-rate","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-xv-voice-stress","trident":"","status":""},
{"gecko":"","webkit":"","presto":"-xv-voice-volume","trident":"","status":""},
{"gecko":"-moz-window-shadow","webkit":"","presto":"","trident":"","status":"P"},
{"gecko":"","webkit":"word-break","presto":"","trident":"-ms-word-break","status":"WD"},
{"gecko":"","webkit":"-epub-word-break = word-break","presto":"","trident":"","status":""},
{"gecko":"word-wrap","webkit":"word-wrap","presto":"word-wrap","trident":"-ms-word-wrap","status":"WD"},
{"gecko":"","webkit":"-webkit-writing-mode","presto":"writing-mode","trident":"-ms-writing-mode","status":"ED"},
{"gecko":"","webkit":"-epub-writing-mode = -webkit-writing-mode","presto":"","trident":"","status":""},
{"gecko":"","webkit":"zoom","presto":"","trident":"-ms-zoom","status":""}]};

var kCSS_PREFIXED_VALUE = [
  {"gecko": "-moz-box", "webkit": "-moz-box", "presto": "", "trident": "", "generic": "box"}
];

var CssInspector = {

  mVENDOR_PREFIXES: null,

  kEXPORTS_FOR_GECKO:   true,
  kEXPORTS_FOR_WEBKIT:  true,
  kEXPORTS_FOR_PRESTO:  true,
  kEXPORTS_FOR_TRIDENT: true,

  cleanPrefixes: function()
  {
    this.mVENDOR_PREFIXES = null;
  },

  prefixesForProperty: function(aProperty)
  {
    if (!this.mVENDOR_PREFIXES) {

      this.mVENDOR_PREFIXES = {};
      for (var i = 0; i < kCSS_VENDOR_PREFIXES.properties.length; i++) {
        var p = kCSS_VENDOR_PREFIXES.properties[i];
        if (p.gecko && (p.webkit || p.presto || p.trident)) {
          var o = {};
          if (this.kEXPORTS_FOR_GECKO) o[p.gecko] = true;
          if (this.kEXPORTS_FOR_WEBKIT && p.webkit)  o[p.webkit] = true;
          if (this.kEXPORTS_FOR_PRESTO && p.presto)  o[p.presto] = true;
          if (this.kEXPORTS_FOR_TRIDENT && p.trident) o[p.trident] = true;
          this.mVENDOR_PREFIXES[p.gecko] = [];
          for (var j in o)
            this.mVENDOR_PREFIXES[p.gecko].push(j)
        }
      }
    }
    if (aProperty in this.mVENDOR_PREFIXES)
      return this.mVENDOR_PREFIXES[aProperty].sort();
    return null;
  },

  parseColorStop: function(parser, token)
  {
    var color = parser.parseColor(token);
    var position = "";
    if (!color)
      return null;
    token = parser.getToken(true, true);
    if (token.isPercentage() ||
        token.isDimensionOfUnit("cm") ||
        token.isDimensionOfUnit("mm") ||
        token.isDimensionOfUnit("in") ||
        token.isDimensionOfUnit("pc") ||
        token.isDimensionOfUnit("px") ||
        token.isDimensionOfUnit("em") ||
        token.isDimensionOfUnit("ex") ||
        token.isDimensionOfUnit("pt")) {
      position = token.value;
      token = parser.getToken(true, true);
    }
    return { color: color, position: position }
  },

  parseGradient: function (parser, token)
  {
    var isRadial = false;
    var gradient = { isRepeating: false };
    if (token.isNotNull()) {
      if (token.isFunction("-moz-linear-gradient(") ||
          token.isFunction("-moz-radial-gradient(") ||
          token.isFunction("-moz-repeating-linear-gradient(") ||
          token.isFunction("-moz-repeating-radial-gradient(")) {
        if (token.isFunction("-moz-radial-gradient(") ||
            token.isFunction("-moz-repeating-radial-gradient(")) {
          gradient.isRadial = true;
        }
        if (token.isFunction("-moz-repeating-linear-gradient(") ||
            token.isFunction("-moz-repeating-radial-gradient(")) {
          gradient.isRepeating = true;
        }
        

        token = parser.getToken(true, true);
        var haveGradientLine = false;
        var foundHorizPosition = false;
        var haveAngle = false;

        if (token.isAngle()) {
          gradient.angle = token.value;
          haveGradientLine = true;
          haveAngle = true;
          token = parser.getToken(true, true);
        }

        if (token.isLength()
            || token.isIdent("top")
            || token.isIdent("center")
            || token.isIdent("bottom")
            || token.isIdent("left")
            || token.isIdent("right")) {
          haveGradientLine = true;
          if (token.isLength()
            || token.isIdent("left")
            || token.isIdent("right")) {
            foundHorizPosition = true;
          }
          gradient.position = token.value;
          token = parser.getToken(true, true);
        }

        if (haveGradientLine) {
          if (!haveAngle && token.isAngle()) { // we have an angle here
            gradient.angle = token.value;
            haveAngle = true;
            token = parser.getToken(true, true);
          }

          else if (token.isLength()
                  || (foundHorizPosition && (token.isIdent("top")
                                             || token.isIdent("center")
                                             || token.isIdent("bottom")))
                  || (!foundHorizPosition && (token.isLength()
                                              || token.isIdent("top")
                                              || token.isIdent("center")
                                              || token.isIdent("bottom")
                                              || token.isIdent("left")
                                              || token.isIdent("right")))) {
            gradient.position = ("position" in gradient) ? gradient.position + " ": "";
            gradient.position += token.value;
            token = parser.getToken(true, true);
          }

          if (!haveAngle && token.isAngle()) { // we have an angle here
            gradient.angle = token.value;
            haveAngle = true;
            token = parser.getToken(true, true);
          }

          // we must find a comma here
          if (!token.isSymbol(","))
            return null;
          token = parser.getToken(true, true);
        }

        // ok... Let's deal with the rest now
        if (gradient.isRadial) {
          if (token.isIdent("circle") ||
              token.isIdent("ellipse")) {
            gradient.shape = token.value;
            token = parser.getToken(true, true);
          }
          if (token.isIdent("closest-side") ||
                   token.isIdent("closest-corner") ||
                   token.isIdent("farthest-side") ||
                   token.isIdent("farthest-corner") ||
                   token.isIdent("contain") ||
                   token.isIdent("cover")) {
            gradient.size = token.value;
            token = parser.getToken(true, true);
          }
          if (!("shape" in gradient) &&
              (token.isIdent("circle") ||
               token.isIdent("ellipse"))) {
            // we can still have the second value...
            gradient.shape = token.value;
            token = parser.getToken(true, true);
          }
          if ((("shape" in gradient) || ("size" in gradient)) && !token.isSymbol(","))
            return null;
          else if (("shape" in gradient) || ("size" in gradient))
            token = parser.getToken(true, true);
        }

        // now color stops...
        var stop1 = this.parseColorStop(parser, token);
        if (!stop1)
          return null;
        token = parser.currentToken();
        if (!token.isSymbol(","))
          return null;
        token = parser.getToken(true, true);
        var stop2 = this.parseColorStop(parser, token);
        if (!stop2)
          return null;
        token = parser.currentToken();
        if (token.isSymbol(",")) {
          token = parser.getToken(true, true);
        }
        // ok we have at least two color stops
        gradient.stops = [stop1, stop2];
        while (!token.isSymbol(")")) {
          var colorstop = this.parseColorStop(parser, token);
          if (!colorstop)
            return null;
          token = parser.currentToken();
          if (!token.isSymbol(")") && !token.isSymbol(","))
            return null;
          if (token.isSymbol(","))
            token = parser.getToken(true, true);
          gradient.stops.push(colorstop);
        }
        return gradient;
      }
    }
    return null;
  },

  parseBoxShadows: function(aString)
  {
    var parser = new CSSParser();
    parser._init();
    parser.mPreserveWS       = false;
    parser.mPreserveComments = false;
    parser.mPreservedTokens = [];
    parser.mScanner.init(aString);

    var shadows = [];
    var token = parser.getToken(true, true);
    var color = "", blurRadius = "0px", offsetX = "0px", offsetY = "0px", spreadRadius = "0px";
    var inset = false;
    while (token.isNotNull()) {
      if (token.isIdent("none")) {
        shadows.push( { none: true } );
        token = parser.getToken(true, true);
      }
      else {
        if (token.isIdent('inset')) {
          inset = true;
          token = parser.getToken(true, true);
        }

        if (token.isPercentage() ||
            token.isDimensionOfUnit("cm") ||
            token.isDimensionOfUnit("mm") ||
            token.isDimensionOfUnit("in") ||
            token.isDimensionOfUnit("pc") ||
            token.isDimensionOfUnit("px") ||
            token.isDimensionOfUnit("em") ||
            token.isDimensionOfUnit("ex") ||
            token.isDimensionOfUnit("pt")) {
          var offsetX = token.value;
          token = parser.getToken(true, true);
        }
        else
          return [];

        if (!inset && token.isIdent('inset')) {
          inset = true;
          token = parser.getToken(true, true);
        }

        if (token.isPercentage() ||
            token.isDimensionOfUnit("cm") ||
            token.isDimensionOfUnit("mm") ||
            token.isDimensionOfUnit("in") ||
            token.isDimensionOfUnit("pc") ||
            token.isDimensionOfUnit("px") ||
            token.isDimensionOfUnit("em") ||
            token.isDimensionOfUnit("ex") ||
            token.isDimensionOfUnit("pt")) {
          var offsetX = token.value;
          token = parser.getToken(true, true);
        }
        else
          return [];

        if (!inset && token.isIdent('inset')) {
          inset = true;
          token = parser.getToken(true, true);
        }

        if (token.isPercentage() ||
            token.isDimensionOfUnit("cm") ||
            token.isDimensionOfUnit("mm") ||
            token.isDimensionOfUnit("in") ||
            token.isDimensionOfUnit("pc") ||
            token.isDimensionOfUnit("px") ||
            token.isDimensionOfUnit("em") ||
            token.isDimensionOfUnit("ex") ||
            token.isDimensionOfUnit("pt")) {
          var blurRadius = token.value;
          token = parser.getToken(true, true);
        }

        if (!inset && token.isIdent('inset')) {
          inset = true;
          token = parser.getToken(true, true);
        }

        if (token.isPercentage() ||
            token.isDimensionOfUnit("cm") ||
            token.isDimensionOfUnit("mm") ||
            token.isDimensionOfUnit("in") ||
            token.isDimensionOfUnit("pc") ||
            token.isDimensionOfUnit("px") ||
            token.isDimensionOfUnit("em") ||
            token.isDimensionOfUnit("ex") ||
            token.isDimensionOfUnit("pt")) {
          var spreadRadius = token.value;
          token = parser.getToken(true, true);
        }

        if (!inset && token.isIdent('inset')) {
          inset = true;
          token = parser.getToken(true, true);
        }

        if (token.isFunction("rgb(") ||
            token.isFunction("rgba(") ||
            token.isFunction("hsl(") ||
            token.isFunction("hsla(") ||
            token.isSymbol("#") ||
            token.isIdent()) {
          var color = parser.parseColor(token);
          token = parser.getToken(true, true);
        }

        if (!inset && token.isIdent('inset')) {
          inset = true;
          token = parser.getToken(true, true);
        }

        shadows.push( { none: false,
                        color: color,
                        offsetX: offsetX, offsetY: offsetY,
                        blurRadius: blurRadius,
                        spreadRadius: spreadRadius } );

        if (token.isSymbol(",")) {
          inset = false;
          color = "";
          blurRadius = "0px";
          spreadRadius = "0px"
          offsetX = "0px";
          offsetY = "0px"; 
          token = parser.getToken(true, true);
        }
        else if (!token.isNotNull())
          return shadows;
        else
          return [];
      }
    }
    return shadows;
  },

  parseTextShadows: function(aString)
  {
    var parser = new CSSParser();
    parser._init();
    parser.mPreserveWS       = false;
    parser.mPreserveComments = false;
    parser.mPreservedTokens = [];
    parser.mScanner.init(aString);

    var shadows = [];
    var token = parser.getToken(true, true);
    var color = "", blurRadius = "0px", offsetX = "0px", offsetY = "0px"; 
    while (token.isNotNull()) {
      if (token.isIdent("none")) {
        shadows.push( { none: true } );
        token = parser.getToken(true, true);
      }
      else {
        if (token.isFunction("rgb(") ||
            token.isFunction("rgba(") ||
            token.isFunction("hsl(") ||
            token.isFunction("hsla(") ||
            token.isSymbol("#") ||
            token.isIdent()) {
          var color = parser.parseColor(token);
          token = parser.getToken(true, true);
        }
        if (token.isPercentage() ||
            token.isDimensionOfUnit("cm") ||
            token.isDimensionOfUnit("mm") ||
            token.isDimensionOfUnit("in") ||
            token.isDimensionOfUnit("pc") ||
            token.isDimensionOfUnit("px") ||
            token.isDimensionOfUnit("em") ||
            token.isDimensionOfUnit("ex") ||
            token.isDimensionOfUnit("pt")) {
          var offsetX = token.value;
          token = parser.getToken(true, true);
        }
        else
          return [];
        if (token.isPercentage() ||
            token.isDimensionOfUnit("cm") ||
            token.isDimensionOfUnit("mm") ||
            token.isDimensionOfUnit("in") ||
            token.isDimensionOfUnit("pc") ||
            token.isDimensionOfUnit("px") ||
            token.isDimensionOfUnit("em") ||
            token.isDimensionOfUnit("ex") ||
            token.isDimensionOfUnit("pt")) {
          var offsetY = token.value;
          token = parser.getToken(true, true);
        }
        else
          return [];
        if (token.isPercentage() ||
            token.isDimensionOfUnit("cm") ||
            token.isDimensionOfUnit("mm") ||
            token.isDimensionOfUnit("in") ||
            token.isDimensionOfUnit("pc") ||
            token.isDimensionOfUnit("px") ||
            token.isDimensionOfUnit("em") ||
            token.isDimensionOfUnit("ex") ||
            token.isDimensionOfUnit("pt")) {
          var blurRadius = token.value;
          token = parser.getToken(true, true);
        }
        if (!color &&
            (token.isFunction("rgb(") ||
             token.isFunction("rgba(") ||
             token.isFunction("hsl(") ||
             token.isFunction("hsla(") ||
             token.isSymbol("#") ||
             token.isIdent())) {
          var color = parser.parseColor(token);
          token = parser.getToken(true, true);
        }

        shadows.push( { none: false,
                        color: color,
                        offsetX: offsetX, offsetY: offsetY,
                        blurRadius: blurRadius } );

        if (token.isSymbol(",")) {
          color = "";
          blurRadius = "0px";
          offsetX = "0px";
          offsetY = "0px"; 
          token = parser.getToken(true, true);
        }
        else if (!token.isNotNull())
          return shadows;
        else
          return [];
      }
    }
    return shadows;
  },

  parseBackgroundImages: function(aString)
  {
    var parser = new CSSParser();
    parser._init();
    parser.mPreserveWS       = false;
    parser.mPreserveComments = false;
    parser.mPreservedTokens = [];
    parser.mScanner.init(aString);

    var backgrounds = [];
    var token = parser.getToken(true, true);
    while (token.isNotNull()) {
      /*if (token.isFunction("rgb(") ||
          token.isFunction("rgba(") ||
          token.isFunction("hsl(") ||
          token.isFunction("hsla(") ||
          token.isSymbol("#") ||
          token.isIdent()) {
        var color = parser.parseColor(token);
        backgrounds.push( { type: "color", value: color });
        token = parser.getToken(true, true);
      }
      else */
      if (token.isFunction("url(")) {
        token = parser.getToken(true, true);
        var urlContent = parser.parseURL(token);
        backgrounds.push( { type: "image", value: "url(" + urlContent });
        token = parser.getToken(true, true);
      }
      else if (token.isFunction("-moz-linear-gradient(") ||
               token.isFunction("-moz-radial-gradient(") ||
               token.isFunction("-moz-repeating-linear-gradient(") ||
               token.isFunction("-moz-repeating-radial-gradient(")) {
        var gradient = this.parseGradient(parser, token);
        backgrounds.push( { type: gradient.isRadial ? "radial-gradient" : "linear-gradient", value: gradient });
        token = parser.getToken(true, true);
      }
      else
        return null;
      if (token.isSymbol(",")) {
        token = parser.getToken(true, true);
        if (!token.isNotNull())
          return null;
      }
    }
    return backgrounds;
  },

  serializeGradient: function(gradient)
  {
    var s = gradient.isRadial
              ? (gradient.isRepeating ? "-moz-repeating-radial-gradient(" : "-moz-radial-gradient(" )
              : (gradient.isRepeating ? "-moz-repeating-linear-gradient(" : "-moz-linear-gradient(" );
    if (gradient.angle || gradient.position)
      s += (gradient.angle ? gradient.angle + " ": "") +
           (gradient.position ? gradient.position : "") +
           ", ";
    if (gradient.isRadial && (gradient.shape || gradient.size))
      s += (gradient.shape ? gradient.shape : "") +
           " " +
           (gradient.size ? gradient.size : "") +
           ", ";
    for (var i = 0; i < gradient.stops.length; i++) {
      var colorstop = gradient.stops[i];
      s += colorstop.color + (colorstop.position ? " " + colorstop.position : "");
      if (i != gradient.stops.length -1)
        s += ", ";
    }
    s += ")";
    return s;
  },

  parseBorderImage: function(aString)
  {
    var parser = new CSSParser();
    parser._init();
    parser.mPreserveWS       = false;
    parser.mPreserveComments = false;
    parser.mPreservedTokens = [];
    parser.mScanner.init(aString);

    var borderImage = {url: "", offsets: [], widths: [], sizes: []};
    var token = parser.getToken(true, true);
    if (token.isFunction("url(")) {
      token = parser.getToken(true, true);
      var urlContent = parser.parseURL(token);
      if (urlContent) {
        borderImage.url = urlContent.substr(0, urlContent.length - 1).trim();
        if ((borderImage.url[0] == '"' && borderImage.url[borderImage.url.length - 1] == '"') ||
             (borderImage.url[0] == "'" && borderImage.url[borderImage.url.length - 1] == "'"))
        borderImage.url = borderImage.url.substr(1, borderImage.url.length - 2);
      }
      else
        return null;
    }
    else
      return null; 

    token = parser.getToken(true, true);
    if (token.isNumber() || token.isPercentage())
      borderImage.offsets.push(token.value);
    else
      return null;
    var i;
    for (i= 0; i < 3; i++) {
      token = parser.getToken(true, true);
      if (token.isNumber() || token.isPercentage())
        borderImage.offsets.push(token.value);
      else
        break;
    }
    if (i == 3)
      token = parser.getToken(true, true);

    if (token.isSymbol("/")) {
      token = parser.getToken(true, true);
      if (token.isDimension()
          || token.isNumber("0")
          || (token.isIdent() && token.value in parser.kBORDER_WIDTH_NAMES))
        borderImage.widths.push(token.value);
      else
        return null;

      for (var i = 0; i < 3; i++) {
        token = parser.getToken(true, true);
        if (token.isDimension()
            || token.isNumber("0")
            || (token.isIdent() && token.value in parser.kBORDER_WIDTH_NAMES))
          borderImage.widths.push(token.value);
        else
          break;
      }
      if (i == 3)
        token = parser.getToken(true, true);
    }

    for (var i = 0; i < 2; i++) {
      if (token.isIdent("stretch")
          || token.isIdent("repeat")
          || token.isIdent("round"))
        borderImage.sizes.push(token.value);
      else if (!token.isNotNull())
        return borderImage;
      else
        return null;
      token = parser.getToken(true, true);
    }
    if (!token.isNotNull())
      return borderImage;

    return null;
  },

  parseMediaQuery: function(aString)
  {
    var kCONSTRAINTS = {
      "width": true,
      "min-width": true,
      "max-width": true,
      "height": true,
      "min-height": true,
      "max-height": true,
      "device-width": true,
      "min-device-width": true,
      "max-device-width": true,
      "device-height": true,
      "min-device-height": true,
      "max-device-height": true,
      "orientation": true,
      "aspect-ratio": true,
      "min-aspect-ratio": true,
      "max-aspect-ratio": true,
      "device-aspect-ratio": true,
      "min-device-aspect-ratio": true,
      "max-device-aspect-ratio": true,
      "color": true,
      "min-color": true,
      "max-color": true,
      "color-index": true,
      "min-color-index": true,
      "max-color-index": true,
      "monochrome": true,
      "min-monochrome": true,
      "max-monochrome": true,
      "resolution": true,
      "min-resolution": true,
      "max-resolution": true,
      "scan": true,
      "grid": true
    };
    var parser = new CSSParser();
    parser._init();
    parser.mPreserveWS       = false;
    parser.mPreserveComments = false;
    parser.mPreservedTokens = [];
    parser.mScanner.init(aString);

    var m = {amplifier: "", medium: "", constraints: []};
    var token = parser.getToken(true, true);

    if (token.isIdent("all") ||
        token.isIdent("aural") ||
        token.isIdent("braille") ||
        token.isIdent("handheld") ||
        token.isIdent("print") ||
        token.isIdent("projection") ||
        token.isIdent("screen") ||
        token.isIdent("tty") ||
        token.isIdent("tv")) {
       m.medium = token.value;
       token = parser.getToken(true, true);
    }
    else if (token.isIdent("not") || token.isIdent("only")) {
      m.amplifier = token.value;
      token = parser.getToken(true, true);
      if (token.isIdent("all") ||
          token.isIdent("aural") ||
          token.isIdent("braille") ||
          token.isIdent("handheld") ||
          token.isIdent("print") ||
          token.isIdent("projection") ||
          token.isIdent("screen") ||
          token.isIdent("tty") ||
          token.isIdent("tv")) {
         m.medium = token.value;
         token = parser.getToken(true, true);
      }
      else
        return null;
    }

    if (m.medium) {
      if (!token.isNotNull())
        return m;
      if (token.isIdent("and")) {
        token = parser.getToken(true, true);
      }
      else
        return null;
    }

    while (token.isSymbol("(")) {
      token = parser.getToken(true, true);
      if (token.isIdent() && (token.value in kCONSTRAINTS)) {
        var constraint = token.value;
        token = parser.getToken(true, true);
        if (token.isSymbol(":")) {
          token = parser.getToken(true, true);
          var values = [];
          while (!token.isSymbol(")")) {
            values.push(token.value);
            token = parser.getToken(true, true);
          }
          if (token.isSymbol(")")) {
            m.constraints.push({constraint: constraint, value: values});
            token = parser.getToken(true, true);
            if (token.isNotNull()) {
              if (token.isIdent("and")) {
                token = parser.getToken(true, true);
              }
              else
                return null;
            }
            else
              return m;
          }
          else
            return null;
        }
        else if (token.isSymbol(")")) {
          m.constraints.push({constraint: constraint, value: null});
          token = parser.getToken(true, true);
          if (token.isNotNull()) {
            if (token.isIdent("and")) {
              token = parser.getToken(true, true);
            }
            else
              return null;
          }
          else
            return m;
        }
        else
          return null;
      }
      else
        return null;
    }
    return m;
  }

};


/************************************************************/
/************************** JSCSSP **************************/
/************************************************************/

var CSS_ESCAPE  = '\\';

var IS_HEX_DIGIT  = 1;
var START_IDENT   = 2;
var IS_IDENT      = 4;
var IS_WHITESPACE = 8;

var W   = IS_WHITESPACE;
var I   = IS_IDENT;
var S   =          START_IDENT;
var SI  = IS_IDENT|START_IDENT;
var XI  = IS_IDENT            |IS_HEX_DIGIT;
var XSI = IS_IDENT|START_IDENT|IS_HEX_DIGIT;

function CSSScanner(aString)
{
  this.init(aString);
}

CSSScanner.prototype = {

  kLexTable: [
  //                                     TAB LF      FF  CR
     0,  0,  0,  0,  0,  0,  0,  0,  0,  W,  W,  0,  W,  W,  0,  0,
  //
     0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  // SPC !   "   #   $   %   &   '   (   )   *   +   ,   -   .   /
     W,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  I,  0,  0,
  // 0   1   2   3   4   5   6   7   8   9   :   ;   <   =   >   ?
     XI, XI, XI, XI, XI, XI, XI, XI, XI, XI, 0,  0,  0,  0,  0,  0,
  // @   A   B   C   D   E   F   G   H   I   J   K   L   M   N   O
     0,  XSI,XSI,XSI,XSI,XSI,XSI,SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // P   Q   R   S   T   U   V   W   X   Y   Z   [   \   ]   ^   _
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, 0,  S,  0,  0,  SI,
  // `   a   b   c   d   e   f   g   h   i   j   k   l   m   n   o
     0,  XSI,XSI,XSI,XSI,XSI,XSI,SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // p   q   r   s   t   u   v   w   x   y   z   {   |   }   ~
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, 0,  0,  0,  0,  0,
  //
     0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  //
     0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  //     ¡   ¢   £   ¤   ¥   ¦   §   ¨   ©   ª   «   ¬   ­   ®   ¯
     0,  SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // °   ±   ²   ³   ´   µ   ¶   ·   ¸   ¹   º   »   ¼   ½   ¾   ¿
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // À   Á   Â   Ã   Ä   Å   Æ   Ç   È   É   Ê   Ë   Ì   Í   Î   Ï
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // Ð   Ñ   Ò   Ó   Ô   Õ   Ö   ×   Ø   Ù   Ú   Û   Ü   Ý   Þ   ß
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // à   á   â   ã   ä   å   æ   ç   è   é   ê   ë   ì   í   î   ï
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // ð   ñ   ò   ó   ô   õ   ö   ÷   ø   ù   ú   û   ü   ý   þ   ÿ
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI
  ],

  kHexValues: {
    "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
    "a": 10, "b": 11, "c": 12, "d": 13, "e": 14, "f": 15
  },

  mString : "",
  mPos : 0,
  mPreservedPos : [],

  init: function(aString) {
    this.mString = aString;
    this.mPos = 0;
    this.mPreservedPos = [];
  },

  getCurrentPos: function() {
    return this.mPos;
  },

  getAlreadyScanned: function()
  {
    return this.mString.substr(0, this.mPos);
  },

  preserveState: function() {
    this.mPreservedPos.push(this.mPos);
  },

  restoreState: function() {
    if (this.mPreservedPos.length) {
      this.mPos = this.mPreservedPos.pop();
    }
  },

  forgetState: function() {
    if (this.mPreservedPos.length) {
      this.mPreservedPos.pop();
    }
  },

  read: function() {
    if (this.mPos < this.mString.length)
      return this.mString.charAt(this.mPos++);
    return -1;
  },

  peek: function() {
    if (this.mPos < this.mString.length)
      return this.mString.charAt(this.mPos);
    return -1;
  },

  isHexDigit: function(c) {
    var code = c.charCodeAt(0);
    return (code < 256 && (this.kLexTable[code] & IS_HEX_DIGIT) != 0);
  },

  isIdentStart: function(c) {
    var code = c.charCodeAt(0);
    return (code >= 256 || (this.kLexTable[code] & START_IDENT) != 0);
  },

  startsWithIdent: function(aFirstChar, aSecondChar) {
    var code = aFirstChar.charCodeAt(0);
    return this.isIdentStart(aFirstChar) ||
           (aFirstChar == "-" && this.isIdentStart(aSecondChar));
  },

  isIdent: function(c) {
    var code = c.charCodeAt(0);
    return (code >= 256 || (this.kLexTable[code] & IS_IDENT) != 0);
  },

  pushback: function() {
    this.mPos--;
  },

  nextHexValue: function() {
    var c = this.read();
    if (c == -1 || !this.isHexDigit(c))
      return new jscsspToken(jscsspToken.NULL_TYPE, null);
    var s = c;
    c = this.read();
    while (c != -1 && this.isHexDigit(c)) {
      s += c;
      c = this.read();
    }
    if (c != -1)
      this.pushback();
    return new jscsspToken(jscsspToken.HEX_TYPE, s);
  },

  gatherEscape: function() {
    var c = this.peek();
    if (c == -1)
      return "";
    if (this.isHexDigit(c)) {
      var code = 0;
      for (var i = 0; i < 6; i++) {
        c = this.read();
        if (this.isHexDigit(c))
          code = code * 16 + this.kHexValues[c.toLowerCase()];
        else if (!this.isHexDigit(c) && !this.isWhiteSpace(c)) {
          this.pushback();
          break;
        }
        else
          break;
      }
      if (i == 6) {
        c = this.peek();
        if (this.isWhiteSpace(c))
          this.read();
      }
      return String.fromCharCode(code);
    }
    c = this.read();
    if (c != "\n")
      return c;
    return "";
  },

  gatherIdent: function(c) {
    var s = "";
    if (c == CSS_ESCAPE)
      s += this.gatherEscape();
    else
      s += c;
    c = this.read();
    while (c != -1
           && (this.isIdent(c) || c == CSS_ESCAPE)) {
      if (c == CSS_ESCAPE)
        s += this.gatherEscape();
      else
        s += c;
      c = this.read();
    }
    if (c != -1)
      this.pushback();
    return s;
  },

  parseIdent: function(c) {
    var value = this.gatherIdent(c);
    var nextChar = this.peek();
    if (nextChar == "(") {
      value += this.read();
      return new jscsspToken(jscsspToken.FUNCTION_TYPE, value);
    }
    return new jscsspToken(jscsspToken.IDENT_TYPE, value);
  },

  isDigit: function(c) {
    return (c >= '0') && (c <= '9');
  },

  parseComment: function(c) {
    var s = c;
    while ((c = this.read()) != -1) {
      s += c;
      if (c == "*") {
        c = this.read();
        if (c == -1)
          break;
        if (c == "/") {
          s += c;
          break;
        }
        this.pushback();
      }
    }
    return new jscsspToken(jscsspToken.COMMENT_TYPE, s);
  },

  parseNumber: function(c) {
    var s = c;
    var foundDot = false;
    while ((c = this.read()) != -1) {
      if (c == ".") {
        if (foundDot)
          break;
        else {
          s += c;
          foundDot = true;
        }
      } else if (this.isDigit(c))
        s += c;
      else
        break;
    }

    if (c != -1 && this.startsWithIdent(c, this.peek())) { // DIMENSION
      var unit = this.gatherIdent(c);
      s += unit;
      return new jscsspToken(jscsspToken.DIMENSION_TYPE, s, unit);
    }
    else if (c == "%") {
      s += "%";
      return new jscsspToken(jscsspToken.PERCENTAGE_TYPE, s);
    }
    else if (c != -1)
      this.pushback();
    return new jscsspToken(jscsspToken.NUMBER_TYPE, s);
  },

  parseString: function(aStop) {
    var s = aStop;
    var previousChar = aStop;
    var c;
    while ((c = this.read()) != -1) {
      if (c == aStop && previousChar != CSS_ESCAPE) {
        s += c;
        break;
      }
      else if (c == CSS_ESCAPE) {
        c = this.peek();
        if (c == -1)
          break;
        else if (c == "\n" || c == "\r" || c == "\f") {
          d = c;
          c = this.read();
          // special for Opera that preserves \r\n...
          if (d == "\r") {
            c = this.peek();
            if (c == "\n")
              c = this.read();
          }
        }
        else {
          s += this.gatherEscape();
          c = this.peek();
        }
      }
      else if (c == "\n" || c == "\r" || c == "\f") {
        break;
      }
      else
        s += c;

      previousChar = c;
    }
    return new jscsspToken(jscsspToken.STRING_TYPE, s);
  },

  isWhiteSpace: function(c) {
    var code = c.charCodeAt(0);
    return code < 256 && (this.kLexTable[code] & IS_WHITESPACE) != 0;
  },

  eatWhiteSpace: function(c) {
    var s = c;
    while ((c = this.read()) != -1) {
      if (!this.isWhiteSpace(c))
        break;
      s += c;
    }
    if (c != -1)
      this.pushback();
    return s;
  },

  parseAtKeyword: function(c) {
    return new jscsspToken(jscsspToken.ATRULE_TYPE, this.gatherIdent(c));
  },

  nextToken: function() {
    var c = this.read();
    if (c == -1)
      return new jscsspToken(jscsspToken.NULL_TYPE, null);

    if (this.startsWithIdent(c, this.peek()))
      return this.parseIdent(c);

    if (c == '@') {
      var nextChar = this.read();
      if (nextChar != -1) {
        var followingChar = this.peek();
        this.pushback();
        if (this.startsWithIdent(nextChar, followingChar))
          return this.parseAtKeyword(c);
      }
    }

    if (c == "." || c == "+" || c == "-") {
      var nextChar = this.peek();
      if (this.isDigit(nextChar))
        return this.parseNumber(c);
      else if (nextChar == "." && c != ".") {
        firstChar = this.read();
        var secondChar = this.peek();
        this.pushback();
        if (this.isDigit(secondChar))
          return this.parseNumber(c);
      }
    }
    if (this.isDigit(c)) {
      return this.parseNumber(c);
    }

    if (c == "'" || c == '"')
      return this.parseString(c);

    if (this.isWhiteSpace(c)) {
      var s = this.eatWhiteSpace(c);
      
      return new jscsspToken(jscsspToken.WHITESPACE_TYPE, s);
    }

    if (c == "|" || c == "~" || c == "^" || c == "$" || c == "*") {
      var nextChar = this.read();
      if (nextChar == "=") {
        switch (c) {
          case "~" :
            return new jscsspToken(jscsspToken.INCLUDES_TYPE, "~=");
          case "|" :
            return new jscsspToken(jscsspToken.DASHMATCH_TYPE, "|=");
          case "^" :
            return new jscsspToken(jscsspToken.BEGINSMATCH_TYPE, "^=");
          case "$" :
            return new jscsspToken(jscsspToken.ENDSMATCH_TYPE, "$=");
          case "*" :
            return new jscsspToken(jscsspToken.CONTAINSMATCH_TYPE, "*=");
          default :
            break;
        }
      } else if (nextChar != -1)
        this.pushback();
    }

    if (c == "/" && this.peek() == "*")
      return this.parseComment(c);

    return new jscsspToken(jscsspToken.SYMBOL_TYPE, c);
  }
};

function CSSParser(aString)
{
  this.mToken = null;
  this.mLookAhead = null;
  this.mScanner = new CSSScanner(aString);

  this.mPreserveWS = true;
  this.mPreserveComments = true;

  this.mPreservedTokens = [];
  
  this.mError = null;
}

CSSParser.prototype = {

  _init:function() {
    this.mToken = null;
    this.mLookAhead = null;
  },

  kINHERIT: "inherit",

  kBORDER_WIDTH_NAMES: {
      "thin": true,
      "medium": true,
      "thick": true
  },

  kBORDER_STYLE_NAMES: {
    "none": true,
    "hidden": true,
    "dotted": true,
    "dashed": true,
    "solid": true,
    "double": true,
    "groove": true,
    "ridge": true,
    "inset": true,
    "outset": true
  },

  kCOLOR_NAMES: {
    "transparent": true,
  
    "black": true,
    "silver": true,
    "gray": true,
    "white": true,
    "maroon": true,
    "red": true,
    "purple": true,
    "fuchsia": true,
    "green": true,
    "lime": true,
    "olive": true,
    "yellow": true,
    "navy": true,
    "blue": true,
    "teal": true,
    "aqua": true,
    
    "aliceblue": true,
    "antiquewhite": true,
    "aqua": true,
    "aquamarine": true,
    "azure": true,
    "beige": true,
    "bisque": true,
    "black": true,
    "blanchedalmond": true,
    "blue": true,
    "blueviolet": true,
    "brown": true,
    "burlywood": true,
    "cadetblue": true,
    "chartreuse": true,
    "chocolate": true,
    "coral": true,
    "cornflowerblue": true,
    "cornsilk": true,
    "crimson": true,
    "cyan": true,
    "darkblue": true,
    "darkcyan": true,
    "darkgoldenrod": true,
    "darkgray": true,
    "darkgreen": true,
    "darkgrey": true,
    "darkkhaki": true,
    "darkmagenta": true,
    "darkolivegreen": true,
    "darkorange": true,
    "darkorchid": true,
    "darkred": true,
    "darksalmon": true,
    "darkseagreen": true,
    "darkslateblue": true,
    "darkslategray": true,
    "darkslategrey": true,
    "darkturquoise": true,
    "darkviolet": true,
    "deeppink": true,
    "deepskyblue": true,
    "dimgray": true,
    "dimgrey": true,
    "dodgerblue": true,
    "firebrick": true,
    "floralwhite": true,
    "forestgreen": true,
    "fuchsia": true,
    "gainsboro": true,
    "ghostwhite": true,
    "gold": true,
    "goldenrod": true,
    "gray": true,
    "green": true,
    "greenyellow": true,
    "grey": true,
    "honeydew": true,
    "hotpink": true,
    "indianred": true,
    "indigo": true,
    "ivory": true,
    "khaki": true,
    "lavender": true,
    "lavenderblush": true,
    "lawngreen": true,
    "lemonchiffon": true,
    "lightblue": true,
    "lightcoral": true,
    "lightcyan": true,
    "lightgoldenrodyellow": true,
    "lightgray": true,
    "lightgreen": true,
    "lightgrey": true,
    "lightpink": true,
    "lightsalmon": true,
    "lightseagreen": true,
    "lightskyblue": true,
    "lightslategray": true,
    "lightslategrey": true,
    "lightsteelblue": true,
    "lightyellow": true,
    "lime": true,
    "limegreen": true,
    "linen": true,
    "magenta": true,
    "maroon": true,
    "mediumaquamarine": true,
    "mediumblue": true,
    "mediumorchid": true,
    "mediumpurple": true,
    "mediumseagreen": true,
    "mediumslateblue": true,
    "mediumspringgreen": true,
    "mediumturquoise": true,
    "mediumvioletred": true,
    "midnightblue": true,
    "mintcream": true,
    "mistyrose": true,
    "moccasin": true,
    "navajowhite": true,
    "navy": true,
    "oldlace": true,
    "olive": true,
    "olivedrab": true,
    "orange": true,
    "orangered": true,
    "orchid": true,
    "palegoldenrod": true,
    "palegreen": true,
    "paleturquoise": true,
    "palevioletred": true,
    "papayawhip": true,
    "peachpuff": true,
    "peru": true,
    "pink": true,
    "plum": true,
    "powderblue": true,
    "purple": true,
    "red": true,
    "rosybrown": true,
    "royalblue": true,
    "saddlebrown": true,
    "salmon": true,
    "sandybrown": true,
    "seagreen": true,
    "seashell": true,
    "sienna": true,
    "silver": true,
    "skyblue": true,
    "slateblue": true,
    "slategray": true,
    "slategrey": true,
    "snow": true,
    "springgreen": true,
    "steelblue": true,
    "tan": true,
    "teal": true,
    "thistle": true,
    "tomato": true,
    "turquoise": true,
    "violet": true,
    "wheat": true,
    "white": true,
    "whitesmoke": true,
    "yellow": true,
    "yellowgreen": true,
  
    "activeborder": true,
    "activecaption": true,
    "appworkspace": true,
    "background": true,
    "buttonface": true,
    "buttonhighlight": true,
    "buttonshadow": true,
    "buttontext": true,
    "captiontext": true,
    "graytext": true,
    "highlight": true,
    "highlighttext": true,
    "inactiveborder": true,
    "inactivecaption": true,
    "inactivecaptiontext": true,
    "infobackground": true,
    "infotext": true,
    "menu": true,
    "menutext": true,
    "scrollbar": true,
    "threeddarkshadow": true,
    "threedface": true,
    "threedhighlight": true,
    "threedlightshadow": true,
    "threedshadow": true,
    "window": true,
    "windowframe": true,
    "windowtext": true
  },

  kLIST_STYLE_TYPE_NAMES: {
    "decimal": true,
    "decimal-leading-zero": true,
    "lower-roman": true,
    "upper-roman": true,
    "georgian": true,
    "armenian": true,
    "lower-latin": true,
    "lower-alpha": true,
    "upper-latin": true,
    "upper-alpha": true,
    "lower-greek": true,

    "disc": true,
    "circle": true,
    "square": true,
    "none": true,
    
    /* CSS 3 */
    "box": true,
    "check": true,
    "diamond": true,
    "hyphen": true,

    "lower-armenian": true,
    "cjk-ideographic": true,
    "ethiopic-numeric": true,
    "hebrew": true,
    "japanese-formal": true,
    "japanese-informal": true,
    "simp-chinese-formal": true,
    "simp-chinese-informal": true,
    "syriac": true,
    "tamil": true,
    "trad-chinese-formal": true,
    "trad-chinese-informal": true,
    "upper-armenian": true,
    "arabic-indic": true,
    "binary": true,
    "bengali": true,
    "cambodian": true,
    "khmer": true,
    "devanagari": true,
    "gujarati": true,
    "gurmukhi": true,
    "kannada": true,
    "lower-hexadecimal": true,
    "lao": true,
    "malayalam": true,
    "mongolian": true,
    "myanmar": true,
    "octal": true,
    "oriya": true,
    "persian": true,
    "urdu": true,
    "telugu": true,
    "tibetan": true,
    "upper-hexadecimal": true,
    "afar": true,
    "ethiopic-halehame-aa-et": true,
    "ethiopic-halehame-am-et": true,
    "amharic-abegede": true,
    "ehiopic-abegede-am-et": true,
    "cjk-earthly-branch": true,
    "cjk-heavenly-stem": true,
    "ethiopic": true,
    "ethiopic-abegede": true,
    "ethiopic-abegede-gez": true,
    "hangul-consonant": true,
    "hangul": true,
    "hiragana-iroha": true,
    "hiragana": true,
    "katakana-iroha": true,
    "katakana": true,
    "lower-norwegian": true,
    "oromo": true,
    "ethiopic-halehame-om-et": true,
    "sidama": true,
    "ethiopic-halehame-sid-et": true,
    "somali": true,
    "ethiopic-halehame-so-et": true,
    "tigre": true,
    "ethiopic-halehame-tig": true,
    "tigrinya-er-abegede": true,
    "ethiopic-abegede-ti-er": true,
    "tigrinya-et": true,
    "ethiopic-halehame-ti-et": true,
    "upper-greek": true,
    "asterisks": true,
    "footnotes": true,
    "circled-decimal": true,
    "circled-lower-latin": true,
    "circled-upper-latin": true,
    "dotted-decimal": true,
    "double-circled-decimal": true,
    "filled-circled-decimal": true,
    "parenthesised-decimal": true,
    "parenthesised-lower-latin": true
  },

  reportError: function(aMsg) {
    this.mError = aMsg;
  },

  consumeError: function() {
    var e = this.mError;
    this.mError = null;
    return e;
  },

  currentToken: function() {
    return this.mToken;
  },

  getHexValue: function() {
    this.mToken = this.mScanner.nextHexValue();
    return this.mToken;
  },

  getToken: function(aSkipWS, aSkipComment) {
    if (this.mLookAhead) {
      this.mToken = this.mLookAhead;
      this.mLookAhead = null;
      return this.mToken;
    }

    this.mToken = this.mScanner.nextToken();
    while (this.mToken &&
           ((aSkipWS && this.mToken.isWhiteSpace()) ||
            (aSkipComment && this.mToken.isComment())))
      this.mToken = this.mScanner.nextToken();
    return this.mToken;
  },

  lookAhead: function(aSkipWS, aSkipComment) {
    var preservedToken = this.mToken;
    this.mScanner.preserveState();
    var token = this.getToken(aSkipWS, aSkipComment);
    this.mScanner.restoreState();
    this.mToken = preservedToken;

    return token;
  },

  ungetToken: function() {
    this.mLookAhead = this.mToken;
  },

  addUnknownAtRule: function(aSheet, aString) {
    var currentLine = CountLF(this.mScanner.getAlreadyScanned());
    var blocks = [];
    var token = this.getToken(false, false);
    while (token.isNotNull()) {
      aString += token.value;
      if (token.isSymbol(";") && !blocks.length)
        break;
      else if (token.isSymbol("{")
               || token.isSymbol("(")
               || token.isSymbol("[")
               || token.type == "function") {
        blocks.push(token.isFunction() ? "(" : token.value);
      } else if (token.isSymbol("}")
                 || token.isSymbol(")")
                 || token.isSymbol("]")) {
        if (blocks.length) {
          var ontop = blocks[blocks.length - 1];
          if ((token.isSymbol("}") && ontop == "{")
              || (token.isSymbol(")") && ontop == "(")
              || (token.isSymbol("]") && ontop == "[")) {
            blocks.pop();
            if (!blocks.length && token.isSymbol("}"))
              break;
          }
        }
      }
      token = this.getToken(false, false);
    }

    this.addUnknownRule(aSheet, aString, currentLine);
  },

  addUnknownRule: function(aSheet, aString, aCurrentLine) {
    var errorMsg = this.consumeError();
    var rule = new jscsspErrorRule(errorMsg);
    rule.currentLine = aCurrentLine;
    rule.parsedCssText = aString;
    rule.parentStyleSheet = aSheet;
    aSheet.cssRules.push(rule);
  },

  addWhitespace: function(aSheet, aString) {
    var rule = new jscsspWhitespace();
    rule.parsedCssText = aString;
    rule.parentStyleSheet = aSheet;
    aSheet.cssRules.push(rule);
  },

  addComment: function(aSheet, aString) {
    var rule = new jscsspComment();
    rule.parsedCssText = aString;
    rule.parentStyleSheet = aSheet;
    aSheet.cssRules.push(rule);
  },

  parseCharsetRule: function(aToken, aSheet) {
    var s = aToken.value;
    var token = this.getToken(false, false);
    s += token.value;
    if (token.isWhiteSpace(" ")) {
      token = this.getToken(false, false);
      s += token.value;
      if (token.isString()) {
        var encoding = token.value;
        token = this.getToken(false, false);
        s += token.value;
        if (token.isSymbol(";")) {
          var rule = new jscsspCharsetRule();
          rule.encoding = encoding;
          rule.parsedCssText = s;
          rule.parentStyleSheet = aSheet;
          aSheet.cssRules.push(rule);
          return true;
        }
        else
          this.reportError(kCHARSET_RULE_MISSING_SEMICOLON);
      }
      else
        this.reportError(kCHARSET_RULE_CHARSET_IS_STRING);
    }
    else
      this.reportError(kCHARSET_RULE_MISSING_WS);

    this.addUnknownAtRule(aSheet, s);
    return false;
  },

  parseImportRule: function(aToken, aSheet) {
    var currentLine = CountLF(this.mScanner.getAlreadyScanned());
    var s = aToken.value;
    this.preserveState();
    var token = this.getToken(true, true);
    var media = [];
    var href = "";
    if (token.isString()) {
      href = token.value;
      s += " " + href;
    }
    else if (token.isFunction("url(")) {
      token = this.getToken(true, true);
      var urlContent = this.parseURL(token);
      if (urlContent) {
        href = "url(" + urlContent;
        s += " " + href;
      }
    }
    else
      this.reportError(kIMPORT_RULE_MISSING_URL);

    if (href) {
      token = this.getToken(true, true);
      while (token.isIdent()) {
        s += " " + token.value;
        media.push(token.value);
        token = this.getToken(true, true);
        if (!token)
          break;
        if (token.isSymbol(",")) {
          s += ",";
        } else if (token.isSymbol(";")) {
          break;
        } else
          break;
        token = this.getToken(true, true);
      }

      if (!media.length) {
        media.push("all");
      }
  
      if (token.isSymbol(";")) {
        s += ";"
        this.forgetState();
        var rule = new jscsspImportRule();
        rule.currentLine = currentLine;
        rule.parsedCssText = s;
        rule.href = href;
        rule.media = media;
        rule.parentStyleSheet = aSheet;
        aSheet.cssRules.push(rule);
        return true;
      }
    }

    this.restoreState();
    this.addUnknownAtRule(aSheet, "@import");
    return false;
  },

  parseVariablesRule: function(token, aSheet) {
    var currentLine = CountLF(this.mScanner.getAlreadyScanned());
    var s = token.value;
    var declarations = [];
    var valid = false;
    this.preserveState();
    token = this.getToken(true, true);
    var media = [];
    var foundMedia = false;
    while (token.isNotNull()) {
      if (token.isIdent()) {
        foundMedia = true;
        s += " " + token.value;
        media.push(token.value);
        token = this.getToken(true, true);
        if (token.isSymbol(",")) {
          s += ",";
        } else {
          if (token.isSymbol("{"))
            this.ungetToken();
          else {
            // error...
            token.type = jscsspToken.NULL_TYPE;
            break;
          }
        }
      } else if (token.isSymbol("{"))
        break;
      else if (foundMedia) {
        token.type = jscsspToken.NULL_TYPE;
        // not a media list
        break;
      }
      token = this.getToken(true, true);
    }

    if (token.isSymbol("{")) {
      s += " {";
      token = this.getToken(true, true);
      while (true) {
        if (!token.isNotNull()) {
          valid = true;
          break;
        }
        if (token.isSymbol("}")) {
          s += "}";
          valid = true;
          break;
        } else {
          var d = this.parseDeclaration(token, declarations, true, false, aSheet);
          s += ((d && declarations.length) ? " " : "") + d;
        }
        token = this.getToken(true, false);
      }
    }
    if (valid) {
      this.forgetState();
      var rule = new jscsspVariablesRule();
      rule.currentLine = currentLine;
      rule.parsedCssText = s;
      rule.declarations = declarations;
      rule.media = media;
      rule.parentStyleSheet = aSheet;
      aSheet.cssRules.push(rule)
      return true;
    }
    this.restoreState();
    return false;
  },

  parseNamespaceRule: function(aToken, aSheet) {
    var currentLine = CountLF(this.mScanner.getAlreadyScanned());
    var s = aToken.value;
    var valid = false;
    this.preserveState();
    var token = this.getToken(true, true);
    if (token.isNotNull()) {
      var prefix = "";
      var url = "";
      if (token.isIdent()) {
        prefix = token.value;
        s += " " + prefix;
        token = this.getToken(true, true);
      }
      if (token) {
        var foundURL = false;
        if (token.isString()) {
          foundURL = true;
          url = token.value;
          s += " " + url;
        } else if (token.isFunction("url(")) {
          // get a url here...
          token = this.getToken(true, true);
          var urlContent = this.parseURL(token);
          if (urlContent) {
            url += "url(" + urlContent;
            foundURL = true;
            s += " " + urlContent;
          }
        }
      }
      if (foundURL) {
        token = this.getToken(true, true);
        if (token.isSymbol(";")) {
          s += ";";
          this.forgetState();
          var rule = new jscsspNamespaceRule();
          rule.currentLine = currentLine;
          rule.parsedCssText = s;
          rule.prefix = prefix;
          rule.url = url;
          rule.parentStyleSheet = aSheet;
          aSheet.cssRules.push(rule);
          return true;
        }
      }

    }
    this.restoreState();
    this.addUnknownAtRule(aSheet, "@namespace");
    return false;
  },

  parseFontFaceRule: function(aToken, aSheet) {
    var currentLine = CountLF(this.mScanner.getAlreadyScanned());
    var s = aToken.value;
    var valid = false;
    var descriptors = [];
    this.preserveState();
    var token = this.getToken(true, true);
    if (token.isNotNull()) {
      // expecting block start
      if (token.isSymbol("{")) {
        s += " " + token.value;
        var token = this.getToken(true, false);
        while (true) {
          if (token.isSymbol("}")) {
            s += "}";
            valid = true;
            break;
          } else {
            var d = this.parseDeclaration(token, descriptors, false, false, aSheet);
            s += ((d && descriptors.length) ? " " : "") + d;
          }
          token = this.getToken(true, false);
        }
      }
    }
    if (valid) {
      this.forgetState();
      var rule = new jscsspFontFaceRule();
      rule.currentLine = currentLine;
      rule.parsedCssText = s;
      rule.descriptors = descriptors;
      rule.parentStyleSheet = aSheet;
      aSheet.cssRules.push(rule)
      return true;
    }
    this.restoreState();
    return false;
  },

  parsePageRule: function(aToken, aSheet) {
    var currentLine = CountLF(this.mScanner.getAlreadyScanned());
    var s = aToken.value;
    var valid = false;
    var declarations = [];
    this.preserveState();
    var token = this.getToken(true, true);
    var pageSelector = "";
    if (token.isSymbol(":") || token.isIdent()) {
      if (token.isSymbol(":")) {
        pageSelector = ":";
        token = this.getToken(false, false);
      }
      if (token.isIdent()) {
        pageSelector += token.value;
        s += " " + pageSelector;
        token = this.getToken(true, true);
      }
    }
    if (token.isNotNull()) {
      // expecting block start
      if (token.isSymbol("{")) {
        s += " " + token.value;
        var token = this.getToken(true, false);
        while (true) {
          if (token.isSymbol("}")) {
            s += "}";
            valid = true;
            break;
          } else {
            var d = this.parseDeclaration(token, declarations, true, true, aSheet);
            s += ((d && declarations.length) ? " " : "") + d;
          }
          token = this.getToken(true, false);
        }
      }
    }
    if (valid) {
      this.forgetState();
      var rule = new jscsspPageRule();
      rule.currentLine = currentLine;
      rule.parsedCssText = s;
      rule.pageSelector = pageSelector;
      rule.declarations = declarations;
      rule.parentStyleSheet = aSheet;
      aSheet.cssRules.push(rule)
      return true;
    }
    this.restoreState();
    return false;
  },

  parseDefaultPropertyValue: function(token, aDecl, aAcceptPriority, descriptor, aSheet) {
    var valueText = "";
    var blocks = [];
    var foundPriority = false;
    var values = [];
    while (token.isNotNull()) {

      if ((token.isSymbol(";")
           || token.isSymbol("}")
           || token.isSymbol("!"))
          && !blocks.length) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }
  
      if (token.isIdent(this.kINHERIT)) {
        if (values.length) {
          return "";
        }
        else {
          valueText = this.kINHERIT;
          var value = new jscsspVariable(kJscsspINHERIT_VALUE, aSheet);
          values.push(value);
          token = this.getToken(true, true);
          break;
        }
      }
      else if (token.isSymbol("{")
                 || token.isSymbol("(")
                 || token.isSymbol("[")) {
        blocks.push(token.value);
      }
      else if (token.isSymbol("}")
                 || token.isSymbol("]")) {
        if (blocks.length) {
          var ontop = blocks[blocks.length - 1];
          if ((token.isSymbol("}") && ontop == "{")
              || (token.isSymbol(")") && ontop == "(")
              || (token.isSymbol("]") && ontop == "[")) {
            blocks.pop();
          }
        }
      }
      // XXX must find a better way to store individual values
      // probably a |values: []| field holding dimensions, percentages
      // functions, idents, numbers and symbols, in that order.
      if (token.isFunction()) {
        if (token.isFunction("var(")) {
          token = this.getToken(true, true);
          if (token.isIdent()) {
            var name = token.value;
            token = this.getToken(true, true);
            if (token.isSymbol(")")) {
              var value = new jscsspVariable(kJscsspVARIABLE_VALUE, aSheet);
              valueText += "var(" + name + ")";
              value.name = name;
              values.push(value);
            }
            else
              return "";
          }
          else
            return "";
        }
        else {
          var fn = token.value;
          token = this.getToken(false, true);
          var arg = this.parseFunctionArgument(token);
          if (arg) {
            valueText += fn + arg;
            var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, aSheet);
            value.value = fn + arg;
            values.push(value);
          }
          else
            return "";
        }
      }
      else if (token.isSymbol("#")) {
        var color = this.parseColor(token);
        if (color) {
          valueText += color;
          var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, aSheet);
          value.value = color;
          values.push(value);
        }
        else
          return "";
      }
      else if (!token.isWhiteSpace() && !token.isSymbol(",")) {
        var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, aSheet);
        value.value = token.value;
        values.push(value);
        valueText += token.value;
      }
      else
        valueText += token.value;
      token = this.getToken(false, true);
    }
    if (values.length && valueText) {
      this.forgetState();
      aDecl.push(this._createJscsspDeclarationFromValuesArray(descriptor, values, valueText));
      return valueText;
    }
    return "";
  },

  parseMarginOrPaddingShorthand: function(token, aDecl, aAcceptPriority, aProperty)
  {
    var top = null;
    var bottom = null;
    var left = null;
    var right = null;

    var values = [];
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!values.length && token.isIdent(this.kINHERIT)) {
        values.push(token.value);
        token = this.getToken(true, true);
        break;
      }

      else if (token.isDimension()
              || token.isNumber("0")
              || token.isPercentage()
              || token.isIdent("auto")) {
        values.push(token.value);
      }
      else
        return "";

      token = this.getToken(true, true);
    }

    var count = values.length;
    switch (count) {
      case 1:
        top = values[0];
        bottom = top;
        left = top;
        right = top;
        break;
      case 2:
        top = values[0];
        bottom = top;
        left = values[1];
        right = left;
        break;
      case 3:
        top = values[0];
        left = values[1];
        right = left;
        bottom = values[2];
        break;
      case 4:
        top = values[0];
        right = values[1];
        bottom = values[2];
        left = values[3];
        break;
      default:
        return "";
    }
    this.forgetState();
    aDecl.push(this._createJscsspDeclarationFromValue(aProperty + "-top", top));
    aDecl.push(this._createJscsspDeclarationFromValue(aProperty + "-right", right));
    aDecl.push(this._createJscsspDeclarationFromValue(aProperty + "-bottom", bottom));
    aDecl.push(this._createJscsspDeclarationFromValue(aProperty + "-left", left));
   return top + " " + right + " " + bottom + " " + left;
  },

  parseBorderColorShorthand: function(token, aDecl, aAcceptPriority)
  {
    var top = null;
    var bottom = null;
    var left = null;
    var right = null;

    var values = [];
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!values.length && token.isIdent(this.kINHERIT)) {
        values.push(token.value);
        token = this.getToken(true, true);
        break;
      }
      
      else {
        var color = this.parseColor(token);
        if (color)
          values.push(color);
        else
          return "";
      }

      token = this.getToken(true, true);
    }

    var count = values.length;
    switch (count) {
      case 1:
        top = values[0];
        bottom = top;
        left = top;
        right = top;
        break;
      case 2:
        top = values[0];
        bottom = top;
        left = values[1];
        right = left;
        break;
      case 3:
        top = values[0];
        left = values[1];
        right = left;
        bottom = values[2];
        break;
      case 4:
        top = values[0];
        right = values[1];
        bottom = values[2];
        left = values[3];
        break;
      default:
        return "";
    }
    this.forgetState();
    aDecl.push(this._createJscsspDeclarationFromValue("border-top-color", top));
    aDecl.push(this._createJscsspDeclarationFromValue("border-right-color", right));
    aDecl.push(this._createJscsspDeclarationFromValue("border-bottom-color", bottom));
    aDecl.push(this._createJscsspDeclarationFromValue("border-left-color", left));
    return top + " " + right + " " + bottom + " " + left;
  },

  parseCueShorthand: function(token, declarations, aAcceptPriority)
  {
    var before = "";
    var after = "";

    var values = [];
    var values = [];
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!values.length && token.isIdent(this.kINHERIT)) {
        values.push(token.value);
      }

      else if (token.isIdent("none"))
        values.push(token.value);

        else if (token.isFunction("url(")) {
        var token = this.getToken(true, true);
        var urlContent = this.parseURL(token);
        if (urlContent)
          values.push("url(" + urlContent);
        else
          return "";
      }
      else
        return "";

      token = this.getToken(true, true);
    }

    var count = values.length;
    switch (count) {
      case 1:
        before = values[0];
        after = before;
        break;
      case 2:
        before = values[0];
        after = values[1];
        break;
      default:
        return "";
    }
    this.forgetState();
    aDecl.push(this._createJscsspDeclarationFromValue("cue-before", before));
    aDecl.push(this._createJscsspDeclarationFromValue("cue-after", after));
    return before + " " + after;
  },

  parsePauseShorthand: function(token, declarations, aAcceptPriority)
  {
    var before = "";
    var after = "";

    var values = [];
    var values = [];
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!values.length && token.isIdent(this.kINHERIT)) {
        values.push(token.value);
      }

      else if (token.isDimensionOfUnit("ms")
               || token.isDimensionOfUnit("s")
               || token.isPercentage()
               || token.isNumber("0"))
        values.push(token.value);
      else
        return "";

      token = this.getToken(true, true);
    }

    var count = values.length;
    switch (count) {
      case 1:
        before = values[0];
        after = before;
        break;
      case 2:
        before = values[0];
        after = values[1];
        break;
      default:
        return "";
    }
    this.forgetState();
    aDecl.push(this._createJscsspDeclarationFromValue("pause-before", before));
    aDecl.push(this._createJscsspDeclarationFromValue("pause-after", after));
    return before + " " + after;
  },

  parseBorderWidthShorthand: function(token, aDecl, aAcceptPriority)
  {
    var top = null;
    var bottom = null;
    var left = null;
    var right = null;

    var values = [];
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!values.length && token.isIdent(this.kINHERIT)) {
        values.push(token.value);
      }
      
      else if (token.isDimension()
               || token.isNumber("0")
               || (token.isIdent() && token.value in this.kBORDER_WIDTH_NAMES)) {
        values.push(token.value);
      }
      else
        return "";

      token = this.getToken(true, true);
    }

    var count = values.length;
    switch (count) {
      case 1:
        top = values[0];
        bottom = top;
        left = top;
        right = top;
        break;
      case 2:
        top = values[0];
        bottom = top;
        left = values[1];
        right = left;
        break;
      case 3:
        top = values[0];
        left = values[1];
        right = left;
        bottom = values[2];
        break;
      case 4:
        top = values[0];
        right = values[1];
        bottom = values[2];
        left = values[3];
        break;
      default:
        return "";
    }
    this.forgetState();
    aDecl.push(this._createJscsspDeclarationFromValue("border-top-width", top));
    aDecl.push(this._createJscsspDeclarationFromValue("border-right-width", right));
    aDecl.push(this._createJscsspDeclarationFromValue("border-bottom-width", bottom));
    aDecl.push(this._createJscsspDeclarationFromValue("border-left-width", left));
    return top + " " + right + " " + bottom + " " + left;
  },

  parseBorderStyleShorthand: function(token, aDecl, aAcceptPriority)
  {
    var top = null;
    var bottom = null;
    var left = null;
    var right = null;

    var values = [];
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!values.length && token.isIdent(this.kINHERIT)) {
        values.push(token.value);
      }
      
      else if (token.isIdent() && token.value in this.kBORDER_STYLE_NAMES) {
        values.push(token.value);
      }
      else
        return "";

      token = this.getToken(true, true);
    }

    var count = values.length;
    switch (count) {
      case 1:
        top = values[0];
        bottom = top;
        left = top;
        right = top;
        break;
      case 2:
        top = values[0];
        bottom = top;
        left = values[1];
        right = left;
        break;
      case 3:
        top = values[0];
        left = values[1];
        right = left;
        bottom = values[2];
        break;
      case 4:
        top = values[0];
        right = values[1];
        bottom = values[2];
        left = values[3];
        break;
      default:
        return "";
    }
    this.forgetState();
    aDecl.push(this._createJscsspDeclarationFromValue("border-top-style", top));
    aDecl.push(this._createJscsspDeclarationFromValue("border-right-style", right));
    aDecl.push(this._createJscsspDeclarationFromValue("border-bottom-style", bottom));
    aDecl.push(this._createJscsspDeclarationFromValue("border-left-style", left));
    return top + " " + right + " " + bottom + " " + left;
  },

  parseBorderEdgeOrOutlineShorthand: function(token, aDecl, aAcceptPriority, aProperty)
  {
    var bWidth = null;
    var bStyle = null;
    var bColor = null;

    while (true) {
      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!bWidth && !bStyle && !bColor
               && token.isIdent(this.kINHERIT)) {
        bWidth = this.kINHERIT;
        bStyle = this.kINHERIT;
        bColor = this.kINHERIT;
      }

      else if (!bWidth &&
               (token.isDimension()
                || (token.isIdent() && token.value in this.kBORDER_WIDTH_NAMES)
                || token.isNumber("0"))) {
        bWidth = token.value;
      }

      else if (!bStyle &&
               (token.isIdent() && token.value in this.kBORDER_STYLE_NAMES)) {
        bStyle = token.value;
      }

      else {
        var color = (aProperty == "outline" && token.isIdent("invert"))
                    ? "invert" : this.parseColor(token);
        if (!bColor && color)
          bColor = color;
        else
          return "";
      }
      token = this.getToken(true, true);
    }

    // create the declarations
    this.forgetState();
    bWidth = bWidth ? bWidth : "medium";
    bStyle = bStyle ? bStyle : "none";
    bColor = bColor ? bColor : "-moz-initial";

    function addPropertyToDecl(aSelf, aDecl, property, w, s, c) {
      aDecl.push(aSelf._createJscsspDeclarationFromValue(property + "-width", w));
      aDecl.push(aSelf._createJscsspDeclarationFromValue(property + "-style", s));
      aDecl.push(aSelf._createJscsspDeclarationFromValue(property + "-color", c));
    }

    if (aProperty == "border") {
      addPropertyToDecl(this, aDecl, "border-top", bWidth, bStyle, bColor);
      addPropertyToDecl(this, aDecl, "border-right", bWidth, bStyle, bColor);
      addPropertyToDecl(this, aDecl, "border-bottom", bWidth, bStyle, bColor);
      addPropertyToDecl(this, aDecl, "border-left", bWidth, bStyle, bColor);
    }
    else
      addPropertyToDecl(this, aDecl, aProperty, bWidth, bStyle, bColor);
    return bWidth + " " + bStyle + " " + bColor;
  },

  parseBackgroundShorthand: function(token, aDecl, aAcceptPriority)
  {
    var kHPos = {"left": true, "right": true };
    var kVPos = {"top": true, "bottom": true };
    var kPos = {"left": true, "right": true, "top": true, "bottom": true, "center": true};

    var bgColor = null;
    var bgRepeat = null;
    var bgAttachment = null;
    var bgImage = null;
    var bgPosition = null;

    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!bgColor && !bgRepeat && !bgAttachment && !bgImage && !bgPosition
               && token.isIdent(this.kINHERIT)) {
        bgColor = this.kINHERIT;
        bgRepeat = this.kINHERIT;
        bgAttachment = this.kINHERIT;
        bgImage = this.kINHERIT;
        bgPosition = this.kINHERIT;
      }

      else {
        if (!bgAttachment &&
            (token.isIdent("scroll")
             || token.isIdent("fixed"))) {
          bgAttachment = token.value;
        }

        else if (!bgPosition &&
                 ((token.isIdent() && token.value in kPos)
                  || token.isDimension()
                  || token.isNumber("0")
                  || token.isPercentage())) {
          bgPosition = token.value;
          token = this.getToken(true, true);
          if (token.isDimension() || token.isNumber("0") || token.isPercentage()) {
            bgPosition += " " + token.value;
          }
          else if (token.isIdent() && token.value in kPos) {
            if ((bgPosition in kHPos && token.value in kHPos) ||
                (bgPosition in kVPos && token.value in kVPos))
              return "";
            bgPosition += " " + token.value;
          }
          else {
            this.ungetToken();
            bgPosition += " center";
          }
        }

        else if (!bgRepeat &&
                 (token.isIdent("repeat")
                  || token.isIdent("repeat-x")
                  || token.isIdent("repeat-y")
                  || token.isIdent("no-repeat"))) {
          bgRepeat = token.value;
        }

        else if (!bgImage &&
                 (token.isFunction("url(")
                  || token.isIdent("none"))) {
          bgImage = token.value;
          if (token.isFunction("url(")) {
            token = this.getToken(true, true);
            var url = this.parseURL(token); // TODO
            if (url)
              bgImage += url;
            else
              return "";
          }
        }

        else if (!bgImage &&
                 (token.isFunction("-moz-linear-gradient(")
                  || token.isFunction("-moz-radial-gradient(")
                  || token.isFunction("-moz-repeating-linear-gradient(")
                  || token.isFunction("-moz-repeating-radial-gradient("))) {
          var gradient = CssInspector.parseGradient(this, token);
          if (gradient)
            bgImage = CssInspector.serializeGradient(gradient);
          else
            return "";
        }

        else {
          var color = this.parseColor(token);
          if (!bgColor && color)
            bgColor = color;
          else
            return "";
        }

      }

      token = this.getToken(true, true);
    }

    // create the declarations
    this.forgetState();
    bgColor = bgColor ? bgColor : "transparent";
    bgImage = bgImage ? bgImage : "none";
    bgRepeat = bgRepeat ? bgRepeat : "repeat";
    bgAttachment = bgAttachment ? bgAttachment : "scroll";
    bgPosition = bgPosition ? bgPosition : "top left";

    aDecl.push(this._createJscsspDeclarationFromValue("background-color", bgColor));
    aDecl.push(this._createJscsspDeclarationFromValue("background-image", bgImage));
    aDecl.push(this._createJscsspDeclarationFromValue("background-repeat", bgRepeat));
    aDecl.push(this._createJscsspDeclarationFromValue("background-attachment", bgAttachment));
    aDecl.push(this._createJscsspDeclarationFromValue("background-position", bgPosition));
    return bgColor + " " + bgImage + " " + bgRepeat + " " + bgAttachment + " " + bgPosition;
  },

  parseListStyleShorthand: function(token, aDecl, aAcceptPriority)
  {
    var kPosition = { "inside": true, "outside": true };

    var lType = null;
    var lPosition = null;
    var lImage = null;

    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!lType && !lPosition && ! lImage
               && token.isIdent(this.kINHERIT)) {
        lType = this.kINHERIT;
        lPosition = this.kINHERIT;
        lImage = this.kINHERIT;
      }

      else if (!lType &&
               (token.isIdent() && token.value in this.kLIST_STYLE_TYPE_NAMES)) {
        lType = token.value;
      }

      else if (!lPosition &&
               (token.isIdent() && token.value in kPosition)) {
        lPosition = token.value;
      }

      else if (!lImage && token.isFunction("url")) {
        token = this.getToken(true, true);
        var urlContent = this.parseURL(token);
        if (urlContent) {
          lImage = "url(" + urlContent;
        }
        else
          return "";
      }
      else if (!token.isIdent("none"))
        return "";

      token = this.getToken(true, true);
    }

    // create the declarations
    this.forgetState();
    lType = lType ? lType : "none";
    lImage = lImage ? lImage : "none";
    lPosition = lPosition ? lPosition : "outside";

    aDecl.push(this._createJscsspDeclarationFromValue("list-style-type", lType));
    aDecl.push(this._createJscsspDeclarationFromValue("list-style-position", lPosition));
    aDecl.push(this._createJscsspDeclarationFromValue("list-style-image", lImage));
    return lType + " " + lPosition + " " + lImage;
  },

  parseFontShorthand: function(token, aDecl, aAcceptPriority)
  {
    var kStyle = {"italic": true, "oblique": true };
    var kVariant = {"small-caps": true };
    var kWeight = { "bold": true, "bolder": true, "lighter": true,
                      "100": true, "200": true, "300": true, "400": true,
                      "500": true, "600": true, "700": true, "800": true,
                      "900": true };
    var kSize = { "xx-small": true, "x-small": true, "small": true, "medium": true,
                    "large": true, "x-large": true, "xx-large": true,
                    "larger": true, "smaller": true };
    var kValues = { "caption": true, "icon": true, "menu": true, "message-box": true, "small-caption": true, "status-bar": true };
    var kFamily = { "serif": true, "sans-serif": true, "cursive": true, "fantasy": true, "monospace": true };

    var fStyle = null;
    var fVariant = null;
    var fWeight = null;
    var fSize = null;
    var fLineHeight = null;
    var fFamily = "";
    var fSystem = null;
    var fFamilyValues = [];

    var normalCount = 0;
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!fStyle && !fVariant && !fWeight
               && !fSize && !fLineHeight && !fFamily
               && !fSystem
               && token.isIdent(this.kINHERIT)) {
        fStyle = this.kINHERIT;
        fVariant = this.kINHERIT;
        fWeight = this.kINHERIT;
        fSize = this.kINHERIT;
        fLineHeight = this.kINHERIT;
        fFamily = this.kINHERIT;
        fSystem = this.kINHERIT;
      }

      else {
        if (!fSystem && (token.isIdent() && token.value in kValues)) {
          fSystem = token.value;
          break;
        }

        else {
          if (!fStyle
                   && token.isIdent()
                   && (token.value in kStyle)) {
            fStyle = token.value;
          }
  
          else if (!fVariant
                   && token.isIdent()
                   && (token.value in kVariant)) {
            fVariant = token.value;
          }
  
          else if (!fWeight
                   && (token.isIdent() || token.isNumber())
                   && (token.value in kWeight)) {
            fWeight = token.value;
          }
  
          else if (!fSize
                   && ((token.isIdent() && (token.value in kSize))
                       || token.isDimension()
                       || token.isPercentage())) {
            fSize = token.value;
            var token = this.getToken(false, false);
            if (token.isSymbol("/")) {
              token = this.getToken(false, false);
              if (!fLineHeight &&
                  (token.isDimension() || token.isNumber() || token.isPercentage())) {
                fLineHeight = token.value;
              }
              else
                return "";
            }
            else
              this.ungetToken();
          }

          else if (token.isIdent("normal")) {
            normalCount++;
            if (normalCount > 3)
              return "";
          }

          else if (!fFamily && // *MUST* be last to be tested here
                   (token.isString()
                    || token.isIdent())) {
            var lastWasComma = false;
            while (true) {
              if (!token.isNotNull())
                break;
              else if (token.isSymbol(";")
                  || (aAcceptPriority && token.isSymbol("!"))
                  || token.isSymbol("}")) {
                this.ungetToken();
                break;
              }
              else if (token.isIdent() && token.value in kFamily) {
                var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, null);
                value.value = token.value;
                fFamilyValues.push(value);
                fFamily += token.value;
                break;
              }
              else if (token.isString() || token.isIdent()) {
                var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, null);
                value.value = token.value;
                fFamilyValues.push(value);
                fFamily += token.value;
                lastWasComma = false;
              }
              else if (!lastWasComma && token.isSymbol(",")) {
                fFamily += ", ";
                lastWasComma = true;
              }
              else
                return "";
              token = this.getToken(true, true);
            }
          }

          else {
            return "";
          }
        }

      }

      token = this.getToken(true, true);
    }

    // create the declarations
    this.forgetState();
    if (fSystem) {
      aDecl.push(this._createJscsspDeclarationFromValue("font", fSystem));
      return fSystem;
    }
    fStyle = fStyle ? fStyle : "normal";
    fVariant = fVariant ? fVariant : "normal";
    fWeight = fWeight ? fWeight : "normal";
    fSize = fSize ? fSize : "medium";
    fLineHeight = fLineHeight ? fLineHeight : "normal";
    fFamily = fFamily ? fFamily : "-moz-initial";

    aDecl.push(this._createJscsspDeclarationFromValue("font-style", fStyle));
    aDecl.push(this._createJscsspDeclarationFromValue("font-variant", fVariant));
    aDecl.push(this._createJscsspDeclarationFromValue("font-weight", fWeight));
    aDecl.push(this._createJscsspDeclarationFromValue("font-size", fSize));
    aDecl.push(this._createJscsspDeclarationFromValue("line-height", fLineHeight));
    aDecl.push(this._createJscsspDeclarationFromValuesArray("font-family", fFamilyValues, fFamily));
    return fStyle + " " + fVariant + " " + fWeight + " " + fSize + "/" + fLineHeight + " " + fFamily;
  },

  _createJscsspDeclaration: function(property, value)
  {
    var decl = new jscsspDeclaration();
    decl.property = property;
    decl.value = this.trim11(value);
    decl.parsedCssText = property + ": " + value + ";";
    return decl;
  },

  _createJscsspDeclarationFromValue: function(property, valueText)
  {
    var decl = new jscsspDeclaration();
    decl.property = property;
    var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, null);
    value.value = valueText;
    decl.values = [value];
    decl.valueText = valueText;
    decl.parsedCssText = property + ": " + valueText + ";";
    return decl;
  },

  _createJscsspDeclarationFromValuesArray: function(property, values, valueText)
  {
    var decl = new jscsspDeclaration();
    decl.property = property;
    decl.values = values;
    decl.valueText = valueText;
    decl.parsedCssText = property + ": " + valueText + ";";
    return decl;
  },

  parseURL: function(token)
  {
    var value = "";
    if (token.isString())
    {
      value += token.value;
      token = this.getToken(true, true);
    }
    else
      while (true)
      {
        if (!token.isNotNull()) {
          this.reportError(kURL_EOF);
          return "";
        }
        if (token.isWhiteSpace()) {
          nextToken = this.lookAhead(true, true);
          // if next token is not a closing parenthesis, that's an error
          if (!nextToken.isSymbol(")")) {
            this.reportError(kURL_WS_INSIDE);
            token = this.currentToken();
            break;
          }
        }
        if (token.isSymbol(")")) {
          break;
        }
        value += token.value;
        token = this.getToken(false, false);
      }

    if (token.isSymbol(")")) {
      return value + ")";
    }
    return "";
  },

  parseFunctionArgument: function(token)
  {
    var value = "";
    if (token.isString())
    {
      value += token.value;
      token = this.getToken(true, true);
    }
    else {
      var parenthesis = 1;
      while (true)
      {
        if (!token.isNotNull())
          return "";
        if (token.isFunction() || token.isSymbol("("))
          parenthesis++;
        if (token.isSymbol(")")) {
          parenthesis--;
          if (!parenthesis)
            break;
        }
        value += token.value;
        token = this.getToken(false, false);
      }
    }

    if (token.isSymbol(")"))
      return value + ")";
    return "";
  },

  parseColor: function(token)
  {
    var color = "";
    if (token.isFunction("rgb(")
        || token.isFunction("rgba(")) {
      color = token.value;
      var isRgba = token.isFunction("rgba(")
      token = this.getToken(true, true);
      if (!token.isNumber() && !token.isPercentage())
        return "";
      color += token.value;
      token = this.getToken(true, true);
      if (!token.isSymbol(","))
        return "";
      color += ", ";
  
      token = this.getToken(true, true);
      if (!token.isNumber() && !token.isPercentage())
        return "";
      color += token.value;
      token = this.getToken(true, true);
      if (!token.isSymbol(","))
        return "";
      color += ", ";
  
      token = this.getToken(true, true);
      if (!token.isNumber() && !token.isPercentage())
        return "";
      color += token.value;
  
      if (isRgba) {
        token = this.getToken(true, true);
        if (!token.isSymbol(","))
          return "";
        color += ", ";
  
        token = this.getToken(true, true);
        if (!token.isNumber())
          return "";
        color += token.value;
      }
  
      token = this.getToken(true, true);
      if (!token.isSymbol(")"))
        return "";
      color += token.value;
    }
  
    else if (token.isFunction("hsl(")
             || token.isFunction("hsla(")) {
      color = token.value;
      var isHsla = token.isFunction("hsla(")
      token = this.getToken(true, true);
      if (!token.isNumber())
        return "";
      color += token.value;
      token = this.getToken(true, true);
      if (!token.isSymbol(","))
        return "";
      color += ", ";
  
      token = this.getToken(true, true);
      if (!token.isPercentage())
        return "";
      color += token.value;
      token = this.getToken(true, true);
      if (!token.isSymbol(","))
        return "";
      color += ", ";
  
      token = this.getToken(true, true);
      if (!token.isPercentage())
        return "";
      color += token.value;
  
      if (isHsla) {
        token = this.getToken(true, true);
        if (!token.isSymbol(","))
          return "";
        color += ", ";
  
        token = this.getToken(true, true);
        if (!token.isNumber())
          return "";
        color += token.value;
      }
  
      token = this.getToken(true, true);
      if (!token.isSymbol(")"))
        return "";
      color += token.value;
    }

    else if (token.isIdent()
             && (token.value in this.kCOLOR_NAMES))
      color = token.value;

    else if (token.isSymbol("#")) {
      token = this.getHexValue();
      if (!token.isHex())
        return "";
      var length = token.value.length;
      if (length != 3 && length != 6)
        return "";
      if (token.value.match( /[a-fA-F0-9]/g ).length != length)
        return "";
      color = "#" + token.value;
    }
    return color;
  },

  parseDeclaration: function(aToken, aDecl, aAcceptPriority, aExpandShorthands, aSheet) {
    this.preserveState();
    var blocks = [];
    if (aToken.isIdent()) {
      var descriptor = aToken.value.toLowerCase();
      var token = this.getToken(true, true);
      if (token.isSymbol(":")) {
        var token = this.getToken(true, true);

        var value = "";
        var declarations = [];
        if (aExpandShorthands)
          switch (descriptor) {
            case "background":
              value = this.parseBackgroundShorthand(token, declarations, aAcceptPriority);
              break;
            case "margin":
            case "padding":
              value = this.parseMarginOrPaddingShorthand(token, declarations, aAcceptPriority, descriptor);
              break;
            case "border-color":
              value = this.parseBorderColorShorthand(token, declarations, aAcceptPriority);
              break;
            case "border-style":
              value = this.parseBorderStyleShorthand(token, declarations, aAcceptPriority);
              break;
            case "border-width":
              value = this.parseBorderWidthShorthand(token, declarations, aAcceptPriority);
              break;
            case "border-top":
            case "border-right":
            case "border-bottom":
            case "border-left":
            case "border":
            case "outline":
              value = this.parseBorderEdgeOrOutlineShorthand(token, declarations, aAcceptPriority, descriptor);
              break;
            case "cue":
              value = this.parseCueShorthand(token, declarations, aAcceptPriority);
              break;
            case "pause":
              value = this.parsePauseShorthand(token, declarations, aAcceptPriority);
              break;
            case "font":
              value = this.parseFontShorthand(token, declarations, aAcceptPriority);
              break;
            case "list-style":
              value = this.parseListStyleShorthand(token, declarations, aAcceptPriority);
              break;
            default:
              value = this.parseDefaultPropertyValue(token, declarations, aAcceptPriority, descriptor, aSheet);
              break;
          }
        else
          value = this.parseDefaultPropertyValue(token, declarations, aAcceptPriority, descriptor, aSheet);
        token = this.currentToken();
        if (value) // no error above
        {
          var priority = false;
          if (token.isSymbol("!")) {
            token = this.getToken(true, true);
            if (token.isIdent("important")) {
              priority = true;
              token = this.getToken(true, true);
              if (token.isSymbol(";") || token.isSymbol("}")) {
                if (token.isSymbol("}"))
                  this.ungetToken();
              }
              else return "";
            }
            else return "";
          }
          else if  (token.isNotNull() && !token.isSymbol(";") && !token.isSymbol("}"))
            return "";
          for (var i = 0; i < declarations.length; i++) {
            declarations[i].priority = priority;
            aDecl.push(declarations[i]);
          }
          return descriptor + ": " + value + ";";
        }
      }
    }
    else if (aToken.isComment()) {
      if (this.mPreserveComments) {
        this.forgetState();
        var comment = new jscsspComment();
        comment.parsedCssText = aToken.value;
        aDecl.push(comment);
      }
      return aToken.value;
    }

    // we have an error here, let's skip it
    this.restoreState();
    var s = aToken.value;
    blocks = [];
    var token = this.getToken(false, false);
    while (token.isNotNull()) {
      s += token.value;
      if ((token.isSymbol(";") || token.isSymbol("}")) && !blocks.length) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      } else if (token.isSymbol("{")
                 || token.isSymbol("(")
                 || token.isSymbol("[")
                 || token.isFunction()) {
        blocks.push(token.isFunction() ? "(" : token.value);
      } else if (token.isSymbol("}")
                 || token.isSymbol(")")
                 || token.isSymbol("]")) {
        if (blocks.length) {
          var ontop = blocks[blocks.length - 1];
          if ((token.isSymbol("}") && ontop == "{")
              || (token.isSymbol(")") && ontop == "(")
              || (token.isSymbol("]") && ontop == "[")) {
            blocks.pop();
          }
        }
      }
      token = this.getToken(false, false);
    }
    return "";
  },

  parseKeyframesRule: function(aToken, aSheet) {
    var currentLine = CountLF(this.mScanner.getAlreadyScanned());
    var s = aToken.value;
    var valid = false;
    var keyframesRule = new jscsspKeyframesRule();
    keyframesRule.currentLine = currentLine;
    this.preserveState();
    var token = this.getToken(true, true);
    var foundName = false;
    while (token.isNotNull()) {
      if (token.isIdent()) {
        // should be the keyframes' name
        foundName = true;
        s += " " + token.value;
        keyframesRule.name = token.value;
        token = this.getToken(true, true);
        if (token.isSymbol("{"))
          this.ungetToken();
        else {
          // error...
          token.type = jscsspToken.NULL_TYPE;
          break;
        }
      }
      else if (token.isSymbol("{")) {
        if (!foundName) {
          token.type = jscsspToken.NULL_TYPE;
          // not a valid keyframes at-rule
        }
        break;
      }
      else {
        token.type = jscsspToken.NULL_TYPE;
        // not a valid keyframes at-rule
        break;
      }
      token = this.getToken(true, true);
    }

    if (token.isSymbol("{") && keyframesRule.name) {
      // ok let's parse keyframe rules now...
      s += " { ";
      token = this.getToken(true, false);
      while (token.isNotNull()) {
        if (token.isComment() && this.mPreserveComments) {
          s += " " + token.value;
          var comment = new jscsspComment();
          comment.parsedCssText = token.value;
          keyframesRule.cssRules.push(comment);
        } else if (token.isSymbol("}")) {
          valid = true;
          break;
        } else {
          var r = this.parseKeyframeRule(token, keyframesRule, true);
          if (r)
            s += r;
        }
        token = this.getToken(true, false);
      }
    }
    if (valid) {
      this.forgetState();
      keyframesRule.currentLine = currentLine;
      keyframesRule.parsedCssText = s;
      aSheet.cssRules.push(keyframesRule);
      return true;
    }
    this.restoreState();
    return false;
  },

  parseKeyframeRule: function(aToken, aOwner) {
    var currentLine = CountLF(this.mScanner.getAlreadyScanned());
    this.preserveState();
    var token = aToken;

    // find the keyframe keys
    var key = "";
    while (token.isNotNull()) {
      if (token.isIdent() || token.isPercentage()) {
        if (token.isIdent()
            && !token.isIdent("from")
            && !token.isIdent("to")) {
          key = "";
          break;
        }
        key += token.value;
        token = this.getToken(true, true);
        if (token.isSymbol("{")) {
          this.ungetToken();
          break;
        }
        else 
          if (token.isSymbol(",")) {
            key += ", ";
          }
          else {
            key = "";
            break;
          }
      }
      else {
        key = "";
        break;
      }
      token = this.getToken(true, true);
    }

    var valid = false;
    var declarations = [];
    if (key) {
      var s = key;
      token = this.getToken(true, true);
      if (token.isSymbol("{")) {
        s += " { ";
        token = this.getToken(true, false);
        while (true) {
          if (!token.isNotNull()) {
            valid = true;
            break;
          }
          if (token.isSymbol("}")) {
            s += "}";
            valid = true;
            break;
          } else {
            var d = this.parseDeclaration(token, declarations, true, true, aOwner);
            s += ((d && declarations.length) ? " " : "") + d;
          }
          token = this.getToken(true, false);
        }
      }
    }
    else {
      // key is invalid so the whole rule is invalid with it
    }

    if (valid) {
      var rule = new jscsspKeyframeRule();
      rule.currentLine = currentLine;
      rule.parsedCssText = s;
      rule.declarations = declarations;
      rule.keyText = key;
      rule.parentRule = aOwner;
      aOwner.cssRules.push(rule);
      return s;
    }
    this.restoreState();
    s = this.currentToken().value;
    this.addUnknownAtRule(aOwner, s);
    return "";
  },

  parseMediaRule: function(aToken, aSheet) {
    var currentLine = CountLF(this.mScanner.getAlreadyScanned());
    var s = aToken.value;
    var valid = false;
    var mediaRule = new jscsspMediaRule();
    mediaRule.currentLine = currentLine;
    this.preserveState();
    var token = this.getToken(true, true);
    var foundMedia = false;
    while (token.isNotNull()) {
      if (token.isIdent()) {
        foundMedia = true;
        s += " " + token.value;
        mediaRule.media.push(token.value);
        token = this.getToken(true, true);
        if (token.isSymbol(",")) {
          s += ",";
        } else {
          if (token.isSymbol("{"))
            this.ungetToken();
          else {
            // error...
            token.type = jscsspToken.NULL_TYPE;
            break;
          }
        }
      }
      else if (token.isSymbol("{"))
        break;
      else if (foundMedia) {
        token.type = jscsspToken.NULL_TYPE;
        // not a media list
        break;
      }
      token = this.getToken(true, true);
    }
    if (token.isSymbol("{") && mediaRule.media.length) {
      // ok let's parse style rules now...
      s += " { ";
      token = this.getToken(true, false);
      while (token.isNotNull()) {
        if (token.isComment() && this.mPreserveComments) {
          s += " " + token.value;
          var comment = new jscsspComment();
          comment.parsedCssText = token.value;
          mediaRule.cssRules.push(comment);
        } else if (token.isSymbol("}")) {
          valid = true;
          break;
        } else {
          var r = this.parseStyleRule(token, mediaRule, true);
          if (r)
            s += r;
        }
        token = this.getToken(true, false);
      }
    }
    if (valid) {
      this.forgetState();
      mediaRule.parsedCssText = s;
      aSheet.cssRules.push(mediaRule);
      return true;
    }
    this.restoreState();
    return false;
  },

  trim11: function(str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
      if (/\S/.test( str.charAt(i) )) { // XXX charat
        str = str.substring(0, i + 1);
        break;
      }
    }
    return str;
  },

  parseStyleRule: function(aToken, aOwner, aIsInsideMediaRule)
  {
    var currentLine = CountLF(this.mScanner.getAlreadyScanned());
    this.preserveState();
    // first let's see if we have a selector here...
    var selector = this.parseSelector(aToken, false);
    var valid = false;
    var declarations = [];
    if (selector) {
      selector = this.trim11(selector.selector);
      var s = selector;
      var token = this.getToken(true, true);
      if (token.isSymbol("{")) {
        s += " { ";
        var token = this.getToken(true, false);
        while (true) {
          if (!token.isNotNull()) {
            valid = true;
            break;
          }
          if (token.isSymbol("}")) {
            s += "}";
            valid = true;
            break;
          } else {
            var d = this.parseDeclaration(token, declarations, true, true, aOwner);
            s += ((d && declarations.length) ? " " : "") + d;
          }
          token = this.getToken(true, false);
        }
      }
    }
    else {
      // selector is invalid so the whole rule is invalid with it
    }

    if (valid) {
      var rule = new jscsspStyleRule();
      rule.currentLine = currentLine;
      rule.parsedCssText = s;
      rule.declarations = declarations;
      rule.mSelectorText = selector;
      if (aIsInsideMediaRule)
        rule.parentRule = aOwner;
      else
        rule.parentStyleSheet = aOwner;
      aOwner.cssRules.push(rule);
      return s;
    }
    this.restoreState();
    s = this.currentToken().value;
    this.addUnknownAtRule(aOwner, s);
    return "";
  },

  parseSelector: function(aToken, aParseSelectorOnly) {
    var s = "";
    var specificity = {a: 0, b: 0, c: 0, d: 0}; // CSS 2.1 section 6.4.3
    var isFirstInChain = true;
    var token = aToken;
    var valid = false;
    var combinatorFound = false;
    while (true) {
      if (!token.isNotNull()) {
        if (aParseSelectorOnly)
          return {selector: s, specificity: specificity };
        return "";
      }

      if (!aParseSelectorOnly && token.isSymbol("{")) {
        // end of selector
        valid = !combinatorFound;
	if (valid) this.ungetToken();
        break;
      }

      if (token.isSymbol(",")) { // group of selectors
        s += token.value;
        isFirstInChain = true;
        combinatorFound = false;
        token = this.getToken(false, true);
        continue;
      }
      // now combinators and grouping...
      else if (!combinatorFound
	       && (token.isWhiteSpace()
		    || token.isSymbol(">")
                    || token.isSymbol("+")
                    || token.isSymbol("~"))) {
	if (token.isWhiteSpace()) {
          s += " ";
	  var nextToken = this.lookAhead(true, true);
	  if (!nextToken.isNotNull()) {
            if (aParseSelectorOnly)
              return {selector: s, specificity: specificity };
	    return "";
	  }
	  if (nextToken.isSymbol(">")
	      || nextToken.isSymbol("+")
	      || nextToken.isSymbol("~")) {
            token = this.getToken(true, true);
	    s += token.value + " ";
	    combinatorFound = true;
	  }
	}
        else {
          s += token.value;
	  combinatorFound = true;
	}
	isFirstInChain = true;
        token = this.getToken(true, true);
        continue;
      }
      else {
        var simpleSelector = this.parseSimpleSelector(token, isFirstInChain, true);
        if (!simpleSelector)
          break; // error
        s += simpleSelector.selector;
        specificity.b += simpleSelector.specificity.b;
        specificity.c += simpleSelector.specificity.c;
        specificity.d += simpleSelector.specificity.d;
	isFirstInChain = false;
	combinatorFound = false;
      }

      token = this.getToken(false, true);
    }

    if (valid) {
      return {selector: s, specificity: specificity };
    }
    return "";
  },

  isPseudoElement: function(aIdent)
  {
    switch (aIdent) {
      case "first-letter":
      case "first-line":
      case "before":
      case "after":
      case "marker":
        return true;
        break;
      default: return false;
        break;
    }
  },

  parseSimpleSelector: function(token, isFirstInChain, canNegate)
  {
    var s = "";
    var specificity = {a: 0, b: 0, c: 0, d: 0}; // CSS 2.1 section 6.4.3
    
    if (isFirstInChain
        && (token.isSymbol("*") || token.isSymbol("|") || token.isIdent())) {
      // type or universal selector
      if (token.isSymbol("*") || token.isIdent()) {
        // we don't know yet if it's a prefix or a universal
        // selector
        s += token.value;
        var isIdent = token.isIdent();
        token = this.getToken(false, true);
        if (token.isSymbol("|")) {
          // it's a prefix
          s += token.value;
          token = this.getToken(false, true);
          if (token.isIdent() || token.isSymbol("*")) {
            // ok we now have a type element or universal
            // selector
            s += token.value;
            if (token.isIdent())
              specificity.d++;
          } else
            // oops that's an error...
            return null;
        } else {
          this.ungetToken();
          if (isIdent)
            specificity.d++;
        }
      } else if (token.isSymbol("|")) {
        s += token.value;
        token = this.getToken(false, true);
        if (token.isIdent() || token.isSymbol("*")) {
          s += token.value;
          if (token.isIdent())
            specificity.d++;
        } else
          // oops that's an error
          return null;
      }
    }
  
    else if (token.isSymbol(".") || token.isSymbol("#")) {
      var isClass = token.isSymbol(".");
      s += token.value;
      token = this.getToken(false, true);
      if (token.isIdent()) {
        s += token.value;
        if (isClass)
          specificity.c++;
        else
          specificity.b++;
      }
      else
        return null;
    }

    else if (token.isSymbol(":")) {
      s += token.value;
      token = this.getToken(false, true);
      if (token.isSymbol(":")) {
        s += token.value;
        token = this.getToken(false, true);
      }
      if (token.isIdent()) {
        s += token.value;
        if (this.isPseudoElement(token.value))
          specificity.d++;
        else
          specificity.c++;
      }
      else if (token.isFunction()) {
        s += token.value;
        if (token.isFunction(":not(")) {
          if (!canNegate)
            return null;
          token = this.getToken(true, true);
          var simpleSelector = this.parseSimpleSelector(token, isFirstInChain, false);
          if (!simpleSelector)
            return null;
          else {
            s += simpleSelector.selector;
            token = this.getToken(true, true);
            if (token.isSymbol(")"))
              s += ")";
            else
              return null;
          }
          specificity.c++;
        }
        else {
          while (true) {
            token = this.getToken(false, true);
            if (token.isSymbol(")")) {
              s += ")";
              break;
            } else
              s += token.value;
          }
          specificity.c++;
        }
      } else
        return null;
  
    } else if (token.isSymbol("[")) {
      s += "[";
      token = this.getToken(true, true);
      if (token.isIdent() || token.isSymbol("*")) {
        s += token.value;
        var nextToken = this.getToken(true, true);
        if (token.isSymbol("|")) {
          s += "|";
          token = this.getToken(true, true);
          if (token.isIdent())
            s += token.value;
          else
            return null;
        } else
          this.ungetToken();
      } else if (token.isSymbol("|")) {
        s += "|";
        token = this.getToken(true, true);
        if (token.isIdent())
          s += token.value;
        else
          return null;
      }
      else
        return null;
  
      // nothing, =, *=, $=, ^=, |=
      token = this.getToken(true, true);
      if (token.isIncludes()
          || token.isDashmatch()
          || token.isBeginsmatch()
          || token.isEndsmatch()
          || token.isContainsmatch()
          || token.isSymbol("=")) {
        s += token.value;
        token = this.getToken(true, true);
        if (token.isString() || token.isIdent()) {
          s += token.value;
          token = this.getToken(true, true);
        }
        else
          return null;
    
        if (token.isSymbol("]")) {
          s += token.value;
          specificity.c++;
        }
        else
          return null;
      }
      else if (token.isSymbol("]")) {
        s += token.value;
        specificity.c++;
      }
      else
        return null;
        
    }
    else if (token.isWhiteSpace()) {
      var t = this.lookAhead(true, true);
      if (t.isSymbol('{'))
        return ""
    }
    if (s)
      return {selector: s, specificity: specificity };
    return null;
  },

  preserveState: function() {
    this.mPreservedTokens.push(this.currentToken());
    this.mScanner.preserveState();
  },

  restoreState: function() {
    if (this.mPreservedTokens.length) {
      this.mScanner.restoreState();
      this.mToken = this.mPreservedTokens.pop();
    }
  },

  forgetState: function() {
    if (this.mPreservedTokens.length) {
      this.mScanner.forgetState();
      this.mPreservedTokens.pop();
    }
  },

  parse: function(aString, aTryToPreserveWhitespaces, aTryToPreserveComments) {
    if (!aString)
      return null; // early way out if we can

    this.mPreserveWS       = aTryToPreserveWhitespaces;
    this.mPreserveComments = aTryToPreserveComments;
    this.mPreservedTokens = [];
    this.mScanner.init(aString);
    var sheet = new jscsspStylesheet();

    // @charset can only appear at first char of the stylesheet
    var token = this.getToken(false, false);
    if (!token.isNotNull())
      return;
    if (token.isAtRule("@charset")) {
      this.parseCharsetRule(token, sheet);
      token = this.getToken(false, false);
    }

    var foundStyleRules = false;
    var foundImportRules = false;
    var foundNameSpaceRules = false;
    while (true) {
      if (!token.isNotNull())
        break;
      if (token.isWhiteSpace())
      {
        if (aTryToPreserveWhitespaces)
          this.addWhitespace(sheet, token.value);
      }

      else if (token.isComment())
      {
        if (this.mPreserveComments)
          this.addComment(sheet, token.value);
      }

      else if (token.isAtRule()) {
        if (token.isAtRule("@variables")) {
          if (!foundImportRules && !foundStyleRules)
            this.parseVariablesRule(token, sheet);
          else {
            this.reportError(kVARIABLES_RULE_POSITION);
            this.addUnknownAtRule(sheet, token.value);
          }
        }
        else if (token.isAtRule("@import")) {
          // @import rules MUST occur before all style and namespace
          // rules
          if (!foundStyleRules && !foundNameSpaceRules)
            foundImportRules = this.parseImportRule(token, sheet);
          else {
            this.reportError(kIMPORT_RULE_POSITION);
            this.addUnknownAtRule(sheet, token.value);
          }
        }
        else if (token.isAtRule("@namespace")) {
          // @namespace rules MUST occur before all style rule and
          // after all @import rules
          if (!foundStyleRules)
            foundNameSpaceRules = this.parseNamespaceRule(token, sheet);
          else {
            this.reportError(kNAMESPACE_RULE_POSITION);
            this.addUnknownAtRule(sheet, token.value);
          }
        }
        else if (token.isAtRule("@font-face")) {
          if (this.parseFontFaceRule(token, sheet))
            foundStyleRules = true;
          else
            this.addUnknownAtRule(sheet, token.value);
        }
        else if (token.isAtRule("@page")) {
          if (this.parsePageRule(token, sheet))
            foundStyleRules = true;
          else
            this.addUnknownAtRule(sheet, token.value);
        }
        else if (token.isAtRule("@media")) {
          if (this.parseMediaRule(token, sheet))
            foundStyleRules = true;
          else
            this.addUnknownAtRule(sheet, token.value);
        }
        else if (token.isAtRule("@keyframes")) {
          if (!this.parseKeyframesRule(token, sheet))
            this.addUnknownAtRule(sheet, token.value);
        }
        else if (token.isAtRule("@charset")) {
          this.reportError(kCHARSET_RULE_CHARSET_SOF);
          this.addUnknownAtRule(sheet, token.value);
        }
        else {
          this.reportError(kUNKNOWN_AT_RULE);
          this.addUnknownAtRule(sheet, token.value);
        }
      }

      else // plain style rules
      {
        var ruleText = this.parseStyleRule(token, sheet, false);
        if (ruleText)
          foundStyleRules = true;
      }
      token = this.getToken(false);
    }

    return sheet;
  }

};


function jscsspToken(aType, aValue, aUnit)
{
  this.type = aType;
  this.value = aValue;
  this.unit = aUnit;
}

jscsspToken.NULL_TYPE = 0;

jscsspToken.WHITESPACE_TYPE = 1;
jscsspToken.STRING_TYPE = 2;
jscsspToken.COMMENT_TYPE = 3;
jscsspToken.NUMBER_TYPE = 4;
jscsspToken.IDENT_TYPE = 5;
jscsspToken.FUNCTION_TYPE = 6;
jscsspToken.ATRULE_TYPE = 7;
jscsspToken.INCLUDES_TYPE = 8;
jscsspToken.DASHMATCH_TYPE = 9;
jscsspToken.BEGINSMATCH_TYPE = 10;
jscsspToken.ENDSMATCH_TYPE = 11;
jscsspToken.CONTAINSMATCH_TYPE = 12;
jscsspToken.SYMBOL_TYPE = 13;
jscsspToken.DIMENSION_TYPE = 14;
jscsspToken.PERCENTAGE_TYPE = 15;
jscsspToken.HEX_TYPE = 16;

jscsspToken.prototype = {

  isNotNull: function ()
  {
    return this.type;
  },

  _isOfType: function (aType, aValue)
  {
    return (this.type == aType && (!aValue || this.value.toLowerCase() == aValue));
  },

  isWhiteSpace: function(w)
  {
    return this._isOfType(jscsspToken.WHITESPACE_TYPE, w);
  },

  isString: function()
  {
    return this._isOfType(jscsspToken.STRING_TYPE);
  },

  isComment: function()
  {
    return this._isOfType(jscsspToken.COMMENT_TYPE);
  },

  isNumber: function(n)
  {
    return this._isOfType(jscsspToken.NUMBER_TYPE, n);
  },

  isSymbol: function(c)
  {
    return this._isOfType(jscsspToken.SYMBOL_TYPE, c);
  },

  isIdent: function(i)
  {
    return this._isOfType(jscsspToken.IDENT_TYPE, i);
  },

  isFunction: function(f)
  {
    return this._isOfType(jscsspToken.FUNCTION_TYPE, f);
  },

  isAtRule: function(a)
  {
    return this._isOfType(jscsspToken.ATRULE_TYPE, a);
  },

  isIncludes: function()
  {
    return this._isOfType(jscsspToken.INCLUDES_TYPE);
  },

  isDashmatch: function()
  {
    return this._isOfType(jscsspToken.DASHMATCH_TYPE);
  },

  isBeginsmatch: function()
  {
    return this._isOfType(jscsspToken.BEGINSMATCH_TYPE);
  },

  isEndsmatch: function()
  {
    return this._isOfType(jscsspToken.ENDSMATCH_TYPE);
  },

  isContainsmatch: function()
  {
    return this._isOfType(jscsspToken.CONTAINSMATCH_TYPE);
  },

  isSymbol: function(c)
  {
    return this._isOfType(jscsspToken.SYMBOL_TYPE, c);
  },

  isDimension: function()
  {
    return this._isOfType(jscsspToken.DIMENSION_TYPE);
  },

  isPercentage: function()
  {
    return this._isOfType(jscsspToken.PERCENTAGE_TYPE);
  },

  isHex: function()
  {
    return this._isOfType(jscsspToken.HEX_TYPE);
  },

  isDimensionOfUnit: function(aUnit)
  {
    return (this.isDimension() && this.unit == aUnit);
  },

  isLength: function()
  {
    return (this.isPercentage() ||
            this.isDimensionOfUnit("cm") ||
            this.isDimensionOfUnit("mm") ||
            this.isDimensionOfUnit("in") ||
            this.isDimensionOfUnit("pc") ||
            this.isDimensionOfUnit("px") ||
            this.isDimensionOfUnit("em") ||
            this.isDimensionOfUnit("ex") ||
            this.isDimensionOfUnit("pt"));
  },

  isAngle: function()
  {
    return (this.isDimensionOfUnit("deg") ||
            this.isDimensionOfUnit("rad") ||
            this.isDimensionOfUnit("grad"));
  }
}

var kJscsspUNKNOWN_RULE   = 0;
var kJscsspSTYLE_RULE     = 1
var kJscsspCHARSET_RULE   = 2;
var kJscsspIMPORT_RULE    = 3;
var kJscsspMEDIA_RULE     = 4;
var kJscsspFONT_FACE_RULE = 5;
var kJscsspPAGE_RULE      = 6;

var kJscsspKEYFRAMES_RULE = 7;
var kJscsspKEYFRAME_RULE  = 8;

var kJscsspNAMESPACE_RULE = 100;
var kJscsspCOMMENT        = 101;
var kJscsspWHITE_SPACE    = 102;

var kJscsspVARIABLES_RULE = 200;

var kJscsspSTYLE_DECLARATION = 1000;

var gTABS = "";

function jscsspStylesheet()
{
  this.cssRules = [];
  this.variables = {};
}

jscsspStylesheet.prototype = {
  insertRule: function(aRule, aIndex) {
    try {
     this.cssRules.splice(aIndex, 1, aRule);
    }
    catch(e) {
    }
  },

  deleteRule: function(aIndex) {
    try {
      this.cssRules.splice(aIndex);
    }
    catch(e) {
    }
  },

  cssText: function() {
    var rv = "";
    for (var i = 0; i < this.cssRules.length; i++)
      rv += this.cssRules[i].cssText() + "\n";
    return rv;
  },

  resolveVariables: function(aMedium) {

    function ItemFoundInArray(aArray, aItem) {
      for (var i = 0; i < aArray.length; i++)
        if (aItem == aArray[i])
          return true;
      return false;
    }
    
    for (var i = 0; i < this.cssRules.length; i++)
    {
      var rule = this.cssRules[i];
      if (rule.type == kJscsspSTYLE_RULE || rule.type == kJscsspIMPORT_RULE)
        break;
      else if (rule.type == kJscsspVARIABLES_RULE &&
               (!rule.media.length || ItemFoundInArray(rule.media, aMedium))) {
        
        for (var j = 0; j < rule.declarations.length; j++) {
          var valueText = "";
          for (var k = 0; k < rule.declarations[j].values.length; k++)
            valueText += (k ? " " : "") + rule.declarations[j].values[k].value;
          this.variables[rule.declarations[j].property] = valueText;
        }
      }
    }
  }
};

/* kJscsspCHARSET_RULE */

function jscsspCharsetRule()
{
  this.type = kJscsspCHARSET_RULE;
  this.encoding = null;
  this.parsedCssText = null;
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspCharsetRule.prototype = {

  cssText: function() {
    return "@charset " + this.encoding + ";";
  },

  setCssText: function(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(false, false);
    if (token.isAtRule("@charset")) {
      if (parser.parseCharsetRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.encoding = newRule.encoding;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspUNKNOWN_RULE */

function jscsspErrorRule(aErrorMsg)
{
  this.error = aErrorMsg ? aErrorMsg : "INVALID"; 
  this.type = kJscsspUNKNOWN_RULE;
  this.parsedCssText = null;
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspErrorRule.prototype = {
  cssText: function() {
    return this.parsedCssText;
  }
};

/* kJscsspCOMMENT */

function jscsspComment()
{
  this.type = kJscsspCOMMENT;
  this.parsedCssText = null;
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspComment.prototype = {
  cssText: function() {
    return this.parsedCssText;
  },

  setCssText: function(val) {
    var parser = new CSSParser(val);
    var token = parser.getToken(true, false);
    if (token.isComment())
      this.parsedCssText = token.value;
    else
      throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspWHITE_SPACE */

function jscsspWhitespace()
{
  this.type = kJscsspWHITE_SPACE;
  this.parsedCssText = null;
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspWhitespace.prototype = {
  cssText: function() {
    return this.parsedCssText;
  }
};

/* kJscsspIMPORT_RULE */

function jscsspImportRule()
{
  this.type = kJscsspIMPORT_RULE;
  this.parsedCssText = null;
  this.href = null;
  this.media = []; 
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspImportRule.prototype = {
  cssText: function() {
    var mediaString = this.media.join(", ");
    return "@import " + this.href
                      + ((mediaString && mediaString != "all") ? mediaString + " " : "")
                      + ";";
  },

  setCssText: function(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@import")) {
      if (parser.parseImportRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.href = newRule.href;
        this.media = newRule.media;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspNAMESPACE_RULE */

function jscsspNamespaceRule()
{
  this.type = kJscsspNAMESPACE_RULE;
  this.parsedCssText = null;
  this.prefix = null;
  this.url = null;
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspNamespaceRule.prototype = {
  cssText: function() {
    return "@namespace " + (this.prefix ? this.prefix + " ": "")
                        + this.url
                        + ";";
  },

  setCssText: function(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@namespace")) {
      if (parser.parseNamespaceRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.url = newRule.url;
        this.prefix = newRule.prefix;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspSTYLE_DECLARATION */

function jscsspDeclaration()
{
  this.type = kJscsspSTYLE_DECLARATION;
  this.property = null;
  this.values = [];
  this.valueText = null;
  this.priority = null;
  this.parsedCssText = null;
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspDeclaration.prototype = {
  kCOMMA_SEPARATED: {
    "cursor": true,
    "font-family": true,
    "voice-family": true,
    "background-image": true
  },

  kUNMODIFIED_COMMA_SEPARATED_PROPERTIES: {
    "text-shadow": true,
    "box-shadow": true,
    "-moz-transition": true,
    "-moz-transition-property": true,
    "-moz-transition-duration": true,
    "-moz-transition-timing-function": true,
    "-moz-transition-delay": true
  },

  cssText: function() {
    var prefixes = CssInspector.prefixesForProperty(this.property);

    if (this.property in this.kUNMODIFIED_COMMA_SEPARATED_PROPERTIES) {
      if (prefixes) {
        var rv = "";
        for (var propertyIndex = 0; propertyIndex < prefixes.length; propertyIndex++) {
          var property = prefixes[propertyIndex];
          rv += (propertyIndex ? gTABS : "") + property + ": ";
          rv += this.valueText + (this.priority ? " !important" : "") + ";";
          rv += ((prefixes.length > 1 && propertyIndex != prefixes.length -1) ? "\n" : "");
        }
        return rv;
      }
      return this.property + ": " + this.valueText +
             (this.priority ? " !important" : "") + ";"
    }

    if (prefixes) {
      var rv = "";
      for (var propertyIndex = 0; propertyIndex < prefixes.length; propertyIndex++) {
        var property = prefixes[propertyIndex];
        rv += (propertyIndex ? gTABS : "") + property + ": ";
        var separator = (property in this.kCOMMA_SEPARATED) ? ", " : " ";
        for (var i = 0; i < this.values.length; i++)
          if (this.values[i].cssText() != null)
            rv += (i ? separator : "") + this.values[i].cssText();
          else
            return null;
        rv += (this.priority ? " !important" : "") + ";" +
              ((prefixes.length > 1 && propertyIndex != prefixes.length -1) ? "\n" : "");
      }
      return rv;
    }

    var rv = this.property + ": ";
    var separator = (this.property in this.kCOMMA_SEPARATED) ? ", " : " ";
    var extras = {"webkit": false, "presto": false, "trident": false, "generic": false }
    for (var i = 0; i < this.values.length; i++) {
      var v = this.values[i].cssText();
      if (v != null) {
        var paren = v.indexOf("(");
        var kwd = v;
        if (paren != -1)
          kwd = v.substr(0, paren);
        if (kwd in kCSS_VENDOR_VALUES) {
          for (var j in kCSS_VENDOR_VALUES[kwd]) {
            extras[j] = extras[j] || (kCSS_VENDOR_VALUES[kwd][j] != "");
          }
        }
        rv += (i ? separator : "") + v;
      }
      else
        return null;
    }
    rv += (this.priority ? " !important" : "") + ";";

    for (var j in extras) {
      if (extras[j]) {
        var str = "\n" + gTABS +  this.property + ": ";
        for (var i = 0; i < this.values.length; i++) {
          var v = this.values[i].cssText();
          if (v != null) {
            var paren = v.indexOf("(");
            var kwd = v;
            if (paren != -1)
              kwd = v.substr(0, paren);
            if (kwd in kCSS_VENDOR_VALUES) {
              functor = kCSS_VENDOR_VALUES[kwd][j];
              if (functor) {
                v = (typeof functor == "string") ? functor : functor(v, j);
                if (!v) {
                  str = null;
                  break;
                }
              }
            }
            str += (i ? separator : "") + v;
          }
          else
            return null;
        }
        if (str)
          rv += str + ";"
        else
          rv += "\n" + gTABS + "/* Impossible to translate property " + this.property + " for " + j + " */";
      }
    }
    return rv;
  },

  setCssText: function(val) {
    var declarations = [];
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (parser.parseDeclaration(token, declarations, true, true, null)
        && declarations.length
        && declarations[0].type == kJscsspSTYLE_DECLARATION) {
      var newDecl = declarations.cssRules[0];
      this.property = newDecl.property;
      this.value = newDecl.value;
      this.priority = newDecl.priority;
      this.parsedCssText = newRule.parsedCssText;
      return;
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspFONT_FACE_RULE */

function jscsspFontFaceRule()
{
  this.type = kJscsspFONT_FACE_RULE;
  this.parsedCssText = null;
  this.descriptors = [];
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspFontFaceRule.prototype = {
  cssText: function() {
    var rv = gTABS + "@font-face {\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.descriptors.length; i++)
      rv += gTABS + this.descriptors[i].cssText() + "\n";
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  setCssText: function(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@font-face")) {
      if (parser.parseFontFaceRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.descriptors = newRule.descriptors;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspKEYFRAMES_RULE */
function jscsspKeyframesRule()
{
  this.type = kJscsspKEYFRAMES_RULE;
  this.parsedCssText = null;
  this.cssRules = [];
  this.name = null;
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspKeyframesRule.prototype = {
  cssText: function() {
    var rv = gTABS
               + "@keyframes "
               + this.name + " {\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.cssRules.length; i++)
      rv += gTABS + this.cssRules[i].cssText() + "\n";
    gTABS = preservedGTABS;
    rv += gTABS + "}\n";
    return rv;
  },

  setCssText: function(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@keyframes")) {
      if (parser.parseKeyframesRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.cssRules = newRule.cssRules;
        this.name = newRule.name;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspKEYFRAME_RULE */
function jscsspKeyframeRule()
{
  this.type = kJscsspKEYFRAME_RULE;
  this.parsedCssText = null;
  this.declarations = []
  this.keyText = null;
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspKeyframeRule.prototype = {
  cssText: function() {
    var rv = this.keyText + " {\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.declarations.length; i++) {
      var declText = this.declarations[i].cssText();
      if (declText)
        rv += gTABS + this.declarations[i].cssText() + "\n";
    }
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  setCssText: function(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (!token.isNotNull()) {
      if (parser.parseKeyframeRule(token, sheet, false)) {
        var newRule = sheet.cssRules[0];
        this.keyText = newRule.keyText;
        this.declarations = newRule.declarations;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspMEDIA_RULE */

function jscsspMediaRule()
{
  this.type = kJscsspMEDIA_RULE;
  this.parsedCssText = null;
  this.cssRules = [];
  this.media = [];
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspMediaRule.prototype = {
  cssText: function() {
    var rv = gTABS + "@media " + this.media.join(", ") + " {\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.cssRules.length; i++)
      rv += gTABS + this.cssRules[i].cssText() + "\n";
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  setCssText: function(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@media")) {
      if (parser.parseMediaRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.cssRules = newRule.cssRules;
        this.media = newRule.media;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspSTYLE_RULE */

function jscsspStyleRule()
{
  this.type = kJscsspSTYLE_RULE;
  this.parsedCssText = null;
  this.declarations = []
  this.mSelectorText = null;
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspStyleRule.prototype = {
  cssText: function() {
    var rv = this.mSelectorText + " {\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.declarations.length; i++) {
      var declText = this.declarations[i].cssText();
      if (declText)
        rv += gTABS + this.declarations[i].cssText() + "\n";
    }
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  setCssText: function(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (!token.isNotNull()) {
      if (parser.parseStyleRule(token, sheet, false)) {
        var newRule = sheet.cssRules[0];
        this.mSelectorText = newRule.mSelectorText;
        this.declarations = newRule.declarations;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  },

  selectorText: function() {
    return this.mSelectorText;
  },

  setSelectorText: function(val) {
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (!token.isNotNull()) {
      var s = parser.parseSelector(token, true);
      if (s) {
        this.mSelectorText = s.selector;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspPAGE_RULE */

function jscsspPageRule()
{
  this.type = kJscsspPAGE_RULE;
  this.parsedCssText = null;
  this.pageSelector = null;
  this.declarations = [];
  this.parentStyleSheet = null;
  this.parentRule = null;
}

jscsspPageRule.prototype = {
  cssText: function() {
    var rv = gTABS + "@page "
                   + (this.pageSelector ? this.pageSelector + " ": "")
                   + "{\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.declarations.length; i++)
      rv += gTABS + this.declarations[i].cssText() + "\n";
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  setCssText: function(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@page")) {
      if (parser.parsePageRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.pageSelector = newRule.pageSelector;
        this.declarations = newRule.declarations;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspVARIABLES_RULE */

function jscsspVariablesRule()
{
  this.type = kJscsspVARIABLES_RULE;
  this.parsedCssText = null;
  this.declarations = [];
  this.parentStyleSheet = null;
  this.parentRule = null;
  this.media = null;
}

jscsspVariablesRule.prototype = {
  cssText: function() {
    var rv = gTABS + "@variables " +
                     (this.media.length ? this.media.join(", ") + " " : "") +
                     "{\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.declarations.length; i++)
      rv += gTABS + this.declarations[i].cssText() + "\n";
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  setCssText: function(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@variables")) {
      if (parser.parseVariablesRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.declarations = newRule.declarations;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

var kJscsspINHERIT_VALUE = 0;
var kJscsspPRIMITIVE_VALUE = 1;
var kJscsspVARIABLE_VALUE = 4;

function jscsspVariable(aType, aSheet)
{
  this.value = "";
  this.type = aType;
  this.name  = null;
  this.parentRule = null;
  this.parentStyleSheet = aSheet;
}

jscsspVariable.prototype = {
  cssText: function() {
    if (this.type == kJscsspVARIABLE_VALUE)
      return this.resolveVariable(this.name, this.parentRule, this.parentStyleSheet);
    else
      return this.value;
  },

  setCssText: function(val) {
    if (this.type == kJscsspVARIABLE_VALUE)
      throw DOMException.SYNTAX_ERR;
    else
      this.value = val;
  },

  resolveVariable: function(aName, aRule, aSheet)
  {
    if (aName.toLowerCase() in aSheet.variables)
      return aSheet.variables[aName.toLowerCase()];
    return null;
  }
};

function ParseURL(buffer) {
  var result = { };
  result.protocol = "";
  result.user = "";
  result.password = "";
  result.host = "";
  result.port = "";
  result.path = "";
  result.query = "";

  var section = "PROTOCOL";
  var start = 0;
  var wasSlash = false;

  while(start < buffer.length) {
    if(section == "PROTOCOL") {
      if(buffer.charAt(start) == ':') {
        section = "AFTER_PROTOCOL";
        start++;
      } else if(buffer.charAt(start) == '/' && result.protocol.length() == 0) { 
        section = PATH;
      } else {
        result.protocol += buffer.charAt(start++);
      }
    } else if(section == "AFTER_PROTOCOL") {
      if(buffer.charAt(start) == '/') {
    if(!wasSlash) {
          wasSlash = true;
    } else {
          wasSlash = false;
          section = "USER";
    }
        start ++;
      } else {
        throw new ParseException("Protocol shell be separated with 2 slashes");
      }       
    } else if(section == "USER") {
      if(buffer.charAt(start) == '/') {
        result.host = result.user;
        result.user = "";
        section = "PATH";
      } else if(buffer.charAt(start) == '?') {
        result.host = result.user;
        result.user = "";
        section = "QUERY";
        start++;
      } else if(buffer.charAt(start) == ':') {
        section = "PASSWORD";
        start++;
      } else if(buffer.charAt(start) == '@') {
        section = "HOST";
        start++;
      } else {
        result.user += buffer.charAt(start++);
      }
    } else if(section == "PASSWORD") {
      if(buffer.charAt(start) == '/') {
        result.host = result.user;
        result.port = result.password;
        result.user = "";
        result.password = "";
        section = "PATH";
      } else if(buffer.charAt(start) == '?') {
        result.host = result.user;
        result.port = result.password;
        result.user = "";
        result.password = "";
        section = "QUERY";
        start ++;
      } else if(buffer.charAt(start) == '@') {
        section = "HOST";
        start++;
      } else {
        result.password += buffer.charAt(start++);
      }
    } else if(section == "HOST") {
      if(buffer.charAt(start) == '/') {
        section = "PATH";
      } else if(buffer.charAt(start) == ':') {
        section = "PORT";
        start++;
      } else if(buffer.charAt(start) == '?') {
        section = "QUERY";
        start++;
      } else {
        result.host += buffer.charAt(start++);
      }
    } else if(section == "PORT") {
      if(buffer.charAt(start) == '/') {
        section = "PATH";
      } else if(buffer.charAt(start) == '?') {
        section = "QUERY";
        start++;
      } else {
        result.port += buffer.charAt(start++);
      }
    } else if(section == "PATH") {
      if(buffer.charAt(start) == '?') {
    section = "QUERY";
    start ++;
      } else {
    result.path += buffer.charAt(start++);
      }
    } else if(section == "QUERY") {
      result.query += buffer.charAt(start++);
    }
  }

  if(section == "PROTOCOL") {
    result.host = result.protocol;
    result.protocol = "http";
  } else if(section == "AFTER_PROTOCOL") {
    throw new ParseException("Invalid url");
  } else if(section == "USER") {
    result.host = result.user;
    result.user = "";
  } else if(section == "PASSWORD") {
    result.host = result.user;
    result.port = result.password;
    result.user = "";
    result.password = "";
  }

  return result;
}

function ParseException(description) {
    this.description = description;
}

function CountLF(s)
{
  var nCR = s.match( /\n/g );
  return nCR ? nCR.length + 1 : 1;
}


function FilterLinearGradientForOutput(aValue, aEngine)
{
  if (aEngine == "generic")
    return aValue.substr(5);

  if (aEngine == "webkit")
    return aValue.replace( /\-moz\-/g , "-webkit-")

  if (aEngine != "webkit20110101")
    return "";

  var g = CssInspector.parseBackgroundImages(aValue)[0];

  var cancelled = false;
  var str = "-webkit-gradient(linear, ";
  var position = ("position" in g.value) ? g.value.position.toLowerCase() : "";
  var angle    = ("angle" in g.value) ? g.value.angle.toLowerCase() : "";
  // normalize angle
  if (angle) {
    var match = angle.match(/^([0-9\-\.\\+]+)([a-z]*)/);
    var angle = parseFloat(match[1]);
    var unit  = match[2];
    switch (unit) {
      case "grad": angle = angle * 90 / 100; break;
      case "rad":  angle = angle * 180 / Math.PI; break;
      default: break;
    }
    while (angle < 0)
      angle += 360;
    while (angle >= 360)
      angle -= 360;
  }
  // get startpoint w/o keywords
  var startpoint = [];
  var endpoint = [];
  if (position != "") {
    if (position == "center")
      position = "center center";
    startpoint = position.split(" ");
    if (angle == "" && angle != 0) {
      // no angle, then we just turn the point 180 degrees around center
      switch (startpoint[0]) {
        case "left":   endpoint.push("right"); break;
        case "center": endpoint.push("center"); break;
        case "right":  endpoint.push("left"); break;
        default: {
            var match = startpoint[0].match(/^([0-9\-\.\\+]+)([a-z]*)/);
            var v     = parseFloat(match[0]);
            var unit  = match[1];
            if (unit == "%") {
              endpoint.push((100-v) + "%");
            }
            else
              cancelled = true;
          }
          break;
      }
      if (!cancelled)
        switch (startpoint[1]) {
          case "top":    endpoint.push("bottom"); break;
          case "center": endpoint.push("center"); break;
          case "bottom": endpoint.push("top"); break;
          default: {
              var match = startpoint[1].match(/^([0-9\-\.\\+]+)([a-z]*)/);
              var v     = parseFloat(match[0]);
              var unit  = match[1];
              if (unit == "%") {
                endpoint.push((100-v) + "%");
              }
              else
                cancelled = true;
            }
            break;
        }
    }
    else {
      switch (angle) {
        case 0:    endpoint.push("right"); endpoint.push(startpoint[1]); break;
        case 90:   endpoint.push(startpoint[0]); endpoint.push("top"); break;
        case 180:  endpoint.push("left"); endpoint.push(startpoint[1]); break;
        case 270:  endpoint.push(startpoint[0]); endpoint.push("bottom"); break;
        default:     cancelled = true; break;
      }
    }
  }
  else {
    // no position defined, we accept only vertical and horizontal
    if (angle == "")
      angle = 270;
    switch (angle) {
      case 0:    startpoint= ["left", "center"];   endpoint = ["right", "center"]; break;
      case 90:   startpoint= ["center", "bottom"]; endpoint = ["center", "top"]; break;
      case 180:  startpoint= ["right", "center"];  endpoint = ["left", "center"]; break;
      case 270:  startpoint= ["center", "top"];    endpoint = ["center", "bottom"]; break;
      default:     cancelled = true; break;
    }
  }

  if (cancelled)
    return "";

  str += startpoint.join(" ") + ", " + endpoint.join(" ");
  if (!g.value.stops[0].position)
    g.value.stops[0].position = "0%";
  if (!g.value.stops[g.value.stops.length-1].position)
    g.value.stops[g.value.stops.length-1].position = "100%";
  var current = 0;
  for (var i = 0; i < g.value.stops.length && !cancelled; i++) {
    var s = g.value.stops[i];
    if (s.position) {
      if (s.position.indexOf("%") == -1) {
        cancelled = true;
        break;
      }
    }
    else {
      var j = i + 1;
      while (j < g.value.stops.length && !g.value.stops[j].position)
        j++;
      var inc = parseFloat(g.value.stops[j].position) - current;
      for (var k = i; k < j; k++) {
        g.value.stops[k].position = (current + inc * (k - i + 1) / (j - i + 1)) + "%";
      }
    }
    current = parseFloat(s.position);
    str += ", color-stop(" + (parseFloat(current) / 100) + ", " + s.color + ")";
  }

  if (cancelled)
    return "";
  return str + ")";
}

function FilterRadialGradientForOutput(aValue, aEngine)
{
  if (aEngine == "generic")
    return aValue.substr(5);

  else if (aEngine == "webkit")
    return aValue.replace( /\-moz\-/g , "-webkit-")

  else if (aEngine != "webkit20110101")
    return "";

  var g = CssInspector.parseBackgroundImages(aValue)[0];

  var shape = ("shape" in g.value) ? g.value.shape : "";
  var size  = ("size"  in g.value) ? g.value.size : "";
  if (shape != "circle"
      || (size != "farthest-corner" && size != "cover"))
    return "";

  if (g.value.stops.length < 2
      || !("position" in g.value.stops[0])
      || !g.value.stops[g.value.stops.length - 1].position
      || !("position" in g.value.stops[0])
      || !g.value.stops[g.value.stops.length - 1].position)
    return "";

  for (var i = 0; i < g.value.stops.length; i++) {
    var s = g.value.stops[i];
    if (("position" in s) && s.position && s.position.indexOf("px") == -1)
      return "";
  }

  var str = "-webkit-gradient(radial, ";
  var position  = ("position"  in g.value) ? g.value.position : "center center";
  str += position + ", " +  parseFloat(g.value.stops[0].position) + ", ";
  str += position + ", " +  parseFloat(g.value.stops[g.value.stops.length - 1].position);

  // at this point we're sure to deal with pixels
  var current = parseFloat(g.value.stops[0].position);
  for (var i = 0; i < g.value.stops.length; i++) {
    var s = g.value.stops[i];
    if (!("position" in s) || !s.position) {
      var j = i + 1;
      while (j < g.value.stops.length && !g.value.stops[j].position)
        j++;
      var inc = parseFloat(g.value.stops[j].position) - current;
      for (var k = i; k < j; k++) {
        g.value.stops[k].position = (current + inc * (k - i + 1) / (j - i + 1)) + "px";
      }
    }
    current = parseFloat(s.position);
    var c = (current - parseFloat(g.value.stops[0].position)) /
            (parseFloat(g.value.stops[g.value.stops.length - 1].position) - parseFloat(g.value.stops[0].position));
    str += ", color-stop(" + c + ", " + s.color + ")";
  }
  str += ")"
  return str;
}

function FilterRepeatingGradientForOutput(aValue, aEngine)
{
  if (aEngine == "generic")
    return aValue.substr(5);

  else if (aEngine == "webkit")
    return aValue.replace( /\-moz\-/g , "-webkit-")

  return "";
}


/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());


/*!
 * jQuery JavaScript Library v1.7.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Nov 21 21:11:03 2011 -0500
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
	navigator = window.navigator,
	location = window.location;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Matches dashed string for camelizing
	rdashAlpha = /-([a-z]|[0-9])/ig,
	rmsPrefix = /^-ms-/,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// The deferred used on DOM ready
	readyList,

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context && document.body ) {
			this.context = document;
			this[0] = document.body;
			this.selector = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = quickExpr.exec( selector );
			}

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context ? context.ownerDocument || context : document );

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector );

					if ( ret ) {
						if ( jQuery.isPlainObject( context ) ) {
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
						selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
					}

					return jQuery.merge( this, selector );

				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.7.1",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		var ret = this.constructor();

		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// Add the callback
		readyList.add( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {
		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.fireWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).off( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyList ) {
			return;
		}

		readyList = jQuery.Callbacks( "once memory" );

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object );

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},

	inArray: function( elem, array, i ) {
		var len;

		if ( array ) {
			if ( indexOf ) {
				return indexOf.call( array, elem, i );
			}

			len = array.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in array && array[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		if ( typeof context === "string" ) {
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		var args = slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) );
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jQuery.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	},

	now: function() {
		return ( new Date() ).getTime();
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	},

	browser: {}
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

return jQuery;

})();


// String to Object flags format cache
var flagsCache = {};

// Convert String-formatted flags into Object-formatted ones and store in cache
function createFlags( flags ) {
	var object = flagsCache[ flags ] = {},
		i, length;
	flags = flags.split( /\s+/ );
	for ( i = 0, length = flags.length; i < length; i++ ) {
		object[ flags[i] ] = true;
	}
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	flags:	an optional list of space-separated flags that will change how
 *			the callback list behaves
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible flags:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( flags ) {

	// Convert flags from String-formatted to Object-formatted
	// (we check in cache first)
	flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};

	var // Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = [],
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Add one or several callbacks to the list
		add = function( args ) {
			var i,
				length,
				elem,
				type,
				actual;
			for ( i = 0, length = args.length; i < length; i++ ) {
				elem = args[ i ];
				type = jQuery.type( elem );
				if ( type === "array" ) {
					// Inspect recursively
					add( elem );
				} else if ( type === "function" ) {
					// Add if not in unique mode and callback is not in
					if ( !flags.unique || !self.has( elem ) ) {
						list.push( elem );
					}
				}
			}
		},
		// Fire callbacks
		fire = function( context, args ) {
			args = args || [];
			memory = !flags.memory || [ context, args ];
			firing = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) {
					memory = true; // Mark as halted
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( !flags.once ) {
					if ( stack && stack.length ) {
						memory = stack.shift();
						self.fireWith( memory[ 0 ], memory[ 1 ] );
					}
				} else if ( memory === true ) {
					self.disable();
				} else {
					list = [];
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					var length = list.length;
					add( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away, unless previous
					// firing was halted (stopOnFalse)
					} else if ( memory && memory !== true ) {
						firingStart = length;
						fire( memory[ 0 ], memory[ 1 ] );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					var args = arguments,
						argIndex = 0,
						argLength = args.length;
					for ( ; argIndex < argLength ; argIndex++ ) {
						for ( var i = 0; i < list.length; i++ ) {
							if ( args[ argIndex ] === list[ i ] ) {
								// Handle firingIndex and firingLength
								if ( firing ) {
									if ( i <= firingLength ) {
										firingLength--;
										if ( i <= firingIndex ) {
											firingIndex--;
										}
									}
								}
								// Remove the element
								list.splice( i--, 1 );
								// If we have some unicity property then
								// we only need to do this once
								if ( flags.unique ) {
									break;
								}
							}
						}
					}
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				if ( list ) {
					var i = 0,
						length = list.length;
					for ( ; i < length; i++ ) {
						if ( fn === list[ i ] ) {
							return true;
						}
					}
				}
				return false;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory || memory === true ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( stack ) {
					if ( firing ) {
						if ( !flags.once ) {
							stack.push( [ context, args ] );
						}
					} else if ( !( flags.once && memory ) ) {
						fire( context, args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!memory;
			}
		};

	return self;
};




var // Static reference to slice
	sliceDeferred = [].slice;

jQuery.extend({

	Deferred: function( func ) {
		var doneList = jQuery.Callbacks( "once memory" ),
			failList = jQuery.Callbacks( "once memory" ),
			progressList = jQuery.Callbacks( "memory" ),
			state = "pending",
			lists = {
				resolve: doneList,
				reject: failList,
				notify: progressList
			},
			promise = {
				done: doneList.add,
				fail: failList.add,
				progress: progressList.add,

				state: function() {
					return state;
				},

				// Deprecated
				isResolved: doneList.fired,
				isRejected: failList.fired,

				then: function( doneCallbacks, failCallbacks, progressCallbacks ) {
					deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks );
					return this;
				},
				always: function() {
					deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments );
					return this;
				},
				pipe: function( fnDone, fnFail, fnProgress ) {
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( {
							done: [ fnDone, "resolve" ],
							fail: [ fnFail, "reject" ],
							progress: [ fnProgress, "notify" ]
						}, function( handler, data ) {
							var fn = data[ 0 ],
								action = data[ 1 ],
								returned;
							if ( jQuery.isFunction( fn ) ) {
								deferred[ handler ](function() {
									returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise().then( newDefer.resolve, newDefer.reject, newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								});
							} else {
								deferred[ handler ]( newDefer[ action ] );
							}
						});
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					if ( obj == null ) {
						obj = promise;
					} else {
						for ( var key in promise ) {
							obj[ key ] = promise[ key ];
						}
					}
					return obj;
				}
			},
			deferred = promise.promise({}),
			key;

		for ( key in lists ) {
			deferred[ key ] = lists[ key ].fire;
			deferred[ key + "With" ] = lists[ key ].fireWith;
		}

		// Handle state
		deferred.done( function() {
			state = "resolved";
		}, failList.disable, progressList.lock ).fail( function() {
			state = "rejected";
		}, doneList.disable, progressList.lock );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( firstParam ) {
		var args = sliceDeferred.call( arguments, 0 ),
			i = 0,
			length = args.length,
			pValues = new Array( length ),
			count = length,
			pCount = length,
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
				firstParam :
				jQuery.Deferred(),
			promise = deferred.promise();
		function resolveFunc( i ) {
			return function( value ) {
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				if ( !( --count ) ) {
					deferred.resolveWith( deferred, args );
				}
			};
		}
		function progressFunc( i ) {
			return function( value ) {
				pValues[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				deferred.notifyWith( promise, pValues );
			};
		}
		if ( length > 1 ) {
			for ( ; i < length; i++ ) {
				if ( args[ i ] && args[ i ].promise && jQuery.isFunction( args[ i ].promise ) ) {
					args[ i ].promise().then( resolveFunc(i), deferred.reject, progressFunc(i) );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( deferred, args );
			}
		} else if ( deferred !== firstParam ) {
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
		}
		return promise;
	}
});




jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		marginDiv,
		fragment,
		tds,
		events,
		eventName,
		i,
		isSupported,
		div = document.createElement( "div" ),
		documentElement = document.documentElement;

	// Preliminary tests
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

	all = div.getElementsByTagName( "*" );
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form(#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent( "onclick" );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute("type", "radio");
	support.radioValue = input.value === "t";

	input.setAttribute("checked", "checked");
	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	if ( window.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.style.width = "2px";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( ( window.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
	}

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	fragment.removeChild( div );

	// Null elements to avoid leaks in IE
	fragment = select = opt = marginDiv = div = input = null;

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, outer, inner, table, td, offsetSupport,
			conMarginTop, ptlm, vb, style, html,
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		conMarginTop = 1;
		ptlm = "position:absolute;top:0;left:0;width:1px;height:1px;margin:0;";
		vb = "visibility:hidden;border:0;";
		style = "style='" + ptlm + "border:5px solid #000;padding:0;'";
		html = "<div " + style + "><div></div></div>" +
			"<table " + style + " cellpadding='0' cellspacing='0'>" +
			"<tr><td></td></tr></table>";

		container = document.createElement("div");
		container.style.cssText = vb + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName( "td" );
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Figure out if the W3C box model works as expected
		div.innerHTML = "";
		div.style.width = div.style.paddingLeft = "1px";
		jQuery.boxModel = support.boxModel = div.offsetWidth === 2;

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.style.display = "inline";
			div.style.zoom = 1;
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "";
			div.innerHTML = "<div style='width:4px;'></div>";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
		}

		div.style.cssText = ptlm + vb;
		div.innerHTML = html;

		outer = div.firstChild;
		inner = outer.firstChild;
		td = outer.nextSibling.firstChild.firstChild;

		offsetSupport = {
			doesNotAddBorder: ( inner.offsetTop !== 5 ),
			doesAddBorderForTableAndCells: ( td.offsetTop === 5 )
		};

		inner.style.position = "fixed";
		inner.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		offsetSupport.fixedPosition = ( inner.offsetTop === 20 || inner.offsetTop === 15 );
		inner.style.position = inner.style.top = "";

		outer.style.overflow = "hidden";
		outer.style.position = "relative";

		offsetSupport.subtractsBorderForOverflowNotVisible = ( inner.offsetTop === -5 );
		offsetSupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== conMarginTop );

		body.removeChild( container );
		div  = container = null;

		jQuery.extend( support, offsetSupport );
	});

	return support;
})();




var rbrace = /^(?:\{.*\}|\[.*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var privateCache, thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey,
			isEvents = name === "events";

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = ++jQuery.uuid;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		privateCache = thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Users should not attempt to inspect the internal events object using jQuery.data,
		// it is undocumented and subject to change. But does anyone listen? No.
		if ( isEvents && !thisCache[ name ] ) {
			return privateCache.events;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			// Reference to internal data cache key
			internalKey = jQuery.expando,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information
			id = isNode ? elem[ internalKey ] : internalKey;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split( " " );
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
		// Ensure that `cache` is not a window object #10080
		if ( jQuery.support.deleteExpando || !cache.setInterval ) {
			delete cache[ id ];
		} else {
			cache[ id ] = null;
		}

		// We destroyed the cache and need to eliminate the expando on the node to avoid
		// false lookups in the cache for entries that no longer exist
		if ( isNode ) {
			// IE does not allow us to delete expando properties from nodes,
			// nor does it have a removeAttribute function on Document nodes;
			// we must handle all of these cases
			if ( jQuery.support.deleteExpando ) {
				delete elem[ internalKey ];
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( internalKey );
			} else {
				elem[ internalKey ] = null;
			}
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, attr, name,
			data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jQuery.data( this[0] );

				if ( this[0].nodeType === 1 && !jQuery._data( this[0], "parsedAttrs" ) ) {
					attr = this[0].attributes;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( this[0], name, data[ name ] );
						}
					}
					jQuery._data( this[0], "parsedAttrs", true );
				}
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var self = jQuery( this ),
					args = [ parts[0], value ];

				self.triggerHandler( "setData" + parts[1] + "!", args );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				jQuery.isNumeric( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}




function handleQueueMarkDefer( elem, type, src ) {
	var deferDataKey = type + "defer",
		queueDataKey = type + "queue",
		markDataKey = type + "mark",
		defer = jQuery._data( elem, deferDataKey );
	if ( defer &&
		( src === "queue" || !jQuery._data(elem, queueDataKey) ) &&
		( src === "mark" || !jQuery._data(elem, markDataKey) ) ) {
		// Give room for hard-coded callbacks to fire first
		// and eventually mark/queue something else on the element
		setTimeout( function() {
			if ( !jQuery._data( elem, queueDataKey ) &&
				!jQuery._data( elem, markDataKey ) ) {
				jQuery.removeData( elem, deferDataKey, true );
				defer.fire();
			}
		}, 0 );
	}
}

jQuery.extend({

	_mark: function( elem, type ) {
		if ( elem ) {
			type = ( type || "fx" ) + "mark";
			jQuery._data( elem, type, (jQuery._data( elem, type ) || 0) + 1 );
		}
	},

	_unmark: function( force, elem, type ) {
		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( (jQuery._data( elem, key ) || 1) - 1 );
			if ( count ) {
				jQuery._data( elem, key, count );
			} else {
				jQuery.removeData( elem, key, true );
				handleQueueMarkDefer( elem, type, "mark" );
			}
		}
	},

	queue: function( elem, type, data ) {
		var q;
		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			q = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || jQuery.isArray(data) ) {
					q = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					q.push( data );
				}
			}
			return q || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			fn = queue.shift(),
			hooks = {};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			jQuery._data( elem, type + ".run", hooks );
			fn.call( elem, function() {
				jQuery.dequeue( elem, type );
			}, hooks );
		}

		if ( !queue.length ) {
			jQuery.removeData( elem, type + "queue " + type + ".run", true );
			handleQueueMarkDefer( elem, type, "queue" );
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined ) {
			return jQuery.queue( this[0], type );
		}
		return this.each(function() {
			var queue = jQuery.queue( this, type, data );

			if ( type === "fx" && queue[0] !== "inprogress" ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, object ) {
		if ( typeof type !== "string" ) {
			object = type;
			type = undefined;
		}
		type = type || "fx";
		var defer = jQuery.Deferred(),
			elements = this,
			i = elements.length,
			count = 1,
			deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark",
			tmp;
		function resolve() {
			if ( !( --count ) ) {
				defer.resolveWith( elements, [ elements ] );
			}
		}
		while( i-- ) {
			if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
					( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
						jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
					jQuery.data( elements[ i ], deferDataKey, jQuery.Callbacks( "once memory" ), true ) )) {
				count++;
				tmp.add( resolve );
			}
		}
		resolve();
		return defer.promise();
	}
});




var rclass = /[\n\t\r]/g,
	rspace = /\s+/,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea)?$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	nodeHook, boolHook, fixSpecified;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.prop );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, i, l, elem, className, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			classNames = ( value || "" ).split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 && elem.className ) {
					if ( value ) {
						className = (" " + elem.className + " ").replace( rclass, " " );
						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							className = className.replace(" " + classNames[ c ] + " ", " ");
						}
						elem.className = jQuery.trim( className );

					} else {
						elem.className = "";
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var self = jQuery(this), val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, i, max, option,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";

				// Nothing was selected
				if ( index < 0 ) {
					return null;
				}

				// Loop through all the selected options
				i = one ? index : 0;
				max = one ? index + 1 : options.length;
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Don't return options that are disabled or in a disabled optgroup
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && name in jQuery.attrFn ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, l,
			i = 0;

		if ( value && elem.nodeType === 1 ) {
			attrNames = value.toLowerCase().split( rspace );
			l = attrNames.length;

			for ( ; i < l; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;

					// See #9699 for explanation of this approach (setting first, then removal)
					jQuery.attr( elem, name, "" );
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( rboolean.test( name ) && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
				ret.nodeValue :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
      try {
        var ret = elem.getAttributeNode( name );
        if ( !ret ) {
          ret = document.createAttribute( name );
          elem.setAttributeNode( ret );
        }
        return ( ret.nodeValue = value + "" );
      } catch (e) { }
		}
	};

	// Apply the nodeHook to tabindex
	jQuery.attrHooks.tabindex.set = nodeHook.set;

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = "" + value );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});




var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
	rhoverHack = /\bhover(\.\S+)?\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
	quickParse = function( selector ) {
		var quick = rquickIs.exec( selector );
		if ( quick ) {
			//   0  1    2   3
			// [ _, tag, id, class ]
			quick[1] = ( quick[1] || "" ).toLowerCase();
			quick[3] = quick[3] && new RegExp( "(?:^|\\s)" + quick[3] + "(?:\\s|$)" );
		}
		return quick;
	},
	quickIs = function( elem, m ) {
		var attrs = elem.attributes || {};
		return (
			(!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
			(!m[2] || (attrs.id || {}).value === m[2]) &&
			(!m[3] || m[3].test( (attrs[ "class" ] || {}).value ))
		);
	},
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, quick, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				quick: quickParse( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
			t, tns, type, origType, namespaces, origCount,
			j, events, special, handle, eventType, handleObj;

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, [ "events", "handle" ], true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var type = event.type || event,
			namespaces = [],
			cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			old = null;
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old && old === elem.ownerDocument ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = [].slice.call( arguments, 0 ),
			run_all = !event.exclusive && !event.namespace,
			handlerQueue = [],
			i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Determine handlers that should run if there are delegated events
		// Avoid disabled elements in IE (#6911) and non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !event.target.disabled && !(event.button && event.type === "click") ) {

			// Pregenerate a single jQuery object for reuse with .is()
			jqcur = jQuery(this);
			jqcur.context = this.ownerDocument || this;

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {
				selMatch = {};
				matches = [];
				jqcur[0] = cur;
				for ( i = 0; i < delegateCount; i++ ) {
					handleObj = handlers[ i ];
					sel = handleObj.selector;

					if ( selMatch[ sel ] === undefined ) {
						selMatch[ sel ] = (
							handleObj.quick ? quickIs( cur, handleObj.quick ) : jqcur.is( sel )
						);
					}
					if ( selMatch[ sel ] ) {
						matches.push( handleObj );
					}
				}
				if ( matches.length ) {
					handlerQueue.push({ elem: cur, matches: matches });
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
		if ( event.metaKey === undefined ) {
			event.metaKey = event.ctrlKey;
		}

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady
		},

		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector,
				ret;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !form._submit_attached ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						// If form was submitted by the user, bubble the event up the tree
						if ( this.parentNode && !event.isTrigger ) {
							jQuery.event.simulate( "submit", this.parentNode, event, true );
						}
					});
					form._submit_attached = true;
				}
			});
			// return undefined since we don't need an event listener
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
							jQuery.event.simulate( "change", this, event, true );
						}
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !elem._change_attached ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					elem._change_attached = true;
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on.call( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			var handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace? handleObj.type + "." + handleObj.namespace : handleObj.type,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( var type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});



/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	expando = "sizcache" + (Math.random() + '').replace('.', ''),
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rReturn = /\r\n/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context, seed );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set, seed );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set, i, len, match, type, left;

	if ( !expr ) {
		return [];
	}

	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
		type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		type, found, item, filter, left,
		i, pass,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				filter = Expr.filter[ type ];
				left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							pass = not ^ found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Utility function for retreiving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {
    var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 ) {
			// Use textContent || innerText for elements
			if ( typeof elem.textContent === 'string' ) {
				return elem.textContent;
			} else if ( typeof elem.innerText === 'string' ) {
				// Replace IE's carriage returns
				return elem.innerText.replace( rReturn, '' );
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {
				ret += getText( node );
			}
		}
	}
	return ret;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var first, last,
				doneName, parent, cache,
				count, diff,
				type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					first = match[2];
					last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					doneName = match[0];
					parent = elem.parentNode;
	
					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
						count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent[ expando ] = doneName;
					}
					
					diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Sizzle.attr ?
					Sizzle.attr( elem, name ) :
					Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				!type && Sizzle.attr ?
				result != null :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem[ expando ] = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem[ expando ] = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context, seed ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet, seed );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
Sizzle.selectors.attrMap = {};
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var self = this,
			i, l;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		var ret = this.pushStack( "", "find", selector ),
			length, n, r;

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && ( 
			typeof selector === "string" ?
				// If this is a positional selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				POS.test( selector ) ? 
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];
		
		// Array (deprecated as of jQuery 1.7)
		if ( jQuery.isArray( selectors ) ) {
			var level = 1;

			while ( cur && cur.ownerDocument && cur !== context ) {
				for ( i = 0; i < selectors.length; i++ ) {

					if ( jQuery( cur ).is( selectors[ i ] ) ) {
						ret.push({ selector: selectors[ i ], elem: cur, level: level });
					}
				}

				cur = cur.parentNode;
				level++;
			}

			return ret;
		}

		// String
		var pos = POS.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}




function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")", "i"),
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( text ) {
		if ( jQuery.isFunction(text) ) {
			return this.each(function(i) {
				var self = jQuery( this );

				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( typeof text !== "object" && text !== undefined ) {
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
		}

		return jQuery.text( this );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			set.push.apply( set, this.toArray() );
			return this.pushStack( set, "before", arguments );
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery.clean(arguments) );
			return set;
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		if ( value === undefined ) {
			return this[0] && this[0].nodeType === 1 ?
				this[0].innerHTML.replace(rinlinejQuery, "") :
				null;

		// See if we can take a shortcut and just use innerHTML
		} else if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

			value = value.replace(rxhtmlTag, "<$1></$2>");

			try {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					// Remove element nodes and prevent memory leaks
					if ( this[i].nodeType === 1 ) {
						jQuery.cleanData( this[i].getElementsByTagName("*") );
						this[i].innerHTML = value;
					}
				}

			// If using innerHTML throws an exception, use the fallback method
			} catch(e) {
				this.empty().append( value );
			}

		} else if ( jQuery.isFunction( value ) ) {
			this.each(function(i){
				var self = jQuery( this );

				self.html( value.call(this, i, self.html()) );
			});

		} else {
			this.empty().append( value );
		}

		return this;
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		} else {
			return this.length ?
				this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
				this;
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {
		var results, first, fragment, parent,
			value = args[0],
			scripts = [];

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback, true );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			parent = value && value.parentNode;

			// If we're in a fragment, just use that instead of building a new one
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
				results = jQuery.buildFragment( args, this, scripts );
			}

			fragment = results.fragment;

			if ( fragment.childNodes.length === 1 ) {
				first = fragment = fragment.firstChild;
			} else {
				first = fragment.firstChild;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
					callback.call(
						table ?
							root(this[i], first) :
							this[i],
						// Make sure that we do not leak memory by inadvertently discarding
						// the original fragment (which might have attached data) instead of
						// using it; in addition, use the original fragment object for the last
						// item instead of first because it can end up being emptied incorrectly
						// in certain situations (Bug #8070).
						// Fragments from the fragment cache must always be cloned and never used
						// in place.
						results.cacheable || ( l > 1 && i < lastIndex ) ?
							jQuery.clone( fragment, true, true ) :
							fragment
					);
				}
			}

			if ( scripts.length ) {
				jQuery.each( scripts, evalScript );
			}
		}

		return this;
	}
});

function root( elem, cur ) {
	return jQuery.nodeName(elem, "table") ?
		(elem.getElementsByTagName("tbody")[0] ||
		elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
		elem;
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 fail to clone children inside object elements that use
	// the proprietary classid attribute value (rather than the type
	// attribute) to identify the type of content to display
	if ( nodeName === "object" ) {
		dest.outerHTML = src.outerHTML;

	} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set
		if ( src.checked ) {
			dest.defaultChecked = dest.checked = src.checked;
		}

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, nodes, scripts ) {
	var fragment, cacheable, cacheresults, doc,
	first = args[ 0 ];

	// nodes may contain either an explicit document object,
	// a jQuery collection or context object.
	// If nodes[0] contains a valid object to assign to doc
	if ( nodes && nodes[0] ) {
		doc = nodes[0].ownerDocument || nodes[0];
	}

	// Ensure that an attr object doesn't incorrectly stand in as a document object
	// Chrome and Firefox seem to allow this to occur and will throw exception
	// Fixes #8950
	if ( !doc.createDocumentFragment ) {
		doc = document;
	}

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		cacheable = true;

		cacheresults = jQuery.fragments[ first ];
		if ( cacheresults && cacheresults !== 1 ) {
			fragment = cacheresults;
		}
	}

	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

	if ( cacheable ) {
		jQuery.fragments[ first ] = cacheresults ? fragment : 1;
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var ret = [],
			insert = jQuery( selector ),
			parent = this.length === 1 && this[0].parentNode;

		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
			insert[ original ]( this[0] );
			return this;

		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) {
				var elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( elem.type === "checkbox" || elem.type === "radio" ) {
		elem.defaultChecked = elem.checked;
	}
}
// Finds all inputs and passes them to fixDefaultChecked
function findInputs( elem ) {
	var nodeName = ( elem.nodeName || "" ).toLowerCase();
	if ( nodeName === "input" ) {
		fixDefaultChecked( elem );
	// Skip scripts, get other children
	} else if ( nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined" ) {
		jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
	}
}

// Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js
function shimCloneNode( elem ) {
	var div = document.createElement( "div" );
	safeFragment.appendChild( div );

	div.innerHTML = elem.outerHTML;
	return div.firstChild;
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			// IE<=8 does not properly clone detached, unknown element nodes
			clone = jQuery.support.html5Clone || !rnoshimcache.test( "<" + elem.nodeName ) ?
				elem.cloneNode( true ) :
				shimCloneNode( elem );

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var checkScriptType;

		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [], j;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Trim whitespace, otherwise indexOf won't work as expected
					var tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Append wrapper element to unknown element safe doc fragment
					if ( context === document ) {
						// Use the fragment we've already created for this document
						safeFragment.appendChild( div );
					} else {
						// Use a fragment created with the owner document
						createSafeFragment( context ).appendChild( div );
					}

					// Go to html and back, then peel off extra wrappers
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;
				}
			}

			// Resets defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			var len;
			if ( !jQuery.support.appendChecked ) {
				if ( elem[0] && typeof (len = elem.length) === "number" ) {
					for ( j = 0; j < len; j++ ) {
						findInputs( elem[j] );
					}
				} else {
					findInputs( elem );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) {
			checkScriptType = function( elem ) {
				return !elem.type || rscriptType.test( elem.type );
			};
			for ( i = 0; ret[i]; i++ ) {
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

				} else {
					if ( ret[i].nodeType === 1 ) {
						var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
					}
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	},

	cleanData: function( elems ) {
		var data, id,
			cache = jQuery.cache,
			special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

			id = elem[ jQuery.expando ];

			if ( id ) {
				data = cache[ id ];

				if ( data && data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
					if ( data.handle ) {
						data.handle.elem = null;
					}
				}

				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

				delete cache[ id ];
			}
		}
	}
});

function evalScript( i, elem ) {
	if ( elem.src ) {
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else {
		jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) );
	}

	if ( elem.parentNode ) {
		elem.parentNode.removeChild( elem );
	}
}




var ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	// fixed for IE9, see #8346
	rupper = /([A-Z]|^ms)/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,
	rrelNum = /^([\-+])=([\-+.\de]+)/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	curCSS,

	getComputedStyle,
	currentStyle;

jQuery.fn.css = function( name, value ) {
	// Setting 'undefined' is a no-op
	if ( arguments.length === 2 && value === undefined ) {
		return this;
	}

	return jQuery.access( this, name, value, true, function( elem, name, value ) {
		return value !== undefined ?
			jQuery.style( elem, name, value ) :
			jQuery.css( elem, name );
	});
};

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity", "opacity" );
					return ret === "" ? "1" : ret;

				} else {
					return elem.style.opacity;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, origName = jQuery.camelCase( name ),
			style = elem.style, hooks = jQuery.cssHooks[ origName ];

		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( +( ret[1] + 1) * +ret[2] ) + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra ) {
		var ret, hooks;

		// Make sure that we're working with the right name
		name = jQuery.camelCase( name );
		hooks = jQuery.cssHooks[ name ];
		name = jQuery.cssProps[ name ] || name;

		// cssFloat needs a special treatment
		if ( name === "cssFloat" ) {
			name = "float";
		}

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {
			return curCSS( elem, name );
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	}
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			var val;

			if ( computed ) {
				if ( elem.offsetWidth !== 0 ) {
					return getWH( elem, name, extra );
				} else {
					jQuery.swap( elem, cssShow, function() {
						val = getWH( elem, name, extra );
					});
				}

				return val;
			}
		},

		set: function( elem, value ) {
			if ( rnumpx.test( value ) ) {
				// ignore negative width and height values #1599
				value = parseFloat( value );

				if ( value >= 0 ) {
					return value + "px";
				}

			} else {
				return value;
			}
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( parseFloat( RegExp.$1 ) / 100 ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery(function() {
	// This hook cannot be added until DOM ready because the support test
	// for it is not run until after DOM ready
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				var ret;
				jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						ret = curCSS( elem, "margin-right", "marginRight" );
					} else {
						ret = elem.style.marginRight;
					}
				});
				return ret;
			}
		};
	}
});

if ( document.defaultView && document.defaultView.getComputedStyle ) {
	getComputedStyle = function( elem, name ) {
		var ret, defaultView, computedStyle;

		name = name.replace( rupper, "-$1" ).toLowerCase();

		if ( (defaultView = elem.ownerDocument.defaultView) &&
				(computedStyle = defaultView.getComputedStyle( elem, null )) ) {
			ret = computedStyle.getPropertyValue( name );
			if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
				ret = jQuery.style( elem, name );
			}
		}

		return ret;
	};
}

if ( document.documentElement.currentStyle ) {
	currentStyle = function( elem, name ) {
		var left, rsLeft, uncomputed,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret === null && style && (uncomputed = style[ name ]) ) {
			ret = uncomputed;
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ( ret || 0 );
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

curCSS = getComputedStyle || currentStyle;

function getWH( elem, name, extra ) {

	// Start with offset property
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		which = name === "width" ? cssWidth : cssHeight,
		i = 0,
		len = which.length;

	if ( val > 0 ) {
		if ( extra !== "border" ) {
			for ( ; i < len; i++ ) {
				if ( !extra ) {
					val -= parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0;
				}
				if ( extra === "margin" ) {
					val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
				} else {
					val -= parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0;
				}
			}
		}

		return val + "px";
	}

	// Fall back to computed then uncomputed css if necessary
	val = curCSS( elem, name, name );
	if ( val < 0 || val == null ) {
		val = elem.style[ name ] || 0;
	}
	// Normalize "", auto, and prepare for extra
	val = parseFloat( val ) || 0;

	// Add padding, border, margin
	if ( extra ) {
		for ( ; i < len; i++ ) {
			val += parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0;
			if ( extra !== "padding" ) {
				val += parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0;
			}
			if ( extra === "margin" ) {
				val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
			}
		}
	}

	return val + "px";
}

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

		return ( width === 0 && height === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Document location
	ajaxLocation,

	// Document location segments
	ajaxLocParts,

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ),
		selection;

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf( " " );
		if ( off >= 0 ) {
			var selector = url.slice( off, url.length );
			url = url.slice( 0, off );
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = undefined;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			// Complete callback (responseText is used internally)
			complete: function( jqXHR, status, responseText ) {
				// Store the response as specified by the jqXHR object
				responseText = jqXHR.responseText;
				// If successful, inject the HTML into all the matched elements
				if ( jqXHR.isResolved() ) {
					// #4825: Get the actual response in case
					// a dataFilter is present in ajaxSettings
					jqXHR.done(function( r ) {
						responseText = r;
					});
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						responseText );
				}

				if ( callback ) {
					self.each( callback, [ responseText, status, jqXHR ] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},

	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			var isSuccess,
				success,
				error,
				statusText = nativeStatusText,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = "" + ( nativeStatusText || statusText );

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		// Serialize object item.
		for ( var name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for ( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for ( key in s.converters ) {
				if ( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if ( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for ( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}




var jsc = jQuery.now(),
	jsre = /(\=)\?(&|$)|\?\?/i;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jQuery.expando + "_" + ( jsc++ );
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
		( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" ||
		s.jsonp !== false && ( jsre.test( s.url ) ||
				inspectData && jsre.test( s.data ) ) ) {

		var responseContainer,
			jsonpCallback = s.jsonpCallback =
				jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ],
			url = s.url,
			data = s.data,
			replace = "$1" + jsonpCallback + "$2";

		if ( s.jsonp !== false ) {
			url = url.replace( jsre, replace );
			if ( s.url === url ) {
				if ( inspectData ) {
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) {
			responseContainer = [ response ];
		};

		// Clean-up function
		jqXHR.always(function() {
			// Set callback back to previous value
			window[ jsonpCallback ] = previous;
			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( previous ) ) {
				window[ jsonpCallback ]( responseContainer[ 0 ] );
			}
		});

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Delegate to script
		return "script";
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});




var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0,
	xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var xhr = s.xhr(),
						handle,
						i;

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occured
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}
									responses.text = xhr.responseText;

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					// if we're in sync mode or it's in cache
					// and has been retrieved directly (IE6 & IE7)
					// we need to manually fire the callback
					if ( !s.async || xhr.readyState === 4 ) {
						callback();
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}




var elemdisplay = {},
	iframe, iframeDoc,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	],
	fxNow;

jQuery.fn.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.animate( genFx("show", 3), speed, easing, callback );

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					// Reset the inline display of this element to learn if it is
					// being hidden by cascaded rules or not
					if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
						display = elem.style.display = "";
					}

					// Set elements which have been overridden with display: none
					// in a stylesheet to whatever the default browser style is
					// for such an element
					if ( display === "" && jQuery.css(elem, "display") === "none" ) {
						jQuery._data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
					}
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					if ( display === "" || display === "none" ) {
						elem.style.display = jQuery._data( elem, "olddisplay" ) || "";
					}
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, easing, callback);

		} else {
			var elem, display,
				i = 0,
				j = this.length;

			for ( ; i < j; i++ ) {
				elem = this[i];
				if ( elem.style ) {
					display = jQuery.css( elem, "display" );

					if ( display !== "none" && !jQuery._data( elem, "olddisplay" ) ) {
						jQuery._data( elem, "olddisplay", display );
					}
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				if ( this[i].style ) {
					this[i].style.display = "none";
				}
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, easing, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed( speed, easing, callback );

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete, [ false ] );
		}

		// Do not change referenced properties as per-property easing will be lost
		prop = jQuery.extend( {}, prop );

		function doAnimation() {
			// XXX 'this' does not always have a nodeName when running the
			// test suite

			if ( optall.queue === false ) {
				jQuery._mark( this );
			}

			var opt = jQuery.extend( {}, optall ),
				isElement = this.nodeType === 1,
				hidden = isElement && jQuery(this).is(":hidden"),
				name, val, p, e,
				parts, start, end, unit,
				method;

			// will store per property easing and be used to determine when an animation is complete
			opt.animatedProperties = {};

			for ( p in prop ) {

				// property name normalization
				name = jQuery.camelCase( p );
				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
				}

				val = prop[ name ];

				// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
				if ( jQuery.isArray( val ) ) {
					opt.animatedProperties[ name ] = val[ 1 ];
					val = prop[ name ] = val[ 0 ];
				} else {
					opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
				}

				if ( val === "hide" && hidden || val === "show" && !hidden ) {
					return opt.complete.call( this );
				}

				if ( isElement && ( name === "height" || name === "width" ) ) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height animated
					if ( jQuery.css( this, "display" ) === "inline" &&
							jQuery.css( this, "float" ) === "none" ) {

						// inline-level elements accept inline-block;
						// block-level elements need to be inline with layout
						if ( !jQuery.support.inlineBlockNeedsLayout || defaultDisplay( this.nodeName ) === "inline" ) {
							this.style.display = "inline-block";

						} else {
							this.style.zoom = 1;
						}
					}
				}
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			for ( p in prop ) {
				e = new jQuery.fx( this, opt, p );
				val = prop[ p ];

				if ( rfxtypes.test( val ) ) {

					// Tracks whether to show or hide based on private
					// data attached to the element
					method = jQuery._data( this, "toggle" + p ) || ( val === "toggle" ? hidden ? "show" : "hide" : 0 );
					if ( method ) {
						jQuery._data( this, "toggle" + p, method === "show" ? "hide" : "show" );
						e[ method ]();
					} else {
						e[ val ]();
					}

				} else {
					parts = rfxnum.exec( val );
					start = e.cur();

					if ( parts ) {
						end = parseFloat( parts[2] );
						unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );

						// We need to compute starting value
						if ( unit !== "px" ) {
							jQuery.style( this, p, (end || 1) + unit);
							start = ( (end || 1) / e.cur() ) * start;
							jQuery.style( this, p, start + unit);
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			}

			// For JS strict compliance
			return true;
		}

		return optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},

	stop: function( type, clearQueue, gotoEnd ) {
		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var index,
				hadTimers = false,
				timers = jQuery.timers,
				data = jQuery._data( this );

			// clear marker counters if we know they won't be
			if ( !gotoEnd ) {
				jQuery._unmark( true, this );
			}

			function stopQueue( elem, data, index ) {
				var hooks = data[ index ];
				jQuery.removeData( elem, index, true );
				hooks.stop( gotoEnd );
			}

			if ( type == null ) {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && index.indexOf(".run") === index.length - 4 ) {
						stopQueue( this, data, index );
					}
				}
			} else if ( data[ index = type + ".run" ] && data[ index ].stop ){
				stopQueue( this, data, index );
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					if ( gotoEnd ) {

						// force the next step to be the last
						timers[ index ]( true );
					} else {
						timers[ index ].saveState();
					}
					hadTimers = true;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( !( gotoEnd && hadTimers ) ) {
				jQuery.dequeue( this, type );
			}
		});
	}

});

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout( clearFxNow, 0 );
	return ( fxNow = jQuery.now() );
}

function clearFxNow() {
	fxNow = undefined;
}

// Generate parameters to create a standard animation
function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice( 0, num )), function() {
		obj[ this ] = type;
	});

	return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx( "show", 1 ),
	slideUp: genFx( "hide", 1 ),
	slideToggle: genFx( "toggle", 1 ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

		// normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function( noUnmark ) {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			} else if ( noUnmark !== false ) {
				jQuery._unmark( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ( ( -Math.cos( p*Math.PI ) / 2 ) + 0.5 ) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		options.orig = options.orig || {};
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		( jQuery.fx.step[ this.prop ] || jQuery.fx.step._default )( this );
	},

	// Get the current size
	cur: function() {
		if ( this.elem[ this.prop ] != null && (!this.elem.style || this.elem.style[ this.prop ] == null) ) {
			return this.elem[ this.prop ];
		}

		var parsed,
			r = jQuery.css( this.elem, this.prop );
		// Empty strings, null, undefined and "auto" are converted to 0,
		// complex values such as "rotate(1rad)" are returned as is,
		// simple values such as "10px" are parsed to Float.
		return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		var self = this,
			fx = jQuery.fx;

		this.startTime = fxNow || createFxNow();
		this.end = to;
		this.now = this.start = from;
		this.pos = this.state = 0;
		this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );

		function t( gotoEnd ) {
			return self.step( gotoEnd );
		}

		t.queue = this.options.queue;
		t.elem = this.elem;
		t.saveState = function() {
			if ( self.options.hide && jQuery._data( self.elem, "fxshow" + self.prop ) === undefined ) {
				jQuery._data( self.elem, "fxshow" + self.prop, self.start );
			}
		};

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			timerId = setInterval( fx.tick, fx.interval );
		}
	},

	// Simple 'show' function
	show: function() {
		var dataShow = jQuery._data( this.elem, "fxshow" + this.prop );

		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = dataShow || jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any flash of content
		if ( dataShow !== undefined ) {
			// This show is picking up where a previous hide or show left off
			this.custom( this.cur(), dataShow );
		} else {
			this.custom( this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur() );
		}

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = jQuery._data( this.elem, "fxshow" + this.prop ) || jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom( this.cur(), 0 );
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var p, n, complete,
			t = fxNow || createFxNow(),
			done = true,
			elem = this.elem,
			options = this.options;

		if ( gotoEnd || t >= options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			options.animatedProperties[ this.prop ] = true;

			for ( p in options.animatedProperties ) {
				if ( options.animatedProperties[ p ] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				// Reset the overflow
				if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

					jQuery.each( [ "", "X", "Y" ], function( index, value ) {
						elem.style[ "overflow" + value ] = options.overflow[ index ];
					});
				}

				// Hide the element if the "hide" operation was done
				if ( options.hide ) {
					jQuery( elem ).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( options.hide || options.show ) {
					for ( p in options.animatedProperties ) {
						jQuery.style( elem, p, options.orig[ p ] );
						jQuery.removeData( elem, "fxshow" + p, true );
						// Toggle data is no longer needed
						jQuery.removeData( elem, "toggle" + p, true );
					}
				}

				// Execute the complete function
				// in the event that the complete function throws an exception
				// we must ensure it won't be called twice. #5684

				complete = options.complete;
				if ( complete ) {

					options.complete = false;
					complete.call( elem );
				}
			}

			return false;

		} else {
			// classical easing cannot be used with an Infinity duration
			if ( options.duration == Infinity ) {
				this.now = t;
			} else {
				n = t - this.startTime;
				this.state = n / options.duration;

				// Perform the easing function, defaults to swing
				this.pos = jQuery.easing[ options.animatedProperties[this.prop] ]( this.state, n, 0, 1, options.duration );
				this.now = this.start + ( (this.end - this.start) * this.pos );
			}
			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		var timer,
			timers = jQuery.timers,
			i = 0;

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];
			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},

	interval: 13,

	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},

	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = fx.now + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

// Adds width/height step functions
// Do not set anything below 0
jQuery.each([ "width", "height" ], function( i, prop ) {
	jQuery.fx.step[ prop ] = function( fx ) {
		jQuery.style( fx.elem, prop, Math.max(0, fx.now) + fx.unit );
	};
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

// Try to restore the default display value of an element
function defaultDisplay( nodeName ) {

	if ( !elemdisplay[ nodeName ] ) {

		var body = document.body,
			elem = jQuery( "<" + nodeName + ">" ).appendTo( body ),
			display = elem.css( "display" );
		elem.remove();

		// If the simple way fails,
		// get element's real default display by attaching it to a temp iframe
		if ( display === "none" || display === "" ) {
			// No iframe to use yet, so create it
			if ( !iframe ) {
				iframe = document.createElement( "iframe" );
				iframe.frameBorder = iframe.width = iframe.height = 0;
			}

			body.appendChild( iframe );

			// Create a cacheable copy of the iframe document on first call.
			// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
			// document to it; WebKit & Firefox won't allow reusing the iframe document.
			if ( !iframeDoc || !iframe.createElement ) {
				iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
				iframeDoc.write( ( document.compatMode === "CSS1Compat" ? "<!doctype html>" : "" ) + "<html><body>" );
				iframeDoc.close();
			}

			elem = iframeDoc.createElement( nodeName );

			iframeDoc.body.appendChild( elem );

			display = jQuery.css( elem, "display" );
			body.removeChild( iframe );
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
	rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) {
	jQuery.fn.offset = function( options ) {
		var elem = this[0], box;

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		try {
			box = elem.getBoundingClientRect();
		} catch(e) {}

		var doc = elem.ownerDocument,
			docElem = doc.documentElement;

		// Make sure we're not dealing with a disconnected DOM node
		if ( !box || !jQuery.contains( docElem, elem ) ) {
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
		}

		var body = doc.body,
			win = getWindow(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
			scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
			top  = box.top  + scrollTop  - clientTop,
			left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};

} else {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		var computedStyle,
			offsetParent = elem.offsetParent,
			prevOffsetParent = elem,
			doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop,
			left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return null;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function( val ) {
		var elem, win;

		if ( val === undefined ) {
			elem = this[ 0 ];

			if ( !elem ) {
				return null;
			}

			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}

		// Set the scroll offset
		return this.each(function() {
			win = getWindow( this );

			if ( win ) {
				win.scrollTo(
					!i ? val : jQuery( win ).scrollLeft(),
					 i ? val : jQuery( win ).scrollTop()
				);

			} else {
				this[ method ] = val;
			}
		});
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}




// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn[ "inner" + name ] = function() {
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, "padding" ) ) :
			this[ type ]() :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn[ "outer" + name ] = function( margin ) {
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, margin ? "margin" : "border" ) ) :
			this[ type ]() :
			null;
	};

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}

		if ( jQuery.isFunction( size ) ) {
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) );
			});
		}

		if ( jQuery.isWindow( elem ) ) {
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ],
				body = elem.document.body;
			return elem.document.compatMode === "CSS1Compat" && docElemProp ||
				body && body[ "client" + name ] || docElemProp;

		// Get document width or height
		} else if ( elem.nodeType === 9 ) {
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max(
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) {
			var orig = jQuery.css( elem, type ),
				ret = parseFloat( orig );

			return jQuery.isNumeric( ret ) ? ret : orig;

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" );
		}
	};

});




// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}



})( window );



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

    iserr :
      function() {
        try {
          F.apply(F.first(arguments), F.rest(arguments));
          return false;
        } catch (e) {
          return true;
        }
      },

    _typeof :
      function(x) { return typeof(x) },

    _instanceof :
      function(x, y) { return x instanceof y },

    evalenv :
      function(_expr, _env) {
        var _i, _ret;
        for (_i in _env)
          eval("var "+_i+" = _env['"+_i+"']");
        eval("_ret = ("+_expr+")");
        return _ret;
      },

    /*************************************************************************
     * STRING FUNCTIONS                                                      *
     *************************************************************************/

    strcmp :
      function(x, y) { return ((x == y) ? 0 : (( x > y) ? 1 : -1)) },

    strncmp :
      function(x, y, len) {
        return F.strcmp(x.substr(0, len), y.substr(0, len));
      },

    strreplace :
      function(x, re, y) { return x.replace(re, y) },

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

    tovec :
      function(arr) {
        var ret;
        ret = $.type(arr) == "string" ? [] : F.vec(arr);
        return ret.length > 0 && arr
          ? ret
          : (arr ? ret.concat([arr]) : ret);
      },

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

    uniquearray :
      function(pred, arr) {
        var i, j, l=arr.length, ret=[];

        for (i=0; i<l; i++) {
          for (j=i+1; j<l; j++)
            if (pred(arr[i], arr[j]))
              j = ++i;
          ret.push(arr[i]);
        }

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

    keyvalmap :
      function(obj) {
        return F.map(function(x) {
          return { key:x[0], val:x[1] };
        }, F.outof(obj));
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
        var obj = F.first(arguments) || {},
            kvs = F.rest(arguments),
            k, v, t;
        if (kvs.length == 1)
          return obj[kvs[0]];
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
     * FP STUFF                                                              *
     *************************************************************************/

    cons :
      function() {
        var fns = F.vec(arguments);
        return function() {
          var i, ret=[], argv=F.vec(arguments);
          for (i=0; i<fns.length; i++)
            ret[i] = fns[i].apply(window, argv);
          return ret;
        }
      },

    applyall :
      function(fn) {
        return function() {
          var i, len=arguments.length, ret=[];
          for (i=0; i<len; i++)
            ret[i] = fn(arguments[i]);
          return ret;
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

    invoke :
      function(f, obj) {
        return function() { f.apply(obj, F.vec(arguments)) };
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

    mapcat :
      function (f, arr) {
        var i, j, ret=[];
        for (i=0; i<arr.length; i++)
          ret = ret.concat(f(arr[i]));
        return ret;
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
      }

  };

  var mathfns = ["cos", "pow", "log", "tan", "sqrt", "ceil", "asin", "abs",
                 "max", "exp", "atan2", "random", "round", "floor", "acos",
                 "atan", "min", "sin"];

  F.map(function(x) {
    F[x] = function() { return Math[x].apply(window, F.vec(arguments)) };
  }, mathfns);

  F.now = function() { return (new Date()).getTime() };

  F.map(function(x) { F["s"+x] = F.partial(F.nth, F._, x) }, F.range(0,16));

  window.Fundaments = F;

})(jQuery);



Fundaments.load();

console = console || {};
console.time = console.time || function() {};
console.timeEnd = console.timeEnd || function() {};

console.time("load");

(function() {

  var eventQ=[], nextQ=[];
  
  /**
   * Returns a function that, when called with no arguments, invokes the given
   * method on the `this` object, with the given (optional) arguments. This is
   * useful for mapping over the jQuery object:
   *
   *   $(foo).map($.invoke("hasClass", "foo"));
   */
  $.invoke = function(meth) {
    var args = rest(arguments);
    return function() {
      return $(this)[meth].apply($(this), args);
    }
  };

  /**
   * Quote special css chars in a selector.
   */
  $.sq = function(x) {
    return x.replace(/([^a-zA-Z0-9-_])/g, '\\$1');
  };

  /**
   * The tag name of this element.
   */
  $.fn.nodeName = function() {
    return this[0].nodeName.toLowerCase();
  };

  /**
   * Get a map of this element's attributes and their associated values.
   */
  $.fn.attrMap = function() {
    var ret = {};
    if (this.size())
      $.each(this.get(0).attributes, function(i,attr) {
        ret[attr.nodeName.toLowerCase()] = attr.nodeValue;
      });
    return ret;
  };

  $.fn.pop = function() {
    var ret = this.get(-1);
    this.splice(this.length-1,1);
    return ret;
  };

  $.fn.shift = function() {
    var ret = this.get(0);
    this.splice(0,1);
    return ret;
  };

  /**
   * Get the child element of this element with name attribute set to `name`
   */
  $.fn.byName = function(name) {
    var ret = $("[data-name='"+$.sq(name)+"']", this);
    //ret = ret.filter($.invoke("isVisibleParents"));
    return ret.type() == "radio" ? ret.filter("[data-checked]") : ret;
  };

  /**
   * The type attribute of this element.
   */
  $.fn.type = function() {
    var n;
    return (n = this.attr("type") || this.attr("data-type"))
      ? n.toLowerCase()
      : "";
  };

  function attr(name, fn) {
    attr.fns[name] = (attr.fns[name]||[]).concat([fn]);
  }

  attr.fns = {};

  function onAttr(elem, name, ini, fin, op) {
    if (name in attr.fns)
      map(applyto([elem, ini, fin, op]), attr.fns[name]);
  }

  function init() {
    map(apply, init.fns);
  }

  function prepare(ctx) {
    map(partial(apply, _, [ctx]), prepare.fns);
    return ctx;
  }

  function prerun(q) {
    map(applyto([q]), prerun.fns);
  }

  function process(q) {
    map(applyto([q]), process.fns);
  }

  function finalize(q) {
    map(applyto([q]), finalize.fns);
  }

  function run(defer) {
    var pre=0, tmpQ, elemQ, doneQ=[];

    console.time("run");

    if ($.type(defer) === "number")
      return setTimeout(function() {
        $(document).trigger("attr-change");
      }, defer);

    function elems(q) {
      return keep(map(function(x) {
        var y = x.split(":"),
            e = $("body").byName(y[0]);
        return e.size() ? [e, x, y[0], y[1]] : false;
      }, q));
    }

    while (eventQ.length) {
      console.time("run iter", true);

      tmpQ = uniquearray(eqq, eventQ);
      eventQ.length = 0;

      elemQ = elems(tmpQ);

      if (! pre++)
        prerun(elemQ);

      process(elemQ);
      doneQ = doneQ.concat(tmpQ);

      console.timeEnd("run iter");
    }

    console.time("finalize");
    finalize(elems(uniquearray(eqq, doneQ)));
    console.timeEnd("finalize");

    console.timeEnd("run");
    console.timeEnd("load");

    $UI.initComplete = true;
  }

  function enqueue(meth, q) {
    return function() {
      if (this.size() > 1)
        return this.each($.invoke(meth));
      if ( (n = this.attr("data-name")) || (n = this.attr("name")) )
        q.push(n);
      return this;
    };
  }

  $.fn.prepare = function() {
    if (this.size() > 1)
      return this.each($.invoke("prepare"));
    return prepare(this);
  };

  $.fn.qNow   = enqueue("qNow", eventQ);
  $.fn.qNext  = enqueue("qNext", nextQ);

  $UI = {
    CREATE:       1,
    UPDATE:       2,
    REMOVE:       3,
    q:            function() { return eventQ },
    m:            {},
    attr:         attr,
    init:         init.fns      = [],
    prepare:      prepare.fns   = [],
    prerun:       prerun.fns    = [],
    process:      process.fns   = [],
    finalize:     finalize.fns  = [],
    run:          run
  };

  $(function() {
    init();
    prepare($("html"));
    run();
  });

  (function(orig) {
    $UI._attr = orig;
    $.attr = function(elem, name, value, pass) {
      var len=arguments.length, ini, op, n;

      if ((len == 3 || len == 4) && name.substr(0,5) === "data-") {
        ini = orig(elem, name);

        op = arguments.length == 3
          ? $UI.REMOVE
          : (ini === undefined ? $UI.CREATE : $UI.UPDATE);

        if (value === true) {
          value = name;
        } else if (value === false) {
          op = $UI.UPDATE;
          value = null;
        }

        if (op !== $UI.UPDATE || value !== null) {
          onAttr(elem, name, ini, value, op);
          if ( (n = orig(elem, "data-name")) || (n = orig(elem, "name")) )
            eventQ.push(n+":"+name);
        }
      }

      return apply(orig, vec(arguments));
    };
  })($.attr);

  $(document).on("attr-change", function(event) {
    $UI.run();
  });
})();



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
    var radios  = "input[type='radio']",
        checks  = "input[type='checkbox']",
        others  = "input[type!='radio'][type!='checkbox'],select,textarea",
        i;

    for (i in dAttrs)
      linkedAttrs(dAttrs[i]);

    function radioClick(elem, event) {
      var jself = $(elem),
          nm = jself.attr("data-name") || jself.attr("name");
      $("[data-name='"+$.sq(nm)+"']").not(jself).removeAttr("data-checked");
      jself.attr("data-checked", true);
      $UI.run(0);
    }

    function checkboxClick(elem, event) {
      var jself = $(elem);
      jself.attr("data-checked", !! jself.is(":checked"));
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



(function() {
  
  var T_OBJECT        = 1,
      T_DEFINED       = 2,
      T_FUNCTION      = 3,
      T_SPECIAL_FORM  = 4,
      T_NIL           = 5,
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
    return this.replaceWith($.fromSexp(evalSexp(null, this.toSexp())));
  };

  /***************************************************************************
   * Declarify.js hooks                                                      *
   ***************************************************************************/

  $UI.init.push(function() {
    map(function(x) { $(x[0]).hide() }, outof(genv));
    $("body").evalSexp();
  });

  /***************************************************************************
   * Special forms                                                           *
   ***************************************************************************/

  $UI.m.macro.fm("define", function mdefine(env, meta, sym, val) {
    var v = evalSexp(env, dup(val));
    genv[sym.name] = { type: T_DEFINED, expr: v };
    return null;
  });

  /***************************************************************************
   * Functions                                                               *
   ***************************************************************************/

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

      map(function(x) {
        map(function(y) {
          var same = {},
              opts = { "$val" : ref.attr(attr) },
              expr = dep.tfdEval(y[1], ref, same, opts);
          if (expr !== same) {
            if (y[0] in mods)
              mods[y[0]](dep, expr);
            else if (y[0] in flags)
              dep.attr("data-"+y[0], !!expr);
            else
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



(function() {
  
  $UI.m.dep("text", function attrlib_text(elem, val, same) {
    if (val !== same)
      elem.text(val);
  });

})();

