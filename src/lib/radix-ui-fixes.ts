/** Fixes Radix dropdown/dialog leaving body unclickable after close */
export function releaseBodyInteractionLock() {
  if (typeof document === 'undefined') return

  document.body.style.pointerEvents = ''
  document.body.style.overflow = ''
  document.body.removeAttribute('data-scroll-locked')
  document.documentElement.style.pointerEvents = ''
  document.documentElement.removeAttribute('data-scroll-locked')
}

/** Run an action after dropdown menu fully closes (e.g. before opening a dialog) */
export function runAfterDropdownClose(action: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      action()
    })
  })
}

/** Close dropdown then open dialog / run action without blocking the page */
export function openFromDropdown(
  closeMenu: () => void,
  action: () => void
) {
  closeMenu()
  runAfterDropdownClose(action)
}
