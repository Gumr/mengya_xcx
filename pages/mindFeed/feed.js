//feeds.js
import HabitService from "../../serivce/HabitService";
import PushService from "../../serivce/PushService";
import { navigate } from "../../utils/router";
const habitService = new HabitService();
const pushService = new PushService();

Page({
	data: {
		loadmore: 1,
		feedList: [],
		isEmpty: false,
		lastId: 0,
		habitId: 0,
		habitData: "",
		isShare: 0,
		isOpen: 0,
		beCommentedId: "",
		atUserName: "",
		btnAnimation: "",
		optionShow: true,
		ratioW: wx.getSystemInfoSync().windowWidth / 750
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			lastId: 0,
			loadmore: 0,
			habitId: options.id,
			isShare: options.share ? options.share : 0,
			isOpen: options.o || 0
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
		this.getOpenNoteByHabit();
	},

	onPageScroll: function(e) {
		// 获取滚动条当前位置
		if (e.scrollTop > 350 * this.data.ratioW && this.data.optionShow) {
			let animation = wx.createAnimation({
				duration: 500
			});
			animation.translateX(150 * this.data.ratioW).step();
			this.setData({
				btnAnimation: animation.export(),
				optionShow: false
			});
		} else if (e.scrollTop < 350 * this.data.ratioW && !this.data.optionShow) {
			let animation = wx.createAnimation({
				duration: 500
			});
			animation.translateX(0).step();
			this.setData({
				btnAnimation: animation.export(),
				optionShow: true
			});
		}
	},

	filterNoteOpen(feedList) {
		const { habitList } = getApp().globalData;
		for (let i = 0; i < feedList.length; i++) {
			feedList[i]["isJoin"] = false;
			if (habitList.some(habit => habit.id === feedList[i].habit_id)) {
				feedList[i]["isJoin"] = true;
			}
		}
		return feedList;
	},

	onPullDownRefresh: function() {
		this.setData({
			lastId: 0,
			loadmore: 0
		});
		this.getOpenNoteByHabit();
	},

	onReachBottom: function() {
		if (this.data.loadmore == -1 || this.data.isEmpty) {
			return;
		}
		let lastId =
			this.data.feedList.length > 0
				? this.data.feedList[this.data.feedList.length - 1].id
				: 0;
		this.setData({
			lastId,
			loadmore: 0
		});
		habitService
			.getOpenNoteByHabit(this.data.habitId, this.data.lastId)
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

	getOpenNoteByHabit: function() {
		habitService
			.getOpenNoteByHabit(this.data.habitId, this.data.lastId)
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
			// 来自页面内转发按
			var id = res.target.dataset.id;
			var day = res.target.dataset.day;
			var path = res.target.dataset.path;
			var name = res.target.dataset.name;
			var app = getApp();
			app.aldstat.sendEvent("小学堂分享", {
				习惯名: name,
				点击位置: "按钮"
			});
			if (name != "" && name != null) {
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
		}
		var app = getApp();
		app.aldstat.sendEvent("小学堂分享", {
			习惯名: this.data.habitData.name,
			点击位置: "顶部"
		});
		return {
			title: "「" + this.data.habitData.name + "」，一起来吗？",
			path: "/pages/mindFeed/feed?id=" + this.data.habitId + "&share=1",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
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
			页面: "小习惯页面"
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
			页面: "小习惯页面"
		});
	},

	backHome: function() {
		wx.switchTab({
			url: "../create/create"
		});
	},

	toUserPage: function(e) {
		var id = e.currentTarget.dataset.user;
		console.log("userId=" + id);
		wx.navigateTo({
			url: "../userOther/user?id=" + id
		});
	},

	clickHabit(e) {
		const habitId = e.currentTarget.dataset.habitid;
		wx.navigateTo({
			url: "../mindFeed/feed?id=" + habitId
		});
	},

	clickJoin: function(e) {
		if (this.data.habitData.isJoin) {
			wx.showToast({
				title: "已经加入该习惯",
				icon: "none",
				duration: 2000
			});
			return;
		}
		habitService
			.joinHabit(this.data.habitId)
			.then(data => {
				let isJoin = "habitData.isJoin";
				this.setData({
					[isJoin]: true
				});
				if (this.data.isOpen == 1) {
					wx.showModal({
						title: "添加成功",
						content:
							"你已经加入" + this.data.habitData.name + "习惯，赶快去打卡吧",
						confirmText: "去打卡",
						success: res => {
							if (res.confirm) {
								wx.switchTab({
									url: "../habit/habit"
								});
							}
						}
					});
				} else {
					wx.showToast({
						title: "加入习惯成功",
						icon: "success",
						duration: 2000
					});
				}
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
