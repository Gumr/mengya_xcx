//feeds.js
import HabitService from "../../serivce/HabitService";
import PushService from "../../serivce/PushService";
const habitService = new HabitService();
const pushService = new PushService();

Page({
	data: {
		currentTab: 0,
		loadmore: 1,
		feedList: [],
		isEmpty: false,
		page: 0,
		lastId: 0,
		beCommentedId: "",
		atUserName: ""
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			lastId: 0,
			loadmore: 1
		});
		this.getHabitNoteOpen();
	},

	// 点击tab切换
	swichNav: function(e) {
		if (this.data.currentTab === e.target.dataset.current) {
			return false;
		} else {
			this.setData({
				feedList: [],
				currentTab: e.target.dataset.current,
				lastId: 0,
				loadmore: 1,
				isEmpty: false
			});
			this.getHabitNoteOpen();
		}
	},

	filterNoteOpen(feedList) {
		const { habitList } = getApp().globalData;
		for (let i = 0; i < feedList.length; i++) {
			feedList[i]["isJoin"] = false;
			feedList[i]["isComment"] = false;
			if (habitList.some(habit => habit.id === feedList[i].habit_id)) {
				feedList[i]["isJoin"] = true;
			}
		}
		return feedList;
	},

	onPullDownRefresh: function() {
		this.setData({
			lastId: 0,
			loadmore: 1
		});
		this.getHabitNoteOpen();
	},

	onReachBottom: function() {
		if (this.data.loadmore == -1 || this.data.isEmpty) {
			return;
		}
		let lastId =
			this.data.feedList.length > 0
				? this.data.feedList[this.data.feedList.length - 1].id
				: 0;
		if (this.data.currentTab == 0) {
			lastId =
				this.data.feedList.length > 0
					? this.data.feedList[this.data.feedList.length - 1].hot_id
					: 0;
		}
		this.setData({
			lastId,
			loadmore: 1
		});

		habitService
			.getMindNoteList(this.data.lastId, this.data.currentTab)
			.then(data => this.filterNoteOpen(data))
			.then(data => {
				if (data.length > 0) {
					this.setData({
						feedList: [...this.data.feedList, ...data],
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
	},

	getHabitNoteOpen: function() {
		habitService
			.getMindNoteList(this.data.lastId, this.data.currentTab)
			.then(data => this.filterNoteOpen(data))
			.then(data => {
				if (data.length > 0) {
					this.setData({
						feedList: data,
						loadmore: 0,
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

	likeHabitNote: function(e) {
		let index = e.currentTarget.dataset.id;
		if (this.data.feedList[index].isLike) {
			let isLike = "feedList[" + index + "].isLike";
			let count = this.data.feedList[index].prop_count;
			let prop_count = "feedList[" + index + "].prop_count";
			this.setData({
				[isLike]: false,
				[prop_count]: parseInt(count) - 1
			});
			habitService
				.cancelLikeNote(this.data.feedList[index].id)
				.then(data => {})
				.catch(err => {});
		} else {
			let isLike = "feedList[" + index + "].isLike";
			let count = this.data.feedList[index].prop_count;
			let prop_count = "feedList[" + index + "].prop_count";
			this.setData({
				[isLike]: true,
				[prop_count]: parseInt(count) + 1
			});
			habitService
				.likeNote(this.data.feedList[index].id)
				.then(data => {})
				.catch(err => {});
		}
	},

	handleViewImage(e) {
		const { src } = e.target.dataset;
		const app = getApp();
		app.preventLock();
		wx.previewImage({
			urls: [src],
			complete: res => {
				app.allowLock();
			}
		});
	},

	onShareAppMessage: function(res) {
		if (res.from === "button") {
			var id = res.target.dataset.id;
			var day = res.target.dataset.day;
			var path = res.target.dataset.path;
			var name = res.target.dataset.name;
			var app = getApp();
			app.aldstat.sendEvent("用户分享", {
				位置: "学堂页面",
				按钮: "页面按钮"
			});

			if (name == "" || name == null) {
				return {
					title: "我在坚持培养好习惯，期待成长，遇见更好的自己。",
					path: "/pages/feed/feed?page=1",
					success: function(res) {
						// 转发成功
					},
					fail: function(res) {
						// 转发失败
					}
				};
			}
			return {
				title: "培养「" + name + "」习惯，萌友已经坚持" + day + "天。",
				path: "/pages/share/index?id=" + id + "&page=1",
				imageUrl: path,
				success: function(res) {
					// 转发成功
				},
				fail: function(res) {
					// 转发失败
				}
			};
		}
		var app = getApp();
		app.aldstat.sendEvent("用户分享", {
			位置: "学堂页面",
			按钮: "顶部按钮"
		});
		return {
			title: "我在坚持培养好习惯，期待成长，遇见更好的自己。",
			path: "/pages/feed/feed?page=1",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
	},

	clickHabit(e) {
		const habitId = e.currentTarget.dataset.habitid;
		wx.navigateTo({
			url: "../mindFeed/feed?id=" + habitId
		});
	},

	toUserPage(e) {
		const id = e.currentTarget.dataset.user;
		wx.navigateTo({
			url: "../userOther/user?id=" + id
		});
	},

	toSearchUser() {
		wx.navigateTo({
			url: "../searchUser/index"
		});
	},

	clickComment: function(e) {
		let index = e.currentTarget.dataset.index;
		const habitId = e.detail.payload;
		let isComment = "feedList[" + index + "].isComment";
		this.setData({
			[isComment]: true,
			atUserName: "评论一下~",
			beCommentedId: ""
		});
		if (getApp().isIos) {
			wx
				.createSelectorQuery()
				.selectViewport()
				.scrollOffset(function(res) {
					setTimeout(() => {
						wx.pageScrollTo({
							scrollTop: res.scrollTop + 60,
							duration: 300
						});
					}, 400);
				})
				.exec();
		}
	},

	clickReply(e) {
		const commentedId = e.currentTarget.dataset.id;
		const index = e.currentTarget.dataset.index;
		const atUser = e.currentTarget.dataset.user;
		const atUserId = e.currentTarget.dataset.userid;
		if (atUserId == habitService.getUserId()) {
			let _this = this;
			wx.showActionSheet({
				itemList: ["删除评论"],
				success(res) {
					if (res.tapIndex == 0) {
						habitService
							.deleteComment(commentedId)
							.then(data => {
								let commentString = "feedList[" + index + "].comment";
								let commentList = _this.data.feedList[index].comment;
								let commentCountString =
									"feedList[" + index + "].comment_count";
								let commentCount = _this.data.feedList[index].comment_count;
								commentList = commentList.filter(
									item => item.id !== commentedId
								);
								_this.setData({
									[commentString]: commentList,
									[commentCountString]: parseInt(commentCount) - 1 + ""
								});
								wx.showToast({
									title: "删除评论成功",
									icon: "none",
									duration: 2000
								});
							})
							.catch(err => {});
					}
				},
				fail(res) {}
			});
			return;
		}
		let isComment = "feedList[" + index + "].isComment";
		this.setData({
			[isComment]: true,
			beCommentedId: commentedId,
			atUserName: "回复" + atUser
		});
		if (getApp().isIos) {
			wx
				.createSelectorQuery()
				.selectViewport()
				.scrollOffset(function(res) {
					setTimeout(() => {
						wx.pageScrollTo({
							scrollTop: res.scrollTop + 60,
							duration: 300
						});
					}, 400);
				})
				.exec();
		}
	},

	hideComment: function(e) {
		let index = e.currentTarget.dataset.index;
		const noteId = e.currentTarget.dataset.id;
		let isComment = "feedList[" + index + "].isComment";
		const content = e.detail.value;
		if (content != "" && content.length > 0) {
			return;
		}
		this.setData({
			[isComment]: false
		});
	},

	sendComment: function(e) {
		let index = e.currentTarget.dataset.index;
		const noteId = e.currentTarget.dataset.id;
		let isComment = "feedList[" + index + "].isComment";
		this.setData({
			[isComment]: false
		});
		const content = e.detail.value;
		if (content == "" || content.length == 0) {
			return;
		}
		habitService
			.commentNote(noteId, content, this.data.beCommentedId)
			.then(data => {
				let commentString = "feedList[" + index + "].comment";
				let commentList = this.data.feedList[index].comment;
				let commentCountString = "feedList[" + index + "].comment_count";
				let commentCount = this.data.feedList[index].comment_count;
				let userInfo = habitService.getUserInfo();
				data["nickname"] = userInfo.nickname;
				commentList.push(data);
				this.setData({
					[commentString]: commentList,
					beCommentedId: "",
					atUserName: "评论一下~",
					[commentCountString]: parseInt(commentCount) + 1 + ""
				});
			})
			.catch(err => {});
	}
});
