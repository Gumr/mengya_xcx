import BaseService from "./BaseService";
import { post, get } from "../utils/http";

export default class PushService extends BaseService {
	/**
	 * 添加推送类型
	 * @param {string} form_id，
	 * @param {string} push_type //1:打卡提醒；2:习惯创建提醒；3:vip购买成功
	 */
	addPushForm(form_id, push_type, habit_id) {
		return get("/HabitPush/addPushForm", {
			form_id,
			push_type,
			habit_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}
}
