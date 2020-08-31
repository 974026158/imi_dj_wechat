// pages/phoneAuth/phoneAuth.js
const config = require('../../utils/config');
const util = require('../../utils/util.js');
const app = getApp()
Page({

  /** 
   * 页面的初始数据
   */
  data: {
    title: "",
    phone: "",
    showToastFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '手机号授权'
    })
  },
  getPhoneNumber(e) {
    this.getToken("", e.detail.iv, e.detail.encryptedData)
  },
  //获取token
  getToken(phone, iv, encryptedData) {
    let self = this;
    var tokenUrl = config.url_prefix + "/REST/api/getWXToken";
    util.request("GET", tokenUrl, {
      phone: phone,
      session_key: app.globalData.session_key,
      iv: iv,
      encryptedData: encryptedData,
      platformPre: "djwx_"
    }, function (res) {
      var myEventDetail = true;
      self.triggerEvent('myevent', myEventDetail);
      wx.showLoading({
        title: '加载中',
      })
      wx.hideLoading()
      app.globalData.token = res.token;
      wx.setStorage({
        key: "phone",
        data: res.phone
      })
      // 存储token成功后并取出，告诉父元素可以执行方法并把token传给父元素
      wx.setStorage({
        key: "token",
        data: res.token,
        success: function () {
          wx.getStorage({
            key: 'token',
            success: function (res) {
              self.triggerEvent('myGETevent',res.data);
            }
          })

        }
      })
      self.setData({
        phone: res.phone
      })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})