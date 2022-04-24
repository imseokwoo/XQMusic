// pages/home-video/index.js
import {getTopMV} from "../../service/api_video"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topMvs: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载(created)
   * async await 异步请求
   * 代码优化
   */

  /* 封装网络请求的方法*/
  getTopMVData: async function(offset) {
    // 判断是否可以请求
    if(!this.data.hasMore && offset !== 0 ) return

    // 展示加载动画
    wx.showNavigationBarLoading()

    // 真正请求数据
    const res = await getTopMV(offset)
    let newData = this.data.topMvs
    if(offset === 0) {
      newData = res.data
    } else {
      newData = newData.concat(res.data)
    }

    // 设置数据
    this.setData({ topMvs: newData })
    this.setData({ hasMore: res.hasMore })

    // 数据获取结束隐藏加载动画
    wx.hideNavigationBarLoading()
    if(offset === 0) {
      wx.stopPullDownRefresh()
    }
  },

  // 封装事件处理的方法
  handleVideoItemClick: function(event) {
    const id = event.currentTarget.dataset.item.id
    // console.log(id)
    // 页面跳转
    wx.navigateTo({
      // url: '../detail-video/index?id=' + id,
      url: `/packageDetail/pages/detail-video/index?id=${id}`
    })
  },

  onLoad: async function (options) {
    this.getTopMVData(0)
  },

   /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function () {
    this.getTopMVData(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    this.getTopMVData(this.data.topMvs.length);
  },
})