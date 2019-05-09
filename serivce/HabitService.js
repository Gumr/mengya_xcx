import BaseService from "./BaseService";
import { post, get } from "../utils/http";

export default class HabitService extends BaseService {
	/**
	 * 获取习惯列表
	 */
	getHabits() {
		return get("/HabitList/getUserHabitList", {
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	getUserHabits(otherId) {
		return get("/HabitList/getOtherUserHabitList", {
			user_id: this.getUserId(),
			other_id: otherId
		}).then(this.handleRespond);
	}

	/**
	 * 获取用户归档的习惯列表
	 */
	getUserStoreHabitList(otherId) {
		return get("/HabitList/getUserStoreHabitList", {
			user_id: this.getUserId(),
			other_id: otherId
		}).then(this.handleRespond);
	}

	setUserHabitSort(ids) {
		return get("/HabitList/setUserHabitSort", {
			user_id: this.getUserId(),
			sort_ids: ids
		}).then(this.handleRespond);
	}

	/**
	 * 获取习惯信息
	 */
	getHabit(habitId) {
		return get("/HabitList/getHabitInfo", {
			user_id: this.getUserId(),
			habit_id: habitId
		}).then(this.handleRespond);
	}

	/**
	 * 删除习惯
	 * @param {number} id
	 */
	deleteHabit(id) {
		return get(
			"/HabitList/deleteHabit",
			{ id, user_id: this.getUserId() },
			{ loadingMsg: "删除中" }
		).then(this.handleRespond);
	}

	/**
	 * 归档习惯
	 * @param {number} id
	 */
	storeHabit(id) {
		return get(
			"/HabitList/storeHabit",
			{ id, user_id: this.getUserId() },
			{ loadingMsg: "归档中" }
		).then(this.handleRespond);
	}

	/**
	 * 恢复习惯
	 * @param {number} id
	 */
	takeOutHabit(id) {
		return get(
			"/HabitList/takeOutHabit",
			{ id, user_id: this.getUserId() },
			{ loadingMsg: "读档中" }
		).then(this.handleRespond);
	}

	/**
	 * 创建习惯
	 * @param {string} name
	 */
	createHabit(name) {
		return get(
			"/HabitList/createHabit",
			{ name, user_id: this.getUserId() },
			{ loadingMsg: "创建中" }
		).then(this.handleRespond);
	}

	/**
	 * 加入习惯
	 * @param {string} habitId
	 */
	joinHabit(habitId) {
		return get(
			"/HabitList/joinHabit",
			{
				habit_id: habitId,
				user_id: this.getUserId()
			},
			{ loadingMsg: "加入中..." }
		).then(this.handleRespond);
	}

	/**
	 * 创建群习惯
	 * @param {string} name
	 * @param {string} type
	 */
	createGroupHabit(name, habitType, notice, isRepair) {
		return get(
			"/HabitList/createGroupHabit",
			{
				name,
				habit_type: habitType,
				notice,
				repair: isRepair,
				user_id: this.getUserId()
			},
			{ loadingMsg: "创建中" }
		).then(this.handleRespond);
	}

	/**
	 * 加入群习惯
	 * @param {string} name
	 * @param {string} type
	 */
	joinGroupHabit(habitId) {
		return get(
			"/HabitList/joinGroupHabit",
			{
				habit_id: habitId,
				user_id: this.getUserId()
			},
			{ loadingMsg: "加入中..." }
		).then(this.handleRespond);
	}

	/**
	 * 搜索习惯
	 * @param {number} name
	 */
	searchHabit(name) {
		return get("/HabitList/searchHabit", { name }).then(this.handleRespond);
	}

	/**
	 * 获取推荐习惯
	 */
	getRecommendHabit(type) {
		return get(
			"/HabitList/getRecommendHabit",
			{ type },
			{
				noNeedPsw: true
			}
		).then(this.handleRespond);
	}

	/**
	 * 获取推荐习惯
	 */
	getRecommendHabitBySearch(content) {
		return get(
			"/HabitList/getRecommendBySearch",
			{ content },
			{
				noNeedPsw: true
			}
		).then(this.handleRespond);
	}

	/**
	 * 获取推荐群习惯
	 */
	getGroupOpenHabit() {
		return get(
			"/HabitList/getGroupOpenHabit",
			{},
			{
				noNeedPsw: true
			}
		).then(this.handleRespond);
	}

	/**
	 * 获取推荐习惯类别列表
	 */
	getRecommendType() {
		return get("/HabitList/getRecommendTypeList").then(this.handleRespond);
	}

	/**
	 * 获取习惯图标
	 */
	getHabitIcons(page) {
		return get("/HabitList/getHabitIconList", {
			page,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 修改习惯的图标
	 * @param {number} id
	 */
	changeHabitIcon(habit_id, iconUrl) {
		return get("/HabitList/changeHabitIcon", {
			habit_id,
			user_id: this.getUserId(),
			url: iconUrl
		}).then(this.handleRespond);
	}

	/**
	 * 获取个人习惯记录
	 * @param {number} habit_id
	 * @param {number} num
	 */
	getHabitNoteList(habit_id, num) {
		return get("/HabitNote/getHabitNoteList", {
			habit_id,
			num,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取个人习惯记录
	 * @param {number} habit_id
	 * @param {number} num
	 */
	getUserHabitNoteList(userId, habit_id, num) {
		return get("/HabitNote/getHabitNoteList", {
			habit_id,
			num,
			user_id: userId == undefined || userId == 0 ? this.getUserId() : userId
		}).then(this.handleRespond);
	}

	/**
	 * 获取习惯群记录
	 * @param {number} habit_id
	 * @param {number} num
	 * @param {number} isSelf
	 */
	getHabitGroupNote(habit_id, num, isSelf) {
		return get("/HabitNote/getHabitGroupNote", {
			habit_id,
			num,
			user_id: this.getUserId(),
			personal: isSelf
		}).then(this.handleRespond);
	}

	/**
	 * 获取习惯群统计
	 * @param {number} habit_id
	 */
	getHabitGroupStatistics(habit_id, day_last) {
		return get("/HabitNote/getHabitGroupStatistics", {
			habit_id,
			day_last,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取习惯群用户分页
	 * @param {number} habit_id
	 * @param {number} num
	 */
	getHabitGroupUser(habit_id, day_last, num) {
		return get("/HabitNote/getHabitGroupUser", {
			habit_id,
			num,
			day_last,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取群用户的打卡排行
	 * @param {number} habit_id
	 * @param {number} num
	 */
	getGroupUserByRank(habit_id, num) {
		return get("/HabitNote/getGroupUserByRank", {
			habit_id,
			num,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取习惯群所有用户
	 * @param {number} habit_id
	 * @param {number} num
	 */
	getHabitAllGroupUser(habit_id) {
		return get("/HabitNote/getHabitGroupUser", {
			habit_id,
			num: 0,
			day_last: 0,
			user_id: this.getUserId(),
			size: "300"
		}).then(this.handleRespond);
	}

	/**
	 * 删除群习惯的用户
	 * @param {number} habit_id
	 * @param {number} deleteUserId
	 */
	deleteGroupUser(habit_id, deleteUserId) {
		return get("/HabitNote/deleteGroupUser", {
			habit_id,
			delete_id: deleteUserId,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 点赞习惯心情
	 * @param {number} note_id
	 */
	likeNote(note_id) {
		return get("/HabitNote/likeNote", {
			note_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 取消点赞习惯心情
	 * @param {number} note_id
	 */
	cancelLikeNote(note_id) {
		return get("/HabitNote/cancelLikeNote", {
			note_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 评论习惯心情
	 * @param {number} note_id
	 * @param {string} conent
	 * @param {number} be_commented_id
	 */
	commentNote(note_id, content, be_commented_id) {
		return get("/HabitNote/commentNote", {
			note_id,
			user_id: this.getUserId(),
			content,
			be_commented_id
		}).then(this.handleRespond);
	}

	/**
	 * 删除评论
	 * @param {number} commented_id
	 */
	deleteComment(comment_id) {
		return get("/HabitNote/deleteComment", {
			user_id: this.getUserId(),
			comment_id
		}).then(this.handleRespond);
	}

	/**
	 * 查看单个习惯的公告
	 * @param {number} id
	 */
	getHabitNotice(habit_id) {
		return get("/HabitList/getHabitNotice", {
			habit_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 修改习惯的公告
	 * @param {number} id
	 */
	changeHabitNotice(habit_id, notice) {
		return get("/HabitList/changeHabitNotice", {
			habit_id,
			user_id: this.getUserId(),
			notice
		}).then(this.handleRespond);
	}

	/**
	 * 修改习惯的7天补卡设置
	 * @param {number} id
	 */
	changeHabitRepair(habit_id, repair) {
		return get("/HabitList/changeHabitRepair", {
			habit_id,
			user_id: this.getUserId(),
			repair
		}).then(this.handleRespond);
	}

	/**
	 * 查看单个习惯过去七天打卡情况
	 * @param {number} id
	 */
	findHabitCheck(id, repair) {
		return get("/HabitCheck/findHabitCheck", {
			id,
			user_id: this.getUserId(),
			isRepair: repair ? 1 : 0
		}).then(this.handleRespond);
	}

	/**
	 * 查看单个习惯最近七天打卡情况
	 * @param {number} id
	 */
	findHabitChecks(habit_id) {
		return get("/HabitCheck/findHabitChecks", {
			habit_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 统计单个习惯打卡次数
	 * @param {number} id
	 */
	getHabitTree(habitId, userId) {
		return get("/HabitCheck/getHabitTree", {
			id: habitId,
			user_id: userId
		}).then(this.handleRespond);
	}

	/**
	 * 打卡
	 * @param {number} habit_id 习惯id
	 * @param {string} day 打卡的日期格式"Y-m-d"
	 */
	addCheckByDay(habit_id, day) {
		return get(
			"/HabitCheck/addCheckByDay",
			{ habit_id, day, user_id: this.getUserId() },
			{ loadingMsg: "" }
		).then(this.handleRespond);
	}

	/**
	 * 取消打卡
	 * @param {number} habit_id 习惯id
	 * @param {string} day 打卡的日期格式"Y-m-d"
	 */
	cancelDayCheck(habit_id, day) {
		return get(
			"/HabitCheck/cancelDayCheck",
			{ habit_id, day, user_id: this.getUserId() },
			{ loadingMsg: "" }
		).then(this.handleRespond);
	}

	/**
	 * 打卡
	 * @param {number} id
	 */
	checkHabit(id) {
		return get(
			"/HabitCheck/addCheck",
			{ id, user_id: this.getUserId() },
			{ loadingMsg: "" }
		).then(this.handleRespond);
	}

	cancelHabit(id) {
		return get(
			"/HabitCheck/cancelCheck",
			{ id, user_id: this.getUserId() },
			{ loadingMsg: "" }
		).then(this.handleRespond);
	}

	/**
	 * 添加习惯记录
	 * @param {number} check_id
	 * @param {number} habit_id
	 * @param {string} picUrl
	 * @param {string} note
	 */
	addRecord(check_id, habit_id, note, picUrl) {
		return post("/HabitNote/addRecord", {
			check_id,
			habit_id,
			picUrl,
			note,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取签到日期
	 * @param {number} id
	 */
	getCheckDays(id) {
		return get("/HabitCheck/findCheckDays", {
			id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取签到心情
	 * @param {number} id
	 */
	getHabitNote(check_id) {
		return get("/HabitNote/getHabitNoteById", {
			check_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取的心情
	 * @param {number} last_id
	 * @param {number} noteType 0：热门；1：关注；2：最新
	 */
	getMindNoteList(last_id, noteType) {
		let listUrl = "getHabitNoteOpenList";
		if (noteType == 0) {
			listUrl = "getHotNoteOpenList";
		} else if (noteType == 1) {
			listUrl = "listAllNotesByAttention";
		}
		return get("/HabitNote/" + listUrl, {
			last_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取热门的心情
	 * @param {number} id
	 */
	getHotNoteOpenList(last_id) {
		return get("/HabitNote/getHotNoteOpenList", {
			last_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取萌芽学堂心情
	 * @param {number} id
	 */
	getHabitNoteOpen(last_id) {
		return get("/HabitNote/getHabitNoteOpenList", {
			last_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取关注的用户心情
	 * @param {number} id
	 */
	listAllNotesByAttention(last_id) {
		return get("/HabitNote/listAllNotesByAttention", {
			last_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取指定习惯公开的心情
	 * @param {number} habit_id
	 * @param {number} last_id
	 */
	getOpenNoteByHabit(habit_id, last_id) {
		return get("/HabitNote/getOpenNoteByHabit", {
			habit_id,
			last_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取指定用户公开的心情
	 * @param {number} habit_id
	 * @param {number} last_id
	 */
	getOpenNoteByUser(otherId, last_id) {
		return get("/HabitNote/getNoteByUser", {
			other_id: otherId,
			last_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取卡片
	 */
	getCard() {
		return get("/HabitNote/getTodayCard", {
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	getRandCard() {
		return get("/HabitNote/getRandCard", {
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取习惯记录
	 * @param {number} habit_id
	 * @param {number} num
	 */
	setHabitPrivate(habit_id, isPrivate) {
		return get("/HabitList/setHabitPrivate", {
			habit_id,
			is_private: isPrivate,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 设置是否可以通知
	 * @param {number} habit_id
	 * @param {number} num
	 */
	setUserCanMsg(canMsg) {
		return get("/HabitUser/setUserCanMsg", {
			can_msg: canMsg,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取分享的心情
	 * @param {number} id
	 */
	getHabitNoteShare(noteId) {
		return get("/HabitNote/getHabitNoteShare", {
			id: noteId,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取分享群信息
	 * @param {number} id
	 */
	getShareGroupHabit(habitId, userId) {
		return get("/HabitList/getShareGroupHabit", {
			habit_id: habitId,
			user_id: userId
		}).then(this.handleRespond);
	}
}
