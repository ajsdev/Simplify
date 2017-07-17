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
        type: "global",
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

    function add() {

        if (current.length) insertTo.data.push(current);
        current = [];
    }

    function peek(a) {
        return a[a.length - 1]
    }

    function rejoin(arr, cut) {
        var b = arr.slice(cut);
        b.reverse();
        var o = [];
        b.forEach((g, p) => {
            if (p !== 0) o.push(" ");

            for (var i = 0, len = g.length; i < len; i++) {
                o.push(g[len - i - 1]);
            }
        })

        return o;
    }

    function format(p, a) {

        if (p.type == "class") {
            a.type = "method";
            a.name = p.data.pop().join("").trim();
        } else {

            var str = peek(p.data)

            var s = false;
            var out = [];
            var cur = [];
            for (var i = 0; i < str.length; i++) {
                var char = str[str.length - i - 1];

                if (char === "\n") {
                    if (cur.length) out.push(cur);
                    cur = [];
                    var arr = str.slice(0, str.length - i);
                    arr.reverse();
                    out.push(arr)
                    break;
                };

                switch (char) {
                    case ")":

                        cur.push(char);
                        s = true;
                        break;
                    case "(":
                        cur.push(char);
                        if (cur.length) out.push(cur);
                        cur = [];

                        s = false;
                        break;
                    case " ":
                        if (s) continue;
                        if (cur.length) out.push(cur);
                        cur = [];
                        break;
                    case "=":
                        if (s) continue;
                        if (cur.length) out.push(cur);
                        cur = ["="];
                        break;
                    default:
                        cur.push(char);
                        break;
                }
            }
            if (cur.length) out.push(cur);

            if (out[1] && out[1].join("") === "noitcnuf") {
                a.type = "anfunction"
                out[0].reverse();
                a.name = "function " + out[0].join("");
                a.names = [];

                for (var i = 2; i < out.length - 1; i += 2) {
                    if (out[i] != "=") break;
                    out[i + 1].reverse();
                    a.names.push(out[i + 1].join(""))
                    a.name = out[i + 1].join("") + " = " + a.name;
                }
                if (out[i] && out[i].join("") === "rav") {
                    i++;
                    a.name = "var " + a.name
                    a.var = true;
                }
                p.data[p.data.length - 1] = rejoin(out, i);
            } else if (out[2] && out[2].join("") === "noitcnuf") {
                a.type = "function";
                out[1].reverse();
                out[0].reverse();
                a.name = "function " + out[1].join("") + out[0].join("");
                a.names = [out[1].join("")]
                p.data[p.data.length - 1] = rejoin(out, 3);
            } else if (out[1] && out[1].join("") === "ssalc") {
                a.type = "class";
                out[0].reverse();


                a.name = "class " + out[0].join("")
                a.names = [out[0].join("")];
                for (var i = 2; i < out.length - 1; i += 2) {
                    if (out[i] != "=") break;

                    out[i + 1].reverse();
                    a.name = out[i + 1].join("") + " = " + a.name;
                    a.names.push(out[i + 1].join(""))
                }
                if (out[i] && out[i].join("") === "rav") {
                    i++;
                    a.name = "var " + a.name
                    a.var = true;
                }

                p.data[p.data.length - 1] = rejoin(out, i);

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
                add();
                scope++;
                var n = {
                    type: "",
                    data: [],
                    parent: insertTo,
                    scope: scope
                }
                format(insertTo, n)
                insertTo.data.push(n)
                insertTo = n;
                break;
            case "}":
                scope--;
                add();

                insertTo = insertTo.parent;
                break;
            default:
                current.push(char)

                break;
        }

    }
    add();
    return out;
}
