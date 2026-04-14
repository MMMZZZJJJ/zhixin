/* 国家标注数据与显示逻辑 */

const countryLabels = [
    { name: '中国', lat: 35.0, lng: 105.0, zoom: 4 },
    { name: '蒙古', lat: 46.8, lng: 103.8, zoom: 5 },
    { name: '俄罗斯', lat: 61.5, lng: 105.3, zoom: 3 },
    { name: '哈萨克斯坦', lat: 48.0, lng: 66.9, zoom: 5 },
    { name: '乌兹别克斯坦', lat: 41.4, lng: 64.5, zoom: 6 },
    { name: '土库曼斯坦', lat: 38.9, lng: 59.5, zoom: 6 },
    { name: '吉尔吉斯斯坦', lat: 41.2, lng: 74.7, zoom: 6 },
    { name: '塔吉克斯坦', lat: 38.8, lng: 71.2, zoom: 6 },
    { name: '阿富汗', lat: 33.9, lng: 67.7, zoom: 6 },
    { name: '巴基斯坦', lat: 30.3, lng: 69.3, zoom: 5 },
    { name: '印度', lat: 20.5, lng: 78.9, zoom: 5 },
    { name: '尼泊尔', lat: 28.3, lng: 84.1, zoom: 6 },
    { name: '不丹', lat: 27.5, lng: 90.4, zoom: 7 },
    { name: '孟加拉国', lat: 23.6, lng: 90.3, zoom: 6 },
    { name: '缅甸', lat: 21.9, lng: 95.9, zoom: 5 },
    { name: '泰国', lat: 15.8, lng: 100.9, zoom: 6 },
    { name: '老挝', lat: 19.8, lng: 102.4, zoom: 6 },
    { name: '越南', lat: 14.0, lng: 108.2, zoom: 6 },
    { name: '柬埔寨', lat: 12.5, lng: 104.9, zoom: 6 },
    { name: '马来西亚', lat: 4.2, lng: 101.9, zoom: 6 },
    { name: '新加坡', lat: 1.3, lng: 103.8, zoom: 10 },
    { name: '印度尼西亚', lat: -0.7, lng: 113.9, zoom: 5 },
    { name: '菲律宾', lat: 12.8, lng: 121.7, zoom: 6 },
    { name: '日本', lat: 36.2, lng: 138.2, zoom: 5 },
    { name: '韩国', lat: 35.9, lng: 127.7, zoom: 6 },
    { name: '朝鲜', lat: 40.3, lng: 127.5, zoom: 6 },
    { name: '伊朗', lat: 32.4, lng: 53.6, zoom: 5 },
    { name: '伊拉克', lat: 33.2, lng: 43.6, zoom: 6 },
    { name: '叙利亚', lat: 34.8, lng: 38.9, zoom: 6 },
    { name: '土耳其', lat: 38.9, lng: 35.2, zoom: 6 },
    { name: '沙特阿拉伯', lat: 23.8, lng: 45.0, zoom: 5 },
    { name: '也门', lat: 15.5, lng: 48.5, zoom: 6 },
    { name: '阿曼', lat: 21.5, lng: 55.9, zoom: 6 },
    { name: '阿联酋', lat: 23.4, lng: 53.8, zoom: 7 },
    { name: '以色列', lat: 31.0, lng: 34.8, zoom: 7 },
    { name: '约旦', lat: 30.5, lng: 36.2, zoom: 7 },
    { name: '英国', lat: 55.3, lng: -3.4, zoom: 6 },
    { name: '法国', lat: 46.2, lng: 2.2, zoom: 6 },
    { name: '德国', lat: 51.1, lng: 10.4, zoom: 6 },
    { name: '意大利', lat: 41.8, lng: 12.5, zoom: 6 },
    { name: '西班牙', lat: 40.4, lng: -3.7, zoom: 6 },
    { name: '波兰', lat: 51.9, lng: 19.1, zoom: 6 },
    { name: '乌克兰', lat: 48.3, lng: 31.1, zoom: 6 },
    { name: '罗马尼亚', lat: 45.9, lng: 24.9, zoom: 6 },
    { name: '瑞典', lat: 60.1, lng: 18.6, zoom: 5 },
    { name: '挪威', lat: 60.4, lng: 8.4, zoom: 5 },
    { name: '芬兰', lat: 61.9, lng: 25.7, zoom: 5 },
    { name: '埃及', lat: 26.8, lng: 30.8, zoom: 6 },
    { name: '利比亚', lat: 26.3, lng: 17.2, zoom: 5 },
    { name: '阿尔及利亚', lat: 28.0, lng: 1.6, zoom: 5 },
    { name: '苏丹', lat: 12.8, lng: 30.2, zoom: 5 },
    { name: '埃塞俄比亚', lat: 9.1, lng: 40.4, zoom: 6 },
    { name: '肯尼亚', lat: 0.0, lng: 37.9, zoom: 6 },
    { name: '南非', lat: -30.5, lng: 22.9, zoom: 5 },
    { name: '尼日利亚', lat: 9.0, lng: 8.6, zoom: 6 },
    { name: '美国', lat: 37.0, lng: -95.7, zoom: 4 },
    { name: '加拿大', lat: 56.1, lng: -106.3, zoom: 4 },
    { name: '墨西哥', lat: 23.6, lng: -102.5, zoom: 5 },
    { name: '巴西', lat: -14.2, lng: -51.9, zoom: 4 },
    { name: '阿根廷', lat: -38.4, lng: -63.6, zoom: 5 },
    { name: '智利', lat: -35.6, lng: -71.5, zoom: 5 },
    { name: '秘鲁', lat: -9.1, lng: -75.0, zoom: 5 },
    { name: '哥伦比亚', lat: 4.5, lng: -74.2, zoom: 5 },
    { name: '澳大利亚', lat: -25.2, lng: 133.7, zoom: 4 },
    { name: '新西兰', lat: -40.9, lng: 174.8, zoom: 5 }
];

let labelLayers = [];

function addCountryLabels(map) {
    clearCountryLabels(map);

    countryLabels.forEach(function(country) {
        const labelIcon = L.divIcon({
            className: 'country-label',
            html: `<div class="country-label-text">${country.name}</div>`,
            iconSize: null
        });

        const marker = L.marker([country.lat, country.lng], {
            icon: labelIcon,
            interactive: false
        });

        labelLayers.push(marker);
    });

    updateLabelsVisibility(map);

    if (map.__countryLabelZoomHandler) {
        map.off('zoomend', map.__countryLabelZoomHandler);
    }

    map.__countryLabelZoomHandler = function() {
        updateLabelsVisibility(map);
    };

    map.on('zoomend', map.__countryLabelZoomHandler);
}

function updateLabelsVisibility(map) {
    const currentZoom = map.getZoom();

    labelLayers.forEach(function(marker, index) {
        const country = countryLabels[index];
        if (!country) {
            return;
        }

        if (currentZoom >= country.zoom - 2) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
            return;
        }

        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
}

function clearCountryLabels(mapInstance) {
    const activeMap = mapInstance || (typeof map !== 'undefined' ? map : null);
    labelLayers.forEach(function(marker) {
        if (activeMap && activeMap.hasLayer(marker)) {
            activeMap.removeLayer(marker);
        }
    });
    labelLayers = [];
}

if (typeof window !== 'undefined') {
    window.countryLabels = countryLabels;
}
