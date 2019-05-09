//习惯列表
import HabitService from "../../serivce/HabitService";
import UserService from "../../serivce/UserService";
import { navigate } from "../../utils/router";
const habitService = new HabitService();

Page({
	data: {
		habitList: null,
		delBtnWidth: 160,
		isLogin: false
	},

	onShow() {
		const app = getApp();
		const isLogined = app.getLoginStatus();
		if (isLogined) {
			this.setData({
				isLogin: true
			});
			this.loadHabits();
			const userService = new UserService();
			userService.syncUnReadMsgCount();
		} else {
			this.setData({
				habitList: [],
				isLogin: false
			});
			wx.hideLoading();
		}
	},

	onLoad() {
		this.initEleWidth();
		wx.showLoading({
			title: ""
		});
		var app = getApp();
		app.aldstat.sendEvent("版本号", {
			当前版本: 182
		});
	},

	/**
	 * 下拉刷新习惯列表
	 */
	onPullDownRefresh() {
		this.loadHabits();
	},

	/**
	 * 跳转至搜索习惯的页
	 */
	goSearchHabitPage() {
		navigate({
			path: "pages/searchHabit/search"
		});
		var app = getApp();
		app.aldstat.sendEvent("点击个人习惯", {
			页面: "习惯页面"
		});
	},

	/**
	 * 跳转至打卡圈子创建的页面
	 */
	goGroupHabitPage() {
		navigate({
			path: "pages/createFt/create?home=1"
		});
		var app = getApp();
		app.aldstat.sendEvent("点击打卡圈子", {
			页面: "习惯页面"
		});
	},

	/**
	 * 跳转至发现页面
	 */
	toCreate(e) {
		wx.switchTab({
			url: "../create/create"
		});
	},

	/**
	 * 跳转至签到记录页面
	 */
	toCheck(e) {
		const id = e.currentTarget.dataset.id;
		const name = e.currentTarget.dataset.name;
		const habitType = e.currentTarget.dataset.type;
		wx.navigateTo({
			url:
				(habitType == 0 ? "../check/check?id=" : "../checkFt/check?id=") +
				id +
				"&name=" +
				name +
				"&type=" +
				habitType
		});
	},

	/**
	 * 滑动条目开始
	 */
	touchS(e) {
		if (e.touches.length == 1) {
			this.setData({
				//设置触摸起始点水平方向位置
				startX: e.touches[0].clientX,
				startY: e.touches[0].clientY
			});
		}
	},

	/**
	 * 滑动条目移动
	 */
	touchM(e) {
		if (e.touches.length == 1) {
			//手指移动时水平方向位置
			let moveX = e.touches[0].clientX;
			let moveY = e.touches[0].clientY;
			//手指起始点位置与移动期间的差值
			let disX = this.data.startX - moveX;
			let disY = this.data.startY - moveY;
			let delBtnWidth = this.data.delBtnWidth;
			let txtStyle = "";
			if (disY > 35 || disY < -35) {
				txtStyle = "right:-" + delBtnWidth + "px";
			} else {
				if (disX == 0 || disX < 35) {
					//如果移动距离小于等于0，文本层位置不变
					txtStyle = "right:-" + delBtnWidth + "px";
				} else if (disX > 35) {
					//移动距离大于0，文本层left值等于手指移动距离
					txtStyle = "right:-" + parseInt(delBtnWidth - disX + 35) + "px";
					if (disX >= delBtnWidth) {
						//控制手指移动距离最大值为删除按钮的宽度
						txtStyle = "right:0px";
					}
				}
			}
			//获取手指触摸的是哪一项
			const index = e.currentTarget.dataset.index;
			let listStyle = "habitList[" + index + "].txtStyle";
			//更新列表的状态
			this.setData({
				[listStyle]: txtStyle
			});
		}
	},

	/**
	 * 滑动条目结束
	 */
	touchE(e) {
		if (e.changedTouches.length == 1) {
			//手指移动结束后水平位置
			let endX = e.changedTouches[0].clientX;
			//触摸开始与结束，手指移动的距离
			let disX = this.data.startX - endX;
			let endY = e.changedTouches[0].clientY;
			//手指起始点位置与移动期间的差值
			let disY = this.data.startY - endY;

			let delBtnWidth = this.data.delBtnWidth;
			let txtStyle = "";
			//如果距离小于删除按钮的2/3，不显示删除按钮
			if (disY > 35 || disY < -35) {
				txtStyle = "right:-" + delBtnWidth + "px";
			} else {
				txtStyle =
					disX > delBtnWidth * 2 / 3
						? "right:0px"
						: "right:-" + delBtnWidth + "px";
			}

			//获取手指触摸的是哪一项
			const index = e.currentTarget.dataset.index;
			let listStyle = "habitList[" + index + "].txtStyle";
			//更新列表的状态
			this.setData({
				[listStyle]: txtStyle
			});
		}
	},

	/**
	 * 计算页面宽度，用于左滑计算
	 */
	initEleWidth() {
		try {
			let res = wx.getSystemInfoSync().windowWidth;
			let scale = 750 / 2 / (this.data.delBtnWidth / 2); //以宽度750px设计稿做宽度的自适应
			let delBtnWidth = Math.floor(res / scale); //获取元素自适应后的实际宽度
			this.setData({
				delBtnWidth
			});
		} catch (e) {
			return false;
		}
	},

	/**
	 * 点击管理按钮事件
	 * 删除习惯、排序习惯、修改习惯图标
	 */
	manageHabit(e) {
		const habitId = e.currentTarget.dataset.id;
		const name = e.currentTarget.dataset.name;
		const day = e.currentTarget.dataset.day;
		let _this = this;
		wx.showActionSheet({
			itemList: ["删除习惯", " 归档习惯", "排序习惯", "修改习惯图标"],
			success(res) {
				if (res.tapIndex == 0) {
					wx.showModal({
						title: "删除习惯",
						content: "删除习惯后，该习惯的历史记录会被清空，您确定删除？",
						success: res => {
							if (res.cancel) {
								_this.handleDeleteHabit(habitId);
							} else if (res.confirm) {
								console.log("用户点击取消");
							}
						},
						cancelColor: "#ea2000",
						cancelText: "删除",
						confirmText: "取消",
						confirmColor: "#666666"
					});
				} else if (res.tapIndex == 1) {
					_this.handleStoreHabit(habitId);
				} else if (res.tapIndex == 2) {
					wx.navigateTo({
						url:
							"../habitSort/index?id=" +
							habitId +
							"&name=" +
							name +
							"&day=" +
							day
					});
				} else if (res.tapIndex == 3) {
					wx.navigateTo({
						url:
							"../changeIcon/change?id=" +
							habitId +
							"&name=" +
							name +
							"&day=" +
							day
					});
				}
			},
			fail(res) {}
		});
	},

	/**
	 * 点击删除习惯事件
	 */
	handleDeleteHabit(habitId) {
		habitService
			.deleteHabit(habitId)
			.then(data => {
				wx.showToast({
					title: "删除成功！",
					icon: "success",
					duration: 2000
				});
				const list = this.data.habitList.filter(item => item.id !== habitId);
				this.setData({
					habitList: list
				});
				const app = getApp();
				app.globalData.habitList = list;
			})
			.catch(err => {
				wx.showToast({
					title: "删除失败！",
					icon: "success",
					duration: 2000
				});
			});
	},

	/**
	 * 点击删除习惯事件
	 */
	handleStoreHabit(habitId) {
		habitService
			.storeHabit(habitId)
			.then(data => {
				wx.showToast({
					title: "归档成功，可在个人主页恢复！",
					icon: "none",
					duration: 2000
				});
				const list = this.data.habitList.filter(item => item.id !== habitId);
				this.setData({
					habitList: list
				});
				const app = getApp();
				app.globalData.habitList = list;
			})
			.catch(err => {
				wx.showToast({
					title: "归档失败！",
					icon: "fail",
					duration: 2000
				});
			});
	},

	/**
	 * 获取习惯列表
	 */
	loadHabits() {
		habitService
			.getHabits()
			.then(data => {
				if (data.length > 0) {
					const habitList = data.map(habit => {
						habit.join_days =
							habit.join_days == null ? 1 : parseInt(habit.join_days) + 1;
						habit.txtStyle = "";
						//习惯排序排序,打卡的排后面
						if (habit.check_today == 0) {
							habit.sort = habit.sort + 10000;
						}
						return habit;
					});

					//习惯排序排序
					habitList.sort((habit1, habit2) => {
						return habit1.sort - habit2.sort;
					});

					const app = getApp();
					app.globalData.habitList = habitList;
					this.setData({
						habitList
					});
				} else {
					this.setData({
						habitList: []
					});
				}
				wx.stopPullDownRefresh();
				wx.hideLoading();
			})
			.catch(err => {
				this.setData({
					habitList: ""
				});
				wx.stopPullDownRefresh();
				wx.hideLoading();
			});
	},

	onShareAppMessage(res) {
		var app = getApp();
		app.aldstat.sendEvent("用户分享", {
			位置: "习惯列表",
			按钮: "顶部"
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
	}
});
