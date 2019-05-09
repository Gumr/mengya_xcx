// pages/vip/index.js
import UserService from "../../serivce/UserService";
import { navigate, redirect } from "../../utils/router";
const userService = new UserService();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		fee: 18,
		isVIP: false,
		energy: 0,
		groupCount: 0,
		isIos: false
	},
	onLoad: function(options) {
		this.setData({
			isVIP: options.vip & 1
		});
		this.getUserEnergy();
		this.getFreeGroup();
		this.setData({
			isIos: getApp().isIos
		});
	},
	getUserEnergy() {
		userService
			.getUserEnergy()
			.then(data => {
				this.setData({
					energy: data[0].total == null ? 0 : data[0].total
				});
			})
			.catch(err => {
				console.log(err);
			});
	},
	getFreeGroup() {
		userService
			.getFreeGroupCount()
			.then(data => {
				console.log(data);
				this.setData({
					groupCount: data
				});
			})
			.catch(err => {
				console.log(err);
			});
	},
	handleOpenMethod: function() {
		wx.showModal({
			title: "免费开通攻略",
			content:
				"坚持培养好习惯打卡，收集180g能量就可以免费开通！五个习惯大概坚持18天，加油哦",
			confirmText: "明白",
			showCancel: false,
			complete: () => {}
		});
	},
	handleOpenVIP: function() {
		userService
			.openVip()
			.then(this.handlePayment)
			.then(this.handlePaySuccess.bind(this))
			.catch(err => {
				this.handleError(err);
			});
		var app = getApp();
		app.aldstat.sendEvent("购买高级功能", {
			是否免费: "否",
			用户id: userService.getUserId()
		});
	},
	handleFreeVIP: function() {
		userService
			.freeOpenVip()
			.then(data => {
				this.setData({
					isVIP: true
				});
				wx.showModal({
					title: "开通成功",
					content: "恭喜您，您已经开通萌芽习惯高级账号，赶快去体验吧！",
					confirmText: "马上去",
					showCancel: false,
					complete: () => {
						redirect({
							path: "pages/vip_features/index"
						});
					}
				});
			})
			.catch(err => {
				this.handleError(err);
			});
		var app = getApp();
		app.aldstat.sendEvent("购买高级功能", {
			是否免费: "是",
			用户id: userService.getUserId()
		});
	},
	handleError: function(err) {
		if (err && err.status === 13001) {
			this.setData({
				isVIP: true
			});
			wx.showModal({
				title: "",
				content: err.info,
				confirmText: "知道了",
				showCancel: false
			});
		} else {
			wx.showModal({
				title: "",
				content: err.info || "支付失败",
				confirmText: "知道了",
				showCancel: false
			});
		}
	},
	handlePayment: function(data) {
		return new Promise((resolve, reject) => {
			wx.requestPayment({
				timeStamp: data.timeStamp,
				nonceStr: data.nonceStr,
				package: data.package,
				signType: "MD5",
				paySign: data.paySign,
				success: res => {
					resolve(data.out_trade_no);
				},
				fail: function(res) {
					console.log(res);
					reject({
						info: "支付请求失败"
					});
				}
			});
		});
	},
	handlePaySuccess: function(out_trade_no) {
		return userService.paySuccess(out_trade_no).then(data => {
			this.setData({
				isVIP: true
			});
			wx.showModal({
				title: "开通成功",
				content: "恭喜您，您已经开通萌芽习惯高级账号，赶快去体验吧！",
				confirmText: "马上去",
				showCancel: false,
				complete: () => {
					redirect({
						path: "pages/vip_features/index"
					});
				}
			});
			var app = getApp();
			app.aldstat.sendEvent("支付高级功能", {
				是否免费: "否",
				用户id: userService.getUserId()
			});
		});
	},

	switchPrivate: function(e) {
		const { value } = e.detail;
		if (value) {
			navigate({
				path: "pages/private_setting/index"
			});
		} else {
			wx.showModal({
				title: "提示",
				content: "确定取消隐私密码？",
				success: res => {
					if (res.confirm) {
						redirect({
							path: "pages/cancel_private/index"
						});
					} else {
						this.setData({
							hasSetPrivate: true
						});
					}
				}
			});
		}
	}
});
