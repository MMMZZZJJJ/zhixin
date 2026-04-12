/* 席位查询模块 - 9069接口 */

const SEAT_PAGE_SIZE = 20;
let seatModalState = null;

// 查询席位（下单）
async function placeOrder() {
    const lat = document.getElementById('lat_input').value;
    const lng = document.getElementById('lng_input').value;
    // const address = document.getElementById('res_addr').innerText;
    
    if (!lat || !lng) {
        alert("请先选择或输入有效的经纬度位置");
        return;
    }
    
    // 精度检查和警告
    const lngPrecision = getDecimalPlaces(lng);
    const latPrecision = getDecimalPlaces(lat);
    
    if (lngPrecision < 4 || latPrecision < 4) {
        const confirmed = confirm(
            `⚠️ 精度警告\n\n` +
            `当前经纬度精度较低：\n` +
            `经度：${lngPrecision}位小数（约${getPrecisionDistance(lngPrecision)}误差）\n` +
            `纬度：${latPrecision}位小数（约${getPrecisionDistance(latPrecision)}误差）\n\n` +
            `建议使用至少4位小数（约11米精度）\n` +
            `推荐使用6位小数（约0.11米精度）\n\n` +
            `是否继续查询？`
        );
        if (!confirmed) return;
    }
    
    // 显示加载状态
    const btnOrder = document.querySelector('.btn-order') || document.getElementById('btn-order') || document.querySelector('button[onclick="placeOrder()"]');
    const originalText = btnOrder ? btnOrder.innerText : '';
    if (btnOrder) {
        btnOrder.innerText = '预测中...';
        btnOrder.disabled = true;
    }
    
    try {
        const seatPredictionConfig = window.APP_CONFIG?.api?.seatPrediction || {};
        const apiBase = seatPredictionConfig.url || '/api/seat-prediction';
        const apiUrl = `${apiBase}?Longitude=${lng}&Latitude=${lat}`;
        const requestOptions = {
            method: seatPredictionConfig.method || 'GET'
        };
        const headers = seatPredictionConfig.headers || {};
        if (Object.keys(headers).length > 0) {
            requestOptions.headers = headers;
        }
        // console.log("请求接口：", apiUrl);
        // console.log("经度精度：", lngPrecision, "位小数");
        // console.log("纬度精度：", latPrecision, "位小数");
        
        const requester = typeof authFetch === 'function' ? authFetch : fetch;
        const response = await requester(apiUrl, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        const data = await response.json();
        const seatList = normalizeSeatList(data);
        // console.log("接口返回数据：", data);
        
        // 解析返回数据并显示
        if (seatList.length > 0) {
            cacheSeatList(lng, lat, seatList);
            showResultModal(seatList, lng, lat, seatList.length);
        } else {
            const cachedSeatList = readSeatCache(lng, lat);
            if (cachedSeatList.length > 0) {
                showResultModal(cachedSeatList, lng, lat, cachedSeatList.length);
            } else {
                showNoResultModal();
            }
        }
        
    } catch (error) {
        // console.error("接口调用失败：", error);
        const cachedSeatList = readSeatCache(lng, lat);
        if (cachedSeatList.length > 0) {
            showResultModal(cachedSeatList, lng, lat, cachedSeatList.length);
            alert(`当前实时接口不可用，已展示最近一次成功查询数据。\n\n错误信息：${error.message}`);
        } else {
            alert(`预测失败：${error.message}\n\n可能原因：\n1. 网络连接问题\n2. 接口服务未启动\n3. 后端未配置跨域响应头（Access-Control-Allow-Origin）`);
        }
    } finally {
        // 恢复按钮状态
        if (btnOrder) {
            btnOrder.innerText = originalText;
            btnOrder.disabled = false;
        }
    }
}

// 显示结果弹窗
function showResultModal(data, lng, lat, seatCount = data.length) {
    seatModalState = {
        data: Array.isArray(data) ? data : [],
        lng,
        lat,
        seatCount,
        currentPage: 1
    };
    renderSeatModalPage();
}

function renderSeatModalPage() {
    if (!seatModalState) {
        return;
    }

    const { data, lng, lat, seatCount } = seatModalState;
    const modalBody = document.getElementById('modalBody');
    const totalSeats = Array.isArray(data) ? data.length : 0;
    const totalPages = Math.max(1, Math.ceil(totalSeats / SEAT_PAGE_SIZE));
    const currentPage = Math.min(Math.max(seatModalState.currentPage || 1, 1), totalPages);
    seatModalState.currentPage = currentPage;
    const startIndex = (currentPage - 1) * SEAT_PAGE_SIZE;
    const endIndex = Math.min(startIndex + SEAT_PAGE_SIZE, totalSeats);
    const pageItems = data.slice(startIndex, endIndex);

    let html = `
        <div class="result-info">
            <p><strong>经纬度：</strong>${lng}, ${lat}</p>
            <p><strong>成像时间预测数量：</strong>共找到 ${seatCount} 个可拍摄时段</p>
            <p><strong>当前分页：</strong>第 ${currentPage} / ${totalPages} 页，显示第 ${totalSeats === 0 ? 0 : startIndex + 1}-${endIndex} 条</p>
        </div>
    `;

    pageItems.forEach((item, index) => {
        const absoluteIndex = startIndex + index;
        const imagingModeText = formatSeatImagingMode(item['05-ImagingMode']);
        const sourceName = item['01-SourceName'] || item['01-SourcName'] || '未知';
            
        html += `
            <div class="seat-card">
                <h3>可拍摄时段 ${absoluteIndex + 1}</h3>
                <div class="info-row">
                    <span class="info-label">卫星名称：</span>
                    <span class="info-value">${sourceName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">中心时间：</span>
                    <span class="info-value highlight">${item['04-CentralityTime'] || '未知'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">成像模式：</span>
                    <span class="info-value">${imagingModeText}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">侧摆位置：</span>
                    <span class="info-value">${item['06-RollPosition'] || '未知'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">最早指令上注时间：</span>
                    <span class="info-value">${item['07-DirectiveUpload'] || '未知'}</span>
                </div>
                <div class="task-submit-box">
                    <button class="btn btn-submit-task" data-index="${absoluteIndex}">
                        提交成像任务
                    </button>
                </div>
            </div>
        `;
    });

    if (totalPages > 1) {
        html += buildSeatPaginationHtml(currentPage, totalPages);
    }

    modalBody.innerHTML = html;
    document.getElementById('resultModal').style.display = 'block';

    const submitButtons = document.querySelectorAll('.btn-submit-task');
    submitButtons.forEach((button) => {
        const index = parseInt(button.getAttribute('data-index'));
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            submitTask(data[index]);
        });
    });

    bindSeatPaginationEvents();
    modalBody.scrollTop = 0;
}

