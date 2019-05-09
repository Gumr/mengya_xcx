// pages/message/message.js
import UserService from "../../serivce/UserService";
const userService = new UserService();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		page: 0,
		messageList: [],
		loadmore: 1,
		isEmpty: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getMessage();
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {},

	toDetail: function(e) {
		let noteId = e.currentTarget.dataset.id;
		let index = e.currentTarget.dataset.index;
		if (noteId == 0 || noteId == "0") {
			return;
		}
		wx.navigateTo({
			url: "../share/index?id=" + noteId
		});
		let read = "messageList[" + index + "].has_read";
		this.setData({
			[read]: 1
		});
	},

	toUserPage: function(e) {
		var id = e.currentTarget.dataset.user;
		console.log("userId=" + id);
		wx.navigateTo({
			url: "../userOther/user?id=" + id
		});
	},

	getMessage: function() {
		userService
			.getUserMsg(this.data.page)
			.then(data => {
				if (data.length > 0) {
					this.setData({
						messageList: data,
						loadmore: data.length > 15 ? 0 : -1,
						isEmpty: false
					});
				} else {
					this.setData({
						loadmore: -1,
						isEmpty: true
					});
				}
				wx.stopPullDownRefresh();
			})
			.catch(err => {
				this.setData({
					loadmore: 1,
					isEmpty: true
				});
				wx.stopPullDownRefresh();
			});
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {
		this.setData({
			page: 0
		});
		this.getMessage();
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		if (this.data.loadmore == -1 || this.data.isEmpty) {
			return;
		}
		const page = this.data.page + 1;
		this.setData({
			page
		});
		userService
			.getUserMsg(page)
			.then(data => {
				if (data.length > 0) {
					this.setData({
						messageList: [...this.data.messageList, ...data],
						loadmore: 0
					});
				} else {
					this.setData({
						loadmore: -1
					});
				}
			})
			.catch(err => {
				console.log(err);
				this.setData({
					loadmore: -1
				});
			});
	}
});
