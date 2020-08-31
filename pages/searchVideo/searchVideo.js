// pages/searchVideo/searchVideo.js
const config = require('../../utils/config');
const util = require('../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    select: false,
    tihuoWay: '按标题检索',
    videoName: "",
    bookList: [],
    listFlag: false,
    noSearch: false
  },
  /*
    生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let isIphoneX = app.globalData.isIphoneX;
    // 进入页面,页码为0并清空数据数组重新执行
    app.globalData.page = 0;
    this.data.bookList = [];
    this.setData({
      isIphoneX: isIphoneX
    })
    app.watch(this, {
      bookList: function (newVal) {
        if (newVal.length == 0) {
          wx.showLoading({
            title: '数据加载中',
            make: true
          })
        } else {
          wx.hideLoading();
        }
      }
    })
  },
  // 输入框
  searchByName(e) {
    util.showTost();
    this.setData({
      videoName: e.detail.value,
      bookList:[]
    })
    app.globalData.page = 0;
    if (this.data.bookList.length == 0) {
      this.setData({
        noSearch: true
      })
    }
    this.getSearch(this.data.videoName, this.data.tihuoWay == "按标题检索" ? '0' : '0');
  },
  // 搜索接口
  getSearch(videoName, type) {
    var page = app.globalData.page; //全局页码
    var _this = this;
    const searchUrl = config.url_prefix + "/Service/?logic=VideoController&call=searchVideoInfo&searchText=" + videoName + "&searchType=" + type + "&page=" + page + "&pageSize=8&token=" + wx.getStorageSync('token') + "&platForm=djwx";
    util.request("GET", searchUrl, "", function (res) {
      // 判断返回数据不为空时合并翻页的数据
      if (res.searchList.length != 0) {
        var concatArr = _this.data.bookList.concat(res.searchList);
        _this.setData({
          bookList: concatArr,
          noSearch: false
        })
      } else {
        // 否则只展示已有数据
        _this.setData({
          bookList: _this.data.bookList,
          listFlag: true
        })
        // wx.showToast({
        //   title: "已经到底了",
        //   icon: 'none',
        //   duration: 2000
        // })
        if (res.totalCount == 0) {
          wx.showToast({
            title: "无相关结果",
            icon: 'none',
            duration: 1000
          })
        } else if (res.searchList == 0) {
          wx.showToast({
            title: "已经到底了",
            icon: 'none',
            duration: 1000
          })
          _this.setData({
            listFlag: true
          })
        }
      }
    })
  },
  // 查看视频  防止用户多次点击
  goShowVideo: util.throttle(function (e) {
    wx.navigateTo({
      url: `/pages/showVideo/showVideo?&id=${e.currentTarget.dataset.id}`,
    })
  }, 1000),
  // 下拉选项
  bindShowMsg() {
    this.setData({
      select: !this.data.select
    })
  },
  mySelect(e) {
    var name = e.currentTarget.dataset.name
    this.setData({
      tihuoWay: name,
      select: false
    })
  },
  hide() {
    this.setData({
      select: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    util.showTostMore();
    // 上拉加载页数叠加并执行方法
    app.globalData.page++;
    this.getSearch(this.data.videoName, this.data.tihuoWay == "按标题检索" ? '0' : '1');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})