import xqRequest from "./index"

export function getBanners() {
  return xqRequest.get("/banner", {
    type: 2
  })
}