// pages/habitNotice/notice.js
import HabitService from "../../serivce/HabitService";
const habitService = new HabitService();
Page({
	data: {
		habitId: 0,
		notice: ""
	},
	onLoad: function(options) {
		this.setData({
			habitId: options.id
		});
	},
	onShow: function() {
		this.getHabitNotice();
	},
	getHabitNotice: function() {
		habitService
			.getHabitNotice(this.data.habitId)
			.then(data => {
				this.setData({
					notice: data.notice
				});
			})
			.catch(err => {});
	},
	noticeInput: function(e) {
		var value = e.detail.value + "";
		this.setData({
			notice: value
		});
	},
	onChangeNotice: function() {
		if (this.data.notice.length <= 0) {
			wx.showToast({
				title: "请填写公告",
				icon: "warn",
				duration: 2000
			});
			return;
		}
		habitService
			.changeHabitNotice(this.data.habitId, this.data.notice)
			.then(data => {
				wx.showToast({
					title: "修改成功",
					icon: "success",
					duration: 2000
				});
				setTimeout(function() {
					wx.navigateBack();
				}, 1500);
			})
			.catch(err => {
				wx.showToast({
					title: "修改失败,请重试",
					icon: "warn",
					duration: 2000
				});
			});
	},
	onShareAppMessage: function() {
		return {
			title: "我在坚持培养好习惯，期待成长，遇见更好的自己。",
			path: "/pages/habit/habit",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
	}
});
