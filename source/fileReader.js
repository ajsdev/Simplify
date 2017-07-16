"use strict"
/*
Copyright 2017 Andrew S

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var fs = require('fs');
var path = require('path');

module.exports = function (call) {


    var results = [];


    var walk = function (dir, done) {

        fs.readdir(dir, function (err, list) {
            if (err) return done(err);

            var pending = list.length;

            if (!pending) return done(null, results);

            list.forEach(function (file) {
                file = path.resolve(dir, file);

                fs.stat(file, function (err, stat) {
                    if (stat && stat.isDirectory()) {

                        walk(file, function (err) {
                            if (!--pending) done(null, results);
                        });

                    } else {
                        if (isJS(file)) results.push({
                            dir: file,
                            parentDir: dir
                        });
                        if (!--pending) done(null, results);
                    }
                });
            });
        });
    };

    function isJS(file) {
        return (file.indexOf(".js") !== -1)
    }


    console.log("Getting filelist...");

    walk(__dirname + "/../", (err, results) => {
        if (err) {
            console.log("Couldnt fetch files:")
            throw err;
        }
        // console.log(results)
        console.log(`Found ${results.length} files. Reading files...`);
        var done = 0;

        results.forEach((file) => {

            fs.readFile(file.dir, "utf8", (err, data) => {
                if (err) console.log("Couldnt read " + file.dir + " reason: " + err);
                else file.data = data;

                done++;
                if (done === results.length) {
                    console.log("Done!");
                    call(results);
                }
            })

        })

    })

}
