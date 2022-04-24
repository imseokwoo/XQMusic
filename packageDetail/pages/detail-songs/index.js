import { rankingStore, playerStore } from '../../../store/index'
import { getSongMenuDetail } from "../../../service/api_music"

Page({
  data: {
    type: '',
    ranking: "",
    songInfo: {}
  },

  onLoad: function (options) {
    const type = options.type
    this.setData({ type })
    if(type === 'rank') {
      const ranking = options.ranking
      // 1.获取数据
      rankingStore.onState(ranking, this.getRankingDataHanlder)
    } else if( type === 'menu') {
      const id = options.id
      getSongMenuDetail(id).then(res => {
        this.setData({
          songInfo: res.playlist
        })
      })
    }
    
  },

  getRankingDataHanlder: function(res) {
    this.setData({ songInfo: res })
  },

  // 点击跳转到播放页并修改播放歌单和索引
  handleSongItemClick: function(event) {
    const index = event.currentTarget.dataset.index
    playerStore.setState("playListSongs", this.data.songInfo.tracks)
    playerStore.setState("playListIndex", index)
  },

  onUnload: function () {
    if (this.data.ranking) {
      rankingStore.offState(this.data.ranking, this.getRankingDataHanlder)
    }
  }
})