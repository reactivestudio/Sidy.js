#Sidy.js
[![Sidy version](http://img.shields.io/badge/Sidy.js-v1.1.0-brightgreen.svg)](http://Sidyjs.org) [![License](http://img.shields.io/badge/License-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

Sidy.js is an off-, on- canvas navigation panels using CSS transforms & transitions. This project was inspired by the SidebarTransitions project seen on [SidebarTransitions](https://github.com/codrops/SidebarTransitions)

- **3.3KB** minified and Gzipped
-An open-source project by [Reactive Design Studio](https://twitter.com/reactive_studio)



Features
------------
 - Uses CSS3 transforms & transitions
 - Smooth performance on mobile devices
 <!-- – an API for custom open and close panel control -->
 - Panel closes when the site overlay is selected
 - Custom panels settings. Position: left, top, right. Size: px, %, 'auto'. Effects: slide_overlay, reveal, push, slide_along, slide_reverse, scale_down, scale_up


Requirements
------------
[jQuery 1.9+](http://jquery.com/)


Installation
------------

Please use which ever is most comfortable:

- [Download ZIP](https://github.com/reactivestudio/Sidy.js/archive/master.zip)
- `git clone github.com/reactivestudio/Sidy.js.git`
- `bower install scrollReveal.js`

Once you’ve got `scrollReveal.min.js` into your project’s JavaScript directory, let’s instantiate it!

```html
<!DOCTYPE html>
<html>
  <body>

    <!-- All your stuff up here... -->

    <script src='/js/scrollReveal.min.js'></script>
    <script>

      window.sr = new scrollReveal();

    </script>
  </body>
</html>
```

Basic Usage
-----------

How does it work? Just add `data-sr` to an element, and it will reveal as it enters the viewport.
```html
<p data-sr> Chips Ahoy! </p>
```

Taking Control
--------------

You guessed it, the `data-sr` attribute is waiting for _you_ to describe the type of animation you want. It’s as simple as using a few **keywords** and natural language.
```html
<div data-sr="enter left please, and hustle 20px"> Foo </div>
<div data-sr="wait 2.5s and then ease-in-out 100px"> Bar </div>
<div data-sr="enter bottom and scale up 20% over 2s"> Baz </div>
```
What you enter into the `data-sr` attribute is parsed for specific words:

- **Keywords** that expect to be followed by a **value**. (e.g. move 50px)
- **Sugar** (optional) for fun and comprehension. (e.g. and, then, please, etc.)
