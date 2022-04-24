// pages/detail-search/index.js
import { getSearchHot, getSearchSuggest, getSearchResult } from "../../../service/api_search"
import debounce from "../../../utils/debounce"
import stringToNodes from "../../../utils/string2nodes"

const debounceGetSearchSuggest = debounce(getSearchSuggest, 300)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotKeywords: [],
    searchValue: "",
    suggestSongs: [],
    suggestSongsNodes: [],
    resultSongs: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPageData()
  },
  getPageData: function() {
    // 获取热门搜索
    getSearchHot().then (res => {
      this.setData({ hotKeywords: res.result.hots})
    })
  },
  handleSearchChange: function(event) {
    // 1.获取输入框中的关键字
    const searchValue = event.detail
    this.setData({ searchValue })

    // 2.当关键字为空时的逻辑处理
    if(!searchValue.length) {
      this.setData({ suggestSongs: [], resultSongs: []})
      // 当输入之后又删除-》关键字为空,此时不用发送数据请求，调用防抖的cancel方法
      debounceGetSearchSuggest.cancel()
      return
    }

    // 3.根据关键字从接口获取搜索数据
    debounceGetSearchSuggest(searchValue).then(res => {
      // 当把输入的关键词清空，要绑定的是data里的searchValue
      // 而不是上一次的searchValue，因为，此时的防抖函数是个闭包，取得值是上次的
      // if (!this.data.searchValue.length) {
      //   console.log("searchValue没有值")
      //   return
      // }

      // 3.1 获取建议的关键字歌曲
      const suggestSongs = res.result.allMatch
      this.setData({ suggestSongs})
      if(!suggestSongs) return

       // 3.2 转成nodes节点
       const suggestKeywords = suggestSongs.map(item => item.keyword)
       const suggestSongsNodes = []
       for (const keyword of suggestKeywords) {
         const nodes = stringToNodes(keyword, searchValue)
         suggestSongsNodes.push(nodes)
       }
       this.setData({ suggestSongsNodes })
    })
  },
  handleSearchAction: function() {
    const searchValue = this.data.searchValue
    getSearchResult(searchValue).then(res => {
      this.setData({ resultSongs: res.result.songs })
    })
  },

  handleKeywordItemClick: function(event) {
    // 1.输入之后返回的搜索结果中，点击之后获取到的关键字
    const keyword = event.currentTarget.dataset.keyword
 
    // 2.将关键字赋值给searchValue
    this.setData({ searchValue: keyword})

    // 3.触发搜索
    this.handleSearchAction()
  }
})