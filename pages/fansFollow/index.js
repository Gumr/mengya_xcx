// pages/FansFollow/index.js
import UserService from "../../serivce/UserService";
const userService = new UserService();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		targetUserId: "",
		fanOrFollow: 1,
		nickName: "",
		userList: [],
		currentPage: 0,
		loadmore: 0,
		isEmpty: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			targetUserId: options.uid,
			fanOrFollow: options.ut,
			nickName: options.name
		});
		wx.setNavigationBarTitle({
			title:
				this.data.nickName +
				"的" +
				(parseInt(this.data.fanOrFollow) == 1 ? "关注" : "粉丝")
		});
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.setData({
			currentPage: 0,
			loadmore: 0
		});

		if (parseInt(this.data.fanOrFollow) == 1) {
			this.getAttentionList();
		} else {
			this.getFollowerList();
		}
	},

	getFollowerList: function() {
		userService
			.getFollowerList(this.data.targetUserId, this.data.currentPage)
			.then(data => {
				if (data.length > 0) {
					this.setData({
						userList: data,
						loadmore: data.length > 8 ? 0 : -1,
						isEmpty: false
					});
				} else {
					this.setData({
						loadmore: -1,
						isEmpty: true
					});
				}
			})
			.catch(err => {
				this.setData({
					loadmore: 1,
					isEmpty: true
				});
			});
	},

	getAttentionList: function() {
		userService
			.getAttentionList(this.data.targetUserId, this.data.currentPage)
			.then(data => {
				if (data.length > 0) {
					this.setData({
						userList: data,
						loadmore: data.length > 5 ? 0 : -1,
						isEmpty: false
					});
				} else {
					this.setData({
						loadmore: -1,
						isEmpty: true
					});
				}
			})
			.catch(err => {
				this.setData({
					loadmore: 1,
					isEmpty: true
				});
			});
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {
		this.setData({
			currentPage: 0,
			loadmore: 0
		});
		if (parseInt(this.data.fanOrFollow) == 1) {
			this.getAttentionList();
		} else {
			this.getFollowerList();
		}
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		if (this.data.loadmore == -1 || this.data.isEmpty) {
			return;
		}
		this.setData({
			currentPage: this.data.currentPage + 1,
			loadmore: 0
		});
		if (parseInt(this.data.fanOrFollow) == 1) {
			userService
				.getAttentionList(this.data.targetUserId, this.data.currentPage)
				.then(data => {
					if (data.length > 0) {
						this.setData({
							userList: [...this.data.userList, ...data],
							loadmore: 0
						});
					} else {
						this.setData({
							loadmore: -1
						});
					}
				})
				.catch(err => {
					this.setData({
						loadmore: -1
					});
				});
		} else {
			userService
				.getFollowerList(this.data.targetUserId, this.data.currentPage)
				.then(data => {
					if (data.length > 0) {
						this.setData({
							userList: [...this.data.userList, ...data],
							loadmore: 0
						});
					} else {
						this.setData({
							loadmore: -1
						});
					}
				})
				.catch(err => {
					this.setData({
						loadmore: -1
					});
				});
		}
	},

	toUserPage: function(e) {
		var id = e.currentTarget.dataset.user;
		wx.navigateTo({
			url: "../userOther/user?id=" + id
		});
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {}
});
