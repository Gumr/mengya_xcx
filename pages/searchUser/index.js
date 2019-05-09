// pages/searchUser/index.js
import UserService from "../../serivce/UserService";
const userService = new UserService();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		input: "",
		result: "",
		recommendList: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.recommendUser();
	},

	inputChangeHandle(e) {
		this.setData({ input: e.detail.value });
		this.recommendUser();
	},

	inputCompleteHandle(e) {
		this.recommendUser();
	},

	recommendUser() {
		userService
			.searchUserByName(this.data.input)
			.then(data => {
				this.setData({
					recommendList: data
				});
			})
			.catch(err => {
				console.log(err);
			});
	},

	toUserPage(e) {
		const id = e.currentTarget.dataset.userid;
		wx.navigateTo({
			url: "../userOther/user?id=" + id
		});
	},

	clickRelation(e) {
		const userId = e.currentTarget.dataset.userid;
		const follow = e.currentTarget.dataset.follow;
		const index = e.currentTarget.dataset.index;
		if (follow == 1) {
			this.cancelAttention(userId, index);
		} else {
			this.clickAttention(userId, index);
		}
	},

	clickAttention(userId, index) {
		userService
			.followUser(userId)
			.then(data => {
				wx.showToast({
					title: "关注成功",
					icon: "none",
					duration: 2000
				});
				let isfollowed = "recommendList[" + index + "].isfollowed";
				this.setData({
					[isfollowed]: 1
				});
			})
			.catch(err => {
				wx.showToast({
					title: err.info || "关注失败",
					icon: "fail",
					duration: 2000
				});
			});
	},

	cancelAttention(userId, index) {
		userService
			.cancelFollow(userId)
			.then(data => {
				wx.showToast({
					title: "取消关注成功",
					icon: "none",
					duration: 2000
				});
				let isfollowed = "recommendList[" + index + "].isfollowed";
				this.setData({
					[isfollowed]: 0
				});
			})
			.catch(err => {
				wx.showToast({
					title: err.info || "取消关注失败",
					icon: "fail",
					duration: 2000
				});
			});
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {
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
