// record.
import HabitService from "../../serivce/HabitService";
import PushService from "../../serivce/PushService";
import { navigate } from "../../utils/router";
const habitService = new HabitService();
const pushService = new PushService();
import UserService from "../../serivce/UserService";

Page({
	data: {
		id: 0,
		name: "",
		isPrivate: true,
		isEmpty: false,
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
		loadmore: 0,
		currentEnergy: 0,
		feedList: [],
		userList: [],
		userRanks: [],
		currentNum: 0,
		currentTab: 0,
		ft_user: 0,
		ft_check: 0,
		grouper: false,
		habitNotice: "",
		toRecord: false,
		repairText: "去补卡",
		isJoin: true,
		isScene: false,
		isLogin: false,
		isLastDay: false,
		hideModal: true, //模态框的状态  true-隐藏  false-显示
		animationData: {}, //底部操作栏动画数据集合
		beCommentedId: "",
		atUserName: "",
		current: -1,
		isRepair: -1, //1要补卡，0不用补卡，-1，未加载
		canRepair: false,
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
			this.initLoad();
		}
		this.getHabitNotice();
	},

	/**
	 * 初始化加载内容
	 */
	initLoad() {
		this.setData({
			currentNum: 0,
			loadmore: 0,
			toRecord: false
		});
		this.findHabitChecks();
		//延时加载
		setTimeout(() => {
			if (this.data.currentTab == 1) {
				this.getHabitGroupStatistics();
				this.getHabitGroupUser();
			} else if (this.data.currentTab == 0) {
				this.getHabitGroupNote();
			} else {
				this.getGroupUserByRank();
			}
		}, 350);
	},

	onLoad: function(query) {
		const scene = decodeURIComponent(query.scene);
		const app = getApp();
		if (scene != "" && scene != undefined && scene != "undefined") {
			this.setData({
				id: scene,
				isLogin: app.getLoginStatus(),
				isScene: true,
				currentTab: 2
			});
		} else {
			this.setData({
				id: query.id,
				name: query.name,
				isJoin: true,
				isLogin: app.getLoginStatus()
			});
		}

		habitService
			.getHabit(this.data.id)
			.then(data => {
				this.setData({
					name: data.name,
					isJoin: data.isJoin,
					currentTab: data.isJoin ? 0 : 2
				});
				wx.setNavigationBarTitle({
					title: data.name
				});
				this.initLoad();
			})
			.catch(err => {});
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
	 * 点击加入习惯按钮，
	 * 先判断是否已经加入
	 */
	joinHabit() {
		if (!this.data.isLogin) {
			habitService
				.getHabit(this.data.id)
				.then(data => {
					this.setData({
						name: data.name,
						isJoin: data.isJoin,
						isLogin: true,
						currentTab: data.isJoin ? 0 : 2
					});
					if (!data.isJoin) {
						this.joinGroupHabit();
					} else {
						this.initLoad();
					}
				})
				.catch(err => {});
		} else {
			this.joinGroupHabit();
		}
	},

	/**
	 * 加入习惯
	 */
	joinGroupHabit() {
		habitService
			.joinGroupHabit(this.data.id)
			.then(data => {
				wx.showModal({
					title: "加入习惯圈子成功",
					showCancel: false,
					content:
						"请按照圈子主题打卡记录，圈主如果把你踢出圈子，习惯将被删除。邀请更多好友一起来活跃圈子吧。",
					confirmText: "确定",
					success: res => {}
				});
				this.setData({
					isJoin: true,
					currentTab: 0
				});
				this.initLoad();
			})
			.catch(err => {
				if (err && err.status === 13005) {
					wx.showModal({
						title: "加入失败",
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
					wx.showModal({
						title: "加入失败",
						content: err.info || "",
						confirmText: "去首页",
						success: res => {
							if (res.confirm) {
								wx.switchTab({
									url: "../habit/habit"
								});
							}
						}
					});
				}
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
	 * 回到首页
	 */
	backHome() {
		wx.switchTab({
			url: "../habit/habit"
		});
	},

	/**
	 * 点击其他用户进入他主页
	 */
	toUserPage(e) {
		var id = e.currentTarget.dataset.user;
		wx.navigateTo({
			url: "../userOther/user?id=" + id
		});
	},

	/**
	 * 点击切换今天和昨天的打卡用户统计
	 */
	onLastDay() {
		this.setData({
			isLastDay: !this.data.isLastDay,
			userList: []
		});
		this.getHabitGroupUser();
	},

	/**
	 * 点击进入自己的记录
	 */
	clickHabit(e) {
		wx.navigateTo({
			url: "../mindUser/feed?id=" + this.data.id + "&day=" + this.data.checkNum
		});
		var app = getApp();
		app.aldstat.sendEvent("点击足迹", {
			页面: "圈子打卡页"
		});
	},

	/**
	 * 点击tab切换
	 */
	swichNav(e) {
		if (this.data.currentTab === e.target.dataset.current) {
			return false;
		} else {
			this.setData({
				currentTab: e.target.dataset.current,
				currentNum: 0,
				loadmore: 0,
				isEmpty: false
			});
			if (this.data.currentTab == 1) {
				this.getHabitGroupStatistics();
				this.getHabitGroupUser();
			} else if (this.data.currentTab == 0) {
				this.setData({
					feedList: [],
					loadmore: 0
				});
				this.getHabitGroupNote();
			} else {
				this.getGroupUserByRank();
			}
		}
	},

	/**
	 * 获取公告和圈子是否可以补卡设置
	 */
	getHabitNotice() {
		habitService
			.getHabitNotice(this.data.id)
			.then(data => {
				this.setData({
					habitNotice: data.notice,
					grouper: data.grouper,
					canRepair: parseInt(data.repair) == 1 ? true : false
				});
			})
			.catch(err => {});
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
				if (this.data.currentTab == 1) {
					this.getHabitGroupUser();
				} else if (this.data.currentTab == 0) {
					this.getHabitGroupNote();
				} else {
					this.getGroupUserByRank();
				}
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
	 * 隐私公开切换
	 */
	priviteChange(e) {
		if (e.detail.value) {
			habitService
				.setHabitPrivate(this.data.id, 2)
				.then(data => {
					this.setData({
						isPrivate: false
					});
					wx.showModal({
						title: "公开记录提示",
						content:
							"你的记录已公开，心情将进入萌芽学堂，大家相互学习监督成长。",
						showCancel: false,
						success: res => {},
						confirmText: "明白"
					});
				})
				.catch(err => {
					this.setData({
						isPrivate: e.detail.value
					});
				});
		} else {
			habitService
				.setHabitPrivate(this.data.id, 1)
				.then(data => {
					this.setData({
						isPrivate: true
					});
					wx.showModal({
						title: "隐私记录提示",
						content:
							"你的记录已只可以自己看到，萌芽学堂将不再呈现，建议公开大家相互学习监督成长。",
						showCancel: false,
						success: res => {},
						confirmText: "明白"
					});
				})
				.catch(err => {
					this.setData({
						isPrivate: e.detail.value
					});
				});
		}
	},

	/**
	 * 进入获取圈子二维码页面
	 */
	groupCard() {
		navigate({
			path: "pages/shareFt/share",
			params: {
				habitId: this.data.id,
				p: this.data.isPrivate,
				r: false
			}
		});
		this.setData({
			hideModal: true
		});
		var app = getApp();
		app.aldstat.sendEvent("查看卡片", {
			位置: "圈子签到页面",
			按钮: "圈子卡片"
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
			位置: "圈子签到页面",
			按钮: "心情打卡卡片"
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
			位置: "圈子签到页面"
		});
	},

	/**
	 * 跳转到统计日历的页面
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
			页面: " 圈子打卡页"
		});
	},

	/**
	 * 跳转到管理页面
	 */
	toManage(e) {
		navigate({
			path: "pages/manageFt/manage",
			params: {
				id: this.data.id,
				cname: this.data.name
			}
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

	/**
	 * 进入圈子公告页面
	 */
	setNotice() {
		if (this.data.grouper) {
			wx.navigateTo({
				url: "../habitNotice/notice?id=" + this.data.id
			});
		} else {
			wx.showModal({
				title: "圈子公告",
				content: this.data.habitNotice,
				showCancel: false,
				success: res => {},
				confirmText: "确定"
			});
		}
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

	onReachBottom() {
		if (this.data.loadmore == -1 || this.data.isEmpty) {
			return;
		}
		this.setData({
			currentNum: this.data.currentNum + 1,
			loadmore: 0
		});
		if (this.data.currentTab == 1) {
			habitService
				.getHabitGroupUser(
					this.data.id,
					this.data.isLastDay ? "-1" : "0",
					this.data.currentNum
				)
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
		} else if (this.data.currentTab == 0) {
			habitService
				.getHabitGroupNote(
					this.data.id,
					this.data.currentNum,
					this.data.currentTab == 0 ? 0 : 1
				)
				.then(data => {
					if (data.length > 0) {
						this.setData({
							feedList: [...this.data.feedList, ...data],
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
		} else {
			habitService
				.getGroupUserByRank(this.data.id, this.data.currentNum)
				.then(data => {
					if (data.length > 0) {
						this.setData({
							userRanks: [...this.data.userRanks, ...data],
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
		}
	},

	onPullDownRefresh() {
		wx.stopPullDownRefresh();
		this.setData({
			currentNum: 0,
			loadmore: 0
		});
		if (this.data.currentTab == 1) {
			this.getHabitGroupUser();
		} else if (this.data.currentTab == 0) {
			this.getHabitGroupNote();
		} else {
			this.getGroupUserByRank();
		}
	},

	getHabitGroupNote() {
		habitService
			.getHabitGroupNote(
				this.data.id,
				this.data.currentNum,
				this.data.currentTab == 0 ? 0 : 1
			)
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
			})
			.catch(err => {
				this.setData({
					loadmore: 1,
					isEmpty: true
				});
			});
	},

	getHabitGroupUser() {
		habitService
			.getHabitGroupUser(
				this.data.id,
				this.data.isLastDay ? "-1" : "0",
				this.data.currentNum
			)
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
		this.getHabitGroupStatistics();
	},

	getGroupUserByRank() {
		habitService
			.getGroupUserByRank(this.data.id, this.data.currentNum)
			.then(data => {
				if (data.length > 0) {
					this.setData({
						userRanks: data,
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

	getHabitGroupStatistics() {
		habitService
			.getHabitGroupStatistics(this.data.id, this.data.isLastDay ? "-1" : "0")
			.then(data => {
				this.setData({
					ft_user: data[0].u_count,
					ft_check: data[0].c_count
				});
			})
			.catch(err => {});
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

	submitCheck(e) {
		const formID = e.detail.formId;
		pushService
			.addPushForm(formID, 1, this.data.id)
			.then(data => {
				console.log(data);
			})
			.catch(err => {
				console.log(err);
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

	showModal() {
		var that = this;
		that.setData({
			hideModal: false
		});
		var animation = wx.createAnimation({
			duration: 500, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
			timingFunction: "ease" //动画的效果 默认值是linear
		});
		this.animation = animation;
		setTimeout(function() {
			that.fadeIn(); //调用显示动画
		}, 50);
	},

	// 隐藏遮罩层
	hideModal() {
		var that = this;
		var animation = wx.createAnimation({
			duration: 300, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
			timingFunction: "ease" //动画的效果 默认值是linear
		});
		this.animation = animation;
		that.fadeDown(); //调用隐藏动画
		setTimeout(function() {
			that.setData({
				hideModal: true
			});
		}, 240); //先执行下滑动画，再隐藏模块
	},

	//底部操作栏动画集
	fadeIn() {
		this.animation.translateY(0).step();
		this.setData({
			animationData: this.animation.export() //动画实例的export方法导出动画数据传递给组件的animation属性
		});
	},

	fadeDown() {
		this.animation.translateY(300).step();
		this.setData({
			animationData: this.animation.export()
		});
	},

	onShareAppMessage(res) {
		if (res.from === "button") {
			let invite = res.target.dataset.invite;
			var app = getApp();
			app.aldstat.sendEvent("用户分享", {
				位置: "群签到页面",
				按钮: "列表按钮" + invite
			});
			let shareTitle =
				"我在培养「" +
				this.data.name +
				"」习惯，已经坚持" +
				this.data.checkNum +
				"天。";
			let shareImage = "";
			if (invite == 1) {
				// 来自页面内转发按钮,邀请更多伙伴
				let userInfo = habitService.getUserInfo();
				shareTitle =
					userInfo.nickname +
					"邀请你一起培养「" +
					this.data.name +
					"」习惯，一起来遇见更好的自己";
				shareImage =
					"http://xiaeke.oss-cn-shanghai.aliyuncs.com/habit/qun/group_share.jpg";
			} else if (invite == 2) {
				// 来自页面内转发按钮,未打卡提醒他
				let name = res.target.dataset.name;
				shareTitle =
					name + "你的习惯「" + this.data.name + "」今天还没有行动哦";
				shareImage =
					"http://xiaeke.oss-cn-shanghai.aliyuncs.com/habit/qun/group_nocheck.jpg";
			} else if (invite == 3) {
				// 来自页面内转发按钮,打卡赞扬他
				let days = res.target.dataset.days;
				let name = res.target.dataset.name;
				shareTitle =
					"哇塞！" +
					name +
					"你已经坚持「" +
					this.data.name +
					"」" +
					days +
					"天啦！厉害啦！";
				shareImage =
					"http://xiaeke.oss-cn-shanghai.aliyuncs.com/habit/qun/group_check.jpg";
			} else if (invite == 0) {
				var day = res.target.dataset.day;
				var path = res.target.dataset.path;
				var name = res.target.dataset.name;
				if (name != "" && name != null) {
					shareTitle = "培养「" + name + "」习惯，萌友已经坚持" + day + "天。";
					shareImage = path;
				}
			}
			return {
				title: shareTitle,
				path: "/pages/checkFt/check?scene=" + this.data.id,
				imageUrl: shareImage,
				success: function(res) {
					// 转发成功
				},
				fail: function(res) {
					// 转发失败
				}
			};
		} else {
			var app = getApp();
			app.aldstat.sendEvent("用户分享", {
				位置: "群签到页面",
				按钮: "顶部按钮"
			});
			return {
				title:
					"我在培养「" +
					this.data.name +
					"」习惯，已经坚持" +
					this.data.checkNum +
					"天。",
				path: "/pages/checkFt/check?scene=" + this.data.id,
				success: function(res) {
					// 转发成功
				},
				fail: function(res) {
					// 转发失败
				}
			};
		}
	}
});
