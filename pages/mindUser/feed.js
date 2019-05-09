//feeds.js
import HabitService from "../../serivce/HabitService";
import { navigate } from "../../utils/router";
const habitService = new HabitService();

Page({
	data: {
		habitId: 0,
		userId: 0,
		days: 0,
		habitData: "",
		loadmore: 0,
		feedList: [],
		dayList: [],
		currentNum: 0,
		isEmpty: false,
		showType: 2, //1、竖向展示，2横列展示
		beCommentedId: "",
		atUserName: ""
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			currentNum: 0,
			loadmore: 0,
			habitId: options.id,
			days: options.day,
			userId: options.user
		});
		habitService
			.getHabit(this.data.habitId)
			.then(data => {
				this.setData({
					habitData: data
				});
				wx.setNavigationBarTitle({
					title: data.name
				});
			})
			.catch(err => {});
		this.getHabitNoteList();
	},

	clickHabit(e) {
		const habitId = e.currentTarget.dataset.habitid;
		wx.navigateTo({
			url: "../mindFeed/feed?id=" + habitId
		});
	},

	toDetail: function(e) {
		let noteId = e.currentTarget.dataset.id;
		if (noteId == 0 || noteId == "0") {
			return;
		}
		wx.navigateTo({
			url: "../share/index?id=" + noteId
		});
	},

	toUserPage: function(e) {
		var id = e.currentTarget.dataset.user;
		console.log("userId=" + id);
		wx.navigateTo({
			url: "../userOther/user?id=" + id
		});
	},

	copyNote(e) {
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

	onReachBottom: function() {
		if (this.data.loadmore == -1 || this.data.isEmpty) {
			return;
		}
		this.setData({
			currentNum: this.data.currentNum + 1,
			loadmore: 0
		});
		habitService
			.getUserHabitNoteList(
				this.data.userId,
				this.data.habitId,
				this.data.currentNum
			)
			.then(data => {
				if (data.length > 0) {
					let feedToDay = data.map(item => {
						let addTime = item.add_time;
						let date = new Date(item.add_time);
						let weekDay = "日一二三四五六".charAt(date.getDay());
						return {
							note: item.note,
							days: item.days,
							haibt_id: item.habit_id,
							id: item.id,
							pic_url: item.pic_url,
							week: "周" + weekDay,
							month: addTime.split(" ")[0].split("-")[0],
							day: addTime.split(" ")[0].split("-")[1],
							time: addTime.split(" ")[1]
						};
					});
					this.setData({
						feedList: [...this.data.feedList, ...data],
						dayList: [...this.data.dayList, ...feedToDay],
						loadmore: 1
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

	onPullDownRefresh: function() {
		wx.stopPullDownRefresh();
		this.setData({
			currentNum: 0,
			loadmore: 0
		});
		this.getHabitNoteList();
	},

	getHabitNoteList: function() {
		habitService
			.getUserHabitNoteList(
				this.data.userId,
				this.data.habitId,
				this.data.currentNum
			)
			.then(data => {
				if (data.length > 0) {
					let feedToDay = data.map(item => {
						let addTime = item.add_time;
						let date = new Date(item.add_time);
						let weekDay = "日一二三四五六".charAt(date.getDay());
						return {
							note: item.note,
							days: item.days,
							haibt_id: item.habit_id,
							id: item.id,
							pic_url: item.pic_url,
							week: "周" + weekDay,
							month: addTime.split(" ")[0].split("-")[0],
							day: addTime.split(" ")[0].split("-")[1],
							time: addTime.split(" ")[1]
						};
					});
					this.setData({
						feedList: data,
						dayList: feedToDay,
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

	changeType(e) {
		let index = e.currentTarget.dataset.index;
		this.setData({
			showType: index
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
	},

	onShareAppMessage: function(res) {
		if (res.from === "button") {
			var id = res.target.dataset.id;
			var day = res.target.dataset.day;
			var path = res.target.dataset.path;
			var name = res.target.dataset.name;
			var app = getApp();
			app.aldstat.sendEvent("用户分享", {
				位置: "个人习惯心情列表",
				按钮: "心情分享按钮"
			});
			return {
				title: "培养「" + name + "」习惯，我已经坚持" + day + "天。",
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
			位置: "个人习惯心情列表",
			按钮: "顶部按钮"
		});
		return {
			title: "我在坚持培养好习惯，期待成长，遇见更好的自己。",
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
