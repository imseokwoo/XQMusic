import xqRequest from './index'

export function getSongDetail(ids) {
  return xqRequest.get("/song/detail", {
    ids
  })
}

export function getSongLyric(id) {
  return xqRequest.get("/lyric", {
    id
  })
}

