import BaseService from "./BaseService";
import md5 from "../lib/md5";

export default class SignatureService extends BaseService {
	salt = "SDasd13as1zdfweA";

	/**
	 * 签名
	 * @param text
	 * @returns {*}
	 */
	sign(text) {
		const userInfo = this.getUserInfo();
		const { id, register_time } = userInfo;
		return md5.hex_md5(id + Date.parse(register_time) + this.salt + text);
	}

	/**
	 * 验签
	 * @param signature
	 * @param text
	 * @returns {boolean}
	 */
	checkSignature(signature, text) {
		console.log(this.sign(text), signature);
		return this.sign(text).startsWith(signature);
	}
}
