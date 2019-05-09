// pages/private_setting/index.js
import SignatureService from "../../serivce/SignatureService";
import UserService from "../../serivce/UserService";
import { reLaunch } from "../../utils/router";
const title = {
	error: "两次密码不一致，请重新输入",
	second: "请再次输入密码",
	first: "请输入密码",
	email: "设置密保邮箱"
};

const warning = {
	psw: "设置隐私密码后，进入习惯列表需要验证你的身份",
	email: "设置您的密保邮箱，以便找回您的密码"
};
Page({
	data: {
		current: 0,
		numbers: ["", "", "", ""],
		lastInput: "",
		value: "",
		title: title.first,
		showEmail: false,
		warning: warning.psw,
		email: "",
		isValidEmail: false,
		isRetPsw: false,
		resetReady: false
	},
	onLoad: function(options) {
		const { reset } = options;
		if (reset) {
			this.setData({
				isRetPsw: true
			});
		}
	},
	handleInput: function(e) {
		const { value } = e.detail;
		this.setData({
			value,
			current: value.length,
			numbers: this.switchInput(value)
		});
		if (value.length === 4 && !this.data.lastInput) {
			this.setData({
				lastInput: value,
				value: "",
				numbers: ["", "", "", ""],
				title: title.second,
				current: 0
			});
		} else if (value.length === 4 && this.data.lastInput) {
			this.handleResult();
		}
	},
	switchInput: function(value) {
		return String(value)
			.padEnd(4, " ")
			.split("");
	},
	handleResult: function() {
		const { lastInput, value } = this.data;
		if (lastInput === value) {
			this.handlePswCorrect();
		} else {
			this.handlePswWrong();
		}
	},
	handlePswWrong: function() {
		this.setData({
			current: 0,
			numbers: ["", "", "", ""],
			lastInput: "",
			value: "",
			title: title.error
		});
	},
	handlePswCorrect: function() {
		if (this.data.isRetPsw) {
			this.setData({
				resetReady: true
			});
		} else {
			this.setData({
				showEmail: true,
				title: title.email,
				warning: warning.email
			});
		}
	},
	handleResetPsw: function() {
		this.handleSetPsw();
	},
	handleInputEmail: function(e) {
		const { value } = e.detail;
		const emailRegx = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
		// console.log(emailRegx.test(value))
		this.setData({
			email: value,
			isValidEmail: emailRegx.test(value)
		});
	},
	handleConfirm: function() {
		wx.showModal({
			title: "设置邮箱",
			content: `您的邮箱为${this.data.email},请确认是否正确`,
			success: res => {
				if (res.confirm) {
					this.handleSetPsw(this.data.email);
				}
			}
		});
	},
	handleSetPsw: function(email = null) {
		const signService = new SignatureService();
		const userService = new UserService();
		const psw = signService.sign(this.data.value);
		return userService
			.setPravitePsw(psw, email)
			.then(data => {
				userService.app.unlockApp();
				wx.showModal({
					content: "设置隐私密码成功",
					showCancel: false,
					success: res => {
						reLaunch({
							path: "pages/mine/mine"
						});
					}
				});
			})
			.catch(err => {
				wx.showModal({
					content: err.info || "设置隐私密码失败",
					showCancel: false
				});
				this.setData({
					current: 0,
					numbers: ["", "", "", ""],
					lastInput: "",
					value: "",
					title: title.first,
					showEmail: false,
					warning: warning.psw,
					email: "",
					isRetPsw: false,
					resetReady: false
				});
			});
	}
});
