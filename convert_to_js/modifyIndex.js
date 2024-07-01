#!/usr/bin/env node
import { readFile, writeFile } from "fs";

readFile('index.html', 'utf8', function (err, data) {
    const content = data.replace(/main\.tsx/g, "main.jsx")
    writeFile('index.html', content, err => {
        if (err) {
          console.error(err);
        }
      });
});
