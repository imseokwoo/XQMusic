import { HYEventStore } from 'hy-event-store'
import { getSongDetail, getSongLyric } from '../service/api_player'
import { parseLyric } from '../utils/parse-lyric'

// const audioContext = wx.createInnerAudioContext()
// 小程序前台createInnerAudioContext和后台getBackgroundAudioManager播放功能都要能使用，直接采用后台播放API
// 使用后台播放API，有三个必须设置的属性，1.src 2.title 3.App.json文件中 "requiredBackgroundModes": ["audio"],
const audioContext = wx.getBackgroundAudioManager()

const playerStore = new HYEventStore({
  state: {
    isFirstPlay: true, //是否是第一次播放
    isStoping: false, //后台播放是否是停止状态
    id: 0,
    currentSong: {},
    durationTime: 0,
    lyricInfos: [],

    currentTime: 0, //当前播放时长
    currentLyricText: "", //当前歌词文本
    currentLyricIndex: 0, //当前歌词索引,

    playModeIndex: 0, // 0: 循环播放 1: 单曲循环 2: 随机播放
    isPlaying: false, //当前播放状态

    playListSongs: [], //播放歌单
    playListIndex: 0, //播放歌单中播放歌曲索引
  },
  actions: {
    // 音乐播放
    playMusicWithSongIdAction(ctx, { id, isRefresh = false }) {
      if(ctx.id == id && !isRefresh) {
        this.dispatch("changeMusicPlayStatusAction", true)
        return
      }
      ctx.id = id

      // 0.修改播放的状态
      ctx.isPlaying = true
      ctx.currentSong = {}
      ctx.durationTime = 0
      ctx.lyricInfos = []
      ctx.currentTime = 0
      ctx.currentLyricIndex = 0
      ctx.currentLyricText = ""

      // 1.根据id请求数据
      // 1.1请求歌曲详情
      getSongDetail(id).then(res => {
        ctx.currentSong = res.songs[0]
        ctx.durationTime = res.songs[0].dt
        audioContext.title = res.songs[0].name
      })
      // 1.2请求歌词数据
      getSongLyric(id).then(res => {
        const lyricString = res.lrc.lyric
        const lyrics = parseLyric(lyricString)
        ctx.lyricInfos = lyrics
      })

      // 2.使用audioContext播放歌曲
      audioContext.stop()
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
      audioContext.title = id
      // 自动播放
      audioContext.autoplay = true

      // 3.监听数据变化
      if(ctx.isFirstPlay) {
        // 当音乐是第一次播放时才去监听
        this.dispatch("setupAudioContextListenerAction")
        ctx.isFirstPlay = false
      }
    },
    setupAudioContextListenerAction(ctx) {
      // 1.监听是否音频是否当解码缓存完成
      audioContext.onCanplay(() => {
        // 设置播放
        audioContext.play()
      })

      // 2.监听当前播放时间变化
      audioContext.onTimeUpdate(() => {
        // 1.获取当前播放的时长
        const currentTime = audioContext.currentTime * 1000

        // 2.根据当前时间修改currentTime
        ctx.currentTime = currentTime

        // 3. 根据当前播放位置查找对应歌词
        if(!ctx.lyricInfos.length) return
        let i = 0;
        for(; i < ctx.lyricInfos.length; i++) {
          const lyricInfo = ctx.lyricInfos[i]
          if(currentTime < lyricInfo.time) {
            break
          }
        }

        // 设置当前索引和歌词内容
        const currentIndex = i - 1
        if(ctx.currentLyricIndex !== currentIndex) {
          const currentLyricInfo = ctx.lyricInfos[currentIndex]
          ctx.currentLyricIndex = currentIndex
          ctx.currentLyricText = currentLyricInfo.text
        }
      })
       //3. 监听播放完成时自动播放下一首
      audioContext.onEnded(() => {
        this.dispatch("changeNewMusicAction")
      })

      // 4.监听切换后台时音乐暂停播放
      // 播放状态
      audioContext.onPlay(() => {
        ctx.isPlaying = true
      })
      // 暂停状态
      audioContext.onPause(() => {
        ctx.isPlaying = false
      })
      // 监听背景音频停止状态
      audioContext.onStop(() => {
        ctx.isPlaying = false
        ctx.isStoping = true
      })

  },

    // 监听播放状态
    changeMusicPlayStatusAction(ctx, isPlaying = true) {
      ctx.isPlaying = isPlaying
      if(ctx.isPlaying && ctx.isStoping) {
        audioContext.src = `https://music.163.com/song/media/outer/url?id=${ctx.id}.mp3`
        audioContext.title = currentSong.name
      }
      ctx.isPlaying ? audioContext.play() : audioContext.pause()

      if (ctx.isStoping) {
        audioContext.seek(ctx.currentTime)
        ctx.isStoping = false
      }
    },

    // 上一首下一首
    changeNewMusicAction(ctx, isNext = true) {
      // isNext：true下一首， false上一首
      // 1.获取当前索引
      let index = ctx.playListIndex

      // 2.根据不同的播放模式, 获取下一首歌的索引
      switch(ctx.playModeIndex) {
        case 0:  //顺序播放
          index = isNext ? index + 1 : index - 1
          // 当index为-1此时播放歌曲为歌单第一首，再次点击上一首则播放歌单最后一首
          if(index === -1) index = ctx. playListSongs.length - 1
          // 当索引为歌单最后一首，下一首为歌单第一首
          if(index === ctx. playListSongs.length) index = 0
          break
        case 1: //单曲循环
          break
        case 2:  //随机播放
          //Math.floor向下取整（5.98984 -》 5） 
          index = Math.floor(Math.random() * ctx.playListSongs.length)
          break
      }

      // 3.获得歌曲
      let currentSong = ctx.playListSongs[index]
      if(!currentSong) {
        currentSong = ctx.currentSong
      } else {
        // 记录最新的索引
        ctx.playListIndex = index
      }

      // 4.播放新的歌曲
      this.dispatch("playMusicWithSongIdAction", { id: currentSong.id, isRefresh: true })
    }
  }
})

export {
  audioContext,
  playerStore
}
