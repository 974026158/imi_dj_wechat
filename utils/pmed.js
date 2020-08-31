import {
  pmedUrl
} from './config'
export function isArray(obj) {
  if (!obj) {
    return false
  }
  if (Array.isArray(obj)) {
    return true
  }
  if (obj.__rawObject__) {
    return Array.isArray(obj.__rawObject__)
  }
  return false
}
let user
let csrfToken
let sessionId
export async function wxRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const header = {}
    if (sessionId) {
      header['Cookie'] = 'JSESSIONID=' + sessionId
    }
    let realUrl = pmedUrl + url
    if (['PUT', 'POST', 'PATCH', 'DELETE'].indexOf(method) !== -1 && csrfToken) {
      if (realUrl.indexOf('?') === -1) {
        realUrl = realUrl + '?_csrf=' + csrfToken
      } else {
        realUrl = realUrl + '&_csrf=' + csrfToken
      }
    }
    let realData = null
    if (data && !isArray(data)) {
      realData = {}
      for (const key of Object.keys(data)) {
        if (data[key] !== undefined && data[key] !== null) {
          realData[key] = data[key]
        }
      }
    } else {
      realData = data
    }
    if (method === 'GET' && realData) {
      let query = ''
      for (const key of Object.keys(realData)) {
        if (isArray(realData[key])) {
          for (let i = 0; i < realData[key].length; i++) {
            if (query.length > 0) {
              query += '&'
            }
            query += encodeURIComponent(key) + '=' + encodeURIComponent(realData[key][i])
          }
        } else {
          if (query.length > 0) {
            query += '&'
          }
          query += encodeURIComponent(key) + '=' + encodeURIComponent(realData[key])
        }
      }
      if (realUrl.indexOf('?') === -1) {
        realUrl += '?' + query
      } else {
        realUrl += '&' + query
      }
      realData = null
    }
    wx.request({
      url: realUrl,
      method,
      header,
      data: realData,
      success(res) {
        const setCookie = res.header['Set-Cookie']
        if (setCookie) {
          const match = /JSESSIONID=([^;]+);/g.exec(setCookie)
          if (match) {
            sessionId = match[1]
          }
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res)
        } else {
          const err = new Error('响应状态码错误')
          err.response = res
          reject(err)
        }
      },
      fail() {
        reject(new Error('请求失败'))
      }
    })
  })
}
export async function login() {
  const token = wx.getStorageSync('token')
  if (token) {
    const response = await wxRequest('/user-info', 'GET', {
      _token: token
    })
    csrfToken = null
    user = response.data
  }
  if (!csrfToken) {
    const response = await wxRequest('/csrf-token', 'GET')
    csrfToken = response.data
  }
}
export function getAllQaCategories() {
  return wxRequest('/qa-categories', 'GET')
}
export function listQaItems(params) {
  return wxRequest('/qa-items', 'GET', params)
}
export function countQaItemsByTag(params) {
  return wxRequest('/qa-items/count-by-tag', 'GET', params)
}
export function getRandomQaItem () {
  return wxRequest('/qa-items/random', 'GET')
}
export function listExamQuestions(params) {
  return wxRequest('/exam-questions', 'GET', params)
}
export function getAllExamQuestionCategories() {
  return wxRequest('/exam-question-categories', 'GET')
}
export function countExamQuestionsByTag(params) {
  return wxRequest('/exam-questions/count-by-tag', 'GET', params)
}
export function listExamQuestionCollections(params) {
  return wxRequest('/exam-question-collections', 'GET', params)
}
export function getExamQuestionCollection(id) {
  return wxRequest('/exam-question-collections/' + id, 'GET')
}
export function formatDate(str) {
  const date = new Date(str)
  return date.getFullYear() + '-' + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '-' + (date.getDate() < 10 ? '0' : '') + date.getDate()
}
export function listCaseObjects(params) {
  return wxRequest('/case-object/search', 'GET', params)
}
export function listCaseObjectsAndTags(params) {
  return wxRequest('/case-object/searchAndStat', 'GET', params)
}
export function getAllCaseObjectCategories() {
  return wxRequest('/case-object-categories', 'GET')
}
export function countCaseObjectsByTag(params) {
  return wxRequest('/case-object/count-by-tag', 'GET', params)
}
export function searchById(id) {
  return wxRequest('/case-object/' + id, 'GET')
}
export function escapeHtml(unsafe) {
  return unsafe ? unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&quot;')
    .replace(/'/g, '&#039;') : ''
}
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
export function addUserLogs(data) {
  return wxRequest('/user-logs', 'POST', data)
}
export function getOwnerPage(me) {
  let comp = me
  while (comp.selectOwnerComponent()) {
    comp = comp.selectOwnerComponent()
  }
  return comp
}
const afterMethodDecoratorOrig = Symbol()
const afterMethodDecoratorDecorators = Symbol()
export function afterMethodDecorator(target, methodName, decorator) {
  if (target[methodName] && target[methodName][afterMethodDecoratorDecorators]) {
    target[methodName][afterMethodDecoratorDecorators].push(decorator)
    return
  }

  function afterMethodDecoratorInvoker() {
    if (afterMethodDecoratorInvoker[afterMethodDecoratorOrig]) {
      afterMethodDecoratorInvoker[afterMethodDecoratorOrig].apply(target, arguments)
    }
    for (const oneDecorator of afterMethodDecoratorInvoker[afterMethodDecoratorDecorators]) {
      oneDecorator(...arguments)
    }
  }
  afterMethodDecoratorInvoker[afterMethodDecoratorOrig] = target[methodName]
  afterMethodDecoratorInvoker[afterMethodDecoratorDecorators] = [decorator]
  target[methodName] = afterMethodDecoratorInvoker
}
export function removeAfterMethodDecorator(target, methodName, decorator) {
  if (target[methodName] && target[methodName][afterMethodDecoratorDecorators]) {
    const idx = target[methodName][afterMethodDecoratorDecorators].indexOf(decorator)
    if (idx !== -1) {
      target[methodName][afterMethodDecoratorDecorators].splice(idx, 1)
      if (target[methodName][afterMethodDecoratorDecorators].length === 0) {
        if (target[methodName][afterMethodDecoratorOrig]) {
          target[methodName] = target[methodName][afterMethodDecoratorOrig]
        } else {
          delete target[methodName]
        }
      }
    }
  }
}