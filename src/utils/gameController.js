// 简单的全局控制器替代 window.gameLogic / window.gameTimeouts
// 在 utils 之间共享：设置 opponentAction、管理 timeouts
let _opponentAction = null
const _gameTimeouts = []

export function setOpponentAction(fn) {
  _opponentAction = fn
}

export function getOpponentAction() {
  return _opponentAction
}

export function addTimeout(id) {
  _gameTimeouts.push(id)
}

export function clearTimeouts() {
  _gameTimeouts.forEach(tid => clearTimeout(tid))
  _gameTimeouts.length = 0
}

export function removeTimeout(id) {
  const i = _gameTimeouts.indexOf(id)
  if (i !== -1) _gameTimeouts.splice(i, 1)
  clearTimeout(id)
}

export default {
  setOpponentAction,
  getOpponentAction,
  addTimeout,
  clearTimeouts,
  removeTimeout
}
