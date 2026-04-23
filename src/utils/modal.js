export function cleanupModalBackdrop() {
  // 移除 modal-open
  document.body.classList.remove('modal-open')

  // 移除 bootstrap 可能加的 padding 以及 overflow 鎖捲動
  document.body.style.removeProperty('padding-right')
  document.body.style.removeProperty('overflow')

  //刪掉所有遮罩
  document.querySelectorAll('.modal-backdrop').forEach(b => b.remove())
}

export function hideModalById(id) {
  const el = document.getElementById(id)
  if (!el) return

  const bs = window.bootstrap
  if (bs?.Modal) {
    const instance = bs.Modal.getInstance(el) || new bs.Modal(el)
    instance.hide()
  }

  // 關完一定清一次
  cleanupModalBackdrop()
}

