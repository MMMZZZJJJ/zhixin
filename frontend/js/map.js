/* 地图功能模块 */

const MAP_HOT_CITY_NAMES = ['全国', '北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '银川'];
const MAP_PROVINCE_CITY_GROUPS = [
    { province: '直辖市', cities: ['北京', '天津', '上海', '重庆'] },
    { province: '广东', cities: ['广州', '深圳'] },
    { province: '广西', cities: ['南宁'] },
    { province: '贵州', cities: ['贵阳'] },
    { province: '江苏', cities: ['南京'] },
    { province: '浙江', cities: ['杭州'] },
    { province: '山东', cities: ['济南', '青岛'] },
    { province: '湖北', cities: ['武汉'] },
    { province: '湖南', cities: ['长沙'] },
    { province: '四川', cities: ['成都'] },
    { province: '河南', cities: ['郑州'] },
    { province: '河北', cities: ['石家庄'] },
    { province: '陕西', cities: ['西安'] },
    { province: '福建', cities: ['福州', '厦门'] },
    { province: '辽宁', cities: ['沈阳', '大连'] },
    { province: '吉林', cities: ['长春'] },
    { province: '黑龙江', cities: ['哈尔滨'] },
    { province: '云南', cities: ['昆明'] },
    { province: '江西', cities: ['南昌'] },
    { province: '安徽', cities: ['合肥'] },
    { province: '山西', cities: ['太原'] },
    { province: '甘肃', cities: ['兰州'] },
    { province: '青海', cities: ['西宁'] },
    { province: '内蒙古', cities: ['呼和浩特'] },
    { province: '宁夏', cities: ['银川'] },
    { province: '新疆', cities: ['乌鲁木齐'] },
    { province: '西藏', cities: ['拉萨'] }
];
const MAP_CITY_INITIALS = ['全部', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'N', 'Q', 'S', 'T', 'W', 'X', 'Y', 'Z'];
const MAP_CITY_INITIAL_MAP = {
    '北京': 'B', '成都': 'C', '重庆': 'C', '长沙': 'C', '长春': 'C',
    '大连': 'D', '福州': 'F', '广州': 'G', '贵阳': 'G',
    '杭州': 'H', '合肥': 'H', '哈尔滨': 'H', '呼和浩特': 'H',
    '济南': 'J', '昆明': 'K', '兰州': 'L', '拉萨': 'L',
    '南京': 'N', '南宁': 'N', '南昌': 'N', '青岛': 'Q',
    '上海': 'S', '深圳': 'S', '沈阳': 'S', '石家庄': 'S',
    '天津': 'T', '太原': 'T', '武汉': 'W', '乌鲁木齐': 'W',
    '西安': 'X', '厦门': 'X', '西宁': 'X', '银川': 'Y', '郑州': 'Z'
};
const MAP_CITY_FALLBACK_POINTS = {
    '全国': { lat: 35.8617, lng: 104.1954, zoom: 4 },
    '广东': { lat: 23.3417, lng: 113.4244, zoom: 7 },
    '广西': { lat: 23.8298, lng: 108.7881, zoom: 7 },
    '贵州': { lat: 26.5982, lng: 106.7074, zoom: 7 },
    '江苏': { lat: 32.9711, lng: 119.4550, zoom: 7 },
    '浙江': { lat: 29.1832, lng: 120.0934, zoom: 7 },
    '山东': { lat: 36.6683, lng: 117.0204, zoom: 7 },
    '湖北': { lat: 30.9756, lng: 112.2707, zoom: 7 },
    '湖南': { lat: 27.6104, lng: 111.7088, zoom: 7 },
    '四川': { lat: 30.6171, lng: 102.7103, zoom: 7 },
    '河南': { lat: 34.2904, lng: 113.3824, zoom: 7 },
    '河北': { lat: 38.0371, lng: 114.5315, zoom: 7 },
    '陕西': { lat: 35.3939, lng: 108.9470, zoom: 7 },
    '福建': { lat: 26.0998, lng: 118.2951, zoom: 7 },
    '辽宁': { lat: 41.2956, lng: 122.6085, zoom: 7 },
    '吉林': { lat: 43.8378, lng: 126.5494, zoom: 7 },
    '黑龙江': { lat: 45.7421, lng: 126.6617, zoom: 6 },
    '云南': { lat: 25.0458, lng: 102.7097, zoom: 7 },
    '江西': { lat: 27.6140, lng: 115.7221, zoom: 7 },
    '安徽': { lat: 31.8612, lng: 117.2857, zoom: 7 },
    '山西': { lat: 37.8735, lng: 112.5624, zoom: 7 },
    '甘肃': { lat: 36.0594, lng: 103.8263, zoom: 6 },
    '青海': { lat: 36.6209, lng: 101.7801, zoom: 6 },
    '内蒙古': { lat: 40.8174, lng: 111.7652, zoom: 6 },
    '宁夏': { lat: 37.2692, lng: 106.1655, zoom: 7 },
    '新疆': { lat: 43.7930, lng: 87.6271, zoom: 5 },
    '西藏': { lat: 29.6475, lng: 91.1172, zoom: 6 }
};
let mapCityPanelState = { tab: 'province', filter: '', initial: '全部', current: '北京' };

let map, marker;
let mapBaseLayer;
let mapReadyTimerId = null;
let mapBaseLayerAttached = false;
let mapBaseLayerScheduled = false;
let mapBaseLayerMode = null;
let mapGlobalBaseLayerSourceIndex = 0;
let mapGlobalBaseLayerTileErrorCount = 0;
const mapGeocodeCache = new Map();
const MAP_GLOBAL_BASE_LAYER_SOURCES = [
    {
        name: 'Esri World Street Map',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        subdomains: [],
        maxZoom: 19,
        maxNativeZoom: 16
    },
    {
        name: 'CartoDB Positron',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        maxZoom: 20,
        maxNativeZoom: 19
    },
    {
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
        maxNativeZoom: 19
    }
];
const MAP_CITY_MOJIBAKE_ALIAS = {
    '镶愬仓': '银川',
    '鍖椾含': '北京',
    '涓婃捣': '上海',
    '骞垮窞': '广州',
    '娣卞湷': '深圳',
    '鏉窞': '杭州',
    '鍗椾含': '南京',
    '姝︽眽': '武汉',
    '鎴愰兘': '成都',
    '瑗垮畨': '西安'
};

function markMapReady() {
    if (mapReadyTimerId) {
        clearTimeout(mapReadyTimerId);
        mapReadyTimerId = null;
    }
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        return;
    }
    mapContainer.classList.remove('map-loading');
    mapContainer.classList.add('map-ready');
}

