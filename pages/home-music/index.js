// pages/home-music/index.js
import { rankingStore, rankingMap } from "../../store/index"

import { getBanners, getSongMenu} from "../../service/api_music"
import queryRect from "../../utils/queryRect"
import throttle from "../../utils/throttle"

// 性能优化=>节流函数 throttle(需要节流的函数，时间) 
const throttleQueryRect = throttle(queryRect)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],
    swiperImageHeight: 0,
    recommendSongs: [],
    hotSongMenu: [],
    recommendSongMenu: [],
    rankings: { 0: {}, 2: {}, 3: {} },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPageData()

    // 发起共享数据的网络请求
    rankingStore.dispatch("getRankingDataAction")

    // 获取共享数据
    // 1.排行榜监听
    rankingStore.onState("hotRanking", (res) => {
      if (!res.tracks) return
      const recommendSongs = res.tracks.slice(0, 6)
      this.setData({ recommendSongs })
    })
    rankingStore.onState("newRanking", this.getRankingHandler(0))
    rankingStore.onState("originRanking", this.getRankingHandler(2))
    rankingStore.onState("upRanking", this.getRankingHandler(3))
  },

  getPageData() {
    // 获取轮播图数据
    getBanners().then(res => {
      // setData是同步的还是异步的？
      // setData在设置data数据上，是同步的
      // 通过最新的数据对wxml进行渲染，渲染的过程是异步的
      // react =>this.setState({})=>是异步的
      this.setData({
        bannerList: res.banners
      })
    })

    // 获取热门歌单数据
    getSongMenu().then(res => {
      this.setData({
        hotSongMenu: res.playlists
      })
    })

    // 获取推荐歌单数据
    getSongMenu("华语").then(res => {
      this.setData({
        recommendSongMenu: res.playlists
      })
    })
  },

  handleMoreClick: function() {
    this.navigateToDetailSongsPage("hotRanking")
  },

  handleRankingItemClick: function(event) {
    const idx = event.currentTarget.dataset.idx
    const rankingName = rankingMap[idx]
    this.navigateToDetailSongsPage(rankingName)
  },

  navigateToDetailSongsPage: function(rankingName) {
    wx.navigateTo({
      url: `/packageDetail/pages/detail-songs/index?ranking=${rankingName}&type=rank`,
    })
  },

  toSearch(e) {
    wx.navigateTo({
      url: '../detail-search/index',
    })
  },

  //图片加载完成的函数
  handleImageLoad:function() {
    //queryRect => 选中图片然后获取高度
    // 因为获取的图片很多，只想获取一次图片的高度，使用了节流函数进行优化 => throttleQueryRect
    throttleQueryRect('.swiper-image').then(res => {
      const rect = res[0]
      this.setData({swiperImageHeight: rect.height})
    })
  },

  getRankingHandler: function(idx) {
    return (res) => {
      if (Object.keys(res).length === 0) return
      const name = res.name
      const coverImgUrl = res.coverImgUrl
      const playCount = res.playCount
      const songList = res.tracks.slice(0, 3)
      const rankingObj = {name, coverImgUrl, playCount, songList}
      const newRankings = { ...this.data.rankings, [idx]: rankingObj}
      this.setData({ 
        rankings: newRankings
      })
    }
  }
})