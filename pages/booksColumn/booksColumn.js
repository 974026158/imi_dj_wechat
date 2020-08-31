// pages/booksColumn/booksColumn.js\
const config = require('../../utils/config');
const util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    bookID: "",
    showToastFlag: false,
    currentTab: "",
    swiperHeight: '',
    list: [],
    tabList: [],
    tabHeight: '',
    listFlag: false,
    scrollTop: 0 //滚动条距离
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this;
    let isIphoneX = app.globalData.isIphoneX;

    // 进入页面,页码为0并清空数据数组重新执行
    app.globalData.page = 0;
    _this.data.list = [];
    _this.setData({
      title: options.name,
      bookID: options.id,
      swiperHeight: wx.getSystemInfoSync().windowHeight - 115,
      config,
      isIphoneX: isIphoneX
    })
    wx.setNavigationBarTitle({
      title: _this.data.title
    })
    // 头部tab栏数据
    const urlTab = config.url_prefix + '/Service/?logic=bookController&call=getSubColumnList&columnId=' + _this.data.bookID;
    util.request("POST", urlTab, {
      "columnId": _this.data.bookID
    }, function (res) {
      // 党tab栏有数据时 默认选中第一项并显示对应数据
      if (res[0].sublist.length > 0) {
        _this.setData({
          tabList: res[0].sublist,
          currentTab: res[0].sublist[0].id,
          tabHeight: isIphoneX ? 276 : 232
        })
        _this.getColumn(res[0].sublist[0].id)
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
        // 否则直接展示数据
        _this.getColumn(_this.data.bookID)
      }

    })
  },
  //点击tab切换
  clickTab: function (e) {
    // 点击切换时页面为0，清空数据数组重新执行
    app.globalData.page = 0;
    //  this.data.list = [];
    this.setData({
      list: []
    })
    this.getColumn(e.target.dataset.current);
    // 判断展示对应数据
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      this.setData({
        currentTab: e.target.dataset.current,
      })
    }
    // 解决切换时滚动条遗留问题
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      })
      util.showTost();
    }
    app.watch(this, {
      list: function (newVal) {
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
  //获取列表数据
  getColumn(bookID) {
    var page = app.globalData.page; //全局页码
    var urldata = config.url_prefix + '/Service/?logic=bookController&call=getBooksBySubColumn&columnId=' + bookID + '&page=' + page + '&pageSize=8&orderby=""';
    const _this = this;
    util.request("POST", urldata, "", function (res) {
      // 时间戳转换时间
      for (var i = 0; i < res.bookinfo.length; i++) {
        res.bookinfo[i]["releaseDate"] = util.timestampToTime(res.bookinfo[i]["releaseDate"])
      }
      // 判断返回数据不为空时合并翻页的数据
      if (res.bookinfo.length != 0) {
        var concatArr = _this.data.list.concat(res.bookinfo);
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
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    util.showTostMore();
    // 上拉加载页数叠加并执行方法
    app.globalData.page++;
    // this.data.bookID
    this.getColumn(this.data.currentTab == "" ? this.data.bookID : this.data.currentTab);
  },
  // 读书跳转webview
  showBook(e) {
    var _this = this;
    let dataset = e.currentTarget.dataset;
    // 判断书是不是免费观看的 showToastFlag
    var token = wx.getStorageSync('token');
    var iphone = wx.getStorageSync('phone');
    var isCheckTokenUrl = config.url_prefix + "/Service/?logic=bookController&call=checkToken&token=" + token + "&phone=" + iphone;
    if (dataset.isfree != 1) {
      util.request("GET", isCheckTokenUrl, "", function (res) {
        if (res) {
          let epubName = dataset.bookname + "_" + dataset.bookid + ".epub";
          wx.navigateTo({
            url: "/pages/booksReader/booksReader?epubName=" + epubName
          })
        } else {
          _this.setData({
            showToastFlag: true
          })
          setTimeout(function () {
            _this.setData({
              showToastFlag: false
            })
          }, 2700);
        }
      })
    } else {
      let epubName = dataset.bookname + "_" + dataset.bookid + ".epub";
      wx.navigateTo({
        url: "/pages/booksReader/booksReader?epubName=" + epubName
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    util.showTost();
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})