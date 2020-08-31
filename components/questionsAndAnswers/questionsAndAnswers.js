import {
  login,
  getAllQaCategories,
  listQaItems,
  addUserLogs,
  getRandomQaItem
} from '../../utils/pmed'
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
      module: '问答',
      name: 'WX问答首页'
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
      categoryId: null,
      tagEq: null,
      keywordType: 1,
      minKeywordPercent: '2<75%'
    },
    categories: [],
    selectedCategory: null,
    tags: [],
    selectedTag: null,
    showFilters: false,
    filters: {
      selectedCategory: null,
      selectedTag: null,
    },
    loadingTips: null,
    randomItem: null,
    searched: false
  },
  computed: {
    sortFields(data) {
      if (data.searchParams.keyword) {
        return [{
          name: 'creationTime',
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
          name: 'creationTime',
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
      await this.fetchRandomItem()
      await this.fetchCategories()
    },

    onCategoryInput(e) {
      this.setData({
        'filters.selectedCategory': e.detail,
        'filters.selectedTag': null,
        tags: e.detail ? this.data.categories.find(item => item.value === e.detail).tags : []
      })
    },

    onTagInput(e) {
      this.setData({
        'filters.selectedTag': e.detail,
      })
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
    async searchKeyword() {
      if(!this.data.keyword||!this.data.keyword.trim()){
        wx.showToast({
          title: '请输入您的问题',
          icon: 'none',
          duration: 2000
        })
        return
      }
      this.data.selectedCategory = null
      this.data.selectedTag = null
      this.data.searched = true
      this.setData(this.data)
      await this.search()
    },
    async search() {
      this.data.searchParams.categoryId = this.data.selectedCategory
      this.data.searchParams.keyword = this.data.keyword
      this.data.searchParams.tagEq = this.data.selectedTag
      this.data.searchParams.keywordType = 1
      if (this.data.searchParams.keyword) {
        this.data.sort = {
          field: 'relevance',
          direction: 'DESC'
        }
        this.data.items = []
        this.data.hasMore = true
        this.data.nextPage = 0
        this.setData(this.data)
        await this.loadItems()
        if (this.data.items.length === 0) {
          this.data.searchParams.keywordType = 0
          this.data.items = []
          this.data.hasMore = true
          this.data.nextPage = 0
          this.setData(this.data)
          await this.loadItems()
        }
      } else {
        this.data.sort = {
          field: 'creationTime',
          direction: 'DESC'
        }
        this.data.items = []
        this.data.hasMore = true
        this.data.nextPage = 0
        this.setData(this.data)
        await this.loadItems()
      }
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
          actionTags: ['微信小程序', '检索问答', this.data.items.length === 0 ? '无结果' : '有结果']
        })
      }
      if (this.data.searchParams.categoryId) {
        userLogs.push({
          actionTime: new Date().toISOString(),
          actionName: '分类检索',
          actionInfo: {
            entity: {
              type: '问答分类',
              id: this.data.searchParams.categoryId + ''
            }
          },
          source: this.data.logPageView.name,
          actionTags: ['微信小程序', '检索问答']
        })
      }
      if (this.data.searchParams.tagEq) {
        userLogs.push({
          actionTime: new Date().toISOString(),
          actionName: '标签检索',
          actionInfo: {
            entity: {
              type: '标签',
              id: this.data.searchParams.tagEq
            }
          },
          source: this.data.logPageView.name,
          actionTags: ['微信小程序', '检索问答']
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
      const response = await listQaItems(params)
      const totalPages = Math.floor((response.data.totalElements + size - 1 )/ size)
      response.data.content.forEach(item => {
        if (item.highlightedDesc) {
          item.highlightedDesc = item.highlightedDesc.replace(/<em>/g, '<em class="red">')
        }
      })
      this.data.items.push(...response.data.content)
      this.setData({
        items: this.data.items,
        nextPage: response.data.number + 1,
        hasMore: response.data.number < totalPages - 1,
        loadingTips: response.data.number < totalPages - 1 ? null : response.data.totalElements === 0 ? '暂无数据' : '没有更多了'
      })
      if (response.data.content.length > 0) {
        const actionTime = new Date().toISOString()
        await addUserLogs(response.data.content.map(item => {
          return {
            actionTime,
            actionName: '查看问答',
            actionInfo: {
              entity: {
                type: '问答',
                id: item.id + ''
              }
            },
            source: this.data.logPageView.name,
            actionTags: ['微信小程序']
          }
        }))
      }
    },

    openFilters() {
      this.setData({
        showFilters: true,
        filters: {
          selectedCategory: this.data.selectedCategory,
          selectedTag: this.data.selectedTag
        },
        tags: this.data.selectedCategory ? this.data.categories.find(item => item.value === this.data.selectedCategory).tags : []
      })
    },

    cancelFilters() {
      this.setData({
        showFilters: false
      })
    },

    confirmFilters() {
      this.setData({
        showFilters: false,
        selectedCategory: this.data.filters.selectedCategory,
        selectedTag: this.data.filters.selectedTag
      })
      this.search()
    },

    async fetchCategories() {
      const response = await getAllQaCategories()
      const rootNodes = []
      for (const item of response.data) {
        if (!item.parentId) {
          item.children = []
          item.showChildren = false
          item.tags = JSON.parse(item.tags)
          for (const line of item.tags) {
            line.values = line.values.map(tag => {
              return {
                label: tag,
                value: tag
              }
            })
          }
          rootNodes.push(item)
        }
      }
      for (const item of response.data) {
        if (item.parentId) {
          const parent = rootNodes.find(parent => parent.id === item.parentId)
          parent.children.push(item)
        }
      }
      const comparator = (a, b) => a.sortNo - b.sortNo
      rootNodes.sort(comparator)
      rootNodes.forEach(item => item.children.sort(comparator))
      this.setData({
        categories: rootNodes.map(item => {
          return {
            label: item.name,
            value: item.id,
            tags: item.tags
          }
        })
      })
    },
    showBook(e) {
      const epubName = e.currentTarget.dataset.name + "_" + e.currentTarget.dataset.id + ".epub";
      wx.navigateTo({
        url: "/pages/booksReader/booksReader?epubName=" + epubName
      })
    },
    async fetchRandomItem () {
      const response = await getRandomQaItem()
      this.setData({
        randomItem: response.data
      })
    },
  }

})