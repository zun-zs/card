// 自定义Vite插件，用于移除HTML中的type="module"属性
export function removeModulePlugin() {
  return {
    name: 'remove-module',
    transformIndexHtml(html) {
      // 移除type="module"属性
      return html.replace(/type="module"\s+/g, '');
    }
  };
}