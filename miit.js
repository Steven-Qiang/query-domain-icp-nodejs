/**
 * @file: Miit.js
 * @description: Miit.js
 * @package: query-domain-icp-nodejs
 * @create: 2021-12-07 09:23:36
 * @author: qiangmouren (2962051004@qq.com)
 * -----
 * @last-modified: 2022-07-26 12:49:16
 * -----
 */

const cv = require('opencv4nodejs');
const axios = require('axios').default;

class Miit {
  #unitName;
  #instance;
  #authData;
  #token;
  #checkImage;
  #sign;
  #puzzleRetry;
  constructor(unitName) {
    this.#unitName = unitName;
    this.#instance = axios.create({
      baseURL: 'https://hlwicpfwc.miit.gov.cn/icpproject_query/api/',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
        referer: 'https://beian.miit.gov.cn/',
      },
    });
    this.#authData = 'authKey=646c2700d17cb15590a0f90483dfb5f4&timeStamp=1638527564826';
  }
  async #getAuthToken() {
    if (this.#token) return;
    const resp = await this.#instance.request({
      method: 'POST',
      url: 'auth',
      data: this.#authData,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    const token = resp.data?.params;
    if (!token) {
      throw new Error('获取token失败。');
    }
    this.#token = token;
  }
  async #getCheckImage() {
    const resp = await this.#instance.request({
      method: 'POST',
      url: 'https://hlwicpfwc.miit.gov.cn/icpproject_query/api/image/getCheckImage',
      data: this.#authData,
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        token: this.#token.bussiness,
      },
    });
    const splitImage = resp.data?.params;
    if (!splitImage) {
      throw new Error('获取验证码图片失败。');
    }
    this.#checkImage = splitImage;
  }
  async #puzzle() {
    if (this.#puzzleRetry > 3) {
      throw new Error('滑动验证码破解失败。');
    }
    try {
      await this.#getCheckImage();

      const bigImage_data = Buffer.from(this.#checkImage.bigImage, 'base64');
      const smallImage_data = Buffer.from(this.#checkImage.smallImage, 'base64');
      const bigImage_src = await cv.imdecodeAsync(bigImage_data);
      const smallImage_src = await cv.imdecodeAsync(smallImage_data); // spell-checker:disable-next-line
      const result = await bigImage_src.matchTemplateAsync(smallImage_src, cv.TM_CCOEFF_NORMED);
      const puzzle = await result.minMaxLocAsync().then(({ maxLoc }) => maxLoc.x);

      console.log('滑动验证码结果：' + puzzle);

      const resp = await this.#instance.request({
        method: 'POST',
        url: 'image/checkImage',
        data: { key: this.#checkImage.uuid, value: puzzle },
        headers: { token: this.#token.bussiness },
      });

      const sign = resp.data.params;
      if (!sign) {
        throw null;
      }

      this.#sign = sign;
    } catch (error) {
      this.#puzzleRetry++;
      console.log('验证码破解失败，重试第', this.#puzzleRetry, '次');
      await this.#puzzle();
    }
  }
  /**
   *
   * @param {number} [pageNum] 页数
   * @param {number} [pageSize] 
   * @returns {Promise<StructQueryRet>}
   */
  async query(pageNum = 1, pageSize = '') {
    this.#puzzleRetry = 0;

    await this.#getAuthToken();
    await this.#puzzle();

    const resp = await this.#instance.request({
      method: 'POST',
      url: 'icpAbbreviateInfo/queryByCondition',
      data: {
        pageNum,
        pageSize,
        unitName: this.#unitName,
      },
      headers: {
        token: this.#token.bussiness,
        sign: this.#sign,
        uuid: this.#checkImage.uuid,
      },
    });
    return resp.data.params;
  }
}

module.exports = Miit;
