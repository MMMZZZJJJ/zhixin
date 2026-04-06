/* 地图功能模块 */

let map, marker;

// 初始化地图
function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([39.914885, 116.403874], 10);

    // 高德地图矢量底图
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 添加国家标注（如果 country-labels.js 已加载）
    if (typeof addCountryLabels === 'function') {
        addCountryLabels(map);
    }

    // 地图点击事件
    map.on('click', function(e) {
        updateData(e.latlng.lat, e.latlng.lng);
    });

    const addrInput = document.getElementById('addr_search');
    if (addrInput) {
        addrInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchAddress();
            }
        });
    }
}

// 更新数据逻辑
function updateData(lat, lng) {
    lat = parseFloat(lat).toFixed(6);
    lng = parseFloat(lng).toFixed(6);

    // 1. 更新输入框
    document.getElementById('lat_input').value = lat;
    document.getElementById('lng_input').value = lng;

    // 2. 更新标记
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
    map.panTo([lat, lng]);

    // 3. 填充表格基础信息
    document.getElementById('res_pos').innerText = `${lng}, ${lat}`;
    document.getElementById('res_deg').innerText = `${lng}°, ${lat}°`;
    document.getElementById('res_dms').innerText = `${toDMS(lng, 'lng')}, ${toDMS(lat, 'lat')}`;
}

// 手动输入定位
function manualLocate() {
    const lat = document.getElementById('lat_input').value;
    const lng = document.getElementById('lng_input').value;
    if (lat && lng) {
        map.setZoom(15);
        updateData(lat, lng);
    } else {
        alert("请输入完整的经纬度数值");
    }
}

async function searchAddress() {
    const input = document.getElementById('addr_search');
    const keyword = input ? String(input.value || '').trim() : '';
    if (!keyword) {
        alert('请输入地址关键词');
        return;
    }
    try {
        const coordinatePoint = parseCoordinatePointByKeyword(keyword);
        if (coordinatePoint) {
            map.setZoom(14);
            updateData(coordinatePoint.lat, coordinatePoint.lng);
            return;
        }
        const countryPoint = findCountryPointByKeyword(keyword);
        if (countryPoint) {
            map.setZoom(Number(countryPoint.zoom) || 5);
            updateData(countryPoint.lat, countryPoint.lng);
            return;
        }
        const builtinPoint = findBuiltinPlacePointByKeyword(keyword);
        if (builtinPoint) {
            map.setZoom(Number(builtinPoint.zoom) || 9);
            updateData(builtinPoint.lat, builtinPoint.lng);
            return;
        }
        const point = await geocodeAddress(keyword);
        const lat = Number(point.lat);
        const lng = Number(point.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            alert('地址解析失败，请更换关键词重试');
            return;
        }
        map.setZoom(13);
        updateData(lat, lng);
    } catch (error) {
        alert(`地址搜索失败：${error.message || '请稍后重试'}`);
    }
}

function normalizeKeyword(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[，。,.、·•\-_/\\]/g, '');
}

function parseCoordinatePointByKeyword(keyword) {
    const text = String(keyword || '').trim();
    if (!text) {
        return null;
    }
    const normalized = text
        .replace(/[，；;]/g, ',')
        .replace(/\s+/g, ',')
        .replace(/,+/g, ',');
    const parts = normalized.split(',').filter(Boolean);
    if (parts.length !== 2) {
        return null;
    }
    const first = Number(parts[0]);
    const second = Number(parts[1]);
    if (!Number.isFinite(first) || !Number.isFinite(second)) {
        return null;
    }
    if (Math.abs(first) <= 90 && Math.abs(second) <= 180) {
        return { lat: first, lng: second };
    }
    if (Math.abs(first) <= 180 && Math.abs(second) <= 90) {
        return { lat: second, lng: first };
    }
    return null;
}

function getCountryAliasKeyword(keyword) {
    const aliasMap = {
        '中国': '中华人民共和国',
        '中华人民共和国': '中华人民共和国',
        'china': '中华人民共和国',
        'prc': '中华人民共和国',
        'iran': '伊朗',
        'islamicrepublicofiran': '伊朗',
        'usa': '美国',
        'unitedstates': '美国',
        'uk': '英国',
        'unitedkingdom': '英国',
        'russia': '俄罗斯',
        'japan': '日本',
        'korea': '韩国',
        'southkorea': '韩国',
        'northkorea': '朝鲜'
    };
    const normalized = normalizeKeyword(keyword);
    return aliasMap[normalized] || null;
}