function buildSeatPaginationHtml(currentPage, totalPages) {
    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let page = startPage; page <= endPage; page++) {
        pageNumbers.push(`
            <button class="seat-page-btn ${page === currentPage ? 'active' : ''}" data-page="${page}">
                ${page}
            </button>
        `);
    }

    return `
        <div class="seat-pagination">
            <div class="seat-pagination-info">
                共 ${totalPages} 页，每页 ${SEAT_PAGE_SIZE} 条
            </div>
            <div class="seat-pagination-controls">
                <button class="seat-page-btn" data-page="1" ${currentPage === 1 ? 'disabled' : ''}>首页</button>
                <button class="seat-page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
                ${pageNumbers.join('')}
                <button class="seat-page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
                <button class="seat-page-btn" data-page="${totalPages}" ${currentPage === totalPages ? 'disabled' : ''}>末页</button>
            </div>
        </div>
    `;
}

function bindSeatPaginationEvents() {
    const pageButtons = document.querySelectorAll('.seat-page-btn[data-page]');
    pageButtons.forEach((button) => {
        button.addEventListener('click', function() {
            if (button.disabled || !seatModalState) {
                return;
            }
            const nextPage = parseInt(button.getAttribute('data-page'), 10);
            if (!Number.isFinite(nextPage) || nextPage === seatModalState.currentPage) {
                return;
            }
            seatModalState.currentPage = nextPage;
            renderSeatModalPage();
        });
    });
}

