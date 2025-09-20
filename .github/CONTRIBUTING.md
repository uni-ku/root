# 贡献指南

Hey There 💜, 感谢参与贡献！在提交您的贡献之前，请务必花点时间阅读以下指南：

- [行为准则](https://github.com/uni-ku/root/blob/main/.github/CODE_OF_CONDUCT.md)

## 参与开发

### 克隆

```
git clone https://github.com/uni-ku/root
```

### 起手

- 我们需要使用 `pnpm` 作为包管理器
- 安装依赖 `pnpm install`
- 打包项目 `pnpm build`

### 代码

- 我们使用 `ESLint` 来检查和格式化代码
- 请确保代码可以通过仓库 `ESLINT` 验证

### 测试

- 如果是新增新功能，我们希望有测试代码
- 运行测试 `pnpm test`

### Commit

我们使用 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 规范，若不满足将会被拦截

> `git add` 后可通过 `git cz` 提交Commit，对不熟悉的朋友会更加便利且友好

### Pull Request

#### 参考

如果你的第一次参与贡献，可以先通过以下文章快速入门：

- [第一次参与开源](https://github.com/firstcontributions/first-contributions/blob/main/translations/README.zh-cn.md)

#### 规范

尽量避免多个不同功能的 `Commit` 放置在一个 `PR` 中，若出现这种情况，那么我们将会让其压缩成一个 `Commit` 合并