function ensureCountryLabelsForMap() {
    if (!map || window.ENABLE_COUNTRY_LABELS !== true || map.__countryLabelsReady === true) {
        return;
    }
    if (typeof addCountryLabels === 'function') {
        addCountryLabels(map);
        map.__countryLabelsReady = true;
        return;
    }
    if (typeof window.ensureCountryLabelsLoaded === 'function') {
        window.ensureCountryLabelsLoaded()
            .then(function() {
                if (map && typeof addCountryLabels === 'function' && map.__countryLabelsReady !== true) {
                    addCountryLabels(map);
                    map.__countryLabelsReady = true;
                }
            })
            .catch(function() {});
    }
}

function getKnownMapCityNames() {
    const cityNames = new Set(MAP_HOT_CITY_NAMES);
    Object.keys(MAP_CITY_FALLBACK_POINTS).forEach(function(name) {
        cityNames.add(name);
    });
    MAP_PROVINCE_CITY_GROUPS.forEach(function(group) {
        cityNames.add(group.province);
        group.cities.forEach(function(cityName) {
            cityNames.add(cityName);
        });
    });
    return cityNames;
}

function sanitizeMapCityName(value) {
    const raw = String(value || '').trim();
    if (!raw) {
        return '北京';
    }
    if (MAP_CITY_MOJIBAKE_ALIAS[raw]) {
        return MAP_CITY_MOJIBAKE_ALIAS[raw];
    }
    return getKnownMapCityNames().has(raw) ? raw : '北京';
}

