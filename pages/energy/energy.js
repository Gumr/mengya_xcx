// pages/energy/energy.js
import UserService from "../../serivce/UserService";
import HabitService from "../../serivce/HabitService";
const userService = new UserService();
const habitService = new HabitService();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		smallAni: "",
		sayingAni: "",
		waterAni: "",
		userId: 0,
		habitId: 0,
		habitName: "",
		userUrl: "",
		isShare: 0,
		showHome: 0,
		sayText: [
			"一分耕耘一分收获\n打卡我就一天天长大",
			"分享给朋友赐能量\n能量可以用来补打卡",
			"积累到180g总能量\n可以用来兑换高级账户",
			"成长的孤独与开心\n我可以陪在你的身边"
		],
		sayingIndex: 0,
		energy: 0,
		checkNum: 0,
		treeUrl: "",
		showEnergy: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		let userInfo = habitService.getUserInfo();
		let ownShare = options.s;
		if (userInfo && userInfo.id > 0 && userInfo.id == options.u) {
			//已经登陆
			ownShare = 0;
		}
		this.setData({
			userId: options.u,
			habitId: options.h,
			isShare: ownShare,
			showHome: options.s
		});
	},

	onShow: function() {
		this.getUserEnergy();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {
		var systemInfo = wx.getSystemInfoSync();
		let animation = wx.createAnimation();
		animation
			.translateX(systemInfo.windowWidth)
			.step({
				duration: 70000
			})
			.translateX(0)
			.step({
				duration: 80000
			});
		this.setData({
			smallAni: animation.export()
		});
		var that = this;
		setInterval(
			function() {
				//动画的脚本定义必须每次都重新生成，不能放在循环外
				animation
					.translateX(systemInfo.windowWidth)
					.step({
						duration: 70000
					})
					.translateX(0)
					.step({
						duration: 80000
					});
				// 更新数据
				that.setData({
					smallAni: animation.export()
				});
			}.bind(that),
			150000
		);

		setInterval(() => {
			let sayAni = wx.createAnimation();
			sayAni.scale(1, 1).step({
				duration: 300
			});
			this.setData({
				sayingIndex:
					this.data.sayingIndex >= this.data.sayText.length - 1
						? 0
						: this.data.sayingIndex + 1,
				sayingAni: sayAni.export()
			});
			this.sayingTime();
		}, 12000);

		this.sayingTime();
	},

	sayingTime() {
		setTimeout(() => {
			let sayAni = wx.createAnimation();
			sayAni.scale(0, 0).step({
				duration: 300
			});
			this.setData({
				sayingAni: sayAni.export()
			});
		}, 4000);
	},

	getUserEnergy() {
		userService
			.getUserEnergyById(this.data.userId)
			.then(data => {
				console.log(data);
				this.setData({
					energy: data[0].total == null ? 0 : data[0].total
				});
			})
			.catch(err => {
				console.log(err);
			});

		habitService
			.getHabitTree(this.data.habitId, this.data.userId)
			.then(data => {
				console.log(data);
				this.setData({
					checkNum: data.checkNum,
					treeUrl: data.tree,
					userUrl: data.avatar_small,
					habitName: data.habitName
				});
				wx.setNavigationBarTitle({
					title: data.habitName + "能量树"
				});
			})
			.catch(err => {
				console.log(err);
				if (err && err.status === 13000) {
					wx.showModal({
						title: "萌芽习惯提示",
						content: err.info,
						showCancel: false,
						success: res => {
							wx.switchTab({
								url: "../create/create"
							});
						},
						confirmText: "去首页"
					});
				}
			});
	},
	onShareAppMessage: function(res) {
		var app = getApp();
		if (res.from === "button") {
			app.aldstat.sendEvent("用户分享", {
				位置: "能量树页面",
				按钮: "页面按钮"
			});
		} else {
			app.aldstat.sendEvent("用户分享", {
				位置: "能量树页面",
				按钮: "顶部按钮"
			});
		}
		return {
			title:
				"我在培养「" + this.data.habitName + "」习惯，赐我一点点能量好吗？",
			path:
				"/pages/energy/energy?h=" +
				this.data.habitId +
				"&u=" +
				this.data.userId +
				"&s=1",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
	},
	backHome: function() {
		wx.switchTab({
			url: "../create/create"
		});
	},
	wateringFriend() {
		userService
			.giveUserEnergy(this.data.userId, this.data.habitId)
			.then(data => {
				console.log(data);
				this.setData({
					energy: parseInt(this.data.energy) + 1
				});
				wx.showToast({
					title: "好友能量+1g",
					icon: "none",
					duration: 2000
				});
				let animation = wx.createAnimation();
				animation
					.rotate(-30)
					.step({
						duration: 300
					})
					.rotate(0)
					.step({
						duration: 300
					})
					.rotate(-30)
					.step({
						duration: 300
					})
					.rotate(0)
					.step({
						duration: 300
					});
				this.setData({
					waterAni: animation.export()
				});
				setTimeout(() => {
					wx.showModal({
						title: "萌芽习惯提示",
						content: "能量好友能量+1g，谢谢你。要种植属于自己的能量树吗？",
						success: res => {
							if (res.confirm) {
								wx.switchTab({
									url: "../create/create"
								});
							} else if (res.cancel) {
								console.log("用户点击取消");
							}
						},
						confirmText: "去种植"
					});
				}, 1200);
			})
			.catch(err => {
				console.log(err);
				if (err && err.status === 13000) {
					wx.showModal({
						title: "萌芽习惯提示",
						content: err.info,
						success: res => {
							if (res.confirm) {
								wx.switchTab({
									url: "../create/create"
								});
							} else if (res.cancel) {
								console.log("用户点击取消");
							}
						},
						confirmText: "去首页"
					});
				}
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
