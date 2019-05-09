// pages/create/create.js
import HabitService from "../../serivce/HabitService";
import PushService from "../../serivce/PushService";
import UserService from "../../serivce/UserService";
import { navigate } from "../../utils/router";
const habitService = new HabitService();
const userService = new UserService();
const pushService = new PushService();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		showGroup: true,
		input: "",
		isCreated: false,
		result: "",
		banners: [],
		recommendList: [],
		list: [
			{
				id: "0",
				name: "热门",
				type: "0"
			},
			{
				id: "1",
				name: "健康",
				type: "1"
			},
			{
				id: "2",
				name: "学习",
				type: "2"
			},
			{
				id: "3",
				name: "思考",
				type: "3"
			},
			{
				id: "4",
				name: "晨间",
				type: "4"
			},
			{
				id: "5",
				name: "晚间",
				type: "5"
			},
			{
				id: "6",
				name: "有趣",
				type: "6"
			},
			{
				id: "8",
				name: "推荐",
				type: "8"
			}
		],
		searchId: 0,
		current: 0,
		indicatorDots: false,
		autoplay: true,
		interval: 5000,
		duration: 400
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getRecommendHabit();
		this.getBanners();
		if (options.type && options.type == 1) {
			navigate({
				path: "pages/about/about"
			});
		}
		userService.syncUnReadMsgCount();
	},

	/**
	 * 切换今天签到和补签swiper事件
	 * 切换后不再提示补卡
	 */
	changeSwiper(e) {
		this.setData({
			current: e.detail.current
		});
	},

	getRecommendHabit() {
		if (this.data.searchId == 7) {
			habitService
				.getGroupOpenHabit()
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
		} else {
			habitService
				.getRecommendHabit(this.data.searchId)
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
		}
	},

	filterRecommend(recommendList) {
		const { habitList } = getApp().globalData;
		return recommendList.filter(
			item => !habitList.some(habit => habit.id === item.habit_id)
		);
	},

	/**
	 * 获取推荐list
	 */
	getRecommendType() {
		habitService
			.getRecommendType()
			.then(data => {
				this.setData({
					list: data
				});
			})
			.catch(err => {
				console.log(err);
			});
	},

	/**
	 * 获取banners
	 */
	getBanners() {
		userService
			.getBanners()
			.then(data => {
				this.setData({
					banners: data
				});
			})
			.catch(err => {
				console.log(err);
			});
	},

	clickBanner(e) {
		const index = e.currentTarget.dataset.index;
		//类型：1、纯图片；2、链接；3、跳转内页
		switch (parseInt(this.data.banners[index].type)) {
			case 1:
				break;
			case 2:
				let url = this.data.banners[index].page_url;
				let title = this.data.banners[index].title;
				console.log(url);
				wx.navigateTo({
					url: "../direct/direct?url=" + url + "&t=" + title
				});
				break;
			case 3:
				wx.navigateTo({
					url: "../" + this.data.banners[index].page_url
				});
				break;
		}
	},

	clickHabit(e) {
		const habitId = e.currentTarget.dataset.habitid;
		wx.navigateTo({
			url: "../mindFeed/feed?id=" + habitId
		});
	},

	clickJoin(e) {
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

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {
		this.getRecommendHabit();
		this.getBanners();
	},

	/**
	 * @method 跳转至搜索习惯的页
	 */
	goSearchHabitPage() {
		navigate({
			path: "pages/searchHabit/search"
		});
		var app = getApp();
		app.aldstat.sendEvent("点击个人习惯", {
			页面: "发现页面"
		});
	},

	/**
	 * @method 跳转至搜索习惯的页
	 */
	goGroupHabitPage() {
		navigate({
			path: "pages/createFt/create?home=1"
		});
		var app = getApp();
		app.aldstat.sendEvent("点击打卡圈子", {
			页面: "发现页面"
		});
	},

	/**
	 * @method 更换习惯
	 */
	changeSearchHabit(e) {
		let clickData = e.currentTarget.dataset.id;
		this.setData({
			searchId: clickData,
			recommendList: []
		});
		this.getRecommendHabit();
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
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(res) {
		if (res.from === "button") {
			let app = getApp();
			app.aldstat.sendEvent("用户分享", {
				位置: "添加习惯页面",
				按钮: "列表按钮"
			});
		} else {
			let app = getApp();
			app.aldstat.sendEvent("用户分享", {
				位置: "添加习惯页面",
				按钮: "顶部按钮"
			});
		}
		return {
			title: "我在坚持培养好习惯，一起来吗？",
			path: "/pages/create/create",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
	}
});
