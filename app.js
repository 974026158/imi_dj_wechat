//app.js
const config = require('/utils/config.js')
const util = require('/utils/util.js')
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    let _this = this;
    // 登录
    wx.login({
      success: res => {

        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var urlColumn = config.url_prefix + "/REST/api/code2session";
        util.request("GET", urlColumn, {
          code: res.code
        }, function (res) {
          //获取id和key值
          _this.globalData.session_key = res.session_key;
          _this.globalData.openid = res.openid;
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {

        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              _this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (_this.userInfoReadyCallback) {
                _this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        _this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          _this.globalData.Custom = capsule;
          _this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          _this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })
  },
  watch: function (ctx, obj) {
    Object.keys(obj).forEach(key => {
      this.observer(ctx.data, key, ctx.data[key], function (value) {
        obj[key].call(ctx, value)
      })
    })
  },
  // 监听属性，并执行监听函数
  observer: function (data, key, val, fn) {
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: true,
      get: function () {
        return val
      },
      set: function (newVal) {
        if (newVal === val) return
        fn && fn(newVal)
        val = newVal
      },
    })
  },
  globalData: {
    userInfo: null,
    isIphoneX: false,

    page: 0 //全局页数
  },
  // 手机适配
  onShow: function () {
    var _this = this;
    wx.getSystemInfo({
      success: res => {
        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1 || modelmes.search('iPhone 11') != -1) {
          _this.globalData.isIphoneX = true
        }
      }
    })
  }
})