function findCountryPointByKeyword(keyword) {
    if (!Array.isArray(countryLabels) || countryLabels.length === 0) {
        return null;
    }
    const normalizedKeyword = normalizeKeyword(keyword);
    if (!normalizedKeyword) {
        return null;
    }
    const aliasName = getCountryAliasKeyword(keyword);
    const exactMatch = countryLabels.find((country) => normalizeKeyword(country.name) === normalizedKeyword);
    if (exactMatch) {
        return exactMatch;
    }
    if (aliasName) {
        const aliasMatch = countryLabels.find((country) => country.name === aliasName);
        if (aliasMatch) {
            return aliasMatch;
        }
    }
    if (normalizedKeyword.length >= 2) {
        const fuzzyMatch = countryLabels.find((country) => normalizeKeyword(country.name).includes(normalizedKeyword));
        if (fuzzyMatch) {
            return fuzzyMatch;
        }
    }
    return null;
}

function findBuiltinPlacePointByKeyword(keyword) {
    const normalizedKeyword = normalizeKeyword(keyword);
    if (!normalizedKeyword) {
        return null;
    }
    const placeMap = {
        '北京': { lat: 39.9042, lng: 116.4074, zoom: 10 },
        '上海': { lat: 31.2304, lng: 121.4737, zoom: 10 },
        '广州': { lat: 23.1291, lng: 113.2644, zoom: 10 },
        '深圳': { lat: 22.5431, lng: 114.0579, zoom: 11 },
        '杭州': { lat: 30.2741, lng: 120.1551, zoom: 10 },
        '南京': { lat: 32.0603, lng: 118.7969, zoom: 10 },
        '武汉': { lat: 30.5928, lng: 114.3055, zoom: 10 },
        '成都': { lat: 30.5728, lng: 104.0668, zoom: 10 },
        '重庆': { lat: 29.563, lng: 106.5516, zoom: 10 },
        '天津': { lat: 39.0842, lng: 117.2009, zoom: 10 },
        '西安': { lat: 34.3416, lng: 108.9398, zoom: 10 },
        '郑州': { lat: 34.7466, lng: 113.6254, zoom: 10 },
        '长沙': { lat: 28.2282, lng: 112.9388, zoom: 10 },
        '合肥': { lat: 31.8206, lng: 117.2272, zoom: 10 },
        '福州': { lat: 26.0745, lng: 119.2965, zoom: 10 },
        '厦门': { lat: 24.4798, lng: 118.0894, zoom: 11 },
        '南宁': { lat: 22.817, lng: 108.3669, zoom: 10 },
        '昆明': { lat: 25.0389, lng: 102.7183, zoom: 10 },
        '贵阳': { lat: 26.647, lng: 106.6302, zoom: 10 },
        '南昌': { lat: 28.6829, lng: 115.8582, zoom: 10 },
        '济南': { lat: 36.6512, lng: 117.1201, zoom: 10 },
        '青岛': { lat: 36.0671, lng: 120.3826, zoom: 10 },
        '沈阳': { lat: 41.8057, lng: 123.4315, zoom: 10 },
        '大连': { lat: 38.914, lng: 121.6147, zoom: 10 },
        '长春': { lat: 43.8171, lng: 125.3235, zoom: 10 },
        '哈尔滨': { lat: 45.8038, lng: 126.5349, zoom: 10 },
        '呼和浩特': { lat: 40.8426, lng: 111.7492, zoom: 10 },
        '石家庄': { lat: 38.0428, lng: 114.5149, zoom: 10 },
        '太原': { lat: 37.8706, lng: 112.5489, zoom: 10 },
        '银川': { lat: 38.4872, lng: 106.2309, zoom: 10 },
        '兰州': { lat: 36.0611, lng: 103.8343, zoom: 10 },
        '西宁': { lat: 36.6171, lng: 101.7782, zoom: 10 },
        '拉萨': { lat: 29.652, lng: 91.1721, zoom: 10 },
        '乌鲁木齐': { lat: 43.8256, lng: 87.6168, zoom: 10 },
        '宁夏': { lat: 37.2692, lng: 106.1655, zoom: 7 },
        '新疆': { lat: 43.793, lng: 87.6271, zoom: 5 },
        '西藏': { lat: 29.6475, lng: 91.1172, zoom: 6 },
        '内蒙古': { lat: 40.8174, lng: 111.7652, zoom: 6 },
        '广西': { lat: 22.817, lng: 108.3669, zoom: 7 },
        '广东': { lat: 23.1291, lng: 113.2644, zoom: 7 },
        '江苏': { lat: 32.0603, lng: 118.7969, zoom: 7 },
        '浙江': { lat: 30.2741, lng: 120.1551, zoom: 7 },
        '山东': { lat: 36.6512, lng: 117.1201, zoom: 7 },
        '河北': { lat: 38.0428, lng: 114.5149, zoom: 7 },
        '四川': { lat: 30.5728, lng: 104.0668, zoom: 7 },
        '河南': { lat: 34.7466, lng: 113.6254, zoom: 7 },
        '湖北': { lat: 30.5928, lng: 114.3055, zoom: 7 },
        '湖南': { lat: 28.2282, lng: 112.9388, zoom: 7 },
        '福建': { lat: 26.0745, lng: 119.2965, zoom: 7 },
        '陕西': { lat: 34.3416, lng: 108.9398, zoom: 7 }
    };
    const aliasMap = {
        '北京市': '北京',
        '上海市': '上海',
        '广州市': '广州',
        '深圳市': '深圳',
        '杭州市': '杭州',
        '南京市': '南京',
        '武汉市': '武汉',
        '成都市': '成都',
        '重庆市': '重庆',
        '天津市': '天津',
        '西安市': '西安',
        '郑州市': '郑州',
        '长沙市': '长沙',
        '合肥市': '合肥',
        '福州市': '福州',
        '厦门市': '厦门',
        '南宁市': '南宁',
        '昆明市': '昆明',
        '贵阳市': '贵阳',
        '南昌市': '南昌',
        '济南市': '济南',
        '青岛市': '青岛',
        '沈阳市': '沈阳',
        '大连市': '大连',
        '长春市': '长春',
        '哈尔滨市': '哈尔滨',
        '呼和浩特市': '呼和浩特',
        '石家庄市': '石家庄',
        '太原市': '太原',
        '银川市': '银川',
        '兰州市': '兰州',
        '西宁市': '西宁',
        '拉萨市': '拉萨',
        '乌鲁木齐市': '乌鲁木齐',
        'yinchuan': '银川',
        'beijing': '北京',
        'shanghai': '上海',
        'guangzhou': '广州',
        'shenzhen': '深圳',
        'chengdu': '成都',
        'wuhan': '武汉',
        'xian': '西安',
        'urumqi': '乌鲁木齐',
        'lhasa': '拉萨'
    };
    const mapped = aliasMap[normalizedKeyword] || normalizedKeyword;
    if (placeMap[mapped]) {
        return placeMap[mapped];
    }
    if (mapped.length >= 2) {
        const matchedName = Object.keys(placeMap).find((name) => normalizeKeyword(name).includes(mapped));
        if (matchedName) {
            return placeMap[matchedName];
        }
    }
    return null;
}

