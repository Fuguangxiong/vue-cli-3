/*
    references:
    https://github.com/conventional-changelog/commitlint
    https://github.com/commitizen/cz-conventional-changelog

    config.commitizen:
    "path": "cz-conventional-changelog"
    or
    "path": "@commitlint/prompt"
 */

// $ <commit-type>[(commit-scope)]: <commit-message>
// $ <commit-icon>: <commit-message>

// feat：新功能（feature）
// fix：修补bug
// docs：文档（documentation）
// style： 格式（不影响代码运行的变动）
// refactor：重构（即不是新增功能，也不是修改bug的代码变动）
// test：增加测试
// chore：构建过程或辅助工具的变动
// revert：分支回溯
// pref：性能相关

module.exports = {
    extends: ["@commitlint/config-conventional"]
};
