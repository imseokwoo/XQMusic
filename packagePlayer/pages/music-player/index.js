// packagePlayer/pages/music-player/index.js
// import { getSongDetail, getSongLyric } from "../../../service/api_player"
// import { parseLyric } from "../../../utils/parse-lyric"
import { audioContext, playerStore } from "../../../store/index"

const playModeNames = ["order", "repeat", "random"]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,  //当前播放页面id
    currentSong: {},  //歌曲详情
    durationTime: 0,  //歌曲总时长
    lyricInfos: [],  //包含歌词文本和时间的数组

    currentTime: 0, //当前播放时长
    currentLyricText: "", //当前歌词文本
    currentLyricIndex: 0, //当前歌词索引,

    playModeIndex: 0, // 0:顺序播放 1:单曲 2:随机
    playModeName: "order", 

    isPlaying: false,  //当前播放状态
    playingName: "pause", //暂停or播放图标


    currentPage: 0,  //0：歌曲 1：歌词
    contentHeight: 0,  //播放页轮播图区域高度
    isMusicLyric: true,  //根据机型判断是否显示歌词
   
    sliderValue: 0,  //滑块的值（整数0-100）
    isSliderChanging: false, //当前滑块是否在滑动
   
    lyricScrollTop: 0, //歌词页面滚动到的位置距离顶部的距离
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 1.获取id
    const id = options.id
    this.setData({ id })

    // 2.根据id请求详情
    // this.getPageData(id)
    this.setupPlayerStoreListener()

    // 3.动态计算轮播图区域高度
    const globalData = getApp().globalData
    const screenHeight = globalData.screenHeight
    const statusBarHeight = globalData.statusBarHeight
    const navBarHeight = globalData.navBarHeight
    const deviceRadio = globalData.deviceRadio
    const contentHeight = screenHeight - statusBarHeight - navBarHeight
    this.setData({ contentHeight, isMusicLyric:  deviceRadio >= 2})

    // // 4.使用audioContext播放歌曲
    // audioContext.stop()
    // audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    // // 自动播放
    // audioContext.autoplay = true

    // 5. audioContext事件监听
    // this.setupAudioContextListener()
  },

  // ========================================事件处理======================================
   // 控制播放模式按钮
   handleModeBtnClick: function() {
    // 计算最新的playModeIndex
    let playModeIndex = this.data.playModeIndex + 1
    if (playModeIndex === 3) playModeIndex = 0

    // 设置playerStore中的playModeIndex
    playerStore.setState("playModeIndex", playModeIndex)
  },

  // 上一首
  handlePrevBtnClick:function() {
    playerStore.dispatch("changeNewMusicAction", false)
  },

  // 下一首
  handleNextBtnClick: function() {
    playerStore.dispatch("changeNewMusicAction")
  },

  // 暂停播放按钮
  handlePlayBtnClick: function() {
    playerStore.dispatch("changeMusicPlayStatusAction", !this.data.isPlaying)
  },

  // 监听滑块值 正在改变 事件处理
  handleSliderChanging: function(event) {
    const value = event.detail.value
    const currentTime = this.data.durationTime * value / 100
    this.setData({ isSliderChanging: true, currentTime })
  },

  // 监听滑块值 改变 事件处理
  handleSliderChange: function(event) {
    // 1.获取slider变化的值
    const value = event.detail.value

    // 2.计算需要播放的currentTIme
    const currentTime = this.data.durationTime * value / 100

    // 3.设置context播放currentTime位置的音乐
    // audioContext.pause()
    audioContext.seek(currentTime / 1000)

    // 4.记录最新的sliderValue, 并且需要讲isSliderChaning设置回false
    this.setData({ sliderValue: value, isSliderChanging: false })
  },

  // 轮播图滑动
  handleSwiperChange: function(event) {
    const current = event.detail.current
    this.setData({ currentPage: current })
  },
 
  // 返回按钮
  handleBackBtnClick:function() {
    wx.navigateBack()
  },

  // ==================================监听数据变化====================================
  handleCurrentMusicListener: function({ currentSong, durationTime, lyricInfos }) {
    if (currentSong) this.setData({ currentSong })
    if (durationTime) this.setData({ durationTime })
    if (lyricInfos) this.setData({ lyricInfos })
  },

  setupPlayerStoreListener: function() {
    // 1.监听currentSong/durationTime/lyricInfos
    playerStore.onStates(["currentSong", "durationTime", "lyricInfos"], this.handleCurrentMusicListener)

    playerStore.onStates(["currentTime", "currentLyricIndex", "currentLyricText"],({
      currentTime,
      currentLyricIndex,
      currentLyricText
    }) => {
      // 时间变化
      if(currentTime && !this.data.isSliderChanging) {
        const sliderValue = currentTime / this.data.durationTime * 100
        this.setData({ currentTime, sliderValue})
      }
      // 歌词变化
      if(currentLyricIndex) {
        this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * 35 })
      }
      if (currentLyricText) {
        this.setData({ currentLyricText })
      }
    })

     // 3.监听播放模式相关的数据
     playerStore.onStates(["playModeIndex", "isPlaying"], ({playModeIndex, isPlaying}) => {
      if (playModeIndex !== undefined) {
        this.setData({ 
          playModeIndex, 
          playModeName: playModeNames[playModeIndex] 
        })
      }

      if (isPlaying !== undefined) {
        this.setData({ 
          isPlaying,
          playingName: isPlaying ? "pause": "resume" 
        })
      }
    })
  },

  
  onUnload: function () {
    playerStore.offStates(["currentSong", "durationTime", "lyricInfos"], this.handleCurrentMusicListener)
  },
})