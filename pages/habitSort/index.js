import HabitService from "../../serivce/HabitService";
const habitService = new HabitService();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		habitList: [],
		movableViewInfo: {
			y: 0,
			showClass: "none",
			data: {}
		},
		pageInfo: {
			rowHeight: 47,
			scrollHeight: 100,
			startIndex: null,
			scrollY: true,
			readyPlaceIndex: null,
			startY: 0,
			selectedIndex: null
		}
	},

	dragStart: function(event) {
		let startIndex = event.target.dataset.index;
		// 初始化页面数据
		let pageInfo = this.data.pageInfo;
		pageInfo.startY = event.touches[0].clientY;
		pageInfo.readyPlaceIndex = startIndex;
		pageInfo.selectedIndex = startIndex;
		pageInfo.scrollY = false;
		pageInfo.startIndex = startIndex;
		// 初始化拖动控件数据
		let movableViewInfo = this.data.movableViewInfo;
		movableViewInfo.data = this.data.habitList[startIndex].name;
		movableViewInfo.showClass = "inline";
		movableViewInfo.y = pageInfo.startY - pageInfo.rowHeight / 2;

		this.setData({
			movableViewInfo: movableViewInfo,
			pageInfo: pageInfo
		});
	},

	dragMove: function(event) {
		let habitList = this.data.habitList;
		let pageInfo = this.data.pageInfo;
		// 计算拖拽距离
		let movableViewInfo = this.data.movableViewInfo;
		let movedDistance = event.touches[0].clientY - pageInfo.startY;
		movableViewInfo.y =
			pageInfo.startY - pageInfo.rowHeight / 2 + movedDistance;

		// 修改预计放置位置
		let movedIndex = parseInt(movedDistance / pageInfo.rowHeight);
		let readyPlaceIndex = pageInfo.startIndex + movedIndex;
		if (readyPlaceIndex < 0) {
			readyPlaceIndex = 0;
		} else if (readyPlaceIndex >= habitList.length) {
			readyPlaceIndex = habitList.length - 1;
		}

		if (readyPlaceIndex != pageInfo.selectedIndex) {
			let selectedData = habitList[pageInfo.selectedIndex];
			habitList.splice(pageInfo.selectedIndex, 1);
			habitList.splice(readyPlaceIndex, 0, selectedData);
			pageInfo.selectedIndex = readyPlaceIndex;
		}
		// 移动movableView
		pageInfo.readyPlaceIndex = readyPlaceIndex;

		this.setData({
			movableViewInfo,
			habitList,
			pageInfo
		});
	},

	dragEnd: function(event) {
		// 重置页面数据
		let pageInfo = this.data.pageInfo;
		pageInfo.readyPlaceIndex = null;
		pageInfo.startY = null;
		pageInfo.selectedIndex = null;
		pageInfo.startIndex = null;
		pageInfo.scrollY = true;
		// 隐藏movableView
		let movableViewInfo = this.data.movableViewInfo;
		movableViewInfo.showClass = "none";

		this.setData({
			pageInfo: pageInfo,
			movableViewInfo: movableViewInfo
		});
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.loadHabits();
		const winWidth = wx.getSystemInfoSync().windowWidth;
		const height = wx.getSystemInfoSync().windowHeight;
		let ratio = winWidth / 750;
		this.setData({
			["pageInfo.scrollHeight"]: (height - 120 * ratio) * 100 / height
		});
	},

	cancelSort() {
		wx.navigateBack();
	},

	sortOk() {
		const sortList = this.data.habitList.map((habit, index) => {
			return habit.id + "," + (index + 1);
		});
		habitService
			.setUserHabitSort(sortList.join("#"))
			.then(data => {
				wx.showToast({
					title: "排序成功",
					icon: "success",
					duration: 2000
				});
				setTimeout(() => {
					wx.navigateBack();
				}, 2000);
			})
			.catch(err => {
				wx.showToast({
					title: "排序失败",
					icon: "none",
					duration: 2000
				});
			});
	},

	loadHabits() {
		habitService
			.getHabits()
			.then(data => {
				if (data.length > 0) {
					const habitList = data.map(habit => {
						habit.join_days =
							habit.join_days == null ? 1 : parseInt(habit.join_days) + 1;
						habit.txtStyle = "";
						return habit;
					});
					this.setData({
						habitList
					});
				} else {
					this.setData({
						habitList: []
					});
				}
				wx.hideLoading();
			})
			.catch(err => {
				this.setData({
					habitList: ""
				});
				wx.hideLoading();
			});
	}
});
