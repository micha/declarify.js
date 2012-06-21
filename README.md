# Declarify JS

* A clientside library for declarative UI development.
* Develop dynamic user interfaces for modern web applications in pure
HTML&mdash;no JavaScript coding required.
* Create and organize frontend code efficiently, without requiring a
secondary effort to develop a JavaScript architecture.
* Supports dynamic behaviors, custom HTML widgets, AJAX communication
with the server, etc.

## Demo

A couple of (rough) demos [here](http://micha.github.com/declarify.js/test.html)
and [here](http://micha.github.com/declarify.js/index.html).

## Motivation

Web user interface development is a complex process. Designing a good-looking,
dynamic, extensible, and maintainable UI framework is hard to do. Normally,
this development process would involve organizing HTML markup, CSS/Sass,
and associated JavaScript modules, plus a slew of naming conventions
applied to HTML element ids and classes (used to link JavaScript modules
to DOM elements).

Ideally, when correctly done these elements of your frontend architecture
would mesh together naturally and complexity in design would be tackled by
forming abstractions which can be composed with each other in many different
ways to form more complex structures.

However, the unfortunate state of affairs is that the means of composition
and abstraction that are available in the DOM world and the JavaScript
world are fundamentally incompatible.

The consequences of this are serious: a good UI designer must be not only a
master of UI design, HTML idiosyncracies and CSS quirks, but he must also be
able to design an excellent JavaScript architecture to encompass the dynamic
behaviors the UI requires. This is an unreasonable burden on the developer,
because JS architecture is a Hard Problem in itself, worthy of serious study.
It takes years of programming experience to understand the complexities
involved enough to design a really good, extensible, and maintainable JS
architecture to support a complex UI.

The natural way to solve this problem is to eliminate the need for
explicit composition in one of the two domains (i.e. DOM and JavaScript).
[Cappuccino](http://cappuccino.org) does this, eliminating the need for
app-level composition and abstraction in the HTML DOM. Declarify.js takes
a complimentary approach, removing the need for JavaScript composition.

Declarify provides a universal mechanism for declaratively "wiring up" DOM
elements to the JavaScript behavior implementations. A full complement of
behaviors are included with the declarify JS distribution and it's easy to
define new ones to suit special needs. Additionally, a means of abstraction
is provided, by which the designer can define "widgets" that encapsulate
behavior and state information in an extensible, composeable way.

## Dependencies

The primary mechanism employed by declarify is a dependency-based event
propagation model that replaces the browser's DOM event system. Dependencies
are specified declaritively rather than imperatively.

#### Example 1

```html
<label>Text: <input type="text" name="ex1-input1" /></label>
<hr>
<div>
  <span>The value of the text input above is: </span>
  <code
    data-a::dep   = "ex1-input1"
    data-a::text  = "$$.value"
    >
  </code>
</div>
```

This is a basic example of a **dependency set**. A dependency set is a
set of attributes that are grouped together by a common **prefix**. (All
attributes used by declarify are themselves prefixed with `data-`.) In this
example the prefix is `data-a`, or, equivalently, just `a`. The prefix is
separated from the **directive** by a double-colon.

There are two directives declared in this dependency set: the first one sets
up the dependency relationship, and the second performs an operation (in this
case sets the text of the dependent element to the value of the referent)
whenever the referent element changes. The **referent** element is what we
call the element that the **dependent** element depends on.

This relationship is completely dynamic, meaning that any time the value of
the input element changes, the code element is automatically updated in real
time.

## Contribute

Jekyll is used to build the final js file, just because I'm using that for
other things in the project I'm working on anyway. The source files are in
the `_includes` directory. Fork and send pull request, by all means.
