import {
  addUserLogs,
  getOwnerPage,
  afterMethodDecorator,
  removeAfterMethodDecorator
} from '../utils/pmed'
const enterTime = Symbol()
const onShow = Symbol()
const onHide=Symbol()
export default Behavior({
  attached: function () {
    if (this.data.logPageView) {
      this.startPageView()
      const page = getOwnerPage(this)
      this[onShow] = this.startPageView.bind(this)
      this[onHide] = this.finishPageView.bind(this)
      afterMethodDecorator(page, 'onShow', this[onShow])
      afterMethodDecorator(page, 'onHide', this[onHide])
    }
  },
  detached: function () {
    if (this.data.logPageView) {
      this.finishPageView()
      const page = getOwnerPage(this)
      removeAfterMethodDecorator(page, 'onShow', this[onShow])
      removeAfterMethodDecorator(page, 'onHide', this[onHide])
    }
  },
  methods: {
    startPageView(){
      this[enterTime]=new Date()
    },
    finishPageView(){
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const url = `/${currentPage.route}`;
      addUserLogs([{
        actionTime: this[enterTime].toISOString(),
        actionName: '浏览页面',
        actionInfo: {
          pageView: {
            name: this.data.logPageView.name,
            path: url,
            leave: new Date().toISOString(),
            duration: new Date().getTime() - this[enterTime].getTime(),
            module: this.data.logPageView.module
          }
        },
        source: pages.length > 1 ? `/${pages[pages.length - 2].route}` : null,
        actionTags: ['微信小程序']
      }])
    }
  }
})