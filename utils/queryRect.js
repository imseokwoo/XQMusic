export default function (selector) {
  return new Promise((resolve) => {
    const query = wx.createSelectorQuery()
    query.select(selector).boundingClientRect()
    // query.selectViewport().scrollOffset()
    // query.exec(resolve)  => 最简便的写法
    query.exec(function(res){
      resolve(res)
    })
  })
}