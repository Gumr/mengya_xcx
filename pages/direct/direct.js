// pages/direct/direct.js
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		url: "",
		title: ""
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			url: options.url,
			title: options.t
		});
		wx.setNavigationBarTitle({
			title: options.t
		});
		// https://mp.weixin.qq.com/s/oMtsNJ9cDMhb4501gdrnIw
	},

	onShareAppMessage: function() {
		var app = getApp();
		app.aldstat.sendEvent("用户分享", {
			位置: "网页文章页面",
			按钮: "顶部按钮"
		});
		return {
			title: "我在培养好习惯，一起来吗？",
			path: "/pages/create/create?type=1",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
	}
});
