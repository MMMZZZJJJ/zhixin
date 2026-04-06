/* 工具函数模块 */

// 度分秒转换逻辑
function toDMS(val, type) {
    const abs = Math.abs(val);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = ((abs - d - m / 60) * 3600).toFixed(2);
    let suffix = "";
    if (type === 'lng') {
        suffix = val >= 0 ? "东经E" : "西经W";
    } else {
        suffix = val >= 0 ? "北纬N" : "南纬S";
    }
    return `${d}°${m}′${s}″ ${suffix}`;
}

// 获取小数位数
function getDecimalPlaces(num) {
    const str = String(num);
    if (str.indexOf('.') === -1) return 0;
    return str.split('.')[1].length;
}

// 获取精度对应的距离描述
function getPrecisionDistance(places) {
    const distances = {
        0: '约111公里',
        1: '约11.1公里',
        2: '约1.11公里',
        3: '约111米',
        4: '约11.1米',
        5: '约1.11米',
        6: '约0.11米'
    };
    return distances[places] || '未知';
}

// 导出函数（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toDMS,
        getDecimalPlaces,
        getPrecisionDistance
    };
}
