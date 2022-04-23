const BASE_URL = "http://123.207.32.32:9001"

// 登录用到的服务器
const LOGIN_BASE_URL = "http://123.207.32.32:3000"

class XQRequest {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  request(url, method, params, header = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.baseURL + url,
        method: method,
        header: header,
        data: params,
        success: function(res) {
          resolve(res.data)
        },
        fail: function(err) {
          reject(err)
        }
      })
    })
  }
  get(url, params, header) {
    return this.request(url, "GET", params, header)
  }
  post(url, data, header) {
    return this.request(url, "POST", data, header)
  }
}

const xqRequest = new XQRequest(BASE_URL)
const xqLoginRequest = new XQRequest(LOGIN_BASE_URL)

// 用promise来返回结果，再对请求方式做封装
// xqRequest.request("/top/mv", "GET", {offset: 0, limit: 10}).then(res => {
// }).catch(err => {
// })

export default xqRequest
export {
  xqLoginRequest
}