(function() {

var window=window||this, i, j, k;

function isArray(arr) {
  return arr
    ? toString.call(arr) == "[object Array]"
    : false;
}

function isFunction(f) {
  return f
    ? toString.call(f) == "[object Function]"
    : false;
}

// Undefined, or "bottom"
window.nil = undefined;

// Selector functions: _1, _2, ...
for (i=1; i<=500; i++)
  window['_'+i] = (function(j) {
    return function(arr) {
      return isArray(arr) && arr.length >= j ? arr[j-1] : nil;
    };
  })(i);

// Tail
window.tl = function(arr) {
  return isArray(arr) ? arr.slice(1) : nil;
};

// Identity
window.id = function(x) {
  return x;
};

// Atom
window.atom = function(x) {
};

})();
