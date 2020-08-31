// pages/showVideo/showVideo.js
const config = require('../../utils/config');
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoUrl: "",
    title: "",
    teacher: "",
    info: "",
    showToastFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log("测试文字")
    // var token = wx.getStorageSync({key: 'token'}); options.id 
    var token = wx.getStorageSync('token');
    var iphone = wx.getStorageSync('phone');
    const _this = this;
    const showvideourl = config.url_prefix + '/Service/?logic=VideoController&call=getVideoInfoForWx&token=' + token + '&phone=' + iphone + '&id=' + options.id;
    // 获取视频信息
    util.request("GET", showvideourl, "", function (res) {
      console.log(res)
      if (!res.isfree && res.isfree != 1) {
        if (!token) {
          _this.setData({
            showToastFlag: true
          })
        } else {
          _this.setData({
            showToastFlag: false
          })
        }
      }
      _this.setData({
        videoUrl: res.url,
        title: res.videotitle,
        teacher: res.lecturer,
        info: res.introduction
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