import { xqLoginRequest } from "./index"

export function getLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      timeout: 1000,
      success: res=> {
        const code = res.code
        resolve(code)
      },
      fail: err => {
        console.log(err)
        reject(err)
      }
    })
  })
}

// 通过code来获取token
export function codeToToken(code) {
  return xqLoginRequest.post("/login", { code })
}

// 验证token是否过期
export function checkToken(token) {
  return xqLoginRequest.post('/auth', {}, {
    token  //传入的header
  })
}

// 验证session是否过期
export function checkSession() {
  return new Promise((resolve) => {
    wx.checkSession({
      success: () => {
        resolve(true)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

