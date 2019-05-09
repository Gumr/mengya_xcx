// pages/changeIcon/change.js
import HabitService from "../../serivce/HabitService";
const habitService = new HabitService();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		habitId: 0,
		habitName: "",
		insistDay: 0,
		habitData: "",
		currentIcon: "",
		iconList: [],
		currentPage: 0,
		loadMoreText: "上拉加载更多图标",
		loadMore: true,
		loading: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			habitId: options.id || 0,
			insistDay: options.day || "",
			habitName: options.name || ""
		});
		habitService
			.getHabit(this.data.habitId)
			.then(data => {
				this.setData({
					habitData: data
				});
			})
			.catch(err => {});
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.getIconList();
	},

	getIconList: function() {
		if (!this.data.loadMore) {
			return;
		}
		habitService
			.getHabitIcons(this.data.currentPage)
			.then(data => {
				if (data.length > 0) {
					this.setData({
						iconList: [...this.data.iconList, ...data],
						loadMore: data.length > 10 ? true : false,
						loadMoreText:
							data.length > 10 ? "上拉加载更多图标" : "更多图标即将上线",
						loading: false
					});
				} else {
					this.setData({
						loadMore: false,
						loadMoreText: "更多图标即将上线",
						loading: false
					});
				}
			})
			.catch(err => {});
	},

	onLoadMore() {
		if (this.data.loading || !this.data.loadMore) return;
		this.setData({
			currentPage: this.data.currentPage + 1,
			loading: true
		});
		this.getIconList();
	},

	onSelectIcon: function(e) {
		const iconUrl = e.currentTarget.dataset.icon;
		this.setData({
			currentIcon: iconUrl
		});
	},

	onChange: function() {
		habitService
			.changeHabitIcon(this.data.habitId, this.data.currentIcon)
			.then(data => {
				wx.showToast({
					title: "修改成功！",
					icon: "success",
					duration: 2000
				});
				setTimeout(() => {
					wx.navigateBack();
				}, 1500);
			})
			.catch(err => {});
	},

	toFeedback: function(e) {
		wx.navigateTo({
			url: "../feedback/send"
		});
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(res) {
		var app = getApp();
		app.aldstat.sendEvent("用户分享", {
			位置: "修改图标",
			按钮: res.from === "button" ? "推荐按钮" : "顶部按钮"
		});
		return {
			title: "遇见更好的自己，一起来吗？",
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
