//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navData: [{
      name: "首页", //文本
      current: 0, //是否是当前页，0不是  1是
      style: 0, //样式
      ico: '../../images/activedj.png', //选中图标
      activeico: '../../images/dj.png', //未选中图标
      fn: 'gotoIndex' //对应处理函数
    }, {
      name: "扫一扫",
      current: 0,
      style: 1,
      ico: '',
      fn: 'gotoPublish'
    }, {
      name: "我的",
      current: 1,
      style: 0,
      ico: '../../images/activemine.png', //选中图标
      activeico: '../../images/mine.png', //未选中图标
      fn: 'gotoMine'
    }, ],
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserInfo: wx.canIUse('button.open-type.getUserInfo')
  },
  // 回首页
  gotoIndex: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  // 扫一扫
  gotoPublish: function () {
    var iphone = wx.getStorageSync('phone');
    // 调用扫码API
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        util.request("GET", config.url_prefix + "/REST/api/ScanQrcode", {
          phoneNum: iphone,
          uuid: res.result
        }, function (scanData) {
        })
      },
      complete(res) {
        wx.navigateTo({
          url: '/pages/index/index'
        })
      }

    })
  },
  // 跳关于
  goAbout() {
    wx.navigateTo({
      url: '/pages/about/about',
    })
  },
  // 获取头像
  getUserInfo: function (e) {
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '获取头像昵称失败',
        duration: 1000,
        icon: "none"
      })
      this.setData({
        hasUserInfo: false
      })
    } else {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this;
    let isIphoneX = app.globalData.isIphoneX;
    _this.setData({
      isIphoneX: isIphoneX
    })
    wx.setNavigationBarTitle({
      title: "我的"
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
    wx.hideHomeButton();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUseGetUserInfo) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})