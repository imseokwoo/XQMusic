import xqRequest from "./index"

export function getBanners() {
  return xqRequest.get("/banner", {
    type: 2
  })
}

export function getRankings(idx) {
  return xqRequest.get("/top/list", {
    idx
  })
}

// cat -> category 类别
export function getSongMenu(cat="全部", limit=6, offset=0) {
  return xqRequest.get("/top/playlist", {
    cat,
    limit,
    offset
  })
}

// 获取歌单详情
export function getSongMenuDetail(id) {
  return xqRequest.get("/playlist/detail/dynamic", {
    id
  })
}
