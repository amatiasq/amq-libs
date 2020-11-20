# dom

Short description

## Installation

Install with `npm i --save @amatiasq/dom`.

## Usage

```js
import { dom } from '@amatiasq/dom';
```

### Render HTML to DOM elements

```js
> const div = dom`<div id="superpotato">`;
<div id="superpotato"></div>
```

### Escape HTML strings

```js
> const myVar = '<div />';
> const span = dom`<span>${myVar}</span>`;
<span>$lt;div /&gt;</span>
```

### Embed DOM element into the template

```js
> const container = dom`<div class="container">${div}<br>${span}</div>`;
<div class="container">
  <div id="superpotato"></div>
  <br>
  <span>$lt;div /&gt;</span>
</div>
```

Thee embeded elements are not cloned. It's the same reference.

```js
> div.classList.add('testing')
> container.querySelector('#superpotato').classList.has('testing')
true
```

### Unescaped HTML embeding

```js
> const unsafe = dom`<div>${{ __html__: '<i></i>' }}</div>`;
<div><i></i></div>
```
