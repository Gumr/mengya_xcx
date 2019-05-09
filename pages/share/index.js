// pages/share/index.js
//获取应用实例
import HabitService from "../../serivce/HabitService";
const habitService = new HabitService();

Page({
	data: {
		feedList: [],
		isEmpty: false,
		page: 0,
		id: -1,
		beCommentedId: "",
		atUserName: ""
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			page: options.page,
			id: options.id
		});
		wx.showLoading();
		this.getHabitNoteShare();
	},

	getHabitNoteShare: function() {
		habitService
			.getHabitNoteShare(this.data.id)
			.then(data => {
				if (data.length > 0) {
					this.setData({
						feedList: data
					});
				} else {
					this.setData({
						isEmpty: true
					});
				}
				wx.hideLoading();
			})
			.catch(err => {
				this.setData({
					isEmpty: true
				});
				wx.hideLoading();
			});
	},

	onShareAppMessage: function(res) {
		if (res.from === "button") {
			// 来自页面内转发按钮
			console.log(res.target);
		}
		return {
			title: "",
			path: "/pages/share/index?id=" + this.data.id + " &page=1",
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

	clickHabit(e) {
		const habitId = e.currentTarget.dataset.habitid;
		wx.navigateTo({
			url: "../mindFeed/feed?id=" + habitId
		});
	},

	toUserPage: function(e) {
		var id = e.currentTarget.dataset.user;
		console.log("userId=" + id);
		wx.navigateTo({
			url: "../userOther/user?id=" + id
		});
	},

	copyNote: function(e) {
		var text = e.currentTarget.dataset.text;
		wx.setClipboardData({
			data: text,
			success: function(res) {
				wx.showToast({
					title: "复制成功！",
					icon: "none",
					duration: 1500
				});
			}
		});
	},

	likeHabitNote: function(e) {
		let index = e.currentTarget.dataset.id;
		if (this.data.feedList[index].isLike) {
			let isLike = "feedList[" + index + "].isLike";
			let count = this.data.feedList[index].prop_count;
			let prop_count = "feedList[" + index + "].prop_count";

			//增加点赞的用户
			let likeString = "feedList[" + index + "].likes";
			let likeUser = this.data.feedList[index].likes.filter(
				item => item.id != habitService.getUserId()
			);
			console.log(likeUser);
			this.setData({
				[isLike]: false,
				[prop_count]: parseInt(count) - 1,
				[likeString]: likeUser
			});
			habitService
				.cancelLikeNote(this.data.feedList[index].id)
				.then(data => {})
				.catch(err => {});
		} else {
			let isLike = "feedList[" + index + "].isLike";
			let count = this.data.feedList[index].prop_count;
			let prop_count = "feedList[" + index + "].prop_count";

			//增加点赞的用户
			let likeString = "feedList[" + index + "].likes";
			let userInfo = habitService.getUserInfo();
			let likes = this.data.feedList[index].likes;
			likes.push({
				id: userInfo.id,
				nickname: userInfo.nickname,
				avatar_small: userInfo.avatar_small
			});

			this.setData({
				[isLike]: true,
				[prop_count]: parseInt(count) + 1,
				[likeString]: likes
			});
			habitService
				.likeNote(this.data.feedList[index].id)
				.then(data => {})
				.catch(err => {});
		}
	},

	handleViewImage: function(e) {
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
