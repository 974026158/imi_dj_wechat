const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatDay = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const request = (method, url, data, cb) => { //不需要参数时 传''    获取值直接 *** = res
  wx.request({
    method: method,
    url: url,
    header: {
      'content-type': 'text/plain' // 默认值json
    },
    data: data,
    success: res => {
      if (res.data.errCode) {
        if (res.data.errCode == "10014") {
          if (typeof cb == 'function') cb(res.data.errCode);
        } else {
          wx.showToast({
            title: res.data.errInfo,
            icon: 'none',
            duration: 2000
          })
        }

      } else if (typeof cb == 'function') cb(res.data.result)

    },
    fail: res => {
      wx.showToast({
        title: res.errMsg,
        icon: 'none',
        duration: 2000
      })
    }
  })
}
// 防止用户多次点击
const throttle = (fn, gapTime) => {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1000
  }
  let _lastTime = null;
  return function () {
    let _nowTime = +new Date();
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments);
      _lastTime = _nowTime;
    }
  }
}
// 公用的修改画笔宽度
function changeWidth(e, _this, canvasHeight, pageType) {
  let c = {};
  if (pageType === 1) {
    c.canvasHeight = canvasHeight;
  } else {
    c.canvasHeightLen = canvasHeight;
  }
  _this.setData({
    w: e.detail.value,
    eraser: false,
    ...c,
  })
}

function login() {
  var that = this
  var sucess = arguments[0] ? arguments[0] : function () {}; //登录成功的回调 
  var fail = arguments[1] ? arguments[1] : function () {}; //登录失败的回调 
  var title = arguments[2] ? arguments[2] : '授权登录失败，部分功能将不能使用，是否重新登录？'; //当用户取消授权登录时，弹出的确认框文案 
  var user = wx.getStorageSync('user'); //登录过后，用户信息会缓存 
  if (!user) {
    wx.login({
      success: function (res) {
        var code = res.code;
        wx.getUserInfo({
          success: function (res) {
            var rawData = encodeURIComponent(res.rawData);
            var signature = res.signature || '';
            var encryptedData = res.encryptedData;
            var iv = res.iv;
            that.getLoginApi(code, rawData, signature, encryptedData, iv, function (res) { //调用服务器端登录，获得详细用户资料，比如openid(支付用)，保存用户数据到服务器 
              wx.setStorageSync("user", res) //本地缓存user数据 下次打开不需要登录 
              var app = getApp()
              app.globalData.user = res //在当前的app对象中缓存user数据 
              sucess(res)
            })
          },
          fail: function (res) { //用户点了“拒绝” 
            wx.showModal({
              title: '提示',
              content: title,
              showCancel: true,
              cancelText: "否",
              confirmText: "是",
              success: function (res) {
                if (res.confirm) {
                  if (wx.openSetting) { //当前微信的版本 ，是否支持openSetting 
                    wx.openSetting({
                      success: (res) => {
                        if (res.authSetting["scope.userInfo"]) { //如果用户重新同意了授权登录 
                          wx.getUserInfo({ //跟上面的wx.getUserInfo sucess处理逻辑一样 
                            success: function (res) {
                              var rawData = encodeURIComponent(res.rawData);
                              var signature = res.signature || '';
                              var encryptedData = res.encryptedData;
                              var iv = res.iv;
                              that.getLoginApi(code, rawData, signature, encryptedData, iv, function (res) {
                                wx.setStorageSync("user", res)
                                var app = getApp()
                                app.globalData.user = res
                                sucess(res)
                              })
                            }
                          })
                        } else { //用户还是拒绝 
                          fail()
                        }
                      },
                      fail: function () { //调用失败，授权登录不成功 
                        fail()
                      }
                    })
                  } else {
                    fail()
                  }
                }
              }
            })
          }
        })
      },
      fail: function (res) {
        fail()
      },
    })
  } else { //如果缓存中已经存在user 那就是已经登录过 
    var app = getApp()
    app.globalData.user = user
    sucess(user)
  }
}
// 时间戳转换
const timestampToTime = (data) => {
  var date = new Date(data)
  var Y = date.getFullYear() + '年'
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月'
  return Y + M
}
// 数据加载
const showTost = () => {
  wx.showLoading({
    title: '数据加载中',
    make: true,
    duration: 100
  })
}
// 加载更多
const showTostMore = () => {
  wx.showLoading({
    title: '加载更多',
    make: true,
    duration: 200
  })
}
module.exports = {
  formatTime: formatTime,
  changeWidth: changeWidth,
  formatDay: formatDay,
  request: request,
  throttle: throttle,
  timestampToTime: timestampToTime,
  showTost: showTost,
  showTostMore: showTostMore
}