function closeMapCityDropdown(dropdown) {
    if (!dropdown) {
        return;
    }
    dropdown.classList.remove('show');
}

function createChinaBaseLayer() {
    return L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 1,
        zoomOffset: 0
    });
}

function createGlobalBaseLayer(sourceIndex = 0) {
    const safeSourceIndex = MAP_GLOBAL_BASE_LAYER_SOURCES[sourceIndex] ? sourceIndex : 0;
    const source = MAP_GLOBAL_BASE_LAYER_SOURCES[safeSourceIndex];
    const layer = L.tileLayer(source.url, {
        subdomains: source.subdomains,
        maxZoom: source.maxZoom,
        maxNativeZoom: source.maxNativeZoom,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 1
    });
    layer.on('tileerror', function() {
        if (!map || mapBaseLayerMode !== 'global' || mapBaseLayer !== layer) {
            return;
        }
        mapGlobalBaseLayerTileErrorCount += 1;
        if (mapGlobalBaseLayerTileErrorCount >= 1) {
            switchGlobalBaseLayerSource(safeSourceIndex + 1);
        }
    });
    return layer;
}

function switchGlobalBaseLayerSource(nextSourceIndex) {
    if (!map || mapBaseLayerMode !== 'global') {
        return;
    }
    if (!MAP_GLOBAL_BASE_LAYER_SOURCES[nextSourceIndex]) {
        if (mapBaseLayer && map.hasLayer(mapBaseLayer)) {
            map.removeLayer(mapBaseLayer);
        }
        mapBaseLayer = createChinaBaseLayer();
        mapBaseLayerMode = 'china-fallback';
        mapBaseLayerAttached = true;
        mapBaseLayer.addTo(map);
        bindBaseLayerReady(mapBaseLayer);
        return;
    }
    if (mapBaseLayer && map.hasLayer(mapBaseLayer)) {
        map.removeLayer(mapBaseLayer);
    }
    mapGlobalBaseLayerSourceIndex = nextSourceIndex;
    mapGlobalBaseLayerTileErrorCount = 0;
    mapBaseLayer = createGlobalBaseLayer(mapGlobalBaseLayerSourceIndex);
    mapBaseLayerAttached = true;
    mapBaseLayer.addTo(map);
    bindBaseLayerReady(mapBaseLayer);
}

function isLikelyChinaLocation(lat, lng) {
    return Number.isFinite(lat)
        && Number.isFinite(lng)
        && lat >= 3
        && lat <= 54.5
        && lng >= 73
        && lng <= 136;
}

function bindBaseLayerReady(layer) {
    layer.once('load', function() {
        markMapReady();
        window.setTimeout(function() {
            if (map) {
                map.invalidateSize(false);
            }
        }, 80);
    });

    mapReadyTimerId = window.setTimeout(markMapReady, 2400);
}

function updateMapBaseLayerForLocation(lat, lng) {
    if (!map) {
        return;
    }
    const nextMode = isLikelyChinaLocation(Number(lat), Number(lng)) ? 'china' : 'global';
    if (mapBaseLayer && mapBaseLayerMode === nextMode) {
        return;
    }

    if (mapBaseLayer && map.hasLayer(mapBaseLayer)) {
        map.removeLayer(mapBaseLayer);
    }

    if (nextMode === 'china') {
        mapGlobalBaseLayerSourceIndex = 0;
        mapGlobalBaseLayerTileErrorCount = 0;
    }

    mapBaseLayer = nextMode === 'china' ? createChinaBaseLayer() : createGlobalBaseLayer(mapGlobalBaseLayerSourceIndex);
    mapBaseLayerMode = nextMode;
    mapBaseLayerAttached = true;
    mapBaseLayer.addTo(map);
    bindBaseLayerReady(mapBaseLayer);
}

