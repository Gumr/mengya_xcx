// pages/userSetting/index.js
import UserService from "../../serivce/UserService";
import HabitService from "../../serivce/HabitService";
const habitService = new HabitService();
Page({
	data: {
		userInfo: {},
		signature: "",
		nickname: "",
		isCanMsg: true
	},
	onShow: function() {
		const userService = new UserService();
		userService
			.getUserInfoFromRemote()
			.then(userInfo => {
				this.setData({
					userInfo,
					signature: userInfo.signature,
					nickname: userInfo.nickname,
					isCanMsg: parseInt(userInfo.can_msg) == 1 ? true : false
				});
			})
			.catch(err => {
				console.log(err);
			});
	},
	nicknameInput: function(e) {
		var value = e.detail.value + "";
		console.log(value.length);
		this.setData({
			nickname: value
		});
	},
	signatureInput: function(e) {
		var value = e.detail.value + "";
		this.setData({
			signature: value
		});
	},
	quitReLogin: function() {
		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
			success(res) {
				const src = res.tempFilePaths[0];

				wx.navigateTo({
					url: `../upload/upload?src=${src}`
				});
			}
		});
	},
	onChangUser: function() {
		if (this.data.nickname.length <= 0) {
			wx.showToast({
				title: "请填写昵称",
				icon: "warn",
				duration: 2000
			});
			return;
		}
		if (this.data.signature.length <= 0) {
			wx.showToast({
				title: "请填写签名",
				icon: "warn",
				duration: 2000
			});
			return;
		}
		const app = getApp();
		const userService = new UserService();
		userService
			.updateUserInfo(this.data.nickname, null, null, this.data.signature)
			.then(userInfo => {
				wx.showToast({
					title: "修改成功",
					icon: "success",
					duration: 2000
				});
				app.updateUserInfo(userInfo);
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
	canMsgChange: function(e) {
		const app = getApp();
		if (e.detail.value) {
			habitService
				.setUserCanMsg(1)
				.then(userInfo => {
					app.updateUserInfo(userInfo);
					wx.showToast({
						title: "打开通知成功",
						icon: "none",
						duration: 2000
					});
				})
				.catch(err => {});
		} else {
			habitService
				.setUserCanMsg(0)
				.then(userInfo => {
					app.updateUserInfo(userInfo);
					wx.showToast({
						title: "关闭通知成功",
						icon: "none",
						duration: 2000
					});
				})
				.catch(err => {});
		}
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
