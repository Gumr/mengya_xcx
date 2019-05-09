// pages/share_invite/invite.js
import HabitService from "../../serivce/HabitService";
import { navigate } from "../../utils/router";
const habitService = new HabitService();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		userId: 0,
		habitId: 0,
		inviteInfo: ""
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			userId: options.uid,
			habitId: options.hid
		});
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		habitService
			.getShareGroupHabit(this.data.habitId, this.data.userId)
			.then(data => {
				this.setData({
					inviteInfo: data
				});
			})
			.catch(err => {
				if (err && err.status === 13000) {
					wx.showModal({
						title: "群初始化失败",
						content: "朋友的群初始化失败，赶快联系客服帮忙处理吧。",
						confirmText: "找客服",
						success: res => {
							if (res.confirm) {
								wx.switchTab({
									url: "../mine/mine"
								});
							}
						}
					});
				}
			});
	},
	createHabit: function() {
		if (this.data.userId == 0 || this.data.habitId == 0) {
			wx.showToast({
				title: "邀请已经失效",
				icon: "none",
				duration: 2000
			});
			return;
		}
		habitService
			.joinGroupHabit(this.data.habitId)
			.then(data => {
				wx.showToast({
					title: "加入习惯群成功",
					icon: "success",
					duration: 2000
				});
				wx.switchTab({
					url: "../habit/habit"
				});
			})
			.catch(err => {
				if (err && err.status === 13005) {
					wx.showModal({
						title: "加入失败",
						content:
							"您目前只能添加5个习惯，您可通过连续签到或者开通高级账号功能解除限制",
						confirmText: "去开通",
						success: res => {
							if (res.confirm) {
								navigate({
									path: "pages/vip/index"
								});
							}
						}
					});
				} else {
					wx.showModal({
						title: "加入失败",
						content: err.info || "",
						confirmText: "去首页",
						success: res => {
							if (res.confirm) {
								wx.switchTab({
									url: "../habit/habit"
								});
							}
						}
					});
				}
			});
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {},
	backHome: function() {
		wx.switchTab({
			url: "../create/create"
		});
	}
});
