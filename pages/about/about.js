// pages/about/about.js
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isShare: 0,
		articleList: [
			{
				url: "https://mp.weixin.qq.com/s/VvoJF0ZU-_KFUJGZiCHI2A",
				title: "使用攻略｜带你解锁【萌芽习惯】打卡新功能",
				time: "置顶-最新"
			},
			{
				url: "https://mp.weixin.qq.com/s/oMtsNJ9cDMhb4501gdrnIw",
				title: "如何建立公众号直接进入萌芽圈子的专属小程序？",
				time: "置顶-2018年10月29日"
			},
			{
				url: "https://mp.weixin.qq.com/s/zKutg6TbohDV5wM8w84nyQ",
				title: "小学问｜为什么你总是3分钟热度？",
				time: "2018年12月09日"
			},
			{
				url: "https://mp.weixin.qq.com/s/B1O2ZYgx13sjZyCGLeoJ6w",
				title: "小学问｜想自律？你连因果关系都弄错了！",
				time: "2018年12月05日"
			},
			{
				url: "https://mp.weixin.qq.com/s/IyBETqb9owmR94G9NmwAig",
				title: "动起来，赶走郁闷",
				time: "2018年11月28日"
			},
			{
				url: "https://mp.weixin.qq.com/s/cQvlNPX23u2g4wbxsBPv5Q",
				title: "你无法做到100%自律，但你可以做到这些",
				time: "2018年11月27日"
			},
			{
				url: "https://mp.weixin.qq.com/s/_mV-dsGE3uAPSoeA3264rA",
				title: "你坚持过哪些有趣的微习惯？",
				time: "2018年11月22日"
			},
			{
				url: "https://mp.weixin.qq.com/s/MlyE1XlD-4iBQcyP0Niz7w",
				title: "谁说免费的东西是最贵的？要不你试试这个？",
				time: "2018年11月01日"
			},
			{
				url: "https://mp.weixin.qq.com/s/YjUPylv2S-0vz80myADsTQ",
				title: "听说，读书与你很配 ｜好习惯大讲堂",
				time: "2018年09月18日"
			},
			{
				url: "https://mp.weixin.qq.com/s/5hGLknHUVq3IrgaUqyB6tA",
				title: "好习惯大讲堂｜给早睡早起找个借口吧！",
				time: "2018年09月06日"
			},
			{
				url: "https://mp.weixin.qq.com/s/MlyE1XlD-4iBQcyP0Niz7w",
				title: "让你一生受益的12个好习惯，你能坚持几个？",
				time: "2018年08月09日"
			}
		]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			isShare: options.share ? options.share : 0
		});
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {},

	onArticle: function(e) {
		let url = e.currentTarget.dataset.url;
		let title = e.currentTarget.dataset.title;
		wx.navigateTo({
			url: "../direct/direct?url=" + url + "&t=" + title
		});
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {},

	backHome: function() {
		wx.switchTab({
			url: "../create/create"
		});
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {
		var app = getApp();
		app.aldstat.sendEvent("用户分享", {
			位置: "使用攻略",
			按钮: "顶部按钮"
		});
		return {
			title: "培养好习惯，一起来吗？",
			path: "/pages/about/about?share=1",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
	}
});