// 显示无结果弹窗
function showNoResultModal() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="no-result">
            <div class="no-result-icon">🔍</div>
            <p style="font-size: 16px; color: #666;">未找到可用的席位时间</p>
            <p style="font-size: 14px; color: #999; margin-top: 10px;">请尝试选择其他位置</p>
        </div>
    `;
    document.getElementById('resultModal').style.display = 'block';
}

// 关闭弹窗
function closeModal() {
    seatModalState = null;
    document.getElementById('resultModal').style.display = 'none';
}

// 点击弹窗外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('resultModal');
    if (event.target === modal) {
        closeModal();
    }
    const confirmModal = document.getElementById('confirmModal');
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
}

function formatSeatImagingMode(mode) {
    if (Array.isArray(mode)) {
        return mode.map(item => formatSeatImagingMode(item)).join('、');
    }
    if (mode === null || mode === undefined || mode === '') {
        return '未知';
    }
    const value = String(mode).trim();
    if (/[、,，/]/.test(value)) {
        return value
            .split(/[、,，/]/)
            .map(item => item.trim())
            .filter(Boolean)
            .map(item => formatSeatImagingMode(item))
            .join('、');
    }
    const modeTextMap = {
        '1': '条带模式',
        '2': '滑聚模式',
        '3': '聚束模式',
        '条带': '条带模式',
        '滑聚': '滑聚模式',
        '聚束': '聚束模式'
    };
    return modeTextMap[value] || value;
}

function getTopLevelSeatCount(payload) {
    return normalizeSeatList(payload).length;
}

function normalizeSeatList(payload) {
    if (Array.isArray(payload)) {
        return normalizeSeatArray(payload);
    }
    if (!payload || typeof payload !== 'object') {
        return [];
    }
    const candidateLists = [
        payload.data,
        payload.list,
        payload.rows,
        payload.result,
        payload.items,
        payload.records
    ];
    const hitList = candidateLists.find(Array.isArray);
    if (hitList) {
        return normalizeSeatArray(hitList);
    }
    return [normalizeSeatItem(payload)];
}

function normalizeSeatArray(rawList) {
    const normalized = [];
    rawList.forEach((entry) => {
        if (typeof entry === 'string') {
            normalized.push(...normalizeSeatStringRecords(entry));
            return;
        }
        normalized.push(normalizeSeatItem(entry));
    });
    return normalized.filter(item => item && Object.keys(item).length > 0);
}

function normalizeSeatStringRecords(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        return [];
    }
    const sourceNameMatch = rawText.match(/'01-(?:SourceName|SourcName)'\s*:\s*'([^']*)'/);
    const longitudeMatch = rawText.match(/'02-Longitude'\s*:\s*'([^']*)'/);
    const latitudeMatch = rawText.match(/'03-Latitude'\s*:\s*'([^']*)'/);
    const sourceName = sourceNameMatch ? sourceNameMatch[1] : '';
    const longitude = longitudeMatch ? longitudeMatch[1] : '';
    const latitude = latitudeMatch ? latitudeMatch[1] : '';
    const recordParts = rawText.split(/\{'04-CentralityTime'\s*:\s*/).slice(1);

    if (recordParts.length === 0) {
        return [normalizeSeatItem(buildSeatItemFromStringPart(rawText, sourceName, longitude, latitude))];
    }

    return recordParts.map((part) => {
        const currentText = `{'04-CentralityTime': ${part}`;
        return normalizeSeatItem(buildSeatItemFromStringPart(currentText, sourceName, longitude, latitude));
    }).filter(item => item && Object.keys(item).length > 0);
}

function buildSeatItemFromStringPart(rawText, sourceName, longitude, latitude) {
    const centralityTimeMatch = rawText.match(/'04-CentralityTime'\s*:\s*'([^']*)'/);
    const rollPositionMatch = rawText.match(/'06-RollPosition'\s*:\s*([^,}\]]+)/);
    const directiveUploadMatch = rawText.match(/'07-DirectiveUpload'\s*:\s*('([^']*)'|None|null|[^,}\]]+)/i);
    const imagingModeMatch = rawText.match(/'05-ImagingMode'\s*:\s*\[([^\]]*)\]/);
    const imagingModeList = (imagingModeMatch ? imagingModeMatch[1] : '')
        .split(',')
        .map(item => item.trim().replace(/^'+|'+$/g, ''))
        .filter(Boolean);
    const directiveUploadValue = directiveUploadMatch
        ? String(directiveUploadMatch[2] || directiveUploadMatch[1] || '').trim().replace(/^'+|'+$/g, '')
        : '';
    return {
        '01-SourceName': sourceName,
        '02-Longitude': longitude,
        '03-Latitude': latitude,
        '04-CentralityTime': centralityTimeMatch ? centralityTimeMatch[1] : '',
        '05-ImagingMode': imagingModeList.length > 0 ? imagingModeList : '',
        '06-RollPosition': rollPositionMatch ? String(rollPositionMatch[1]).trim().replace(/^'+|'+$/g, '') : '',
        '07-DirectiveUpload': directiveUploadValue
    };
}

function normalizeSeatItem(rawItem) {
    if (!rawItem || typeof rawItem !== 'object') {
        return {};
    }
    const sourceName = pickFieldValue(rawItem, ['01-SourceName', '01-SourcName', 'SourceName', 'SourcName', 'sourceName', 'satelliteName', 'satName']);
    const longitude = pickFieldValue(rawItem, ['02-Longitude', 'Longitude', 'longitude', 'Lng', 'lng', 'Lon', 'lon']);
    const latitude = pickFieldValue(rawItem, ['03-Latitude', 'Latitude', 'latitude', 'Lat', 'lat']);
    const centralityTime = pickFieldValue(rawItem, ['04-CentralityTime', 'CentralityTime', 'centralityTime', 'CenterTime', 'centerTime', 'ImagingTime', 'imagingTime']);
    const imagingMode = pickFieldValue(rawItem, ['05-ImagingMode', 'ImagingMode', 'imagingMode', 'Mode', 'mode']);
    const rollPosition = pickFieldValue(rawItem, ['06-RollPosition', 'RollPosition', 'rollPosition', 'SideSwing', 'sideSwing']);
    const directiveUpload = pickFieldValue(rawItem, ['07-DirectiveUpload', 'DirectiveUpload', 'directiveUpload', 'UploadTime', 'uploadTime', 'EarliestUploadTime', 'earliestUploadTime']);

    return {
        ...rawItem,
        '01-SourceName': sourceName,
        '02-Longitude': longitude,
        '03-Latitude': latitude,
        '04-CentralityTime': centralityTime,
        '05-ImagingMode': imagingMode,
        '06-RollPosition': rollPosition,
        '07-DirectiveUpload': directiveUpload
    };
}

function pickFieldValue(source, aliases) {
    for (const key of aliases) {
        if (source[key] !== undefined && source[key] !== null && String(source[key]).trim() !== '') {
            return source[key];
        }
    }
    return '';
}

function cacheSeatList(lng, lat, seatList) {
    try {
        const cachePayload = {
            lng: String(lng),
            lat: String(lat),
            updatedAt: Date.now(),
            seatList
        };
        localStorage.setItem('seatPredictionCache', JSON.stringify(cachePayload));
    } catch (e) {
        return;
    }
}

function readSeatCache(lng, lat) {
    try {
        const raw = localStorage.getItem('seatPredictionCache');
        if (!raw) {
            return [];
        }
        const cachePayload = JSON.parse(raw);
        if (!cachePayload || !Array.isArray(cachePayload.seatList)) {
            return [];
        }
        const samePosition = String(cachePayload.lng) === String(lng) && String(cachePayload.lat) === String(lat);
        if (!samePosition) {
            return [];
        }
        return cachePayload.seatList;
    } catch (e) {
        return [];
    }
}
