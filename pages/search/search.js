const config = require('../../utils/config');
const util = require('../../utils/util.js');
const app = getApp();
// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalName: null,
    showToastFlag: false,
    bookName: '', //书名
    author: "", //作者
    isbn: "", //ISBN号
    keyWord: "", //相关词
    startDate: '1900-01-01',
    endDate: util.formatDay(new Date()),
    bookList: [],
    listFlag: false,
    noSearch: false,
    typeSearch: "",
    active: 0
  },
  tabSearch() {
    this.setData({
      active: 0,
      bookList: [],
      noSearch: false,
      listFlag: false
    })
    wx.hideLoading();
  },
  tabseainrSearch(e) {
    this.setData({
      active: 1,
      bookList: [],
      noSearch: false,
      listFlag: false
    })
    wx.hideLoading();
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  // 高级检索点击事件
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  // 关闭模态框
  hideModal(e) {
    this.setData({
      modalName: null,
      noSearch: true
    })
  },
  // 高级搜索确定按钮
  searchByFilter(e) {
    this.setData({
      modalName: null,
      bookList: [],
      typeSearch: "1",
      listFlag: false
    })
    app.globalData.page = 0;
    if (this.data.bookList.length == 0) {
      this.setData({
        noSearch: true
      })
    }
    this.seniorSearch(this.data.bookName);
  },
  // 输入框
  searchByName(e) {
    this.setData({
      bookName: e.detail.value,
      bookList: [],
      typeSearch: "0",
      listFlag: false
    })
    app.globalData.page = 0;
    if (this.data.bookList.length == 0) {
      this.setData({
        noSearch: true
      })
    }
    this.getSearch(this.data.bookName);
  },
  // 搜索数据方法( 普通检索 )
  getSearch(bookname) {
    var page = app.globalData.page; //全局页码
    const _this = this;
    const _text = _this.data;
    const searchUrl = config.url_prefix + "/Service/?logic=bookController&call=searchBookByColumnAndBookinfo";
    const req = {
      searchtext: bookname,
      page: page,
      pageSize: 8,
      orderby: "",
      panel: "system",
      columnId: "",
      name: "",
      author: _text.author,
      isbn: _text.isbn,
      relatedWords: _text.keyWord,
      translator: "",
      starttime: _text.startDate,
      endtime: _text.endDate,
      filtersql: ""
    };
    util.request("GET", searchUrl, req, function (res) {
      // 时间戳转换时间
      for (var i = 0; i < res.bookinfo.length; i++) {
        if (res.bookinfo[i].releaseDate.toString().indexOf("-") > 1) {
          var time = res.bookinfo[i].releaseDate.split(" ")[0];
          var iosTime = time.replace(/\-/g, "/");
          res.bookinfo[i].releaseDate = iosTime.split("/")[0] + "年" + iosTime.split("/")[1] + "月";
        } else {
          // 全部
          var time = util.timestampToTime(res.bookinfo[i].releaseDate);
          res.bookinfo[i].releaseDate = time.replace(/\-/g, "/");
        }
      }

      // 判断返回数据不为空时合并翻页的数据
      if (res.bookinfo.length != 0) {
        var concatArr = _this.data.bookList.concat(res.bookinfo);
        _this.setData({
          bookList: concatArr,
          noSearch: false
        })
      } else {
        wx.hideLoading();
        // 否则只展示已有数据
        _this.setData({
          bookList: _this.data.bookList
        })
        if (res.totalCount == 0) {
          wx.showToast({
            title: "无相关结果",
            icon: 'none',
            duration: 1000
          })
        } else if (res.bookinfo == 0) {
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
  // 高级检索
  seniorSearch(bookname) {
    var page = app.globalData.page; //全局页码
    const _this = this;
    const _text = _this.data;
    const searchUrl = config.url_prefix + "/Service/?logic=bookController&call=searchBookByColumnAndSenior";
    const req = {
      searchtext: "",
      page: page,
      pageSize: 8,
      orderby: "",
      panel: "system",
      columnId: "",
      name: bookname,
      author: _text.author,
      isbn: _text.isbn,
      relatedWords: _text.keyWord,
      translator: "",
      starttime: _text.startDate,
      endtime: _text.endDate,
      filtersql: ""
    };
    util.request("GET", searchUrl, req, function (res) {
      // 时间戳转换时间
      for (var i = 0; i < res.bookinfo.length; i++) {
        if (res.bookinfo[i].releaseDate.toString().indexOf("-") > 1) {
          var time = res.bookinfo[i].releaseDate.split(" ")[0];
          var iosTime = time.replace(/\-/g, "/");
          res.bookinfo[i].releaseDate = iosTime.split("/")[0] + "年" + iosTime.split("/")[1] + "月";
        } else {
          // 全部
          var time = util.timestampToTime(res.bookinfo[i].releaseDate);
          res.bookinfo[i].releaseDate = time.replace(/\-/g, "/");
        }
      }
      // 判断返回数据不为空时合并翻页的数据
      if (res.bookinfo.length != 0) {
        var concatArr = _this.data.bookList.concat(res.bookinfo);
        _this.setData({
          bookList: concatArr,
          noSearch: false
        })
      } else {
        wx.hideLoading();
        // 否则只展示已有数据
        _this.setData({
          bookList: _this.data.bookList
        })
        if (res.totalCount == 0) {
          wx.showToast({
            title: "无相关结果",
            icon: 'none',
            duration: 1000
          })
        } else if (res.bookinfo == 0) {
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
  // 读书跳转webview
  showBook(e) {
    var _this = this;
    let dataset = e.currentTarget.dataset;
    // 判断书是不是免费观看的 showToastFlag
    var token = wx.getStorageSync('token');
    var iphone = wx.getStorageSync('phone');
    var bookUrl = config.url_prefix + "/Service/?logic=bookController&call=checkToken&token=" + token + "&phone=" + iphone;
    if (dataset.isfree != 1) {
      util.request("GET", bookUrl, "", function (res) {
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 进入页面,页码为0并清空数据数组重新执行
    app.globalData.page = 0;
    this.setData({
      config,
      bookList: []
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.data.bookList.length != 0;

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
    // 上拉加载页数叠加并执行方法 seniorSearch
    app.globalData.page++;
    if (this.data.typeSearch == "0") {
      this.getSearch(this.data.bookName);
    } else if (this.data.typeSearch == "1") {
      this.seniorSearch(this.data.bookName);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})