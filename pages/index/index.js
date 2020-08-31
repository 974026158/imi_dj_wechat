const config = require('../../utils/config');
const util = require('../../utils/util.js');
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasPhone: true,
    showToastFlag: false,
    phone: "",
    phoneNumber: "",
    title: "党员教育数据库",
    background: [], // banner图
    updateBooksList: [], // 最近更新图书
    outerList: [], // 外部数组
    booksCoulmn: [], //专题
    indicatorDots: false, //是否显示指示点  this.setData({indicatorDots: !this.data.indicatorDots })
    updateindicatorDots: true,
    autoplay: true, //是否自动轮播  this.setData({autoplay: !this.data.autoplay })
    updateautoplay: true,
    interval: 5000, //自动切换时间间隔
    duration: 500, //滑动动画时长
    // tabbar
    navData: [{
      name: "首页", //文本
      current: 1, //是否是当前页，0不是  1是
      style: 0, //样式
      ico: '../../images/dj.png', //未选中图标
      activeico: '../../images/activedj.png', //选中图标
      fn: 'gotoIndex', //对应处理函数
      index: 0
    }, {
      name: "扫一扫",
      current: 0,
      style: 1,
      ico: '',
      fn: 'gotoPublish'
    }, {
      name: "我的",
      current: 0,
      style: 0,
      ico: '../../images/mine.png', //未选中图标
      activeico: '../../images/activemine.png', //选中图标
      fn: 'gotoMine',
      index: 1
    }, ],
    // 指示点
    pointList: [],
    avtive: 0,
    // 头部导航
    optionList: [{
        id: "0",
        text: "电子书"
      },
      {
        id: "1",
        text: "视频"
      },
      // {
      //   id: "5",
      //   text: "课件"
      // },
      {
        id: "2",
        text: "问答"
      },
      {
        id: "3",
        text: "试题"
      },
      {
        id: "4",
        text: "案例"
      }
    ],
    optionActive: 0
  },
  // 获取swiper当前滑动块的index并赋值给自定义指示点
  swiperEvent(e) {
    this.setData({
      avtive: e.detail.current
    })
  },
  // 扫一扫
  gotoPublish() {
    var iphone = wx.getStorageSync('phone');
    var _this = this;
    // 调用扫码API
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        util.request("GET", config.url_prefix + "/REST/api/ScanQrcode", {
          phoneNum: iphone,
          uuid: res.result
        }, function (scanData) {})
      },
      complete(res) {
        // wx.navigateTo({
        //   url: '/pages/index/index'
        // })
        _this.setData({
          optionActive: 0
        })
        _this.onLoad()
      }

    })
  },
  // 跳转我的
  gotoMine: util.throttle(function (e) {
    wx.navigateTo({
      url: "/pages/mine/mine"
    })
  }, 1000),
  // 跳更多
  goMore(e) {
    wx.navigateTo({
      url: `/pages/booksColumn/booksColumn?name=${e.currentTarget.dataset.name}&id=${e.currentTarget.dataset.id}`,
    })
  },
  // 跳搜索 防止用户多次点击
  goSearch: util.throttle(function (e) {
    wx.navigateTo({
      //目的页面地址
      url: "/pages/search/search",
      success: function (res) {},
      fail: function (res) {}
    })
  }, 1000),
  // banner图点击事件
  bannerClick: util.throttle(function (e) {
    wx.navigateTo({
      url: `/pages/booksColumn/booksColumn?name=${e.currentTarget.dataset.name}&id=${e.currentTarget.dataset.id}`
    })
  }, 1000),
  // 导航栏点击
  tab(e) {
    const _ID = e.currentTarget.dataset.id;
    var _this = this;
    this.setData({
      optionActive: _ID
    })
    if (_ID == 1) {
      wx.setNavigationBarTitle({
        title: "党员教育数据库"
      });
      var videodata = this.selectComponent('#videodata');
      videodata.getVideo();
      util.showTost();
      _this.setData({
        showToastFlag: false
      })
    } else if (_ID == 0) {
      wx.setNavigationBarTitle({
        title: "党员教育数据库"
      });
    }
    if (_ID == 2) {
      wx.setNavigationBarTitle({
        title: "党员教育数据库"
      });
      util.showTost();
      _this.setData({
        showToastFlag: false
      })
    } else if (_ID == 3) {
      wx.setNavigationBarTitle({
        title: "党员教育数据库"
      });
      util.showTost();
      _this.setData({
        showToastFlag: false
      })
    } else if (_ID == 4) {
      wx.setNavigationBarTitle({
        title: "党员教育数据库"
      });
      util.showTost();
      _this.setData({
        showToastFlag: false
      })
    }
    /*
       if (_ID == 5) {
      // wx.setNavigationBarTitle({
      //   title: "党员教育数据库"
      // });
      wx.redirectTo({
        url: "/components/courseWare/courseWare"
      })
      // var courseWare = this.selectComponent('#courseWare');
      // courseWare.getCourse();
      util.showTost();
      _this.setData({
        showToastFlag: false
      })
    }
    */
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
          }, 2500);
        }
      })
    } else {
      let epubName = dataset.bookname + "_" + dataset.bookid + ".epub";
      wx.navigateTo({
        url: "/pages/booksReader/booksReader?epubName=" + epubName
      })
    }
  },
  // 子传父
  toggleToast(e) {
    this.setData({
      hasPhone: e.detail
    })
  },
  // 获取token
  getToken(phone) {
    var tokenUrl = config.url_prefix + "/REST/api/getWXToken";
    util.request("GET", tokenUrl, {
      phone: phone,
      session_key: "",
      iv: "",
      encryptedData: "",
      platformPre: "djwx_"
    }, function (res) {
      if (res.token != "") {
        wx.setStorage({
          data: res.token,
          key: 'token',
        })
      }

    })
  },
  // 获取banner图
  getBanner() {
    const _this = this;
    const url = config.url_prefix + '/Service/?logic=bookController&call=getCustomColumn';
    // banner图接口
    util.request("GET", url, "", function (res) {
      // 如果只有一条数据停止轮播并隐藏指示点
      if (res.length == 1) {
        this.setData({
          indicatorDots: !this.data.indicatorDots,
          autoplay: !this.data.autoplay
        })
      }
      _this.setData({
        background: [...res],
        pointList: res.length
      });
    })
  },
  // 获取最近更新
  getUpdate() {
    const _this = this;
    const urlUpdate = config.url_prefix + '/Service/?logic=bookController&call=getUpdatedColumn';
    // 最近更新接口
    util.request("GET", urlUpdate, "", function (res) {
      // 如果只有一条数据停止轮播并隐藏指示点
      if (res.length == 1) {
        this.setData({
          updateindicatorDots: !this.data.updateindicatorDots,
          updateautoplay: !this.data.updateautoplay
        })
      }
      const pages = []; //外层数组
      res.forEach((item, index) => {
        const page = Math.floor(index / 3); //三个放一组
        if (!pages[page]) {
          pages[page] = [];
        }
        pages[page].push(item);
      });
      _this.setData({
        outerList: pages
      })
    })
  },
  // 获取专题
  getColumn(token) {
    const _this = this;
    const urlColumn = config.url_prefix + '/Service/?logic=bookController&call=getColumnList&token=' + token + '&platForm=djwx';
    // 专题接口
    util.request("GET", urlColumn, "", function (res) {
      res.find(item => {
        item.bookInfo.length = 3;
        return;
      })
      _this.setData({
        booksCoulmn: [...res]
      });
    })

  },
  // 执行自定义方法并拿到token
  toggleGetToast(e) {
    this.getBanner();
    this.getUpdate();
    this.getColumn(e.detail);
  },
  /* 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    const _this = this;
    wx.setNavigationBarTitle({
      title: _this.data.title
    })
    let isIphoneX = app.globalData.isIphoneX;
    _this.setData({
      config,
      isIphoneX: isIphoneX
    })
    var phone = wx.getStorageSync('phone');
    var token = wx.getStorageSync('token');
    if (phone != "") {
      _this.getToken(phone);
      _this.getBanner();
      _this.getUpdate();
      _this.getColumn(token);
    }
    //缓存过手机号不需要再次授权
    wx.getStorage({
      key: 'phone',
      success(res) {
        _this.data.phone = res.data;
      },
      fail(res) {
        _this.setData({
          hasPhone: false
        })
      }
    })

  },
  /* 生命周期函数--监听页面初次渲染完成*/
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