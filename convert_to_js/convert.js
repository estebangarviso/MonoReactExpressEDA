#!/usr/bin/env node
import { readFiles } from "node-dir";
import { writeFile, rename } from "fs";

// ---- import to_js function ---
import to_js from "./tojs.js"; // change file name to the file name you chose

function convert() {
    const __dirname = ".";
    console.log("Transforming files...");
    readFiles(
        __dirname,
        {
            excludeDir: ["node_modules"],
            match: /\.tsx?$/,
            exclude: /\.d\.ts$/,
        },
        function (err, content, filename, next) {
            if (err) throw err;
            const new_content = to_js(content);

            writeFile(filename, new_content, (err) => {
                if (err) {
                    console.error(err);
                }
            });

            next();
        },
        function (err, files) {
            if (err) throw err;
            console.log("Finished transforming files:", files);
            console.log("Changing Extensions...");
            for(const file of files) {
                rename(file, file.replace(/(\.ts)$/i, ".js").replace(/(\.tsx)$/i, ".jsx"), function(err) {
                    if ( err ) console.log('ERROR Renaming: ' + err);
                });
            }
            console.log("Finished changing Extensions...");
        }
    );
}

convert();