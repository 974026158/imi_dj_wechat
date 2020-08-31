// components/navbar/index.js
const app = getApp();

Component({
  options: {
    
  },
  /**
   * 组件的属性列表
   */
  properties: {
    pageName:String
  },
  /**
   * 组件的初始数据
   */
  data: {
    isIphoneX:app.globalData.isIphoneX,
  },
  lifetimes: {
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //回退
    navBack: function () {
        wx.navigateBack({
          delta: 1
        })      
    }
  }
})