function attachMapBaseLayer() {
    if (!map) {
        return;
    }
    const center = typeof map.getCenter === 'function'
        ? map.getCenter()
        : { lat: 39.914885, lng: 116.403874 };
    updateMapBaseLayerForLocation(Number(center.lat), Number(center.lng));
}

function scheduleMapBaseLayerAttach(mapContainer) {
    if (mapBaseLayerScheduled) {
        return;
    }
    mapBaseLayerScheduled = true;

    const startAttach = function() {
        attachMapBaseLayer();
    };

    const attachImmediately = function() {
        startAttach();
        if (!mapContainer) {
            return;
        }
        mapContainer.removeEventListener('pointerdown', attachImmediately);
        mapContainer.removeEventListener('wheel', attachImmediately);
        mapContainer.removeEventListener('touchstart', attachImmediately);
    };

    if (mapContainer) {
        mapContainer.addEventListener('pointerdown', attachImmediately, { passive: true, once: true });
        mapContainer.addEventListener('wheel', attachImmediately, { passive: true, once: true });
        mapContainer.addEventListener('touchstart', attachImmediately, { passive: true, once: true });
    }

    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(startAttach, { timeout: 1600 });
        return;
    }

    window.setTimeout(startAttach, 900);
}

// 初始化地图
function initMap() {
    if (map) {
        if (!mapBaseLayerAttached) {
            attachMapBaseLayer();
        }
        markMapReady();
        window.setTimeout(function() {
            map.invalidateSize(false);
        }, 60);
        return;
    }

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.classList.add('map-loading');
    }

    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
        inertia: false,
        wheelDebounceTime: 100,
        zoomSnap: 0.5
    }).setView([39.914885, 116.403874], 9.5);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 添加国家标注（如果已启用 country-labels.js）
    ensureCountryLabelsForMap();

    // 地图点击事件
    map.on('click', function(e) {
        updateData(e.latlng.lat, e.latlng.lng);
    });
    initMapCitySelector();
    scheduleMapBaseLayerAttach(mapContainer);
}

// 鏇存柊鏁版嵁閫昏緫
function initMapCitySelector() {
    const toolbar = document.getElementById('mapToolbar');
    const searchInput = document.getElementById('map_search_input') || document.getElementById('addr_search');
    const legacyInput = document.getElementById('addr_search');
    const searchBtn = document.getElementById('mapSearchBtn');
    const trigger = document.getElementById('mapCityTrigger');
    const dropdown = document.getElementById('mapCityDropdown');
    const closeBtn = document.getElementById('mapCityClose');
    const filterInput = document.getElementById('mapCityFilterInput');

    if (!toolbar || !searchInput || !trigger || !dropdown) {
        return;
    }

    if (!mapCityPanelState.current) {
        const currentLabel = document.getElementById('mapCityLabel');
        mapCityPanelState.current = sanitizeMapCityName(currentLabel ? currentLabel.textContent : '北京');
    }

    syncMapSearchKeyword(legacyInput ? legacyInput.value : searchInput.value);
    updateMapCityLabel();
    renderMapCityDropdown();

    if (toolbar.dataset.citySelectorReady === '1') {
        return;
    }
    toolbar.dataset.citySelectorReady = '1';

    searchInput.addEventListener('input', function() {
        if (legacyInput) {
            legacyInput.value = searchInput.value;
        }
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            syncMapSearchKeyword(searchInput.value);
            searchAddress();
        }
    });

    if (legacyInput) {
        legacyInput.addEventListener('input', function() {
            if (document.activeElement !== searchInput) {
                syncMapSearchKeyword(legacyInput.value);
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            syncMapSearchKeyword(searchInput.value);
            searchAddress();
        });
    }

    trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeMapCityDropdown(dropdown);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', function() {
            mapCityPanelState.filter = String(filterInput.value || '').trim();
            renderMapCityDropdown();
        });
    }

    document.querySelectorAll('[data-city-tab]').forEach(function(tabButton) {
        tabButton.addEventListener('click', function() {
            const nextTab = tabButton.getAttribute('data-city-tab') || 'province';
            if (mapCityPanelState.tab === nextTab) {
                return;
            }
            mapCityPanelState.tab = nextTab;
            mapCityPanelState.initial = '全部';
            renderMapCityDropdown();
        });
    });

    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.addEventListener('click', function(e) {
        if (!toolbar.contains(e.target)) {
            closeMapCityDropdown(dropdown);
        }
    });
}