async function geocodeAddress(keyword) {
    const encodedKeyword = encodeURIComponent(keyword);
    const providers = [
        {
            name: 'Nominatim',
            url: `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=zh-CN&q=${encodedKeyword}`,
            parse(data) {
                if (!Array.isArray(data) || data.length === 0) return null;
                const best = data.find((item) => {
                    const type = String(item?.type || '').toLowerCase();
                    return type === 'city' || type === 'town' || type === 'village' || type === 'county' || type === 'state' || type === 'country';
                }) || data[0];
                if (!best || best.lat === undefined || best.lon === undefined) return null;
                return { lat: best.lat, lng: best.lon };
            }
        },
        {
            name: 'Photon',
            url: `https://photon.komoot.io/api/?q=${encodedKeyword}&limit=5`,
            parse(data) {
                if (!data || !Array.isArray(data.features) || data.features.length === 0) return null;
                const bestFeature = data.features.find((feature) => {
                    const type = String(feature?.properties?.type || '').toLowerCase();
                    return type === 'city' || type === 'district' || type === 'state' || type === 'country';
                }) || data.features[0];
                const coords = bestFeature && bestFeature.geometry && bestFeature.geometry.coordinates;
                if (!Array.isArray(coords) || coords.length < 2) return null;
                return { lat: coords[1], lng: coords[0] };
            }
        }
    ];
    let lastError = null;
    for (const provider of providers) {
        try {
            const response = await fetchWithTimeout(provider.url, { method: 'GET' }, 6000);
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            const data = await response.json();
            const point = provider.parse(data);
            if (point) {
                return point;
            }
            lastError = new Error(`${provider.name}未返回可用结果`);
        } catch (error) {
            lastError = new Error(`${provider.name}查询失败：${error.message}`);
        }
    }
    throw new Error(lastError && lastError.message ? lastError.message : '未找到相关地址');
}

async function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } finally {
        clearTimeout(timerId);
    }
}

// 重置
function resetAll() {
    document.getElementById('lat_input').value = '';
    document.getElementById('lng_input').value = '';
    document.getElementById('res_pos').innerText = '点击地图获取';
    document.getElementById('res_deg').innerText = '--';
    document.getElementById('res_dms').innerText = '--';
    if (marker) map.removeLayer(marker);
    map.setView([39.914885, 116.403874], 10);
}
