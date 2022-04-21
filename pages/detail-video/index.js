// pages/detail-video/index.js
import {getMVURL, getMVDetail, getRelatedVideo} from "../../service/api_video"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mvURLInfo: {},
    mvDetial: {},
    relatedVideos: [],
    danmuList: [
      {
        text: "很好听",
        time: 3
      },
      {
        text: "好听！好听",
        time: 3
      },
      {
        text: "好听哇",
        time: 6
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取传入的id
    const id = options.id

    // 请求的具体参数
    this.getPageData(id)
  },

  getPageData: function(id) {
    // 请求视频地址
    getMVURL(id).then(res => {
      this.setData({mvURLInfo: res.data})
      // console.log(res)
    })

    //请求视频详情信息 
    getMVDetail(id).then(res => {
      this.setData({mvDetial: res.data})
    })

    // 请求推荐视频
    getRelatedVideo(id).then(res => {
      this.setData({relatedVideos: res.data})
    })
  }

})