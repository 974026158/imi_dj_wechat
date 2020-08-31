// components/navbar/index.js
const app = getApp();
const util = require("../../utils/util.js");
const config = require('../../utils/config');
Component({
  options: {

  },
  /**
   * 组件的属性列表
   */
  properties: {},
  /**
   * 组件的初始数据
   */
  data: {
    indicatorDots: false, //是否显示指示点  this.setData({indicatorDots: !this.data.indicatorDots })
    autoplay: false, //是否自动轮播  this.setData({autoplay: !this.data.autoplay })
    interval: 5000, //自动切换时间间隔
    duration: 500, //滑动动画时长
    videoList: [], //存放视频
    // 指示点
    pointList: [],
    activepoint: 0
  },
  lifetimes: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 跳搜索 防止用户多次点击
    goSearch: util.throttle(function (e) {
      wx.navigateTo({
        //目的页面地址
        url: "/pages/searchVideo/searchVideo",
        success: function (res) {},
        fail: function (res) {
        }
      })
    }, 1000),
    // 跳更多
    goMore(e) {
      wx.navigateTo({
        url: `/pages/videoColumn/videoColumn?name=${e.currentTarget.dataset.name}&id=${e.currentTarget.dataset.id}`
      })
    },
    // 查看视频
    goShowVideo: util.throttle(function (e) {
      wx.navigateTo({
        url: `/pages/showVideo/showVideo?&id=${e.currentTarget.dataset.id}`,
      })
    }, 1000),
    getVideo() {
      this.setData({
        config
      });
      const videourl = config.url_prefix +'/Service/?logic=VideoController&call=getColumnList&token='+wx.getStorageSync('token')+'&platForm=djwx';
      // 获取视频信息
      var _this = this;
      util.request("GET", videourl, "", function (res) {
        res.video_list.find(item => {
          if (item.videoInfo.length >= 4) {
            item.videoInfo.length = 4;
          }
          return;
        })
        _this.setData({
          videoList: [...res.video_list]
        });
      })
    }
  },

})