function syncMapSearchKeyword(keyword) {
    const value = String(keyword || '');
    const overlayInput = document.getElementById('map_search_input');
    const legacyInput = document.getElementById('addr_search');
    if (overlayInput && overlayInput.value !== value) {
        overlayInput.value = value;
    }
    if (legacyInput && legacyInput.value !== value) {
        legacyInput.value = value;
    }
}

function renderMapCityDropdown() {
    const dropdown = document.getElementById('mapCityDropdown');
    const filterInput = document.getElementById('mapCityFilterInput');
    if (!dropdown) {
        return;
    }

    if (filterInput && filterInput.value !== mapCityPanelState.filter) {
        filterInput.value = mapCityPanelState.filter;
    }

    document.querySelectorAll('[data-city-tab]').forEach(function(tabButton) {
        const isActive = tabButton.getAttribute('data-city-tab') === mapCityPanelState.tab;
        tabButton.classList.toggle('active', isActive);
    });

    renderMapHotCities();
    renderMapCityInitials();
    renderMapCityList();
    updateMapCityLabel();
}

function renderMapHotCities() {
    const hotList = document.getElementById('mapCityHotList');
    if (!hotList) {
        return;
    }

    hotList.innerHTML = MAP_HOT_CITY_NAMES.map(function(cityName) {
        const activeClass = cityName === mapCityPanelState.current ? ' active' : '';
        return `<button type="button" class="map-city-link${activeClass}" data-city-name="${cityName}">${cityName}</button>`;
    }).join('');

    bindMapCityLinks(hotList);
}

function renderMapCityInitials() {
    const initialsContainer = document.getElementById('mapCityInitials');
    if (!initialsContainer) {
        return;
    }

    if (mapCityPanelState.tab !== 'city') {
        initialsContainer.style.display = 'none';
        initialsContainer.innerHTML = '';
        return;
    }

    initialsContainer.style.display = 'flex';
    initialsContainer.innerHTML = MAP_CITY_INITIALS.map(function(initial) {
        const activeClass = initial === mapCityPanelState.initial ? ' active' : '';
        return `<button type="button" class="map-city-initial-btn${activeClass}" data-city-initial="${initial}">${initial}</button>`;
    }).join('');

    initialsContainer.querySelectorAll('[data-city-initial]').forEach(function(button) {
        button.addEventListener('click', function() {
            mapCityPanelState.initial = button.getAttribute('data-city-initial') || '全部';
            renderMapCityList();
            renderMapCityInitials();
        });
    });
}

function renderMapCityList() {
    const listContainer = document.getElementById('mapCityList');
    if (!listContainer) {
        return;
    }

    const keyword = String(mapCityPanelState.filter || '').trim();
    if (mapCityPanelState.tab === 'city') {
        renderMapCityListByInitial(listContainer, keyword);
        return;
    }
    renderMapCityListByProvince(listContainer, keyword);
}

function renderMapCityListByProvince(container, keyword) {
    const normalizedKeyword = normalizeKeyword(keyword);
    const sections = [];

    MAP_PROVINCE_CITY_GROUPS.forEach(function(group) {
        const provinceMatch = !normalizedKeyword || normalizeKeyword(group.province).includes(normalizedKeyword);
        const matchedCities = group.cities.filter(function(cityName) {
            return !normalizedKeyword || normalizeKeyword(cityName).includes(normalizedKeyword);
        });

        if (!provinceMatch && matchedCities.length === 0) {
            return;
        }

        const cityButtons = (provinceMatch ? group.cities : matchedCities).map(function(cityName) {
            const activeClass = cityName === mapCityPanelState.current ? ' active' : '';
            return `<button type="button" class="map-city-link${activeClass}" data-city-name="${cityName}">${cityName}</button>`;
        }).join('');

        const provinceActive = group.province === mapCityPanelState.current ? ' active' : '';
        sections.push(
            `<div class="map-city-group">
                <div class="map-city-group-title">
                    <button type="button" class="map-city-link map-city-group-link${provinceActive}" data-city-name="${group.province}">${group.province}</button>
                </div>
                <div class="map-city-group-items">${cityButtons}</div>
            </div>`
        );
    });

    container.innerHTML = sections.length > 0 ? sections.join('') : '<div class="map-city-empty">未找到匹配的城市或省份</div>';
    bindMapCityLinks(container);
}

