class Tools {
    constructor() {
        
    }

    /**
     * 正则表
     * @param {*} type 
     */
    regMap(type) {
        const mapList = {
            emailReg: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, //Email
            ip: /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/g, //ip地址
            num: "^[0-9]*$", //只能输入数字
            tel: "^(\(\d{3,4}-)|\d{3.4}-)?\d{7,8}$", //手机号
            identity: "^\d{15}|\d{18}$" //身份证
        };
        return mapList[type];
    }

    /**
     * 动态加载脚本
     * @param  {[type]}   url      [脚本地址]
     * @param  {Function} callback [回调函数]
     * @return {[type]}            [description]
     */
    loadScript(url, callback) {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    script.onreadystatechange = null;
                    callback();
                }
            }
        } else { // Others: Firefox, Safari, Chrome, Opera
            script.onload = function () {
                callback();
            }
        }
        script.src = url;
        document.body.appendChild(script);
    }

    /**
     * 合并多个map，过滤重复的key
     * @param  {...[type]} obj [description]
     * @return {[type]}         [description]
     */
    mergeMap(...obj) {
        var map1 = obj[0],
            map2 = [],
            k,
            i = 1,
            maps = [...obj],
            len = maps.length;
        for (; i < len; i++) {
            map2 = maps[i];
            for (k in map2) {
                map1[k] = map2[k]
            }
        }
        return map1;
    }

    /**
     * 通过参数key获取地址栏对应的value
     * @param  {[type]} name [参数key]
     * @param  {[type]} url  [地址]
     * @return {[type]}      [description]
     */
    getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    /**
     * 解析url参数
     * @example ?id=12345&a=b
     * @return Object {id:12345,a:b}
     */
    urlParse() {
        let obj = {};
        let url = window.location.search;
        let reg = /[?&][^?&]+=[^?&]+/g;
        let arr = url.match(reg);
        if (Array.isArray(arr)) {
            arr.forEach(item => {
                let tempArr = item.substring(1).split('=');
                let key = decodeURIComponent(tempArr[0]);
                let val = decodeURIComponent(tempArr[1]);
                obj[key] = val;
            });
        }
        return obj;
    }

    /* 封装ajax函数,大致实现步骤:
     * 1.建立xmlHttpRequrest连接
     * 2.向台台服务器发送请求
     * 3.根据服务器返回状态码进行相关的操作
     * 4.返回的数据进行格式化
     * @param {string}opt.type http连接的方式，包括POST和GET两种方式
     * @param {string}opt.url 发送请求的url
     * @param {boolean}opt.async 是否为异步请求，true为异步的，false为同步的
     * @param {string}opt.dataType 请求的数据类型
     * @param {string}opt.contentType 设置表单提交时的内容类型
     * @param {object}opt.data 发送的参数，格式为对象类型
     * @param {function}opt.success ajax发送并接收成功调用的回调函数
     * @param {function}opt.fail ajax发送失败调用的回调函数
     */
    ajax(opt) {
        // 格式化参数
        const formatParams = (data) => {
            let arr = [];
            for (var name in data) {
                arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
            }
            arr.push(('v=' + Math.random()).replace('.', ''));
            return arr.join('&');
        };
        // 错误消息MAP表
        const mapErrorList = (type) => {
            let errorObj = {
                '0': '请求未初始化',
                '1': '服务器连接已建立',
                '2': '请求已接收',
                '3': '请求处理中',
                '4': '请求已完成且响应已就绪',
                '400': '参数格式不正确',
                '401': '用户授权过期，请重新登陆',
                '404': '请求地址不存在',
                '500': '服务器内部错误',
                '502': '网关错误',
                'parsererror': '数据解析错误',
                'timeout': '请求超时',
                'abort': '连接被终止'
            };
            let rtv = errorObj[type];
            return rtv ? rtv : '请求失败';
        };
        let xmlHttp = null;
        let result = '';
        opt = opt || {};
        opt.method = opt.method.toUpperCase() || 'POST';
        opt.url = opt.url || '';
        opt.async = opt.async || true;
        opt.dataType = opt.dataType || 'json';
        opt.contentType = opt.contentType || 'application/x-www-form-urlencoded;charset=utf-8';
        opt.data = formatParams(opt.data); // 格式化参数
        opt.success = opt.success || function () {};
        opt.fail = opt.fail || function () {};

        // 第一步 创建xmlHttp实例
        if (window.XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        } else { // IE6及其以下版本浏览器
            xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
        }

        // 第二步 连接和发送
        if (opt.method.toUpperCase() === 'POST') {
            xmlHttp.open(opt.method, opt.url, opt.async);
            // 设置表单提交时的内容类型
            xmlHttp.setRequestHeader('Content-Type', opt.contentType);
            xmlHttp.send(opt.data);
        } else if (opt.method.toUpperCase() === 'GET') {
            xmlHttp.open(opt.method, opt.url + '?' + opt.data, opt.async);
            xmlHttp.send(null);
        }

        // 第三步 接收
        xmlHttp.onreadystatechange = function () {
            // readyState: 0.请求未初始化 1.服务器连接已建立 2.请求已接收 3.请求处理中 4.请求已完成且响应已就绪
            if (xmlHttp.readyState == 4) {
                let status = xmlHttp.status;
                let responseText = xmlHttp.responseText;
                let responseXML = xmlHttp.responseXML;


                if (status >= 200 && status < 300) {
                    typeof opt.success === 'function' && opt.success(responseText, responseXML);
                } else {
                    if (status) {
                        result = mapErrorList(status + '');
                    } else {
                        result = mapErrorList(responseText + '');
                    }
                    typeof opt.fail === 'function' && opt.fail(status || responseText);
                }
            } else {
                result = mapErrorList(xmlHttp.readyState + '');
                typeof opt.fail === 'function' && opt.fail(result);
            }
        }
    }

    /**
     * [getGroupByField 对象数组(JSON)根据某个共同字段分组]
     * @param  {[type]} arr [数据源]
     * @return {[type]}     [description]
     */
    getGroupByField(arr) {
        var map = {},
            dest = [];
        for (var i = 0; i < arr.length; i++) {
            var ai = arr[i];
            if (!map[ai.id]) {
                dest.push({
                    id: ai.id,
                    name: ai.name,
                    data: [ai]
                });
                map[ai.id] = ai;
            } else {
                for (var j = 0; j < dest.length; j++) {
                    var dj = dest[j];
                    if (dj.id == ai.id) {
                        dj.data.push(ai);
                        break;
                    }
                }
            }
        }
        return dest;
    }

    /**
     * [getPercent 获取两个整数的百分比值 ]
     * @param  {[type]} n [description]
     * @param  {[type]} t [description]
     * @return {[type]}   [description]
     */
    getTwoNumberPercent(n, t) {
        let rtn = 0;
        let num = parseFloat(n);
        let total = parseFloat(t);

        if (isNaN(num) || isNaN(total)) {
            return '--';
        }
        if (total <= 0) {
            rtn = '0%';
        } else {
            rtn = Math.round(num / total * 10000) / 100.00 + '%';
        }
        return rtn;
    }

    /**
     * [getDecimalPoint 保留小数几位]
     * @param  {[type]} n [description]
     * @param  {[type]} p [description]
     * @return {[type]}   [description]
     */
    getDecimalPoint(n, p) {
        let num = parseFloat(n);
        let rtn = '0.00';
        p = p ? p : 0;
        if (isNaN(num)) {
            return rtn;
        }
        if (('' + num).indexOf('.') > -1) {
            rtn = num.toFixed(p);
        } else {
            let point = '';
            for (let i = 0; i < p; i++) {
                point += '0';
            }
            point = point === '' ? '' : `.${point}`;
            rtn = `${num}${point}`;
        }
        return rtn;
    }

    /**
     * [getRandomNum 获取随机数]
     * @param  {[type]} min [description]
     * @param  {[type]} max [description]
     * @return {[type]}     [description]
     */
    getRandomNum(min, max) {
        let range = max - min
        let rand = Math.random()
        return min + Math.round(rand * range)
    }

    /**
     * 混淆(打乱)数组顺序
     * @param {*数组参数} arr
     */
    upset(arr) {
        let num = arr.length;
        let result = [];
        for (let i = 0; i < num; i++) {
            let index = Math.floor(Math.random() * arr.length);
            result.push(...arr.splice(index, 1));
        }
        return result;
    }

    // 过滤数组返回新值
    getValueByArr(originArr, newArr) {
        // var originArr = [{
        //     id: 11,
        //     text: '11'
        // }, {
        //     id: 22,
        //     text: '22'
        // }, {
        //     id: 33,
        //     text: '33'
        // }];
        // var newArr = [22, 33];
        return originArr.filter(item => newArr.find(v => v === item.id)); // newArr.includes(item.id)
    }

    /**
     * [getPaginationData 数据源分页]
     * @param  {[type]} curPage  [当前页]
     * @param  {[type]} pageSize [页码]
     * @param  {[type]} array    [数据源]
     * @return {[type]}          [description]
     */
    getPaginationData(curPage, pageSize, array) {
        let total = 0,
            totalPage = 0,
            offset = 0,
            pageData = [];

        curPage = curPage < 1 ? 1 : curPage;
        total = array.length;
        totalPage = Math.floor(total / pageSize);
        totalPage = totalPage === 0 ? 1 : totalPage;
        offset = total <= pageSize ? 0 : (curPage - 1) * pageSize; // 总记录小于当前页面大小默认取0

        if (offset + pageSize >= total) {
            pageData = array.slice(offset, total);

            if (pageData.length === 0) {
                let mode = total % pageSize;
                let last = mode === 0 ? pageSize : mode;

                pageData = array.slice(-last); // 如果跳转的页码木有数据默认取最后一个页码数据
            }
        } else {
            pageData = array.slice(offset, offset + pageSize);
        }

        return {
            pageData: pageData,
            totalPage: totalPage,
            currentPage: curPage,
            pageSize: pageSize
        };
    }

    /**
     * [bp 二维数组扁平化]
     * @param  {[type]} arr [description]
     * @return {[type]}     [description]
     */
    bp(matrix) {
        return matrix.reduce((pre, cur) => pre.concat(cur));
    }

    /**
     * [summary 数字数组累加]
     * @param  {[type]} arr [description]
     * @return {[type]}     [description]
     */
    summary(arr) {
        return arr.reduce((pre, cur) => {
            pre = isNaN(parseFloat(pre)) ? 0 : parseFloat(pre);
            cur = isNaN(parseFloat(cur)) ? 0 : parseFloat(cur);
            return pre + cur;
        }, 0);
    }

    /**
     * [formatDate 时间格式化]
     * @param  {[type]} date [日期对象]
     * @param  {[type]} fmt  [字符串格式：yyyy-MM-dd hh:mm:ss]
     * @return {[type]}      [description]
     */
    formatDate(date, fmt) {
        let o = {};
        date = date instanceof Date ? date : new Date();
        o = Object.assign(o, {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        });
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + '';
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length));
            }
        }
        return fmt;
    }

    /**
     * [formatDate2 格式化时间]
     * @param  {...[type]} values [description]
     * @return {[type]}           [description]
     */
    formatDate2(...values) {
        let date = values[0] instanceof Date ? values[0] : new Date();
        let ymdSeparator = values[1] || '-';
        let hmsSeparator = values[2] || ':';
        let year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds();
        const formatNumber = (n) => {
            n = n.toString();
            return n[1] ? n : '0' + n;
        };
        return [year, month, day].map(formatNumber).join(ymdSeparator) + ' ' + [hour, minute, second].map(formatNumber).join(hmsSeparator);
    }

    /**
     * [setStore 存储localStorage]
     * @param {[type]} name    [description]
     * @param {[type]} content [description]
     * @constructor
     */
    setStore(name, content) {
        if (!name) {
            return;
        }
        if (typeof content !== 'string') {
            content = JSON.stringify(content);
        }
        window.localStorage.setItem(name, content);
    }

    /**
     * [getStore 获取localStorage]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    getStore(name) {
        let rtn = '';

        if (name) {
            rtn = JSON.parse(window.localStorage.getItem(name));
        }
        return rtn;
    }

    /**
     * [removeStore 删除localStorage]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    removeStore(name) {
        if (!name) {
            return;
        }
        window.localStorage.removeItem(name);
    }

    // 对11位手机号中间4位做星号替换处理。如：输入 => 18735679868 ，输出 => 187****9868
    maskPhone(s) {
        return s.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }

    // 匹配连续11位数字，并替换其中的前7位为*号
    maskPhone2(s) {
        return s.replace(/\d{7}(\d{4})/, '*******$1');
    }

    // 清除内容中包含得空格
    clearSpace(content) {
        return content.replace(/(^\s+)|(\s+$)/g, '').replace(/\s/g, '');
    }

    // 必须为字母加数字且长度不小于8位
    checkPassWord(password) {
        let str = password;
        if (str == null || str.length < 8) {
            return false;
        }
        let reg1 = new RegExp(/^[0-9A-Za-z]+$/);
        if (!reg1.test(str)) {
            return false;
        }
        let reg = new RegExp(/[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/);
        if (reg.test(str)) {
            return true;
        } else {
            return false;
        }
    }

    // 检测mac地址
    checkMac(mac) {
        let s = mac, // MAC地址
            reg = /^[0-9a-zA-Z]+$/; // 正则匹配数字和字母

        if (!s || s.length < 12) {
            console.warn('MAC地址位数少于12位，请重新核对！');
            return false;
        }

        if (!reg.test(s)) {
            console.warn('MAC地址只能是数字和字母，请重新核对！');
            return false;
        }

        return true;
    }

    //生成下载
    download(href, title) {
        let a = document.createElement('a');
        a.setAttribute('href', href);
        a.setAttribute('download', title);
        a.click();
    }

    // 图片在图片框内按宽高比例自动缩放
    // img:要放图片的img元素，onload时传参可用this
    // maxHeight  :img元素的高度，像素（图片框 最大高度）
    // maxWidth:img元素的宽度，像素（图片框 最大宽度）
    autoSize(img, maxWidth, maxHeight) {
        let image = new Image();
        //原图片原始地址（用于获取原图片的真实宽高，当<img>标签指定了宽、高时不受影响）
        image.src = img.src;
        // 当图片比图片框小时不做任何改变
        if (image.width < maxWidth && image.height < maxHeight) {
            img.width = image.width;
            img.height = image.height;
        } else { //原图片宽高比例 大于 图片框宽高比例,则以框的宽为标准缩放，反之以框的高为标准缩放

            if (maxWidth / maxHeight <= image.width / image.height) //原图片宽高比例 大于 图片框宽高比例
            {
                img.width = maxWidth; //以框的宽度为标准
                img.height = maxWidth * (image.height / image.width);
            } else { //原图片宽高比例 小于 图片框宽高比例
                img.width = maxHeight * (image.width / image.height);
                img.height = maxHeight; //以框的高度为标准
            }
        }
    }

    // 随机抽取数组中得一个值输出
    arrRandom(arr) {
        return arr[Math.floor((Math.random() * arr.length))];
    }

    // 输入3000，变成3,000.00
    convert(money) {
        let s = money; //获取小数型数据
        s += "";
        if (s.indexOf(".") == -1) s += ".00"; //如果没有小数点，在后面补个小数点和00
        if (/\.\d$/.test(s)) s += "0"; //正则判断
        while (/\d{4}(\.|,)/.test(s)) //符合条件则进行替换
            s = s.replace(/(\d)(\d{3}(\.|,))/, "$1,$2"); //每隔3位添加一个
        return s;
    }

    // 取最大值
    arrMax(arr) {
        return Math.max.apply(Math, arr);
    }

    // 取最小值
    arrMin(arr) {
        return Math.min.apply(Math, arr);
    }

    // 数组排序
    arrSort(arr, zmp = 3) {
        arr.sort(function (a, b) {
            if (zmp == 1) {
                return a - b; //从小到大排
            } else if (zmp == 2) {
                return b - a; //从大到小排
            } else {
                return Math.random() - 0.5; //数组洗牌
            }
        });
        return arr;
    }
    // 清除空格
    clearStrspace(s) {
        return s.replace(/(^\s+)|(\s+$)/g, "").replace(/\s/g, "");
    }

    // 判断是不是空对象
    isEmptyObj(obj) {
        return JSON.stringify(obj) === '{}';
    }

    // 判断值是否为null或者undefind
    isEmpty(zhi) {
        if (zhi == null || typeof (zhi) == "undefined" || zhi == '') {
            return false
        } else if (typeof (zhi) == "object") {
            return true
        } else {
            return true
        }
    }

    // 保留两位小数-将浮点数四舍五入，取小数点后2位
    numRounding(x) {
        let f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x * 100) / 100;
        return f;
    }

    // 计算rem - size为设计稿尺寸
    checkSize(size = 750) {
        let docEl = document.documentElement,
            resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
            reCalc = () => {
                let clientWidth = docEl.clientWidth;
                if (!clientWidth) return;
                if (clientWidth >= size) {
                    docEl.style.fontSize = '100px';
                } else {
                    docEl.style.fontSize = 100 * (clientWidth / size) + 'px';
                }
            };

        if (!document.addEventListener) return;
        reCalc();
        window.addEventListener(resizeEvt, reCalc, false);
        document.addEventListener('DOMContentLoaded', reCalc, false);
    }

    // 预加载图片资源
    preLoadImg(imgs, callback) {
        let len = imgs.length;
        let i = 0;
        let loadOk = function (i, len, isError) {
            callback(parseInt(i / len * 100), isError);
        };
        let cacheMapImg = {};
        imgs.forEach(item => {
            if (cacheMapImg[item]) {
                i++;
                loadOk(i, len);
            } else {
                let image = new Image();
                image.onload = function () {
                    i++;
                    loadOk(i, len);
                };
                image.onerror = function () {
                    i++;
                    loadOk(i, len, true);
                };
                image.src = item;
            }
        });
    }

}