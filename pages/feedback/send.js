// send.js
import UserService from "../../serivce/UserService";

//页面图片配置

Page({
	data: {
		userInfo: {},
		content: "",
		email: "",
		intputLength: 0
	},

	contentInput: function(e) {
		var value = e.detail.value + "";
		console.log(value.length);
		this.setData({
			content: value,
			intputLength: value.length
		});
	},

	emailInput: function(e) {
		var value = e.detail.value + "";
		this.setData({
			email: value
		});
	},

	onSendFeed: function() {
		if (this.data.content.length <= 0) {
			wx.showToast({
				title: "请填写反馈内容",
				icon: "warn",
				duration: 2000
			});
			return;
		}
		const userService = new UserService();
		userService
			.sendFeedback(this.data.content, this.data.email)
			.then(data => {
				wx.showToast({
					title: "发送成功",
					icon: "success",
					duration: 2000
				});
				setTimeout(function() {
					wx.navigateBack();
				}, 1500);
			})
			.catch(err => {
				wx.showToast({
					title: "发送失败,请重试",
					icon: "warn",
					duration: 2000
				});
			});
	},

	clickHelp() {
		let url = "https://mp.weixin.qq.com/s/VvoJF0ZU-_KFUJGZiCHI2A";
		let title = "使用攻略｜带你解锁【萌芽习惯】打卡新功能";
		wx.navigateTo({
			url: "../direct/direct?url=" + url + "&t=" + title
		});
	},

	officialError: function(errMsg) {
		console.log(errMsg);
	},

	officialOk: function(e) {
		console.log(e);
	},

	onShareAppMessage: function() {
		var app = getApp();
		app.aldstat.sendEvent("用户分享", {
			位置: "发送心情页面",
			按钮: "顶部按钮"
		});
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
	},
	previewImage: function(e) {
		wx.previewImage({
			current:
				"http://xiaeke.oss-cn-shanghai.aliyuncs.com/habit/qun/mengyaqun02.jpg", // 当前显示图片的http链接
			urls: [
				"http://xiaeke.oss-cn-shanghai.aliyuncs.com/habit/qun/mengyaqun02.jpg"
			] // 需要预览的图片http链接列表
		});
	}
});
