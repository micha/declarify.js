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

##

## Contribute

Jekyll is used to build the final js file, just because I'm using that for
other things in the project I'm working on anyway. The source files are in
the `_includes` directory. Fork and send pull request, by all means.