function renderMapCityListByInitial(container, keyword) {
    const normalizedKeyword = normalizeKeyword(keyword);
    const citySet = new Set();
    MAP_PROVINCE_CITY_GROUPS.forEach(function(group) {
        group.cities.forEach(function(cityName) {
            citySet.add(cityName);
        });
    });

    const cityList = Array.from(citySet);
    const groups = [];

    MAP_CITY_INITIALS.forEach(function(initial) {
        if (initial === '全部') {
            return;
        }
        if (mapCityPanelState.initial !== '全部' && mapCityPanelState.initial !== initial) {
            return;
        }

        const currentCities = cityList.filter(function(cityName) {
            const initialMatched = (MAP_CITY_INITIAL_MAP[cityName] || '#') === initial;
            const keywordMatched = !normalizedKeyword || normalizeKeyword(cityName).includes(normalizedKeyword);
            return initialMatched && keywordMatched;
        });

        if (currentCities.length === 0) {
            return;
        }

        const buttons = currentCities.map(function(cityName) {
            const activeClass = cityName === mapCityPanelState.current ? ' active' : '';
            return `<button type="button" class="map-city-link${activeClass}" data-city-name="${cityName}">${cityName}</button>`;
        }).join('');

        groups.push(
            `<div class="map-city-group">
                <div class="map-city-group-title">${initial}</div>
                <div class="map-city-group-items">${buttons}</div>
            </div>`
        );
    });

    container.innerHTML = groups.length > 0 ? groups.join('') : '<div class="map-city-empty">未找到匹配的城市</div>';
    bindMapCityLinks(container);
}

function bindMapCityLinks(container) {
    if (!container) {
        return;
    }
    container.querySelectorAll('[data-city-name]').forEach(function(button) {
        button.addEventListener('click', function() {
            const cityName = button.getAttribute('data-city-name');
            if (cityName) {
                selectMapCity(cityName);
            }
        });
    });
}

function selectMapCity(cityName) {
    const nextCityName = sanitizeMapCityName(cityName);
    if (!nextCityName || !map) {
        return;
    }

    mapCityPanelState.current = nextCityName;
    updateMapCityLabel();

    const targetPoint = findBuiltinPlacePointByKeyword(nextCityName) || MAP_CITY_FALLBACK_POINTS[nextCityName];
    if (targetPoint && Number.isFinite(Number(targetPoint.lat)) && Number.isFinite(Number(targetPoint.lng))) {
        map.setView([Number(targetPoint.lat), Number(targetPoint.lng)], Number(targetPoint.zoom) || map.getZoom());
    }

    const dropdown = document.getElementById('mapCityDropdown');
    if (dropdown) {
        closeMapCityDropdown(dropdown);
    }

    renderMapCityDropdown();
}

function updateMapCityLabel() {
    const cityName = sanitizeMapCityName(mapCityPanelState.current);
    const cityLabel = document.getElementById('mapCityLabel');
    const currentCity = document.getElementById('mapCurrentCityName');
    if (cityLabel) {
        cityLabel.textContent = cityName;
    }
    if (currentCity) {
        currentCity.textContent = cityName;
    }
}

function updateData(lat, lng) {
    lat = parseFloat(lat).toFixed(6);
    lng = parseFloat(lng).toFixed(6);
    updateMapBaseLayerForLocation(Number(lat), Number(lng));

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
        .replace(/[，。、,.·—_\\/\\-]/g, '');
}

