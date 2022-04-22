// packagePlayer/pages/music-player/index.js
import { getSongDetail, getSongLyric } from "../../../service/api_player"
import { audioContext } from "../../../store/index"
import { parseLyric } from "../../../utils/parse-lyric"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,  //当前播放页面id
    currentSong: {},  //歌曲详情
    currentPage: 0,  //0：歌曲 1：歌词
    contentHeight: 0,  //播放页轮播图区域高度
    isMusicLyric: true,  //根据机型判断是否显示歌词
    durationTime: 0,  //歌曲总时长
    currentTime: 0, //当前播放时长
    sliderValue: 0,  //滑块的值（整数0-100）
    isSliderChanging: false, //当前滑块是否在滑动
    lyricInfos: [],  //包含歌词文本和时间的数组
    currentLyricText: "", //当前歌词文本
    currentLyricIndex: 0, //当前歌词索引,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 1.获取id
    const id = options.id
    this.setData({ id })

    // 2.根据id请求详情
    this.getPageData(id)

    // 3.动态计算轮播图区域高度
    const globalData = getApp().globalData
    const screenHeight = globalData.screenHeight
    const statusBarHeight = globalData.statusBarHeight
    const navBarHeight = globalData.navBarHeight
    const deviceRadio = globalData.deviceRadio
    const contentHeight = screenHeight - statusBarHeight - navBarHeight
    this.setData({ contentHeight, isMusicLyric:  deviceRadio >= 2})

    // 4.使用audioContext播放歌曲
    audioContext.stop()
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    // 自动播放
    audioContext.autoplay = true

    // 5. audioContext事件监听
    this.setupAudioContextListener()
  },
  
  // =================================== 网络请求 =================================
  getPageData: function(id) {
    getSongDetail(id).then(res => {
      this.setData({ currentSong: res.songs[0],  durationTime: res.songs[0].dt})
    })
    getSongLyric(id).then(res => {
      const lyricString = res.lrc.lyric
      const lyrics = parseLyric(lyricString)
      console.log(lyrics)
      this.setData({lyricInfos: lyrics})
    })
  },

  // =================================== audio事件监听 =================================
  setupAudioContextListener: function() {
     // 监听是否音频是否当解码缓存完成
     audioContext.onCanplay(() => {
      // 设置播放
      audioContext.play()
    })
    // 设置现在播放时间
    audioContext.onTimeUpdate(() => {
      // 1.获取当前播放的时长
      const currentTime = audioContext.currentTime * 1000

      // 2.根据当前时间修改currentTime/sliderValue
      if(!this.data.isSliderChanging) {
        const sliderValue = currentTime / this.data.durationTime * 100
        this.setData({ sliderValue, currentTime })
      }  
      // 3. 根据当前播放位置查找对应歌词
      let i = 0;
      for(; i < this.data.lyricInfos.length; i++) {
        const lyricInfo = this.data.lyricInfos[i]
        if(currentTime < lyricInfo.time) {
          break
        }
      }

      // 设置当前索引和歌词内容
      const currentIndex = i - 1
      if(this.data.currentLyricIndex !== currentIndex) {
        const currentLyricInfo = this.data.lyricInfos[currentIndex]
        this.setData({ currentLyricText: currentLyricInfo.text, currentLyricIndex: currentIndex})
      }
    })
  },

  // 监听滑块值 正在改变 事件处理
  handleSliderChanging: function(event) {
    const value = event.detail.value
    const currentTime = this.data.durationTime * value / 100
    this.setData({ isSliderChanging: true, currentTime, sliderValue: value })
  },

  // 监听滑块值 改变 事件处理
  handleSliderChange: function(event) {
    // 1.获取slider变化的值
    const value = event.detail.value

    // 2.计算需要播放的currentTIme
    const currentTime = this.data.durationTime * value / 100

    // 3.设置context播放currentTime位置的音乐
    audioContext.pause()
    audioContext.seek(currentTime / 1000)

    // 4.记录最新的sliderValue, 并且需要讲isSliderChaning设置回false
    this.setData({ sliderValue: value, isSliderChanging: false })
  },
})