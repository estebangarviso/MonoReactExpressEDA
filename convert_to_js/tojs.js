#!/usr/bin/env node
import { parse, print } from "recast";
import { transformFromAstSync } from "@babel/core";
import transformTypescript from "@babel/plugin-transform-typescript";
import getBabelOptions from "recast/parsers/_babel_options.js";
import { parser } from "recast/parsers/babel.js";

export default function to_js(content) {
    console.log("Transforming file...", content);
    try {
        const ast = parse(content, {
            parser: {
                parse: (source, options) => {
                    const babelOptions = getBabelOptions.default(options);
                    babelOptions.plugins.push("typescript", "jsx");
                    return parser.parse(source, babelOptions);
                },
            },
        });

        const options = {
            cloneInputAst: false,
            code: false,
            ast: true,
            plugins: [transformTypescript],
            configFile: false,
        };
        const { ast: transformedAST } = transformFromAstSync(
            ast,
            content,
            options
        );
        const result = print(transformedAST).code;

        return result;
    } catch (e) {
        console.log(e);
        throw new Error(e.message);
    }
}