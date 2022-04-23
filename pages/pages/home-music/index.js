// pages/home-music/index.js
import { rankingStore, rankingMap, playerStore } from "../../store/index"

import { getBanners, getSongMenu} from "../../service/api_music"
import queryRect from "../../utils/queryRect"
import throttle from "../../utils/throttle"

// 性能优化=>节流函数 throttle(需要节流的函数，时间) 
const throttleQueryRect = throttle(queryRect, 1000, {trailing: true})

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
    currentSong: {},
    isPlaying: false,
    playAnimState: "paused"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 1.网络请求数据
    this.getPageData()

    // 2.发起共享数据的网络请求
    rankingStore.dispatch("getRankingDataAction")

    // 3.从store获取共享的数据
    this.setupPlayerStoreListener()
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
  },

  // 音乐暂停播放按钮
  handlePlayBtnClick: function() {
    playerStore.dispatch("changeMusicPlayStatusAction", !this.data.isPlaying)
  },
  // 点击播放栏跳转到播放页面
  handlePlayBarClick:function() {
    wx.navigateTo({
      url: '/packagePlayer/pages/music-player/index?id=' + this.data.currentSong.id,
    })
  },

  // 推荐歌单点击进入获取播放列表和索引
  handleSongItemClick: function(event) {
    const index= event.currentTarget.dataset.index
    playerStore.setState("playListSongs", this.data.recommendSongs)
    playerStore.setState("playListIndex", index) 
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

  setupPlayerStoreListener: function() {
     // 1.排行榜监听
     rankingStore.onState("hotRanking", (res) => {
      if (!res.tracks) return
      const recommendSongs = res.tracks.slice(0, 6)
      this.setData({ recommendSongs })
    })
    rankingStore.onState("newRanking", this.getRankingHandler(0))
    rankingStore.onState("originRanking", this.getRankingHandler(2))
    rankingStore.onState("upRanking", this.getRankingHandler(3))

    // 2.播放器监听
    playerStore.onStates(["currentSong", "isPlaying"], ({
      currentSong,
      isPlaying
    }) => {
      if(currentSong) this.setData({ currentSong})
      if(isPlaying !== undefined) {
        this.setData({
          isPlaying,
          playAnimState: isPlaying ? "running": "paused" 
        })
      }
    })

  }
})