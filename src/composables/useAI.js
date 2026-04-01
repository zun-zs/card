// 轻量 composable：封装并重导出 AI 引擎相关的构造与实例
export { AdvancedAIEngine, aiEngine, DIFFICULTY_CONFIGS } from '../utils/aiEngine.js'

// 未来可以在此添加 AI 状态或工厂函数

// 安全的决策调用封装，统一错误处理与默认返回
export function makeDecisionSafe(aiEngineInstance, gameStateForAI) {
	try {
		if (!aiEngineInstance || typeof aiEngineInstance.makeDecision !== 'function') {
			console.error('AI 引擎不可用，返回保守决策')
			return { action: 'check', reasoning: 'AI 引擎不可用', confidence: 0.3, debugInfo: {} }
		}

		return aiEngineInstance.makeDecision(gameStateForAI)
	} catch (err) {
		console.error('AI 决策过程出错:', err)
		return { action: 'check', reasoning: '决策失败，使用保守策略', confidence: 0.3, debugInfo: {} }
	}
}
