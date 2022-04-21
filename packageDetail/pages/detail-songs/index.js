import { rankingStore } from '../../../store/index'

Page({
  data: {
    ranking: "",
    songInfo: {}
  },

  onLoad: function (options) {
    const ranking = options.ranking

    // 1.获取数据
    rankingStore.onState(ranking, this.getRankingDataHanlder)
  },

  getRankingDataHanlder: function(res) {
    this.setData({ songInfo: res })
  },

  onUnload: function () {
    if (this.data.ranking) {
      rankingStore.offState(this.data.ranking, this.getRankingDataHanlder)
    }
  }
})