// pages/calendar/calendar.js
import HabitService from "../../serivce/HabitService";

const conf = {
	data: {
		id: 0,
		name: "",
		hasEmptyGrid: false,
		checkDays: [],
		checkNum: 0,
		continueCount: 0,
		startNum: 0
	},

	getCheckDayByUser(id) {
		const habitService = new HabitService();
		habitService
			.getCheckDays(id)
			.then(data => {
				this.setData({
					checkDays: data.checkDays,
					checkNum: data.checkNum,
					continueCount: data.continueCount,
					startNum: data.disDays == "未知" ? "未知" : parseInt(data.disDays) + 1
				});
				const date = new Date();
				const cur_year = date.getFullYear();
				const cur_month = date.getMonth() + 1;
				this.calculateDays(cur_year, cur_month);
			})
			.catch(err => {
				wx.showToast({
					title: err.info || "获取数据失败",
					icon: "warn",
					duration: 2000
				});
			});
	},

	initCalendar: function() {
		const date = new Date();
		const cur_year = date.getFullYear();
		const cur_month = date.getMonth() + 1;
		const weeks_ch = ["日", "一", "二", "三", "四", "五", "六"];
		this.calculateEmptyGrids(cur_year, cur_month);
		this.calculateDays(cur_year, cur_month, false);
		this.setData({
			cur_year,
			cur_month,
			weeks_ch
		});
	},

	onLoad: function(options) {
		// this.setData({
		// 	id: options.id,
		// 	name: options.name
		// });
		this.initCalendar();
		this.getCheckDayByUser(options.id);
	},

	getThisMonthDays(year, month) {
		return new Date(year, month, 0).getDate();
	},

	getFirstDayOfWeek(year, month) {
		return new Date(Date.UTC(year, month - 1, 1)).getDay();
	},

	calculateEmptyGrids(year, month) {
		const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
		let empytGrids = [];
		if (firstDayOfWeek > 0) {
			for (let i = 0; i < firstDayOfWeek; i++) {
				empytGrids.push(i);
			}
			this.setData({
				hasEmptyGrid: true,
				empytGrids
			});
		} else {
			this.setData({
				hasEmptyGrid: false,
				empytGrids: []
			});
		}
	},

	isCheckDay(year, mouth, day) {
		var checkArray = this.data.checkDays;
		for (let i = 0; i < checkArray.length; i++) {
			var date = checkArray[i].split("-");
			if (
				parseInt(date[0]) == year &&
				parseInt(date[1]) == mouth &&
				parseInt(date[2]) == day
			) {
				return true;
			}
		}
		return false;
	},

	calculateDays(year, month, needCheck = true) {
		let days = [];

		const thisMonthDays = this.getThisMonthDays(year, month);
		for (let i = 1; i <= thisMonthDays; i++) {
			let isCheck = false;
			if (needCheck) {
				isCheck = this.isCheckDay(year, month, i);
			}
			days.push({
				day: i,
				choosed: isCheck
			});
		}

		this.setData({
			days
		});
	},

	handleCalendar(e) {
		const handle = e.currentTarget.dataset.handle;
		const cur_year = this.data.cur_year;
		const cur_month = this.data.cur_month;
		if (handle === "prev") {
			let newMonth = cur_month - 1;
			let newYear = cur_year;
			if (newMonth < 1) {
				newYear = cur_year - 1;
				newMonth = 12;
			}

			this.calculateDays(newYear, newMonth);
			this.calculateEmptyGrids(newYear, newMonth);

			this.setData({
				cur_year: newYear,
				cur_month: newMonth
			});
		} else {
			let newMonth = cur_month + 1;
			let newYear = cur_year;
			if (newMonth > 12) {
				newYear = cur_year + 1;
				newMonth = 1;
			}

			this.calculateDays(newYear, newMonth);
			this.calculateEmptyGrids(newYear, newMonth);

			this.setData({
				cur_year: newYear,
				cur_month: newMonth
			});
		}
	},

	tapDayItem(e) {
		const idx = e.currentTarget.dataset.idx;
		const days = this.data.days;
		days[idx].choosed = !days[idx].choosed;
		this.setData({
			days
		});
	},

	onShareAppMessage() {
		var app = getApp();
		app.aldstat.sendEvent("用户分享", {
			位置: "打卡日历",
			按钮: "顶部按钮"
		});
		return {
			title: "打卡日历",
			desc: "每天培养习惯，一步一个脚印。",
			path: "pages/create/create"
		};
	}
};

Page(conf);
