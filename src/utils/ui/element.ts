export function getPopupParentEl() {
  // 获取当前组件的dom，并向父级寻找到class 为 box的元素
  const currentEl = getCurrentInstance()?.proxy?.$el
  let parent = currentEl?.parentElement
  while (parent) {
    if (parent.classList.contains('z-popup')) {
      return parent
    }
    parent = parent.parentElement
  }
}
