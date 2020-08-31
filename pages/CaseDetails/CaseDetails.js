import {
  login,
  searchById,
  escapeRegExp
} from '../../utils/pmed'
import {
  pmedUrl
} from '../../utils/config'
const computedBehavior = require('miniprogram-computed')
import PageViewBehavior from '../../components/PageViewBehavior'
Component({
  behaviors: [computedBehavior, PageViewBehavior],
  /**
   * 组件的属性列表
   */
  properties: {
    id: {
      type: String
    },
    keywords: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    logPageView: {
      module: '案例',
      name: 'WX案例详情页'
    },
    details: null,
    parsedParagraphs: []
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
      const details = (await searchById(this.data.id)).data
      let keywordsPattern = ''
      if (this.data.keywords) {
        const keywords = this.data.keywords.split(/\s+/)
        for (let keyword of keywords) {
          keyword = keyword.trim()
          if (!keyword) {
            continue
          }
          if (keywordsPattern) {
            keywordsPattern += '||'
          }
          keywordsPattern += escapeRegExp(keyword)
        }
      }
      let keywordsRegex = keywordsPattern ? new RegExp(keywordsPattern, 'g') : null
      if (keywordsRegex && details.title) {
        details.title = details.title.replace(keywordsRegex, '<em class="red">$&</em>')
      }
      const paragraphs = details.content.split(/\r?\n/)
      const parsedParagraphs = []
      for (const p of paragraphs) {
        const imgRegex = /<IMAGE\s+SRC="([^"]+)">/g
        let prev = 0
        let match
        while ((match = imgRegex.exec(p))) {
          const start = imgRegex.lastIndex - match[0].length
          if (start > prev) {
            parsedParagraphs.push({
              type: 'text',
              text: keywordsRegex ? p.substring(prev, start).replace(keywordsRegex, '<em class="red">$&</em>') : p.substring(prev, start)
            })
          }
          parsedParagraphs.push({
            type: 'image',
            src: pmedUrl + '/image?url=' + encodeURIComponent(match[1])
            // src: match[1]
          })
          prev = imgRegex.lastIndex
        }
        if (prev < p.length - 1) {
          parsedParagraphs.push({
            type: 'text',
            text: keywordsRegex ? p.substring(prev).replace(keywordsRegex, '<em class="red">$&</em>') : p.substring(prev)
          })
        }

      }
      this.setData({
        details,
        parsedParagraphs: parsedParagraphs
      })
    },
    copyUrl(e){
      wx.setClipboardData({
        data: this.data.details.url
      })
    }

  }
})