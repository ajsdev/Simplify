"use strict";
/*
Copyright 2017 Andrew S

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
module.exports = {
    getConfig: function (file, def) {

        if (file.data.indexOf('"/* CCONFIG"') !== -1) return;

        var a = file.data.split("/* CCONFIG")[1];

        if (!a) return false;



        var b = a.split("*/")[0];

        if (!b) return false;

        b = b.split(";")

        var config = {};
        for (var i in def) {
            config[i] = def[i];
        }

        b.forEach((item, i) => {
            var l = item.trim().split("=");

            if (!l[1]) return;

            var name = l[0].trim();

            if (config[name] === undefined) return console.log(`WARN: ${name} is not a valid configuration`);

            var value = l.slice(1).join("=").trim();

            if (value == "true" || value == "false") {
                console.log("WARN: Please use 1 or 0 for true or false.")

                value = (value == "true") ? "1" : "0"

            }
            var isString = (value.charAt(0) == '"' || value.charAt(0) == "'")
            var isStringDef = (typeof def[name] == "string");

            if (isString !== isStringDef) {
                var type = isStringDef ? "STRING" : "INTEGER"
                console.log(`ERR: Invalid Type. Cannot set ${value} to ${name} as value is supposed to be a ${type}`)
                console.log(`At ${file.dir}:${i+1}`)
                process.exit()
            }

            if (isStringDef) {
                value = value.substring(1, value.length - 1);
            } else value = parseInt(value)

            config[name] = value;
        })
        return [config, a.split("*/").slice(1).join("*/")];
    },
    getCmd: function (b) {

        var config = {
            as: b[1],
            scope: 0
        }

        for (var i = 2; i < b.length - 1; i += 2) {

            switch (b[i]) {
                case "as":
                    config.as = b[i + 1];
                    break;
                case "scope":
                    config.scope = b[i + 1]
                    break;

            }
        }

        return config;
    },
    getInfo: function (file) {
        var a = file.data.split("\n");
        var d = 0;

        var info = [];
        var imports = [];
        var exports = [];

        a = a.filter((b) => {
            b = b.trim();
            if (d !== 2 && b.charAt(0) == "/" && b.charAt(1) == "/") {
                b = b.substr(2).trim();

                b = b.split(" ");

                var key = b[0];

                switch (key) {
                    case "import":

                        var dt = b[1];
                        if (dt.substr(0, 8) == "load(") {

                            imports.push({
                                file: dt.substring(8, dt.length - 1),
                                data: b.slice(1)
                            })
                        } else {
                            imports.push({
                                name: dt,
                                data: b.slice(1)
                            })
                        }

                        break;
                    case "export":

                        var d = this.getCmd(b);

                        exports.push({
                            name: b[1],
                            as: d.as,
                            scope: d.scope,
                            data: b.slice(1)
                        })
                        break;
                    case "set":
                        info.push({
                            type: "set",
                            data: b.slice(1)
                        })
                        break;
                }

                d = 1;
                return false;
            } else if (d) { // stop
                d = 2;
            }
            return true;
        })


        file.info = info;
        file.data = a.join("\n");
        file.exports = exports;
        file.imports = imports

    }
}
