// pages/videoColumn/videoColumn.js
const config = require('../../utils/config');
const util = require('../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    videoID: "",
    currentTab: "",
    swiperHeight: '',
    windowHeight: '',
    list: [],
    tabList: [],
    tabHeight: '',
    listFlag: false,
    scrollTop: 0, //滚动条距离
    arr:[[],[],[]]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '数据加载中',
      make: true
    })
    const _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    let isIphoneX = app.globalData.isIphoneX;
    // 进入页面,页码为0并清空数据数组重新执行
    app.globalData.page = 0;
    _this.data.list = [];
    // 拿到父级传来的信息
    _this.setData({
      title: options.name,
      videoID: options.id,
      swiperHeight: wx.getSystemInfoSync().windowHeight - 115,
      config,
      isIphoneX: isIphoneX
    })
    wx.setNavigationBarTitle({
      title: _this.data.title
    })
    // tab
    const videoTab = config.url_prefix + '/Service/?logic=VideoController&call=getSubColumnList&columnId=' + _this.data.videoID;
    // 获取视频tab
    util.request("POST", videoTab, "", function (res) {
      if (res[0].sublist.length > 0) {
        _this.setData({
          tabList: res[0].sublist,
          currentTab: res[0].sublist[0].id,
          tabHeight: isIphoneX ? 276 : 232
        })
        _this.getVideoList(res[0].sublist[0].id)
      } else {
        if (isIphoneX) {
          _this.setData({
            tabHeight: 188
          })
        } else {
          _this.setData({
            tabHeight: 140
          })
        }
        _this.getVideoList(_this.data.videoID)
      }
    })
  },
  // 获取视频数据
  getVideoList(videoID) {
    var page = app.globalData.page; //全局页码
    const _this = this;
    // const arr = [
    //   [],
    //   [],
    //   []
    // ];
    const videoUrl = config.url_prefix + '/Service/?logic=VideoController&call=getVideoBySubColumn&columnId=' + videoID + '&page=' + page + '&pageSize=8';
    util.request("POST", videoUrl, "", function (res) {
      // 判断返回数据不为空时合并翻页的数据
      if (res.videoInfo.length != 0) {
        wx.hideLoading();
        if (videoID == "945") {
          _this.data.arr[0] = res.videoInfo
        } else if (videoID == "947") {
          _this.data.arr[1] = res.videoInfo
        } else if (videoID == "948") {
          _this.data.arr[2] = res.videoInfo
        }
        console.log( _this.data.arr)
        var concatArr = _this.data.list.concat(res.videoInfo);
        if (videoID == "945") {
          concatArr =  _this.data.arr[0]
        } else if (videoID == "947") {
          concatArr =  _this.data.arr[1]
        } else if (videoID == "948") {
          concatArr =  _this.data.arr[2]
        }
        _this.setData({
          list: concatArr
        })
      } else {
        // 否则只展示已有数据
        _this.setData({
          list: _this.data.list,
          listFlag: true
        })
        wx.showToast({
          title: "已经到底了",
          icon: 'none',
          duration: 2000
        })
      }
      // _this.setData({
      //   list:res.videoInfo
      // })
    })
  },
  // 查看视频 防止用户多次点击
  goShowVideo: util.throttle(function (e) {
    wx.navigateTo({
      url: `/pages/showVideo/showVideo?&id=${e.currentTarget.dataset.id}`,
    })
  }, 1000),
  // 滑动
  swiperTab: function (e) {
    this.setData({
      currentTab: e.detail.current,
    })
  },

  //点击切换
  clickTab: function (e) {

    wx.showLoading({
      title: '数据加载中',
      make: true
    })
    // 点击切换时页面为0，清空数据数组重新执行
    app.globalData.page = 0;
    this.setData({
      list: []
    })
    this.getVideoList(e.target.dataset.current)
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      this.setData({
        currentTab: e.target.dataset.current
      })
    }
    // 解决切换时滚动条遗留问题
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      })
      // util.showTost();
    }
    // app.watch(this, {
    //   list: function (newVal) {
    //     if (newVal.length == 0) {
    //       wx.showLoading({
    //         title: '数据加载中',
    //         make: true
    //       })
    //     } else {
    //       wx.hideLoading();
    //     }
    //   }
    // })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // util.showTost();
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
    this.getVideoList(this.data.currentTab == "" ? this.data.videoID : this.data.currentTab);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})