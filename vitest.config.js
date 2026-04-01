import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // 仅运行 unit 测试目录，避免仓库内旧的自定义测试脚本被 vitest 收录
    include: ['tests/unit/**/*.test.*', 'tests/unit/**/*.spec.*'],
    exclude: ['tests/gameLogic.test.js', 'tests/**/*.html']
    ,
    passWithNoTests: true
  }
})
