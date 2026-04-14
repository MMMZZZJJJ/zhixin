/* 国际城市搜索映射，仅用于搜索跳转，不在地图上额外显示标签 */

(function() {
    function normalizeWorldCityKey(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[，。、,.·—_\/\\-]/g, '');
    }

    const worldCityPoints = [
        { name: '纽约', country: '美国', lat: 40.7128, lng: -74.0060, zoom: 10, aliases: ['new york', 'new york city', 'nyc', '美国纽约'] },
        { name: '洛杉矶', country: '美国', lat: 34.0522, lng: -118.2437, zoom: 10, aliases: ['los angeles', 'la', '美国洛杉矶'] },
        { name: '华盛顿', country: '美国', lat: 38.9072, lng: -77.0369, zoom: 11, aliases: ['washington', 'washington dc', 'dc', '美国华盛顿'] },
        { name: '芝加哥', country: '美国', lat: 41.8781, lng: -87.6298, zoom: 10, aliases: ['chicago', '美国芝加哥'] },
        { name: '旧金山', country: '美国', lat: 37.7749, lng: -122.4194, zoom: 11, aliases: ['san francisco', 'sf', '美国旧金山'] },
        { name: '波士顿', country: '美国', lat: 42.3601, lng: -71.0589, zoom: 11, aliases: ['boston', '美国波士顿'] },
        { name: '多伦多', country: '加拿大', lat: 43.6532, lng: -79.3832, zoom: 10, aliases: ['toronto', '加拿大多伦多'] },
        { name: '温哥华', country: '加拿大', lat: 49.2827, lng: -123.1207, zoom: 10, aliases: ['vancouver', '加拿大温哥华'] },
        { name: '墨西哥城', country: '墨西哥', lat: 19.4326, lng: -99.1332, zoom: 10, aliases: ['mexico city', 'ciudad de mexico', '墨西哥墨西哥城'] },
        { name: '圣保罗', country: '巴西', lat: -23.5558, lng: -46.6396, zoom: 10, aliases: ['sao paulo', 'são paulo', '巴西圣保罗'] },
        { name: '布宜诺斯艾利斯', country: '阿根廷', lat: -34.6037, lng: -58.3816, zoom: 10, aliases: ['buenos aires', '阿根廷布宜诺斯艾利斯'] },
        { name: '伦敦', country: '英国', lat: 51.5074, lng: -0.1278, zoom: 10, aliases: ['london', '英国伦敦'] },
        { name: '巴黎', country: '法国', lat: 48.8566, lng: 2.3522, zoom: 10, aliases: ['paris', '法国巴黎'] },
        { name: '柏林', country: '德国', lat: 52.5200, lng: 13.4050, zoom: 10, aliases: ['berlin', '德国柏林'] },
        { name: '慕尼黑', country: '德国', lat: 48.1351, lng: 11.5820, zoom: 11, aliases: ['munich', 'muenchen', '德国慕尼黑'] },
        { name: '马德里', country: '西班牙', lat: 40.4168, lng: -3.7038, zoom: 10, aliases: ['madrid', '西班牙马德里'] },
        { name: '巴塞罗那', country: '西班牙', lat: 41.3851, lng: 2.1734, zoom: 10, aliases: ['barcelona', '西班牙巴塞罗那'] },
        { name: '罗马', country: '意大利', lat: 41.9028, lng: 12.4964, zoom: 10, aliases: ['rome', '意大利罗马'] },
        { name: '米兰', country: '意大利', lat: 45.4642, lng: 9.1900, zoom: 11, aliases: ['milan', '意大利米兰'] },
        { name: '阿姆斯特丹', country: '荷兰', lat: 52.3676, lng: 4.9041, zoom: 11, aliases: ['amsterdam', '荷兰阿姆斯特丹'] },
        { name: '布鲁塞尔', country: '比利时', lat: 50.8503, lng: 4.3517, zoom: 11, aliases: ['brussels', '比利时布鲁塞尔'] },
        { name: '维也纳', country: '奥地利', lat: 48.2082, lng: 16.3738, zoom: 11, aliases: ['vienna', '奥地利维也纳'] },
        { name: '苏黎世', country: '瑞士', lat: 47.3769, lng: 8.5417, zoom: 11, aliases: ['zurich', 'zürich', '瑞士苏黎世'] },
        { name: '布拉格', country: '捷克', lat: 50.0755, lng: 14.4378, zoom: 11, aliases: ['prague', '捷克布拉格'] },
        { name: '布达佩斯', country: '匈牙利', lat: 47.4979, lng: 19.0402, zoom: 11, aliases: ['budapest', '匈牙利布达佩斯'] },
        { name: '雅典', country: '希腊', lat: 37.9838, lng: 23.7275, zoom: 11, aliases: ['athens', '希腊雅典'] },
        { name: '莫斯科', country: '俄罗斯', lat: 55.7558, lng: 37.6173, zoom: 10, aliases: ['moscow', '俄罗斯莫斯科'] },
        { name: '伊斯坦布尔', country: '土耳其', lat: 41.0082, lng: 28.9784, zoom: 10, aliases: ['istanbul', '土耳其伊斯坦布尔'] },
        { name: '安卡拉', country: '土耳其', lat: 39.9334, lng: 32.8597, zoom: 11, aliases: ['ankara', '土耳其安卡拉'] },
        { name: '德黑兰', country: '伊朗', lat: 35.6892, lng: 51.3890, zoom: 10, aliases: ['tehran', '伊朗德黑兰'] },
        { name: '大马士革', country: '叙利亚', lat: 33.5138, lng: 36.2765, zoom: 11, aliases: ['damascus', '叙利亚大马士革'] },
        { name: '巴格达', country: '伊拉克', lat: 33.3152, lng: 44.3661, zoom: 11, aliases: ['baghdad', '伊拉克巴格达'] },
        { name: '迪拜', country: '阿联酋', lat: 25.2048, lng: 55.2708, zoom: 11, aliases: ['dubai', '阿联酋迪拜'] },
        { name: '阿布扎比', country: '阿联酋', lat: 24.4539, lng: 54.3773, zoom: 11, aliases: ['abu dhabi', '阿联酋阿布扎比'] },
        { name: '利雅得', country: '沙特阿拉伯', lat: 24.7136, lng: 46.6753, zoom: 11, aliases: ['riyadh', '沙特利雅得'] },
        { name: '开罗', country: '埃及', lat: 30.0444, lng: 31.2357, zoom: 10, aliases: ['cairo', '埃及开罗'] },
        { name: '拉各斯', country: '尼日利亚', lat: 6.5244, lng: 3.3792, zoom: 10, aliases: ['lagos', '尼日利亚拉各斯'] },
        { name: '内罗毕', country: '肯尼亚', lat: -1.2921, lng: 36.8219, zoom: 11, aliases: ['nairobi', '肯尼亚内罗毕'] },
        { name: '约翰内斯堡', country: '南非', lat: -26.2041, lng: 28.0473, zoom: 10, aliases: ['johannesburg', '南非约翰内斯堡'] },
        { name: '东京', country: '日本', lat: 35.6762, lng: 139.6503, zoom: 10, aliases: ['tokyo', '日本东京'] },
        { name: '大阪', country: '日本', lat: 34.6937, lng: 135.5023, zoom: 11, aliases: ['osaka', '日本大阪'] },
        { name: '首尔', country: '韩国', lat: 37.5665, lng: 126.9780, zoom: 10, aliases: ['seoul', '韩国首尔'] },
        { name: '河内', country: '越南', lat: 21.0278, lng: 105.8342, zoom: 10, aliases: ['hanoi', '越南河内'] },
        { name: '胡志明市', country: '越南', lat: 10.8231, lng: 106.6297, zoom: 10, aliases: ['ho chi minh city', 'saigon', '越南胡志明市'] },
        { name: '曼谷', country: '泰国', lat: 13.7563, lng: 100.5018, zoom: 10, aliases: ['bangkok', '泰国曼谷'] },
        { name: '新德里', country: '印度', lat: 28.6139, lng: 77.2090, zoom: 10, aliases: ['new delhi', '印度新德里'] },
        { name: '孟买', country: '印度', lat: 19.0760, lng: 72.8777, zoom: 10, aliases: ['mumbai', 'bombay', '印度孟买'] },
        { name: '新加坡市', country: '新加坡', lat: 1.3521, lng: 103.8198, zoom: 11, aliases: ['singapore city', '新加坡'] },
        { name: '吉隆坡', country: '马来西亚', lat: 3.1390, lng: 101.6869, zoom: 10, aliases: ['kuala lumpur', '马来西亚吉隆坡'] },
        { name: '雅加达', country: '印度尼西亚', lat: -6.2088, lng: 106.8456, zoom: 10, aliases: ['jakarta', '印度尼西亚雅加达'] },
        { name: '马尼拉', country: '菲律宾', lat: 14.5995, lng: 120.9842, zoom: 10, aliases: ['manila', '菲律宾马尼拉'] },
        { name: '悉尼', country: '澳大利亚', lat: -33.8688, lng: 151.2093, zoom: 10, aliases: ['sydney', '澳大利亚悉尼'] },
        { name: '墨尔本', country: '澳大利亚', lat: -37.8136, lng: 144.9631, zoom: 10, aliases: ['melbourne', '澳大利亚墨尔本'] },
        { name: '奥克兰', country: '新西兰', lat: -36.8509, lng: 174.7645, zoom: 10, aliases: ['auckland', '新西兰奥克兰'] }
    ];

    const worldCityAliasMap = Object.create(null);
    worldCityPoints.forEach(function(city) {
        worldCityAliasMap[normalizeWorldCityKey(city.name)] = city.name;
        worldCityAliasMap[normalizeWorldCityKey(city.country + city.name)] = city.name;
        worldCityAliasMap[normalizeWorldCityKey(city.name + city.country)] = city.name;
        (city.aliases || []).forEach(function(alias) {
            worldCityAliasMap[normalizeWorldCityKey(alias)] = city.name;
        });
    });

    window.worldCityPoints = worldCityPoints;
    window.worldCityAliasMap = worldCityAliasMap;
})();
