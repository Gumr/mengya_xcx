// pages/private_setting/index.js
import SignatureService from "../../serivce/SignatureService";
import { navigate } from "../../utils/router";
const title = {
	error: "密码错误，请重新输入",
	first: "请输入密码",
	disable: "请稍后重新尝试"
};
let timer = null;
Page({
	data: {
		current: 0,
		numbers: ["", "", "", ""],
		value: "",
		title: title.first,
		errorCount: 0,
		second: 60
	},
	handleInput: function(e) {
		if (this.data.errorCount === 5) {
			return;
		}
		const { value } = e.detail;
		this.setData({
			value,
			current: value.length,
			numbers: this.switchInput(value)
		});
		if (value.length === 4) {
			this.handleCheckResult(value);
		}
	},
	switchInput: function(value) {
		return String(value)
			.padEnd(4, " ")
			.split("");
	},
	pswIsCorrect: function(signature, value) {
		const signatureService = new SignatureService();
		return signatureService.checkSignature(signature, value);
	},
	handleCheckResult: function(value) {
		const app = getApp();
		const { private_pwd } = app.getUserInfo();
		if (this.pswIsCorrect(private_pwd, value)) {
			app.unlockApp();
			wx.navigateBack();
		} else {
			console.log(this.data.errorCount);
			if (this.data.errorCount < 4) {
				this.setData({
					current: 0,
					numbers: ["", "", "", ""],
					value: "",
					title: title.error,
					errorCount: this.data.errorCount + 1
				});
			} else {
				this.handleMultiError();
			}
		}
	},
	handleMultiError: function() {
		this.setData({
			title: title.disable,
			errorCount: this.data.errorCount + 1
		});
		timer = setInterval(() => {
			if (this.data.second > 0) {
				this.setData({
					second: this.data.second - 1
				});
			} else {
				clearInterval(timer);
				timer = null;
				this.setData({
					current: 0,
					numbers: ["", "", "", ""],
					value: "",
					title: title.first,
					errorCount: 0,
					second: 60
				});
			}
		}, 1000);
	},
	handleForget: function() {
		navigate({
			path: "pages/private_reset/index"
		});
	}
});
