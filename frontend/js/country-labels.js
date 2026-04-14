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
    const bounds = typeof map.getBounds === 'function' ? map.getBounds() : null;
    const usedGrid = new Set();
    const gridSize = currentZoom <= 4 ? 120 : currentZoom <= 5 ? 90 : currentZoom <= 6 ? 70 : 54;

    labelLayers.forEach(function(marker, index) {
        const country = countryLabels[index];
        if (!country) {
            return;
        }
        const labelZoom = Number(country.labelZoom || country.zoom || 6);
        if (currentZoom < labelZoom) {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
            return;
        }

        const latLng = marker.getLatLng ? marker.getLatLng() : null;
        if (bounds && latLng && typeof bounds.contains === 'function' && !bounds.contains(latLng)) {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
            return;
        }

        if (latLng && typeof map.latLngToContainerPoint === 'function') {
            const point = map.latLngToContainerPoint(latLng);
            if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                }
                return;
            }
            const gridKey = `${Math.round(point.x / gridSize)}:${Math.round(point.y / gridSize)}`;
            if (usedGrid.has(gridKey)) {
                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                }
                return;
            }
            usedGrid.add(gridKey);
        }

        if (!map.hasLayer(marker)) {
            marker.addTo(map);
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
