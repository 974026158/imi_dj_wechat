import {
  login,
  getAllExamQuestionCategories,
  listExamQuestions,
  addUserLogs,
} from '../../utils/pmed'
const computedBehavior = require('miniprogram-computed')
import PageViewBehavior from '../PageViewBehavior'
import OnReachBottomBehavior from '../OnReachBottomBehavior'
Component({
  behaviors: [computedBehavior, PageViewBehavior, OnReachBottomBehavior],
  /**
   * 组件的属性列表
   */
  properties: {
    keyword: {
      type: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    logPageView: {
      module: '试题',
      name: 'WX试题首页'
    },
    sort: null,
    showFilters: false,
    selectedCategories: null,
    filters: {
      selectedCategories: null,
    },
    categories: [],
    searchParams: {
      keyword: null,
      categoryIds: null,
    },
    items: [],
    hasMore: true,
    nextPage: 0,
    loadingTips: null
  },

  observers: {
    keyword(v) {
      this.search()
    }
  },

  computed: {
    sortFields(data) {
      if (data.keyword) {
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

  /**
   * 组件的方法列表
   */
  methods: {
    init: async function () {
      await login()
      await this.fetchCategories()
      // await this.search()
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
    openFilters() {
      this.setData({
        showFilters: true,
        filters: {
          selectedCategories: this.data.selectedCategories,
        }
      })
    },
    async fetchCategories() {
      const response = await getAllExamQuestionCategories()
      const rootNodes = []
      for (const item of response.data) {
        if (!item.parentId) {
          item.children = []
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
            value: item.id
          }
        })
      })
    },
    onCategoryInput(e) {
      this.setData({
        'filters.selectedCategories': e.detail
      })
    },
    onReachBottom() {
      this.loadItems()
    },
    cancelFilters() {
      this.setData({
        showFilters: false
      })
    },

    confirmFilters() {
      this.setData({
        showFilters: false,
        selectedCategories: this.data.filters.selectedCategories,
      })
      this.search()
    },

    async search() {
      this.setData({
        searchParams: {
          categoryIds: this.data.selectedCategories,
          keyword: this.data.keyword
        },
        sort: this.data.keyword ? {
          field: 'relevance',
          direction: 'DESC'
        } : {
          field: 'creationTime',
          direction: 'DESC'
        },
        items: [],
        hasMore: true,
        nextPage: 0
      })
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
          actionTags: ['微信小程序', '检索试题', this.data.items.length === 0 ? '无结果' : '有结果']
        })
      }
      if (this.data.searchParams.categoryIds && this.data.searchParams.categoryIds.length > 0) {
        userLogs.push(...this.data.searchParams.categoryIds.map(item => {
          return {
            actionTime: new Date().toISOString(),
            actionName: '分类检索',
            actionInfo: {
              entity: {
                type: '试题分类',
                id: item + ''
              }
            },
            source: this.data.logPageView.name,
            actionTags: ['微信小程序', '检索试题']
          }
        }))
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
      const response = await listExamQuestions(params)
      const totalPages = Math.floor((response.data.totalElements + size - 1) / size)
      response.data.content.forEach(item => {
        if (item.answers) {
          item.answers.forEach((answer,index)=>{
            answer.label = this.getAnswerLabel(index)
          })
          item.rightAnswers = this.getRightAnswers(item)
        }
        item.showAnalysis=false
        
        // item.highlightedBookName='<em>习近平</em>论XX'
        // item.rightAnswers='A、C'
        // item.originalText='乡镇应当设立党建工作办公室或者党建工作站，配备专职组织员，配强党务力量。'
        // item.collection.via='引自'
        // item.collection.code='B_01020350_001'
        // item.collection.bookName='中国共产党农村基层组织工作条例'
        // item.collection.bookVersion='2019年1月'
        // item.collection.bookPublisher='人民出版社'
        // item.paperPageNo=12

        if(item.highlightedDesc){
          item.highlightedDesc=item.highlightedDesc.replace(/<em>/g, '<em class="red">')
        }
        if(item.highlightedBookName){
          item.highlightedBookName=item.highlightedBookName.replace(/<em>/g, '<em class="red">')
        }
        if (item.collection.code){
          if (item.highlightedBookName){
            item.viaInfo = item.collection.via+'：<span class="link">《'+item.highlightedBookName+'》第'+item.paperPageNo+'页</span>，'+item.collection.bookVersion+'，'+item.collection.bookPublisher
          }else{
            item.viaInfo = item.collection.via+'：<span class="link">《'+item.collection.bookName+'》第'+item.paperPageNo+'页</span>，'+item.collection.bookVersion+'，'+item.collection.bookPublisher
          }
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
        await addUserLogs(response.data.content.map(question => {
          return {
            actionTime,
            actionName: '查看试题',
            actionInfo: {
              entity: {
                type: '试题',
                id: question.id + ''
              }
            },
            source: this.data.logPageView.name,
            actionTags: ['微信小程序']
          }
        }))
      }
    },
    getAnswerLabel (index) {
      return String.fromCharCode('A'.charCodeAt(0) + index)
    },
    getRightAnswers (question) {
      if (question.questionType === '填空题') {
        return question.answers.map((item, index) => (index + 1) + '、' + item.content).join('；')
      } else {
        return question.answers.map((item, index) => item.right ? this.getAnswerLabel(index) : null).filter(item => item !== null).join('、')
      }
    },
    showQuestionAnalysis (e) {
      const index = e.currentTarget.dataset.index
      const question = e.currentTarget.dataset.question
      if (!question.collection.code) {
        wx.showToast({
          title: '未登录或权限不足',
          icon: 'none',
          duration: 2000
        })
        return
      }
      this.setData({
        ['items['+index+'].showAnalysis']: true
      })
    },
    hideQuestionAnalysis (e) {
      const index = e.currentTarget.dataset.index
      this.setData({
        ['items['+index+'].showAnalysis']: false
      })
    },
    showBook(e){
      const epubName = e.currentTarget.dataset.name + "_" + e.currentTarget.dataset.id + ".epub";
      wx.navigateTo({
        url: "/pages/booksReader/booksReader?epubName=" + epubName
      })
    }
  }
})