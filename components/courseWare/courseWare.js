// components/courseWare/courseWare.js
const config = require('../../utils/config');
const util = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    url: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    util.request("POST", "http://192.168.1.44:8080/Service/?logic=CoursewareController&call=getCoursewareInfo&id=1", "", function (res) {
      wx.getSystemInfo({
        success: (result) => {
          if (result.system.indexOf("iOS") != -1) {
            _this.setData({
              url: "http://192.168.1.44:8080/pdf/" + res[0].pdffile
            })
          } else {
            wx.downloadFile({
              url: "http://192.168.1.44:8080/pdf/" + res[0].pdffile,
              success: function (res) {
                const filePath = res.tempFilePath
                _this.setData({
                  url: filePath
                })
                wx.openDocument({
                  filePath: filePath,
                  fileType: "pdf",
                  success: function (res) {
                    console.log(res);
                    wx.navigateBack({
                      delta: 1,
                    })
                  }
                })
              }
            })
          }
        },
      })


    })

  },
  getCourse() {

  },
  //滑动切换
  swiperTabView: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
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