/**
 * Scroll to top of the element.
 * @param element a target dom element
 * @param point scroll target point of the element
 **/
export default function scrollTop(element: HTMLElement, point: number = 0) {
  const start = element.scrollTop
  const range = start - point
  // Progress of scroll: 0 ~ 100
  let progress = 0
  const boost = range > 200 ? range / 200 : 2.0
  /**
   * Scroll calling recursion.
   **/
  const move = function () {
    progress++
    const nextPos = start - range * boost * easeOut(progress / 100)

    // Stop the recursion
    if (nextPos <= 0) {
      element.scrollTop = 0
      return
    }

    element.scrollTop = nextPos
    requestAnimationFrame(move)
  }

  requestAnimationFrame(move)
}

/**
 * easeOut
 **/
const easeOut = function (p: number) {
  return p * (2 - p)
}

export class ScrollPosition {
  private node: HTMLElement | null = null
  private previousScrollHeightMinusTop: number = 0

  constructor(node: HTMLElement) {
    this.node = node
    this.previousScrollHeightMinusTop = 0
  }

  prepare() {
    if (this.node) {
      this.previousScrollHeightMinusTop = this.node.scrollHeight - this.node.scrollTop
    }
  }

  restore() {
    if (this.node) {
      this.node.scrollTop = this.node.scrollHeight - this.previousScrollHeightMinusTop
    }
  }
}
