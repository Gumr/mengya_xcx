// record.
import HabitService from "../../serivce/HabitService";
import PushService from "../../serivce/PushService";
import { navigate } from "../../utils/router";
const habitService = new HabitService();
import UserService from "../../serivce/UserService";

Page({
	data: {
		id: 0, //习惯id
		name: "", //习惯名称
		isPrivate: true,
		checkNum: 0,
		continueCount: 0,
		weekChecks: [false, false, false, false, false, false, false],
		dateInfo: [
			{ day: "一", isCheck: false },
			{ day: "二", isCheck: false },
			{ day: "三", isCheck: false },
			{ day: "四", isCheck: false },
			{ day: "五", isCheck: false },
			{ day: "六", isCheck: false },
			{ day: "日", isCheck: false }
		],
		current: -1,
		loadmore: 0,
		isEmpty: false,
		showType: 2, //1、竖向展示，2缩略条目展示
		feedList: [],
		dayList: [],
		currentNum: 0,
		isRepair: -1, //1要补卡，0不用补卡，-1，未加载
		toRecord: false,
		repairText: "去补卡",
		currentEnergy: 0,
		beCommentedId: "",
		atUserName: "",
		sevenChecks: [{ isCheck: false, isNoted: false, checkId: "", day: "" }],
		indicatorDots: false,
		autoplay: false,
		interval: 5000,
		duration: 400,
		btnAnimation: "",
		optionShow: true,
		ratioW: wx.getSystemInfoSync().windowWidth / 750
	},

	onShow: function() {
		if (this.data.toRecord) {
			this.setData({
				currentNum: 0,
				loadmore: 0,
				toRecord: false
			});
			this.findHabitChecks();
			this.getHabitNoteList();
		}
	},

	onLoad: function(options) {
		//读取本地以前操作过的显示类型
		const showType = wx.getStorageSync("showType") || 2;
		this.setData({
			id: options.id,
			name: options.name,
			showType
		});
		wx.setNavigationBarTitle({
			title: options.name
		});
		this.findHabitChecks();
		this.getHabitNoteList();
	},

	/**
	 * 页面滚动，显示隐藏分享等操作按钮
	 */
	onPageScroll(e) {
		// 获取滚动条当前位置
		if (e.scrollTop > 150 * this.data.ratioW && this.data.optionShow) {
			let animation = wx.createAnimation({
				duration: 500
			});
			animation.translateY(150 * this.data.ratioW).step();
			this.setData({
				btnAnimation: animation.export(),
				optionShow: false
			});
		} else if (e.scrollTop < 150 * this.data.ratioW && !this.data.optionShow) {
			let animation = wx.createAnimation({
				duration: 500
			});
			animation.translateY(0).step();
			this.setData({
				btnAnimation: animation.export(),
				optionShow: true
			});
		}
	},

	/**
	 * 点击打卡按钮，可能是取消打卡
	 */
	startCheck(e) {
		let day = e.currentTarget.dataset.day;
		let isCheck = e.currentTarget.dataset.check;
		if (day == "" || day == null) {
			wx.showToast({
				title: "加载中,请稍等...",
				icon: "none",
				duration: 2000
			});
			return;
		}
		if (isCheck) {
			wx.showModal({
				title: "取消打卡",
				content: "取消打卡后，该习惯当天的记录会被清空，您确定删除？",
				success: res => {
					if (res.confirm) {
						this.cancelCheck(day);
					}
				},
				confirmColor: "#ea2000",
				confirmText: "取消打卡",
				cancelText: "关闭"
			});
		} else {
			this.addCheck(day);
		}
	},

	/**
	 * 进行打卡，可能是补卡
	 */
	addCheck(day) {
		let isRepair =
			this.data.current == this.data.sevenChecks.length - 1 ? false : true;
		if (isRepair && this.data.currentEnergy < 5) {
			wx.showModal({
				title: "补卡能量不足提醒",
				content: "补卡需要使用5g能量，你的能量不足，去能量树求好友赐你能量吧？",
				success: res => {
					if (res.confirm) {
						this.lookTree();
					}
				},
				confirmColor: "#1f82d2",
				confirmText: "查看能量"
			});
			return;
		}
		habitService
			.addCheckByDay(this.data.id, day)
			.then(data => {
				wx.showToast({
					title: isRepair ? "补卡成功，能量-5g" : "打卡成功，能量+1g",
					icon: "none",
					duration: 2000
				});
				let checkId = "sevenChecks[" + this.data.current + "].checkId";
				let isCheck = "sevenChecks[" + this.data.current + "].isCheck";
				this.setData({
					[isCheck]: true,
					[checkId]: data
				});
				this.findHabitChecks();
				setTimeout(() => {
					this.startRecord(data);
				}, 1000);
			})
			.catch(err => {
				if (err && err.info) {
					wx.showModal({
						title: "打卡提示",
						content: err.info || "打卡失败"
					});
				} else {
					wx.showToast({
						title: "打卡失败",
						icon: "warn",
						duration: 2000
					});
				}
			});
	},

	/**
	 * 取消打卡，指定日期取消
	 */
	cancelCheck(day) {
		let isCheck = "sevenChecks[" + this.data.current + "].isCheck";
		habitService
			.cancelDayCheck(this.data.id, day)
			.then(data => {
				wx.showToast({
					title: "取消打卡成功",
					icon: "none",
					duration: 2000
				});
				this.setData({
					[isCheck]: false,
					currentNum: 0,
					loadmore: 0,
					feedList: [],
					dayList: []
				});
				this.findHabitChecks();
				this.getHabitNoteList();
			})
			.catch(err => {
				if (err && err.info) {
					wx.showModal({
						title: "取消打卡提示",
						content: err.info || "取消打卡失败"
					});
				} else {
					wx.showToast({
						title: "取消打卡失败",
						icon: "warn",
						duration: 2000
					});
				}
			});
	},

	/**
	 * 点击记录按钮
	 */
	clickRecord(e) {
		let checkId = e.currentTarget.dataset.checkid;
		this.startRecord(checkId);
	},

	/**
	 * 跳转到记录页面
	 */
	startRecord(checkId) {
		navigate({
			path: "pages/send/send",
			params: {
				habitId: this.data.id,
				c: checkId,
				p: this.data.isPrivate,
				r: false
			}
		});
		this.setData({
			toRecord: true
		});
	},

	/**
	 * 跳转到指定id用户页面
	 */
	toUserPage(e) {
		const id = e.currentTarget.dataset.user;
		wx.navigateTo({
			url: "../userOther/user?id=" + id
		});
	},

	/**
	 * 跳转到小学堂页面
	 */
	toSmallFeed(e) {
		wx.navigateTo({
			url: "../mindFeed/feed?id=" + this.data.id
		});
		var app = getApp();
		app.aldstat.sendEvent("点击小学堂", {
			页面: "个人打卡页"
		});
	},

	/**
	 * 跳转到日历页面
	 */
	toCalendar(e) {
		navigate({
			path: "pages/calendar/calendar",
			params: {
				id: this.data.id,
				cname: this.data.name
			}
		});
		var app = getApp();
		app.aldstat.sendEvent("查看日历", {
			页面: "个人打卡页"
		});
	},

	/**
	 * 跳转到记录卡片页面
	 * 只获取今天的卡片
	 */
	getTodayCard() {
		const checkId = this.data.sevenChecks[this.data.sevenChecks.length - 1]
			.checkId;
		const isNoted = this.data.sevenChecks[this.data.sevenChecks.length - 1]
			.isNoted;
		if (!isNoted) return;
		wx.navigateTo({
			url:
				"../makeCard/index?id=" +
				checkId +
				"&day=" +
				this.data.checkNum +
				"&name=" +
				this.data.name
		});
	},

	/**
	 * 跳转到记录卡片页面
	 * 只获取今天的记录卡片
	 */
	toGetCard(e) {
		const id = e.currentTarget.dataset.id;
		const day = e.currentTarget.dataset.day;
		wx.navigateTo({
			url:
				"../makeCard/index?id=" + id + "&day=" + day + "&name=" + this.data.name
		});
		var app = getApp();
		app.aldstat.sendEvent("查看卡片", {
			位置: "个人签到页面",
			按钮: "心情记录卡片"
		});
	},

	/**
	 * 跳转到打卡卡片页面
	 * 只获取今天的打卡卡片
	 */
	makeDayCard() {
		wx.navigateTo({
			url:
				"../makeDayCard/card?id=" +
				this.data.id +
				"&day=" +
				this.data.checkNum +
				"&name=" +
				this.data.name
		});
		var app = getApp();
		app.aldstat.sendEvent("查看卡片", {
			位置: "个人签到页面",
			按钮: "心情打卡卡片"
		});
	},

	/**
	 * 跳转到心情详情页面
	 */
	toDetail(e) {
		const noteId = e.currentTarget.dataset.id;
		if (noteId == 0 || noteId == "0") {
			return;
		}
		wx.navigateTo({
			url: "../share/index?id=" + noteId
		});
	},

	/**
	 * 跳转到树的页面
	 */
	lookTree() {
		const userInfo = habitService.getUserInfo();
		wx.navigateTo({
			url:
				"/pages/energy/energy?h=" + this.data.id + "&u=" + userInfo.id + "&s=0"
		});
		var app = getApp();
		app.aldstat.sendEvent("查看树", {
			位置: "个人签到页面"
		});
	},

	/**
	 * 复制心情内容
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

	/**
	 * 预览心情的大图
	 */
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

	/**
	 * 切换显示方式：1、竖向展示，2缩略条目展示
	 */
	changeType(e) {
		let showType = e.currentTarget.dataset.index;
		this.setData({
			showType
		});
		wx.setStorageSync("showType", showType);
	},

	/**
	 * 切换今天签到和补签swiper事件
	 * 切换后不再提示补卡
	 */
	changeSwiper(e) {
		this.setData({
			current: e.detail.current,
			isRepair: 0
		});
		//补签去刷新能量
		if (this.data.current != this.data.sevenChecks.length - 1) {
			this.getUserEnergy();
		}
	},

	/**
	 * 点击补卡按钮，滑动到补卡操作
	 */
	swiperRepair(e) {
		this.setData({
			current: this.data.current - 1
		});
	},

	/**
	 * 下拉刷新，刷新心情
	 */
	onPullDownRefresh() {
		this.setData({
			currentNum: 0,
			loadmore: 0
		});
		this.getHabitNoteList();
	},

	/**
	 * 到底加载更多，加载更多心情
	 * 未根据id分页
	 */
	onReachBottom() {
		if (this.data.loadmore == -1 || this.data.isEmpty) {
			return;
		}
		this.setData({
			currentNum: this.data.currentNum + 1,
			loadmore: 0
		});
		habitService
			.getHabitNoteList(this.data.id, this.data.currentNum)
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

	/**
	 * 获取个人的习惯心情列表
	 */
	getHabitNoteList() {
		habitService
			.getHabitNoteList(this.data.id, this.data.currentNum)
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
						isEmpty: true,
						feedList: [],
						dayList: []
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
	 * 补签页获取当前能量，能量不足即提示
	 */
	getUserEnergy() {
		const userService = new UserService();
		userService
			.getUserEnergy()
			.then(data => {
				this.setData({
					currentEnergy: data[0].total == null ? 0 : data[0].total
				});
				if (data[0].total < 5) {
					wx.showModal({
						title: "补卡能量不足提醒",
						content:
							"补卡需要使用5g能量，你的能量不足，去能量树求好友赐你能量吧？",
						success: res => {
							if (res.confirm) {
								this.lookTree();
							}
						},
						confirmColor: "#1f82d2",
						confirmText: "查看能量"
					});
				}
			})
			.catch(err => {
				console.log(err);
			});
	},

	/**
	 * 获取签到数据
	 */
	findHabitChecks() {
		habitService
			.findHabitChecks(this.data.id)
			.then(data => {
				const dateWeek = [
					{ day: "一", isCheck: data.weekChecks[0] },
					{ day: "二", isCheck: data.weekChecks[1] },
					{ day: "三", isCheck: data.weekChecks[2] },
					{ day: "四", isCheck: data.weekChecks[3] },
					{ day: "五", isCheck: data.weekChecks[4] },
					{ day: "六", isCheck: data.weekChecks[5] },
					{ day: "日", isCheck: data.weekChecks[6] }
				];

				const sevenChecks = data.sevenChecks.map(item => {
					let day = item.day.split("-");
					item.showDay = day[1] + "/" + day[2];
					return item;
				});
				this.setData({
					checkNum: data.checkNum,
					continueCount: data.continueCount,
					dateInfo: dateWeek,
					isPrivate: data.isPrivate,
					sevenChecks,
					current:
						this.data.current == -1 ? sevenChecks.length - 1 : this.data.current
				});

				//判断是否需要补签,显示补卡提示
				if (this.data.sevenChecks.length > 1) {
					const repairData = this.data.sevenChecks[
						this.data.sevenChecks.length - 2
					];
					this.setData({
						isRepair:
							this.data.isRepair == -1
								? repairData.isCheck && repairData.isNoted
									? 0
									: 1
								: this.data.isRepair,
						repairText: repairData.isCheck ? "去记录" : "去补卡"
					});
				}
			})
			.catch(err => {
				wx.showToast({
					title: err.info || "获取数据失败",
					icon: "warn",
					duration: 2000
				});
			});
	},

	/**
	 * 记录可以发送通知的formID
	 */
	submitCheck(e) {
		const formID = e.detail.formId;
		const pushService = new PushService();
		pushService
			.addPushForm(formID, 1, this.data.id)
			.then(data => {})
			.catch(err => {
				console.log(err);
			});
	},

	/**
	 * 设置记录隐私或公开
	 */
	priviteChange(e) {
		const changeValue = e.detail.value;
		habitService
			.setHabitPrivate(this.data.id, changeValue ? 2 : 1)
			.then(data => {
				this.setData({
					isPrivate: changeValue ? false : true
				});
				wx.showModal({
					title: changeValue ? "公开记录提示" : "隐私记录提示",
					content: changeValue
						? "你的记录已公开，心情将进入萌芽学堂，大家相互学习监督成长。"
						: "你的记录已只可以自己看到，萌芽学堂将不再呈现，建议公开大家相互学习监督成长。",
					showCancel: false,
					success: res => {},
					confirmText: "明白"
				});
			})
			.catch(err => {
				this.setData({
					isPrivate: changeValue
				});
			});
	},

	likeHabitNote(e) {
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

	clickComment(e) {
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

	hideComment(e) {
		let index = e.currentTarget.dataset.index;
		const noteId = e.currentTarget.dataset.id;
		let isComment = "feedList[" + index + "].isComment";
		this.setData({
			[isComment]: false
		});
	},

	sendComment(e) {
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

	onShareAppMessage(res) {
		if (res.from === "button") {
			let app = getApp();
			app.aldstat.sendEvent("用户分享", {
				位置: "个人签到页面",
				按钮: "列表按钮"
			});

			let id = res.target.dataset.id;
			let day = res.target.dataset.day;
			let path = res.target.dataset.path;
			let invite = res.target.dataset.invite;
			let toPath =
				invite == "1"
					? "/pages/mindFeed/feed?id=" + this.data.id + "&share=1"
					: "/pages/share/index?id=" + id + "&page=1";
			return {
				title:
					"我在培养「" +
					this.data.name +
					"」习惯，已经坚持" +
					this.data.checkNum +
					"天。",
				path: toPath,
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
			位置: "个人签到页面",
			按钮: "顶部按钮"
		});
		return {
			title:
				"我在培养「" +
				this.data.name +
				"」习惯，已经坚持" +
				this.data.checkNum +
				"天。",
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
