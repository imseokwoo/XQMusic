import xqRequest from "./index"

export function getSearchHot() {
  return xqRequest.get("/search/hot")
}

export function getSearchSuggest(keywords) {
  return xqRequest.get("/search/suggest", {
    keywords,
    type: "mobile"
  })
}

export function getSearchResult(keywords) {
  return xqRequest.get("/search", {
    keywords
  })
}