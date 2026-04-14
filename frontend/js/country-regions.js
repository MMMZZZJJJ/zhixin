/* 国家区域中心点与别名映射 */

(function() {
    const countryRegionPoints = [
        { name: '中国', lat: 35.0, lng: 105.0, zoom: 4, aliases: ['中华人民共和国', 'china', 'prc'] },
        { name: '蒙古', lat: 46.8, lng: 103.8, zoom: 5, aliases: ['mongolia'] },
        { name: '俄罗斯', lat: 61.5, lng: 105.3, zoom: 3, aliases: ['俄国', 'russia', 'russian federation'] },
        { name: '哈萨克斯坦', lat: 48.0, lng: 66.9, zoom: 5, aliases: ['kazakhstan'] },
        { name: '乌兹别克斯坦', lat: 41.4, lng: 64.5, zoom: 6, aliases: ['uzbekistan'] },
        { name: '土库曼斯坦', lat: 38.9, lng: 59.5, zoom: 6, aliases: ['turkmenistan'] },
        { name: '吉尔吉斯斯坦', lat: 41.2, lng: 74.7, zoom: 6, aliases: ['kyrgyzstan'] },
        { name: '塔吉克斯坦', lat: 38.8, lng: 71.2, zoom: 6, aliases: ['tajikistan'] },
        { name: '阿富汗', lat: 33.9, lng: 67.7, zoom: 6, aliases: ['afghanistan'] },
        { name: '巴基斯坦', lat: 30.3, lng: 69.3, zoom: 5, aliases: ['pakistan'] },
        { name: '印度', lat: 20.5, lng: 78.9, zoom: 5, aliases: ['india'] },
        { name: '尼泊尔', lat: 28.3, lng: 84.1, zoom: 6, aliases: ['nepal'] },
        { name: '不丹', lat: 27.5, lng: 90.4, zoom: 7, aliases: ['bhutan'] },
        { name: '孟加拉国', lat: 23.6, lng: 90.3, zoom: 6, aliases: ['bangladesh'] },
        { name: '缅甸', lat: 21.9, lng: 95.9, zoom: 5, aliases: ['myanmar', 'burma'] },
        { name: '泰国', lat: 15.8, lng: 100.9, zoom: 6, aliases: ['thailand'] },
        { name: '老挝', lat: 19.8, lng: 102.4, zoom: 6, aliases: ['laos'] },
        { name: '越南', lat: 14.0, lng: 108.2, zoom: 6, aliases: ['vietnam'] },
        { name: '柬埔寨', lat: 12.5, lng: 104.9, zoom: 6, aliases: ['cambodia'] },
        { name: '马来西亚', lat: 4.2, lng: 101.9, zoom: 6, aliases: ['malaysia'] },
        { name: '新加坡', lat: 1.3, lng: 103.8, zoom: 10, aliases: ['singapore'] },
        { name: '印度尼西亚', lat: -0.7, lng: 113.9, zoom: 5, aliases: ['indonesia'] },
        { name: '菲律宾', lat: 12.8, lng: 121.7, zoom: 6, aliases: ['philippines'] },
        { name: '日本', lat: 36.2, lng: 138.2, zoom: 5, aliases: ['japan'] },
        { name: '韩国', lat: 35.9, lng: 127.7, zoom: 6, aliases: ['南韩', 'south korea', 'korea'] },
        { name: '朝鲜', lat: 40.3, lng: 127.5, zoom: 6, aliases: ['north korea', 'dprk'] },
        { name: '伊朗', lat: 32.4, lng: 53.6, zoom: 5, aliases: ['iran', 'iran, islamic republic of'] },
        { name: '伊拉克', lat: 33.2, lng: 43.6, zoom: 6, aliases: ['iraq'] },
        { name: '叙利亚', lat: 34.8, lng: 38.9, zoom: 6, aliases: ['syria', 'syrian arab republic'] },
        { name: '土耳其', lat: 38.9, lng: 35.2, zoom: 6, aliases: ['turkiye', 'turkey'] },
        { name: '沙特阿拉伯', lat: 23.8, lng: 45.0, zoom: 5, aliases: ['saudi arabia'] },
        { name: '也门', lat: 15.5, lng: 48.5, zoom: 6, aliases: ['yemen'] },
        { name: '阿曼', lat: 21.5, lng: 55.9, zoom: 6, aliases: ['oman'] },
        { name: '阿联酋', lat: 23.4, lng: 53.8, zoom: 7, aliases: ['uae', 'united arab emirates'] },
        { name: '以色列', lat: 31.0, lng: 34.8, zoom: 7, aliases: ['israel'] },
        { name: '约旦', lat: 30.5, lng: 36.2, zoom: 7, aliases: ['jordan'] },
        { name: '英国', lat: 55.3, lng: -3.4, zoom: 6, aliases: ['uk', 'united kingdom', 'britain', 'england'] },
        { name: '法国', lat: 46.2, lng: 2.2, zoom: 6, aliases: ['france'] },
        { name: '德国', lat: 51.1, lng: 10.4, zoom: 6, aliases: ['germany'] },
        { name: '意大利', lat: 41.8, lng: 12.5, zoom: 6, aliases: ['italy'] },
        { name: '西班牙', lat: 40.4, lng: -3.7, zoom: 6, aliases: ['spain'] },
        { name: '波兰', lat: 51.9, lng: 19.1, zoom: 6, aliases: ['poland'] },
        { name: '乌克兰', lat: 48.3, lng: 31.1, zoom: 6, aliases: ['ukraine'] },
        { name: '罗马尼亚', lat: 45.9, lng: 24.9, zoom: 6, aliases: ['romania'] },
        { name: '瑞典', lat: 60.1, lng: 18.6, zoom: 5, aliases: ['sweden'] },
        { name: '挪威', lat: 60.4, lng: 8.4, zoom: 5, aliases: ['norway'] },
        { name: '芬兰', lat: 61.9, lng: 25.7, zoom: 5, aliases: ['finland'] },
        { name: '埃及', lat: 26.8, lng: 30.8, zoom: 6, aliases: ['egypt'] },
        { name: '利比亚', lat: 26.3, lng: 17.2, zoom: 5, aliases: ['libya'] },
        { name: '阿尔及利亚', lat: 28.0, lng: 1.6, zoom: 5, aliases: ['algeria'] },
        { name: '苏丹', lat: 12.8, lng: 30.2, zoom: 5, aliases: ['sudan'] },
        { name: '埃塞俄比亚', lat: 9.1, lng: 40.4, zoom: 6, aliases: ['ethiopia'] },
        { name: '肯尼亚', lat: 0.0, lng: 37.9, zoom: 6, aliases: ['kenya'] },
        { name: '南非', lat: -30.5, lng: 22.9, zoom: 5, aliases: ['south africa'] },
        { name: '尼日利亚', lat: 9.0, lng: 8.6, zoom: 6, aliases: ['nigeria'] },
        { name: '美国', lat: 39.8283, lng: -98.5795, zoom: 4, aliases: ['usa', 'us', 'united states', 'united states of america', 'america'] },
        { name: '加拿大', lat: 56.1, lng: -106.3, zoom: 4, aliases: ['canada'] },
        { name: '墨西哥', lat: 23.6, lng: -102.5, zoom: 5, aliases: ['mexico'] },
        { name: '巴西', lat: -14.2, lng: -51.9, zoom: 4, aliases: ['brazil'] },
        { name: '阿根廷', lat: -38.4, lng: -63.6, zoom: 5, aliases: ['argentina'] },
        { name: '智利', lat: -35.6, lng: -71.5, zoom: 5, aliases: ['chile'] },
        { name: '秘鲁', lat: -9.1, lng: -75.0, zoom: 5, aliases: ['peru'] },
        { name: '哥伦比亚', lat: 4.5, lng: -74.2, zoom: 5, aliases: ['colombia'] },
        { name: '澳大利亚', lat: -25.2, lng: 133.7, zoom: 4, aliases: ['australia'] },
        { name: '新西兰', lat: -40.9, lng: 174.8, zoom: 5, aliases: ['new zealand'] }
    ];

    const countryRegionAliasMap = Object.create(null);
    countryRegionPoints.forEach(function(country) {
        countryRegionAliasMap[country.name] = country.name;
        (country.aliases || []).forEach(function(alias) {
            countryRegionAliasMap[alias] = country.name;
        });
    });

    window.countryRegionPoints = countryRegionPoints;
    window.countryRegionAliasMap = countryRegionAliasMap;
})();
