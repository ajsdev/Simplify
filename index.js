"use strict";
/*
Copyright 2017 Andrew S

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const CommentReader = require("./source/commentReader.js");
const FileReader = require("./source/fileReader.js");
//const FunctionOrderer = require("./source/functionOrderer.js");
const JSDeconstructor = require("./source/jsDeconstructor.js")

var DEFAULT_CONFIG = {
    useStrict: 0,
    useRestrict: 0,
    license: "",
    fileNames: 1
}

FileReader(function (files) {

    var entry = false;
    var config = false;

    if (files.every((file) => {
            var c = CommentReader.getConfig(file, DEFAULT_CONFIG)
            if (c) {
                entry = file;
                config = c;
                return false;
            }
            return true;
        })) {

        throw "Entry file not found!"
    }

    console.log("Entry found: " + entry.dir);
    var num = 0;
    var ln = entry.parentDir.length;
    files = files.filter((file) => {

        if (file.dir.slice(0, ln) !== entry.parentDir) {
            num++;
            return false;
        }

        return true;
    })

    console.log("Filtered out " + num + " files");
    files.forEach((file) => {

        file.layered = JSDeconstructor(file)
    })

    var out = [];

    if (config.useStrict) out.push("\"use strict\";");
    if (config.useRestrict) out.push("\"use restrict\";");

    out.push("\n");

    out.push(config.license);




    var build = function (dt) {
        switch (dt.type) {
            case "global":

                dt.data.forEach((d) => {
                    build(d);
                })
                break;
            case "class":

                out.push(dt.name, " {\n");

                dt.data.forEach((d) => {
                    build(d);
                })

                out.push("}\n");

                break;
            case "method":
                out.push(dt.name, " {\n");

                dt.data.forEach((d) => {
                    build(d);
                })

                out.push("}\n")

                break;
            default:
                if (typeof dt == "object") {

                } else {
                    out.push(dt);
                }
                break;
        }
    }
    build(entry.layered);
    console.log(out.join(""))
})
