import {
  login,
  getExamQuestionCollection,
  listExamQuestions,
  formatDate,
  addUserLogs
} from '../../utils/pmed'
import {pmedUrl} from '../../utils/config'
const computedBehavior = require('miniprogram-computed')
import PageViewBehavior from '../../components/PageViewBehavior'
Component({
  behaviors: [computedBehavior, PageViewBehavior],
  /**
   * 组件的属性列表
   */
  properties: {
    id:{
      type:String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    logPageView: {
      module: '试题',
      name: 'WX试题集详情页'
    },
    collection: null,
    keyword: null,
    searchParams: {
      keyword: null,
    },
    items: [],
    hasMore: true,
    nextPage: 0,
    loadingTips: null
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
      const collection = (await getExamQuestionCollection(this.data.id)).data
      collection.preparationTime = formatDate(collection.preparationTime)
      collection.coverPictureUrl = pmedUrl + '/files?path=' + encodeURIComponent(collection.coverPictureName)
      this.setData({
        collection
      })
      await this.search()
    },

    onKeywordInput(e){
      this.setData({
        keyword: e.detail.value
      })
    },
    onReachBottom() {
      this.loadItems()
    },

    async search() {
      this.setData({
        searchParams: {
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
        collectionId: this.data.id,
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
    },
  }
})
