// mine.js
import { navigate } from "../../utils/router";
import HabitService from "../../serivce/HabitService";
import UserService from "../../serivce/UserService";
const habitService = new HabitService();
const userService = new UserService();

Page({
	data: {
		isLogin: false,
		userInfo: {},
		showModal: false,
		showEnergy: false,
		recommend: "",
		energy: 0,
		hasUnRead: false
	},

	onShow: function() {
		const app = getApp();
		const isLogin = app.getLoginStatus();
		if (isLogin) {
			userService
				.getUserInfoFromRemote()
				.then(userInfo => {
					this.setData({
						userInfo
					});
				})
				.catch(err => {
					console.log(err);
				});
			this.initMessage();
		}
		this.setData({
			isLogin
		});
		this.getRecommend();
		this.getUserEnergy();
	},

	/**
	 * 初始化是否有消息
	 */
	initMessage: function() {
		userService
			.syncUnReadMsgCount()
			.then(data => {
				this.setData({
					hasUnRead: parseInt(data) > 0
				});
			})
			.catch(err => {
				console.log(err);
			});
	},

	handleLoginSuccess: function(e) {
		const { userInfo } = e.detail;
		this.setData({
			userInfo,
			isLogin: true
		});
		this.initMessage();
		this.getRecommend();
		this.getUserEnergy();
	},

	onShareAppMessage: function(res) {
		var app = getApp();
		app.aldstat.sendEvent("用户分享", {
			位置: "个人页面",
			按钮: res.from === "button" ? "推荐按钮" : "顶部按钮"
		});
		return {
			title: this.data.userInfo.nickname + "邀请你加入萌芽习惯",
			path: "/pages/create/create",
			imageUrl:
				"http://xiaeke.oss-cn-shanghai.aliyuncs.com/habit/qun/group_share.jpg",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
	},

	toUserPage: function(e) {
		wx.navigateTo({
			url: "../userOther/user?id=" + userService.getUserId()
		});
	},

	toFeedback: function(e) {
		wx.navigateTo({
			url: "../feedback/send"
		});
	},

	toAbout: function(e) {
		wx.navigateTo({
			url: "../about/about"
		});
	},

	toDirect: function(e) {
		let url = "https://mp.weixin.qq.com/s/oMtsNJ9cDMhb4501gdrnIw";
		let title = "萌芽圈子直达服务";
		wx.navigateTo({
			url: "../direct/direct?url=" + url + "&t=" + title
		});
		var app = getApp();
		app.aldstat.sendEvent("查看直达服务", {
			页面: "个人中心"
		});
	},

	goMessage: function() {
		wx.navigateTo({
			url: "../message/message"
		});
		var app = getApp();
		app.aldstat.sendEvent("查看消息", {
			是否有消息: this.data.hasUnRead
		});
	},

	editUser: function() {
		wx.navigateTo({
			url: "../userSetting/index"
		});
	},

	toRelation: function(e) {
		this.setData({
			showModal: true
		});
	},

	toBuyVIP: function(e) {
		const { vip, private_pwd } = this.data.userInfo;
		if (vip & 1) {
			navigate({
				path: "pages/vip_features/index",
				params: {
					hasSetPrivate: private_pwd && private_pwd.length > 16 ? 1 : 0
				}
			});
		} else {
			navigate({
				path: "pages/vip/index",
				params: {
					vip
				}
			});
		}
		var app = getApp();
		app.aldstat.sendEvent("点击高级账户", {
			已经vip: vip,
			用户名: this.data.userInfo.nickname
		});
	},

	preventTouchMove: function() {},

	/**
	 * 隐藏模态对话框
	 */
	hideModal: function() {
		this.setData({
			showModal: false
		});
	},

	/**
	 * 对话框确认按钮点击事件
	 */
	onConfirm: function() {
		wx.setClipboardData({
			data: "wx496e9bad2411496f",
			success: function(res) {
				wx.showToast({
					title: "复制成功！",
					icon: "success",
					duration: 1500
				});
			}
		});
		this.hideModal();
	},

	getRecommend: function() {
		userService
			.getUserRecommendMina()
			.then(data => {
				this.setData({
					recommend: data
				});
			})
			.catch(err => {
				console.log(err);
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

	energyDesc: function() {
		this.setData({
			showEnergy: true
		});
	},

	hideEnergy: function() {
		this.setData({
			showEnergy: false
		});
	}
});