function parseCoordinatePointByKeyword(keyword) {
    const text = String(keyword || '').trim();
    if (!text) {
        return null;
    }
    const normalized = text
        .replace(/[锛岋紱;]/g, ',')
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
    const normalized = normalizeKeyword(keyword);
    return aliasMap[normalized] || null;
}

function getAvailableCountryLabels() {
    if (typeof window !== 'undefined' && Array.isArray(window.countryRegionPoints)) {
        return window.countryRegionPoints;
    }
    if (typeof countryLabels !== 'undefined' && Array.isArray(countryLabels)) {
        return countryLabels;
    }
    if (typeof window !== 'undefined' && Array.isArray(window.countryLabels)) {
        return window.countryLabels;
    }
    return [];
}

function findCountryPointByKeyword(keyword) {
    const labels = getAvailableCountryLabels();
    if (labels.length === 0) {
        return null;
    }
    const normalizedKeyword = normalizeKeyword(keyword);
    if (!normalizedKeyword) {
        return null;
    }
    const regionAliasMap = (typeof window !== 'undefined' && window.countryRegionAliasMap) ? window.countryRegionAliasMap : null;
    const aliasName = regionAliasMap && regionAliasMap[normalizedKeyword]
        ? regionAliasMap[normalizedKeyword]
        : getCountryAliasKeyword(keyword);
    const exactMatch = labels.find((country) => normalizeKeyword(country.name) === normalizedKeyword);
    if (exactMatch) {
        return exactMatch;
    }
    if (aliasName) {
        const aliasMatch = labels.find((country) => country.name === aliasName);
        if (aliasMatch) {
            return aliasMatch;
        }
    }
    const aliasListMatch = labels.find(function(country) {
        return Array.isArray(country.aliases) && country.aliases.some(function(alias) {
            return normalizeKeyword(alias) === normalizedKeyword;
        });
    });
    if (aliasListMatch) {
        return aliasListMatch;
    }
    if (normalizedKeyword.length >= 2) {
        const fuzzyMatch = labels.find((country) => normalizeKeyword(country.name).includes(normalizedKeyword));
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
    const worldCityAliasMap = (typeof window !== 'undefined' && window.worldCityAliasMap) ? window.worldCityAliasMap : null;
    const worldCityPoints = (typeof window !== 'undefined' && Array.isArray(window.worldCityPoints)) ? window.worldCityPoints : null;
    if (worldCityPoints && worldCityPoints.length > 0) {
        const mappedWorldCityName = worldCityAliasMap && worldCityAliasMap[normalizedKeyword]
            ? worldCityAliasMap[normalizedKeyword]
            : null;
        if (mappedWorldCityName) {
            const matchedWorldCity = worldCityPoints.find(function(city) {
                return city.name === mappedWorldCityName;
            });
            if (matchedWorldCity) {
                return { lat: matchedWorldCity.lat, lng: matchedWorldCity.lng, zoom: matchedWorldCity.zoom || 10 };
            }
        }
        const directWorldCityMatch = worldCityPoints.find(function(city) {
            return normalizeKeyword(city.name) === normalizedKeyword
                || (Array.isArray(city.aliases) && city.aliases.some(function(alias) {
                    return normalizeKeyword(alias) === normalizedKeyword;
                }));
        });
        if (directWorldCityMatch) {
            return { lat: directWorldCityMatch.lat, lng: directWorldCityMatch.lng, zoom: directWorldCityMatch.zoom || 10 };
        }
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
        '重庆': { lat: 29.5630, lng: 106.5516, zoom: 10 },
        '天津': { lat: 39.0842, lng: 117.2009, zoom: 10 },
        '西安': { lat: 34.3416, lng: 108.9398, zoom: 10 },
        '郑州': { lat: 34.7466, lng: 113.6254, zoom: 10 },
        '长沙': { lat: 28.2282, lng: 112.9388, zoom: 10 },
        '合肥': { lat: 31.8206, lng: 117.2272, zoom: 10 },
        '福州': { lat: 26.0745, lng: 119.2965, zoom: 10 },
        '厦门': { lat: 24.4798, lng: 118.0894, zoom: 11 },
        '南宁': { lat: 22.8170, lng: 108.3669, zoom: 10 },
        '昆明': { lat: 25.0389, lng: 102.7183, zoom: 10 },
        '贵阳': { lat: 26.6470, lng: 106.6302, zoom: 10 },
        '南昌': { lat: 28.6829, lng: 115.8582, zoom: 10 },
        '济南': { lat: 36.6512, lng: 117.1201, zoom: 10 },
        '青岛': { lat: 36.0671, lng: 120.3826, zoom: 10 },
        '沈阳': { lat: 41.8057, lng: 123.4315, zoom: 10 },
        '大连': { lat: 38.9140, lng: 121.6147, zoom: 10 },
        '长春': { lat: 43.8171, lng: 125.3235, zoom: 10 },
        '哈尔滨': { lat: 45.8038, lng: 126.5349, zoom: 10 },
        '呼和浩特': { lat: 40.8426, lng: 111.7492, zoom: 10 },
        '石家庄': { lat: 38.0428, lng: 114.5149, zoom: 10 },
        '太原': { lat: 37.8706, lng: 112.5489, zoom: 10 },
        '银川': { lat: 38.4872, lng: 106.2309, zoom: 10 },
        '兰州': { lat: 36.0611, lng: 103.8343, zoom: 10 },
        '西宁': { lat: 36.6171, lng: 101.7782, zoom: 10 },
        '拉萨': { lat: 29.6520, lng: 91.1721, zoom: 10 },
        '乌鲁木齐': { lat: 43.8256, lng: 87.6168, zoom: 10 },
        '宁夏': { lat: 37.2692, lng: 106.1655, zoom: 7 },
        '新疆': { lat: 43.7930, lng: 87.6271, zoom: 5 },
        '西藏': { lat: 29.6475, lng: 91.1172, zoom: 6 },
        '内蒙古': { lat: 40.8174, lng: 111.7652, zoom: 6 },
        '广西': { lat: 22.8170, lng: 108.3669, zoom: 7 },
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
    const normalizedKeyword = normalizeKeyword(keyword);
    if (normalizedKeyword && mapGeocodeCache.has(normalizedKeyword)) {
        return mapGeocodeCache.get(normalizedKeyword);
    }
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
            const response = await fetchWithTimeout(provider.url, { method: 'GET' }, 4000);
            if (!response.ok) {
                throw new Error(`HTTP閿欒: ${response.status}`);
            }
            const data = await response.json();
            const point = provider.parse(data);
            if (point) {
                const result = { lat: Number(point.lat), lng: Number(point.lng) };
                if (normalizedKeyword && Number.isFinite(result.lat) && Number.isFinite(result.lng)) {
                    mapGeocodeCache.set(normalizedKeyword, result);
                    if (mapGeocodeCache.size > 20) {
                        const oldestKey = mapGeocodeCache.keys().next().value;
                        mapGeocodeCache.delete(oldestKey);
                    }
                }
                return result;
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

// 閲嶇疆
function resetAll() {
    document.getElementById('lat_input').value = '';
    document.getElementById('lng_input').value = '';
    document.getElementById('res_pos').innerText = '点击地图获取';
    document.getElementById('res_deg').innerText = '--';
    document.getElementById('res_dms').innerText = '--';
    if (marker) map.removeLayer(marker);
    marker = null;
    mapCityPanelState.filter = '';
    const dropdown = document.getElementById('mapCityDropdown');
    const filterInput = document.getElementById('mapCityFilterInput');
    if (dropdown) {
        closeMapCityDropdown(dropdown);
    }
    if (filterInput) {
        filterInput.value = '';
    }
    syncMapSearchKeyword('');
    mapCityPanelState.current = '北京';
    updateMapCityLabel();
    map.setView([39.914885, 116.403874], 10);
}










