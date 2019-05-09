import BaseService from "./BaseService";
import WxService from "./WxService";
import { get } from "../utils/http";

function random_string(len) {
	len = len || 32;
	const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
	const maxPos = chars.length;
	let pwd = "";
	for (let i = 0; i < len; i++) {
		pwd += chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}

//获取文件后缀
function get_suffix(filename) {
	const pos = filename.lastIndexOf(".");
	return pos !== -1 ? filename.substring(pos) : "";
}

export default class OssService extends BaseService {
	constructor() {
		super();
		this.wxService = new WxService();
	}

	getOssPolicy(path) {
		return get("/HabitNote/getOssPolicy");
	}

	uploadFile(path) {
		let ossPath = "";
		return this.getOssPolicy()
			.then(ossData => {
				const fileName = this._getFileName(path);
				const keyName = ossData.dir + "/" + fileName;
				ossPath = ossData.host + "/" + keyName;
				const formData = {
					key: keyName,
					policy: ossData.policy,
					OSSAccessKeyId: ossData.accessid,
					success_action_status: "200", //让服务端返回200,不然，默认会返回204
					signature: ossData.signature
				};
				return this.wxService.uploadFile(ossData.host, path, formData);
			})
			.then(data => {
				return ossPath;
			});
	}

	_getFileName(path) {
		return random_string(10) + new Date().getTime() + get_suffix(path);
	}
}
