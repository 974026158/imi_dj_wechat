// pages/booksReader/booksReader.js
const config = require('../../utils/config');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    bookid: "",
    epubName: '',
    version: (new Date().valueOf())
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var booksNameOrId = options.epubName;
    var str = booksNameOrId.indexOf(".")
    var strLast = booksNameOrId.substring(0, str)
    var strStart = strLast.indexOf('_')
    var strLastOf = strLast.substring(strStart, booksNameOrId.length)
    var strData = strLastOf.substr(1)
    this.setData({
      title: options.bookname,
      bookid: options.bookid,
      epubName: config.server_book + strData + '/t='  + this.data.version
    });
    console.log(this.data.epubName)
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