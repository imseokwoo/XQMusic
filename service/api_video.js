import xqRequest from "./index"

export function getTopMV(offset, limit = 10) {
  return xqRequest.get("/top/mv", {
    offset,
    limit
  })
}

/**
 * 请求mv的播放地址
 * @param {number} id mv的id
 */ 
export function getMVURL(id) {
  return xqRequest.get("/mv/url", {
    id
  })
}

// 获取mv详情信息
export function getMVDetail(mvid) {
  return xqRequest.get("/mv/detail", {
    mvid
  })
}

// 获取推荐视频信息
export function getRelatedVideo(id) {
  return xqRequest.get("/related/allvideo", {
    id
  })
}