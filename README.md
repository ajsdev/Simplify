# Simplify
A Simple yet powerful JS compiler.

## Purpose

1. Merge multiple files into one without using npm's dist (its slow).
2. Drop-n-play functionality
3. Organization of functions
4. Quick-file searching
5. Readability

### Important Files

* fileReader.js - Reads files async
* commentReader.js - Loads configs... comments
* functionOrderer.js - Orders functions/methods
* jsDeconstructor.js - Deconstructs JS code into "layers" (scopes)
* jsReconstructor.js - Reconstructs JS code back into code.

### Proof Of Concept

Input:

```js
/* CCONFIG
useStrict = 1;
license = "
Copyright @c Andrew S 2017

ALL RIGHTS RESERVED
";
*/

class hello {
    constructor() {

    }
    hello() {

    }
}
```

Deconstruction:

```json
{ 
"type": "global",
"data": 
   [ ["\n", "\n"],
     { "type": "class",
       "data": 
       [ 
          { 
             "type": "method",
             "data": [ "\n", "\n", " ", " ", " ", " " ],
             "parent": "[Circular]",
             "scope": 2,
             "name": "constructor()"
          },
          { 
             "type": "method",
             "data": [ "\n", "\n", " ", " ", " ", " " ],
             "parent": "[Circular]",
             "scope": 2,
             "name": "hello()" 
          },
          [ "\n" ] 
       ],
       "parent": "[Circular]",
       "scope": 1,
       "name": "class hello" },
     [ "\n" ] ],
"parent": null,
"scope": 0 }
```

Reconstruction:

```js
"use strict";

Copyright @c Andrew S 2017

ALL RIGHTS RESERVED


class hello {
constructor() {


    }
hello() {


    }

}

```