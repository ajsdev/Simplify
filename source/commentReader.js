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

        file.data = a.split("*/").slice(1).join("*/")

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
        return config;
    }
}
