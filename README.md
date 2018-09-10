# [typeahead.js](https://github.com/bhavin36/typeAhead)
Inspired by twitter's autocomplete search functionality [typeahead.js](https://github.com/twitter/typeahead.js).
 this JavaScript library customizable autocomplete functionality for Bootstarp (uses Bootstrap downdown.js).

## Quick start

typeAhead.js requires jQuery v1.9.1+, Bootstrap’s dropdown.js component, and Bootstrap's CSS. If you're not already using Bootstrap in your project, a precompiled version of the Bootstrap v3.3.7 minimum requirements can be downloaded [here](https://getbootstrap.com/docs/3.3/customize/?id=7830063837006f6fc84f).

## Install
Manually download `typeAhead.js` [here](https://raw.githubusercontent.com/bhavin36/typeAhead/master/typeahead.js) and include in your page/project.

## Usage
```html
<div>
  <input type="text" class="form-control" id="txt">
</div>
```

### Via JavaScript
```js
$txt.typeahead({
    //options...
    // see options section below for mode details.
    });
```
## Options
```js
$txt.typeahead({
  placeholderText: "Search...", //placeholder text for input field
  editMode: true, //Default: true. Determines if UI is rendered as live-search or edit(allows user to manually trigger live-search) mode. 
  highlight: true //Default: true. Determines if the search text will be highlighted in dropdown menu.
  minLength: 2, //Default:2. Determines the minimun search string text length to trigger the search function(searchFn).
  // data search function
  searchFn: function (searchString) {    
      // should return Deferred or Promise Object
      return $.get("https:...." + searchString);
	}, 
  // function to build the droddown menu items
  listBuilderFn:  function (data/* returned from searchFn*/) {
      // Format: <li><a>...</a><li>
      // should return array of strings eg:["<li><a>1</a><li>","<li><a>1</a><li>"...]
      return $.get("https:...." + searchString);
	},
  // item is chosen
  itemSelectedFn: function ($currentElement/* the target element which was clicked*/) {
      // Note: $currentElement is a jQuery object
	},
  closedFn: function (event, isClear) {
      // isClear: returns false if "X" is clicked in "live-search" mode, otherwise false.
      // should return array of strings eg:["<li><a>1</a><li>","<li><a>1</a><li>"...]
      return $.get("https:...." + searchString);
	}
});
```
## Demo

You can view a live demo and some examples of how to use the various options [here](https://codepen.io/Bhavin36/full/aaVxLj/).
