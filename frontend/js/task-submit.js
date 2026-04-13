/* 任务提交模块 */

async function submitTask(seatData) {
    const lng = pickSeatFieldValue(seatData, ['02-Longitude', 'Longitude', 'longitude', 'Lng', 'lng']);
    const lat = pickSeatFieldValue(seatData, ['03-Latitude', 'Latitude', 'latitude', 'Lat', 'lat']);
    const centralityTime = pickSeatFieldValue(seatData, ['04-CentralityTime', 'CentralityTime', 'centralityTime', 'CenterTime', 'centerTime']);
    const selectedSourceName = pickSeatFieldValue(seatData, ['01-SourceName', '01-SourcName', 'SourceName', 'SourcName', 'sourceName', 'satelliteName', 'satName']);

    const imagingModeValue = pickSeatFieldValue(seatData, ['05-ImagingMode', 'ImagingMode', 'imagingMode', 'Mode', 'mode']);
    const modeCodeList = normalizeImagingModeCodeList(imagingModeValue);
    const imagingModeText = formatImagingModeText(imagingModeValue);

    showConfirmModal(seatData, lng, lat, centralityTime, imagingModeText, modeCodeList, selectedSourceName);
}

function showConfirmModal(seatData, lng, lat, centralityTime, imagingModeText, modeCodeList, selectedSourceName) {
    const confirmModalBody = document.getElementById('confirmModalBody');
    const modeSelectHtml = modeCodeList.length > 1
        ? `
            <div class="confirm-info-item">
                <span class="confirm-info-label">提交模式：</span>
                <span class="confirm-info-value">
                    <select id="imagingModeSelect" class="pay-time-select">
                        ${modeCodeList.map((modeCode) => `<option value="${modeCode}">${formatImagingModeText(modeCode)}</option>`).join('')}
                    </select>
                </span>
            </div>
        `
        : '';

    const html = `
        <div class="confirm-info-item">
            <span class="confirm-info-label">卫星名称：</span>
            <span class="confirm-info-value">${pickSeatFieldValue(seatData, ['01-SourceName', '01-SourcName', 'SourceName', 'SourcName', 'sourceName', 'satelliteName']) || '未知'}</span>
        </div>
        <div class="confirm-info-item">
            <span class="confirm-info-label">成像时间：</span>
            <span class="confirm-info-value highlight">${centralityTime}</span>
        </div>
        <div class="confirm-info-item">
            <span class="confirm-info-label">成像模式：</span>
            <span class="confirm-info-value">${imagingModeText}</span>
        </div>
        ${modeSelectHtml}
        <div class="confirm-info-item">
            <span class="confirm-info-label">目标位置：</span>
            <span class="confirm-info-value">${lng}, ${lat}</span>
        </div>
        <div class="confirm-info-item">
            <span class="confirm-info-label">最早上传时间：</span>
            <span class="confirm-info-value">${pickSeatFieldValue(seatData, ['07-DirectiveUpload', 'DirectiveUpload', 'directiveUpload', 'UploadTime', 'uploadTime']) || '未知'}</span>
        </div>
        <div class="confirm-info-item">
            <span class="confirm-info-label">交付时间：</span>
            <span class="confirm-info-value">
                <select id="payTimeSelect" class="pay-time-select">
                    <option value="1">8小时内交付</option>
                    <option value="2">24小时内交付</option>
                    <option value="3">48小时内交付</option>
                </select>
            </span>
        </div>
        <div class="confirm-warning">
            <p>⚠️ 提示：</p>
            <p>• 任务提交后将调用卫星资源</p>
            <p>• 请确认信息无误后再提交</p>
        </div>
    `;

    confirmModalBody.innerHTML = html;
    document.getElementById('confirmModal').style.display = 'block';

    document.getElementById('confirmSubmitBtn').onclick = function() {
        const payTime = document.getElementById('payTimeSelect').value;
        const imagingModeSelect = document.getElementById('imagingModeSelect');
        const submitMode = imagingModeSelect ? imagingModeSelect.value : (modeCodeList[0] || '');
        closeConfirmModal();
        doSubmitTask(lng, lat, centralityTime, submitMode, payTime, selectedSourceName);
    };
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

async function doSubmitTask(lng, lat, centralityTime, imagingMode, payTime, selectedSourceName) {
    try {
        const taskPlanningConfig = window.APP_CONFIG?.api?.taskPlanning || {};
        const apiBase = taskPlanningConfig.url || '/api/task-planning';
        const apiUrl = `${apiBase}?` +
            `Longitude=${lng}&` +
            `Latitude=${lat}&` +
            `CentralityTime=${encodeURIComponent(centralityTime)}&` +
            `ImagingMode=${encodeURIComponent(imagingMode)}&` +
            `PayTime=${encodeURIComponent(payTime)}`;
        const requestOptions = {
            method: taskPlanningConfig.method || 'GET',
            mode: 'cors'
        };
        const headers = taskPlanningConfig.headers || {};
        if (Object.keys(headers).length > 0) {
            requestOptions.headers = headers;
        }

        const requester = typeof authFetch === 'function' ? authFetch : fetch;
        const response = await requester(apiUrl, requestOptions);

        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const responseText = await response.text();
        const result = parseTaskPlanningResult(responseText);
        const taskSourceName = selectedSourceName || pickSeatFieldValue(result, ['01-SourceName', '01-SourcName', 'SourceName', 'SourcName', 'sourceName', 'satelliteName']) || '未知';

        if (Number(result['04-ConditionCode']) === 1) {
            alert(
                `✅ 任务提交成功！\n\n` +
                `卫星名称：${taskSourceName}\n` +
                `成像时间：${result['02-CentralityTime']}\n` +
                `成像模式：${formatBackendModeValue(result['03-ImagingMode'])}\n` +
                `任务状态：规划成功\n\n` +
                `请等待卫星拍摄，稍后可查看成像结果。`
            );
        } else {
            alert(
                `❌ 任务规划失败\n\n` +
                `可能原因：\n` +
                `1. 该时间段已被占用\n` +
                `2. 卫星资源不足\n` +
                `3. 天气条件不满足\n` +
                `4. 目标位置超出卫星覆盖范围\n\n` +
                `建议选择其他席位重试。`
            );
        }
    } catch (error) {
        alert(
            `任务提交失败：${error.message}\n\n` +
            `可能原因：\n` +
            `1. 网络连接问题\n` +
            `2. 接口服务未启动（${window.APP_CONFIG?.api?.taskPlanning?.url || '/api/task-planning'}）\n` +
            `3. 跨域限制（需要后端配置 CORS）\n\n` +
            `请检查网络连接或联系技术支持。`
        );
    }
}

function parseTaskPlanningResult(responseText) {
    const text = String(responseText || '').trim();
    if (!text) {
        throw new Error('接口返回为空');
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error(text);
    }
}

function normalizeImagingModeCodeList(mode) {
    if (mode === null || mode === undefined || mode === '') {
        return [];
    }
    const modeRawList = Array.isArray(mode)
        ? mode
        : String(mode).split(/[、,，]/).map(item => item.trim()).filter(Boolean);
    const modeMap = {
        '1': '1',
        '2': '2',
        '3': '3',
        '条带': '1',
        '条带模式': '1',
        '滑聚': '2',
        '滑聚模式': '2',
        '聚束': '3',
        '聚束模式': '3'
    };
    const normalizedList = modeRawList
        .map(item => {
            const value = String(item).trim();
            return modeMap[value] || value;
        })
        .filter(Boolean);
    return Array.from(new Set(normalizedList));
}

function formatImagingModeText(mode) {
    if (Array.isArray(mode)) {
        return mode.map(item => formatImagingModeText(item)).join('、');
    }
    if (mode === null || mode === undefined || mode === '') {
        return '未知';
    }
    const value = String(mode).trim();
    if (/[、,，]/.test(value)) {
        return value
            .split(/[、,，]/)
            .map(item => item.trim())
            .filter(Boolean)
            .map(item => formatImagingModeText(item))
            .join('、');
    }
    const modeTextMap = {
        '1': '条带模式',
        '2': '滑聚模式',
        '3': '聚束模式'
    };
    return modeTextMap[value] || value;
}

function formatBackendModeValue(mode) {
    if (mode === null || mode === undefined || mode === '') {
        return '未知';
    }
    if (Array.isArray(mode)) {
        return mode.map(item => String(item)).join('、');
    }
    if (typeof mode === 'object') {
        try {
            return JSON.stringify(mode);
        } catch (e) {
            return String(mode);
        }
    }
    return String(mode);
}

function pickSeatFieldValue(source, aliases) {
    for (const key of aliases) {
        if (source[key] !== undefined && source[key] !== null && String(source[key]).trim() !== '') {
            return source[key];
        }
    }
    return '';
}
