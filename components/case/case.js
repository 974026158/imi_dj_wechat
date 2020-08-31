import {
  login,
  listCaseObjects,
  addUserLogs,
} from '../../utils/pmed'
import {
  pmedUrl
} from '../../utils/config'
const computedBehavior = require('miniprogram-computed')
import PageViewBehavior from '../PageViewBehavior'
import OnReachBottomBehavior from '../OnReachBottomBehavior'
Component({
  behaviors: [computedBehavior, PageViewBehavior, OnReachBottomBehavior],

  /**
   * 页面的初始数据
   */
  data: {
    logPageView: {
      module: '案例',
      name: 'WX案例首页'
    },
    indicatorDots: false, //是否显示指示点  this.setData({indicatorDots: !this.data.indicatorDots })
    autoplay: false, //是否自动轮播  this.setData({autoplay: !this.data.autoplay })
    interval: 5000, //自动切换时间间隔
    duration: 500, //滑动动画时长
    // 指示点
    pointList: [],
    activepoint: 0,
    items: [],
    hasMore: true,
    nextPage: 0,
    sort: null,
    keyword: null,
    searchParams: {
      keyword: null,
      random: true
    },
    loadingTips: null
  },
  computed: {
    sortFields(data) {
      if (data.searchParams.keyword) {
        return [{
          name: 'publishTime',
          label: '最新'
        }, {
          name: 'hotDegree',
          label: '最热'
        }, {
          name: 'relevance',
          label: '匹配度'
        }]
      } else {
        return [{
          name: 'publishTime',
          label: '最新'
        }, {
          name: 'hotDegree',
          label: '最热'
        }]
      }
    }
  },
  lifetimes: {
    attached: function () {
      this.init()
    },
  },

  methods: {
    init: async function () {
      await login()
      await this.search()
    },

    onReachBottom() {
      this.loadItems()
    },

    onKeywordInput(e) {
      this.setData({
        keyword: e.detail.value
      })
    },

    async onSortInput(e) {
      this.setData({
        sort: e.detail,
        items: [],
        nextPage: 0,
        hasMore: true
      })
      await this.loadItems()
    },

    async search() {
      this.data.searchParams.keyword = this.data.keyword
      if (this.data.searchParams.keyword) {
        this.data.sort = {
          field: 'relevance',
          direction: 'DESC'
        }
        this.data.searchParams.random = false
      } else {
        this.data.sort = {
          field: 'creationTime',
          direction: 'DESC'
        }
        this.data.searchParams.random = true
      }
      this.data.items = []
      this.data.hasMore = true
      this.data.nextPage = 0
      this.setData(this.data)
      await this.loadItems()
      const userLogs = []
      if (this.data.searchParams.keyword) {
        userLogs.push({
          actionTime: new Date().toISOString(),
          actionName: '关键词检索',
          actionInfo: {
            entity: {
              type: '关键词',
              id: this.data.searchParams.keyword
            }
          },
          source: this.data.logPageView.name,
          actionTags: ['微信小程序', '检索案例', this.data.items.length === 0 ? '无结果' : '有结果']
        })
      }
      if (userLogs.length > 0) {
        await addUserLogs(userLogs)
      }
    },

    async loadItems() {
      if (!this.data.hasMore) {
        return
      }
      this.setData({
        loadingTips: '正在加载数据...'
      })
      const size = 10
      const params = Object.assign({
        page: this.data.nextPage,
        size,
        sort: this.data.sort ? (this.data.sort.field + ',' + this.data.sort.direction) : null
      }, this.data.searchParams)
      const response = await listCaseObjects(params)
      const caseObjectSummary = response.data
      const totalPages = Math.floor((caseObjectSummary.totalElements + size - 1) / size)
      caseObjectSummary.content.forEach(item => {
        if (item.title) {
          item.title = item.title.replace(/<em>/g, '<em class="red">')
        }
        if (item.content) {
          if (this.data.searchParams.keyword) {
            item.content = item.content.replace(/<em>/g, '<em class="red">')
          } else {
            item.content = item.content.substring(0, 50) + '...'
          }
        }
        if (item.publishTime) {
          item.publishTime = item.publishTime.substring(0, 10)
        }
        if (item.containImgs) {
          item.containImgs = item.containImgs.map(img => {
            return pmedUrl + '/image?url=' + encodeURIComponent(img.replace(/^<IMAGE\s+SRC="([^"]+)">$/, '$1'))
          })
        }
      })
      this.data.items.push(...caseObjectSummary.content)
      this.setData({
        items: this.data.items,
        nextPage: caseObjectSummary.number + 1,
        hasMore: caseObjectSummary.number < totalPages - 1,
        loadingTips: caseObjectSummary.number < totalPages - 1 ? null : caseObjectSummary.totalElements === 0 ? '暂无数据' : '没有更多了'
      })
    },

    async showDetails(e) {
      const id = e.currentTarget.dataset.id
      await addUserLogs([{
        actionTime: new Date().toISOString(),
        actionName: '查看案例',
        actionInfo: {
          entity: {
            type: '案例',
            id: id + ''
          }
        },
        source: this.data.logPageView.name,
        actionTags: ['微信小程序']
      }])
      wx.navigateTo({
        url: "/pages/CaseDetails/CaseDetails?id=" + id + '&keywords=' + (this.data.searchParams.keyword || '')
      })
    },

  }

})