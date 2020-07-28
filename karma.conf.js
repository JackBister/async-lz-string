module.exports = function (config) {
    config.set({
        autoWatch: true,
        browserNoActivityTimeout: 60000,
        frameworks: ["jasmine", "karma-typescript"],
        files: [
            { pattern: "src/**/*.ts" },
            { pattern: "test/**/*.ts" },
        ],
        karmaTypescriptConfig: {
            bundlerOptions: {
                transforms: [require("karma-typescript-es6-transform")()]
            },
            tsconfig: "./tsconfig.json"
        },
        preprocessors: {
            "**/*.ts": ["karma-typescript"],
        },
        reporters: ["progress", "karma-typescript"],
        browsers: ["ChromeHeadless"]
    });
};
