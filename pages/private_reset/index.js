// pages/private_setting/index.js
import { navigate } from "../../utils/router";
import UserService from "../../serivce/UserService";

Page({
	data: {
		email: "",
		codeHasSend: false,
		code: ""
	},
	onLoad: function() {
		const app = getApp();
		const { email } = app.getUserInfo();
		this.setData({
			email
		});
	},
	handleFetchCode: function(e) {
		const userService = new UserService();
		userService
			.fetchVerifyCode()
			.then(() => {
				this.setData({
					codeHasSend: true
				});
			})
			.catch(err => {
				console.log(err);
				wx.showModal({
					content: err.info || "获取失败，请稍后尝试"
				});
			});
	},
	handleInputCode: function(e) {
		const { value } = e.detail;
		this.setData({
			code: value
		});
	},
	handleVerifyCode: function() {
		const userService = new UserService();
		userService
			.verifyCode(this.data.code)
			.then(() => {
				navigate({
					path: "pages/private_setting/index",
					params: {
						reset: 1
					}
				});
			})
			.catch(err => {
				wx.showModal({
					content: err.info || "获取失败，请稍后尝试"
				});
			});
	}
});
