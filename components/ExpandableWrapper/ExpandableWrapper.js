// components/ExpandableWrapper/ExpandableWrapper.js
const computedBehavior = require('miniprogram-computed')
Component({
  behaviors: [computedBehavior],
  /**
   * 组件的属性列表
   */
  properties: {
    maxHeight: {
      type: Number,
      value: 50
    },
    authorized: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    expandable: false,
    expanded: false
  },

  computed: {
    outerStyle (data) {
      let style = ''
      if (data.expandable) {
        if (!data.expanded) {
          style = 'max-height:' + data.maxHeight + 'px;overflow:hidden;'
        }
      }
      return style
    }
  },

  lifetimes: {
    attached: function () {
      this.updateExpandable()
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateExpandable () {
      wx.nextTick(() => {
        const query = this.createSelectorQuery()
        query.select('#inner').boundingClientRect(res=>{
          this.setData({
            expandable: res.height > this.data.maxHeight
          })
        })
        query.exec()
      })
    },
    expand () {
      if (this.data.authorized) {
        this.setData({
          expanded: true
        })
      } else {
        wx.showToast({
          title: '未登录或权限不足',
          icon: 'none',
          duration: 2000
        })
      }
    },
    collapse () {
      if (this.data.authorized) {
        this.setData({
          expanded: false
        })
      } else {
        wx.showToast({
          title: '未登录或权限不足',
          icon: 'none',
          duration: 2000
        })
      }
    }
  }
})