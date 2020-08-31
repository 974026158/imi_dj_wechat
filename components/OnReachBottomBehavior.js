import {
  getOwnerPage,
  afterMethodDecorator,
  removeAfterMethodDecorator
} from '../utils/pmed'
const onReachBottom = Symbol()
export default Behavior({
  attached: function () {
    if (this.onReachBottom) {
      const page = getOwnerPage(this)
      this[onReachBottom] = this.onReachBottom.bind(this)
      afterMethodDecorator(page, 'onReachBottom', this[onReachBottom])
    }
  },
  detached: function () {
    if (this[onReachBottom]) {
      const page = getOwnerPage(this)
      removeAfterMethodDecorator(page, 'onReachBottom', this[onReachBottom])
    }
  },
})