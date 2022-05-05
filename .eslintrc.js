module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "standard",
        "prettier", // 追加。他の設定の上書きを行うために、必ず最後に配置する。
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
    }
}
