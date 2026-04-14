/* 国家标注显示逻辑 */

const countryLabels = Array.isArray(window.countryRegionPoints) ? window.countryRegionPoints : [];
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
