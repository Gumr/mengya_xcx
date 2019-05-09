// pages/create/searchHabit/search.js
import HabitService from "../../serivce/HabitService";
import { navigate } from "../../utils/router";
const habitService = new HabitService();
import PushService from "../../serivce/PushService";
const pushService = new PushService();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		input: "",
		isCreated: false,
		result: "",
		recommendList: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.recommendHabit();
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage(res) {
		if (res.from === "button") {
			// 来自页面内转发按钮
			console.log(res.target);
		}
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
	inputChangeHandle: function(e) {
		this.setData({ input: e.detail.value });
		this.searchHabit();
		this.recommendHabit();
	},
	inputCompleteHandle: function(e) {
		if (!this.data.input || !this.data.input.trim()) return;
		this.searchHabit();
	},
	createHabit: function() {
		habitService
			.createHabit(this.data.result)
			.then(data => {
				wx.showToast({
					title: "加入习惯成功",
					icon: "success",
					duration: 2000
				});
				this.setData({
					result: "",
					input: "",
					isCreate: false
				});
			})
			.catch(err => {
				this.setData({
					result: this.data.input,
					isCreate: false
				});
				if (err && err.status === 13005) {
					wx.showModal({
						title: "创建失败",
						content:
							"您目前只能添加5个习惯，您可通过连续签到或者开通高级账号功能解除限制",
						confirmText: "去开通",
						success: res => {
							if (res.confirm) {
								navigate({
									path: "pages/vip/index"
								});
							}
						}
					});
				} else {
					wx.showToast({
						title: err.info || "",
						icon: "fail",
						duration: 2000
					});
				}
			});
	},
	searchHabit: function() {
		habitService
			.searchHabit(this.data.input)
			.then(data => {
				this.setData({
					result: this.data.input,
					isCreated: true
				});
			})
			.catch(err => {
				this.setData({
					result: this.data.input,
					isCreated: false
				});
			});
	},

	recommendHabit: function() {
		habitService
			.getRecommendHabitBySearch(this.data.input)
			.then(data => this.filterRecommend(data))
			.then(data => {
				this.setData({
					recommendList: data
				});
				wx.stopPullDownRefresh();
			})
			.catch(err => {
				console.log(err);
				wx.stopPullDownRefresh();
			});
	},

	filterRecommend(recommendList) {
		const { habitList } = getApp().globalData;
		return recommendList.filter(
			item => !habitList.some(habit => habit.id === item.habit_id)
		);
	},
	clickHabit: function(e) {
		const habitId = e.currentTarget.dataset.habitid;
		wx.navigateTo({
			url: "../mindFeed/feed?id=" + habitId
		});
	},
	clickJoin: function(e) {
		const name = e.detail.payload;
		const habitType = e.currentTarget.dataset.type;
		const habitId = e.currentTarget.dataset.habitid;
		if (habitType == 2) {
			habitService
				.joinGroupHabit(habitId)
				.then(data => {
					const recommendList = this.data.recommendList.filter(
						item => item.habit_id !== data.habit_id
					);
					this.setData({
						recommendList
					});
					wx.showToast({
						title: "加入习惯群成功",
						icon: "success",
						duration: 2000
					});
				})
				.catch(err => {
					if (err && err.status === 13005) {
						wx.showModal({
							title: "添加失败",
							content:
								"您目前只能添加5个习惯，您可通过连续签到或者开通高级账号功能解除限制",
							confirmText: "去开通",
							success: res => {
								if (res.confirm) {
									navigate({
										path: "pages/vip/index"
									});
								}
							}
						});
					} else {
						wx.showToast({
							title: err.info || "加入失败",
							icon: "fail",
							duration: 2000
						});
					}
				});
			return;
		}

		habitService
			.joinHabit(habitId)
			.then(data => {
				const recommendList = this.data.recommendList.filter(
					item => item.habit_id !== data.habit_id
				);
				this.setData({
					recommendList
				});
				wx.showToast({
					title: "加入习惯成功",
					icon: "success",
					duration: 2000
				});
			})
			.catch(err => {
				this.setData({
					result: this.data.input,
					isCreate: false
				});
				if (err && err.status === 13005) {
					wx.showModal({
						title: "添加失败",
						content:
							"您目前只能添加5个习惯，您可通过连续签到或者开通高级账号功能解除限制",
						confirmText: "去开通",
						success: res => {
							if (res.confirm) {
								navigate({
									path: "pages/vip/index"
								});
							}
						}
					});
				} else {
					wx.showToast({
						title: err.info || "加入失败",
						icon: "fail",
						duration: 2000
					});
				}
			});
	},

	submitJoin(e) {
		var formID = e.detail.formId;
		let habitId = e.currentTarget.dataset.id;
		pushService
			.addPushForm(formID, 2, habitId)
			.then(data => {
				console.log(data);
			})
			.catch(err => {
				console.log(err);
			});
	}
});
