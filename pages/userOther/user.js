// 个人主页
import HabitService from "../../serivce/HabitService";
import UserService from "../../serivce/UserService";
const habitService = new HabitService();
const userService = new UserService();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		id: 0,
		userInfo: "",
		lastId: 0,
		habitList: [],
		storeCount: 0,
		loadmore: 0,
		feedList: [],
		isEmpty: false,
		firstLoadEnd: false,
		beCommentedId: "",
		atUserName: "",
		isShare: 0,
		btnAnimation: "",
		optionShow: true,
		ratioW: wx.getSystemInfoSync().windowWidth / 750,
		gender: "她" //0女，1男
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		let userId = options.id;
		this.setData({
			id: userId,
			isShare: options.share ? options.share : 0
		});
		userService
			.getOtherUserInfo(this.data.id)
			.then(userInfo => {
				this.setData({
					userInfo,
					gender:
						userService.getUserId() == userInfo.id
							? "我"
							: userInfo.gender == 1
								? "他"
								: "她"
				});
				wx.setNavigationBarTitle({
					title: userInfo.nickname + "的个人主页"
				});
			})
			.catch(err => {
				console.log(err);
			});
		this.getOpenNoteByUser();
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		habitService.getUserHabits(this.data.id).then(data => {
			this.setData({ habitList: data });
		});
		habitService.getUserStoreHabitList(this.data.id).then(data => {
			this.setData({ storeCount: data.length });
		});
	},

	onPageScroll: function(e) {
		// 获取滚动条当前位置
		if (e.scrollTop > 150 * this.data.ratioW && this.data.optionShow) {
			let animation = wx.createAnimation({
				duration: 500
			});
			animation.translateX(280 * this.data.ratioW).step();
			this.setData({
				btnAnimation: animation.export(),
				optionShow: false
			});
		} else if (e.scrollTop < 150 * this.data.ratioW && !this.data.optionShow) {
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

	onPullDownRefresh: function() {
		this.setData({
			lastId: 0,
			loadmore: 0
		});
		this.getOpenNoteByUser();
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
			.getOpenNoteByUser(this.data.id, this.data.lastId)
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

	clickAttention: function() {
		if (!userService.getUserId() || userService.getUserId() == undefined) {
			wx.showToast({
				title: "请登录再操作",
				icon: "none",
				duration: 2000
			});
			return;
		}
		userService
			.followUser(this.data.id)
			.then(data => {
				wx.showToast({
					title: "关注成功",
					icon: "none",
					duration: 2000
				});
				let relation = "userInfo.relation";
				let followers = "userInfo.followers";
				this.setData({
					[relation]: 1,
					[followers]: parseInt(this.data.userInfo.followers) + 1
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

	cancelAttention: function() {
		userService
			.cancelFollow(this.data.id)
			.then(data => {
				wx.showToast({
					title: "取消关注成功",
					icon: "none",
					duration: 2000
				});
				let relation = "userInfo.relation";
				let followers = "userInfo.followers";
				this.setData({
					[relation]: 0,
					[followers]: parseInt(this.data.userInfo.followers) - 1
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

	clickRelation: function(e) {
		let rType = e.currentTarget.dataset.type;
		wx.navigateTo({
			url:
				"../fansFollow/index?uid=" +
				this.data.id +
				"&ut=" +
				rType +
				"&name=" +
				this.data.userInfo.nickname
		});
	},

	/**
	 * 长按复制心情内容
	 */
	copyNote(e) {
		const text = e.currentTarget.dataset.text;
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

	toUserPage(e) {
		var id = e.currentTarget.dataset.user;
		wx.navigateTo({
			url: "../userOther/user?id=" + id
		});
	},

	clickStoreHabit() {
		wx.navigateTo({
			url: "../habitStore/index?id=" + this.data.id
		});
	},

	getOpenNoteByUser: function() {
		habitService
			.getOpenNoteByUser(this.data.id, this.data.lastId)
			.then(data => {
				if (data.length > 0) {
					this.setData({
						feedList: data,
						loadmore: 0,
						isEmpty: false,
						firstLoadEnd: true
					});
				} else {
					this.setData({
						loadmore: -1,
						isEmpty: true,
						firstLoadEnd: true
					});
				}
				wx.stopPullDownRefresh();
			})
			.catch(err => {
				this.setData({
					loadmore: 1,
					isEmpty: true,
					firstLoadEnd: true
				});
				wx.stopPullDownRefresh();
			});
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

	backHome: function() {
		wx.switchTab({
			url: "../create/create"
		});
	},

	onShareAppMessage: function(res) {
		if (res.from === "button") {
			let invite = res.target.dataset.invite;
			if (invite == 1 || invite == 2) {
				return {
					title:
						this.data.userInfo.nickname +
						"在坚持" +
						this.data.habitList.length +
						"个习惯,快来" +
						(invite == 2 ? "关注吧！" : "一起坚持吧！"),
					path: "/pages/userOther/user?id=" + this.data.id + "&share=1",
					success: function(res) {
						// 转发成功
					},
					fail: function(res) {
						// 转发失败
					}
				};
			}
			//页面内按钮
			let id = res.target.dataset.id;
			let day = res.target.dataset.day;
			let path = res.target.dataset.path;
			let name = res.target.dataset.name;
			let app = getApp();
			app.aldstat.sendEvent("用户分享", {
				位置: "个人主页心情列表",
				按钮: "心情分享按钮"
			});
			return {
				title: "培养「" + name + "」习惯，一起来吗？",
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
		let app = getApp();
		app.aldstat.sendEvent("用户分享", {
			位置: "个人主页心情列表",
			按钮: "顶部按钮"
		});
		return {
			title:
				this.data.userInfo.nickname +
				"在坚持" +
				this.data.habitList.length +
				"个习惯,快来关注！",
			path: "/pages/userOther/user?id=" + this.data.id + "&share=1",
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

	clickHabitName(e) {
		const habitId = e.currentTarget.dataset.habitid;
		wx.navigateTo({
			url: "../mindFeed/feed?id=" + habitId
		});
	},

	clickHabit: function(e) {
		let id = e.currentTarget.dataset.id;
		let days = e.currentTarget.dataset.days;
		wx.navigateTo({
			url:
				"../mindUser/feed?id=" + id + "&day=" + days + "&user=" + this.data.id
		});
		var app = getApp();
		app.aldstat.sendEvent("点击用户主页习惯", {
			页面: "用户主页"
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
