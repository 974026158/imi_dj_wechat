const computedBehavior = require('miniprogram-computed')
Component({
  behaviors: [computedBehavior],

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false, //是否显示指示点  this.setData({indicatorDots: !this.data.indicatorDots })
    autoplay: false, //是否自动轮播  this.setData({autoplay: !this.data.autoplay })
    interval: 5000, //自动切换时间间隔
    duration: 500, //滑动动画时长
    // 指示点
    pointList: [],
    activepoint: 0,
    showFilters: false,
    keyword: null,
    showTypeSelect: false,
    selectedType: '试题集',
    types: ['试题集', '试题'],
    confirmedKeyword: null
  },

  methods:{
    onKeywordInput(e) {
      this.setData({
        keyword: e.detail.value
      })
    },
    async searchKeyword(){
      this.setData({
        confirmedKeyword: this.data.keyword
      })
    },
    toggleTypeSelect(e){
      this.setData({
        showTypeSelect: !this.data.showTypeSelect
      })
    },
    onTypeTap(e){
      this.setData({
        selectedType: e.currentTarget.dataset.type,
        showTypeSelect: false
      })
    }
  }

})