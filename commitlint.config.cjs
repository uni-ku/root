/** @type {import('cz-git').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'perf', 'fix', 'refactor', 'docs', 'build', 'types', 'chore', 'examples', 'test', 'style', 'ci']],
  },
  prompt: {
    messages: {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围 (可选) :',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述 (可选) 。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更 (可选) 。使用 "|" 换行 :\n',
      footerPrefixesSelect: '设置关联issue前缀 (可选) :',
      customFooterPrefix: '输入自定义issue前缀 :',
      footer: '列举关联issue (可选) 例如: #1 :\n',
      confirmCommit: '是否提交或修改commit ?',
    },
    types: [
      { value: 'feat', name: '🚀 Features: 新功能', emoji: '🚀' },
      { value: 'perf', name: '🔥 Performance: 性能优化', emoji: '🔥' },
      { value: 'fix', name: '🩹 Fixes: 缺陷修复', emoji: '🩹' },
      { value: 'refactor', name: '💅 Refactors: 代码重构', emoji: '💅' },
      { value: 'docs', name: '📖 Documentation: 文档', emoji: '📖' },
      { value: 'build', name: '📦 Build: 构建工具', emoji: '📦' },
      { value: 'types', name: '🌊 Types: 类型定义', emoji: '🌊' },
      { value: 'chore', name: '🏡 Chore: 简修处理', emoji: '🏡' },
      { value: 'examples', name: '🏀 Examples: 例子展示', emoji: '🏀' },
      { value: 'test', name: '✅ Tests: 测试用例', emoji: '✅' },
      { value: 'style', name: '🎨 Styles: 代码风格', emoji: '🎨' },
      { value: 'ci', name: '🤖 CI: 持续集成', emoji: '🤖' },
    ],
    useEmoji: true,
    scopes: [],
    maxHeaderLength: 72,
  },
}