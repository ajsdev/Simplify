"use strict";
/*
Copyright 2017 Andrew S

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
module.exports = function (file) {
    var doublequote = false, // "
        singlequote = false, // '
        backtick = false, // `
        backslash = false, // \
        fowardslash = false, // /
        star = false, // *
        scope = 0 // {}

    var data = file.data.split(""),
        len = data.length;

    var lineComment = false,
        mlineComment = false

    var out = {
        type: "",
        data: [],
        parent: null,
        scope: 0
    };
    var current = [];
    var insertTo = out;
    var i;

    function skip(char) {
        backslash = false;
        current.push(char)
        for (++i; i < len; i++) {
            char = data[i];

            current.push(char)
            if (char === "\\") backslash = true;
            else if (char === char && !backslash) {
                break;
            } else if (backslash) {
                backslash = false;
            }
        }
    }

    for (i = 0; i < len; i++) {
        var char = data[i];
        switch (char) {
            case "\"": // skip strings
                skip("\"")
                break;
            case "'": // skip strings
                skip("'")
                break;
            case "`": // skip strings
                skip("`")
                break;
            case "\\": // skip backslash
                current.push(char)
                current.push(data[++i]);
                break;
            case "/": // skip comments
                i++;
                if (data[i] === "/") {
                    current.push("/", "/");
                    for (++i; i < len; i++) {
                        var c = data[i];
                        current.push(c);
                        if (c == "\n") {
                            break;
                        }
                    }
                } else if (data[i] === "*") {
                    current.push("/", "*");
                    star = false;
                    for (++i; i < len; i++) {
                        var c = data[i];
                        current.push(c);
                        if (c == "*") {
                            star = true;
                        } else
                        if (c == "/" && star) {
                            break;
                        } else if (star) {
                            star = false;
                        }
                    }
                }
                break;
            case "{":

                if (current.length) insertTo.data.push(current.join(""));

                current = [];

                scope++;
                var n = {
                    type: "",
                    data: [],
                    parent: insertTo,
                    scope: scope
                }
                insertTo.data.push(n)
                insertTo = n;
                break;
            case "}":
                scope--;
                if (current.length) insertTo.data.push(current.join(""));

                current = [];
                insertTo = insertTo.parent;

                break;
            default:

                current.push(char)
                break;
        }

    }
    if (current.length) insertTo.data.push(current.join(""));

    current = [];

    return out;
}
