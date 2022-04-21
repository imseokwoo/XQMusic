// pages/home-music/index.js
import { getBanners } from "../../service/api_music"
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
    swiperImageHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBannerList()
  },

  getBannerList() {
    getBanners().then(res => {
      // setData是同步的还是异步的？
      // setData在设置data数据上，是同步的
      // 通过最新的数据对wxml进行渲染，渲染的过程是异步的
      this.setData({
        bannerList: res.banners
      })

      // react =>this.setState({})=>是异步的
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

  toSearch(e) {
    wx.navigateTo({
      url: '../detail-search/index',
    })
  }
})