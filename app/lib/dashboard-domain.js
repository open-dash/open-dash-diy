/**
 * Pure dashboard domain helpers (no filesystem / Express).
 * Used by API routes and unit tests.
 */

function findDashboard(dashboards, dashId) {
    if (!Array.isArray(dashboards)) {
        return null;
    }
    for (var i = 0; i < dashboards.length; i++) {
        if (dashboards[i].id == dashId) {
            return dashboards[i];
        }
    }
    return null;
}

function findDashDevice(dashboard, deviceId) {
    if (!dashboard || !Array.isArray(dashboard.devices)) {
        return null;
    }
    for (var i = 0; i < dashboard.devices.length; i++) {
        if (dashboard.devices[i].dashDevId == deviceId) {
            return dashboard.devices[i];
        }
    }
    return null;
}

function listEnabledDeviceRefs(dashboard) {
    var devices = [];
    if (!dashboard || !Array.isArray(dashboard.devices)) {
        return devices;
    }
    for (var i = 0; i < dashboard.devices.length; i++) {
        if (dashboard.devices[i].enabled) {
            devices.push({
                id: dashboard.devices[i].dashDevId,
                order: dashboard.devices[i].order
            });
        }
    }
    return devices;
}

/**
 * Next dashboard id — preserves historical dense-index behavior
 * (for..in over array indices increments until past last index).
 */
function nextDashboardId(dashboards) {
    var id = 0;
    var list = dashboards || [];
    for (var dash in list) {
        if (parseInt(dash, 10) <= id) {
            id++;
        }
    }
    return id.toString();
}

/**
 * Map a SmartThings device type onto a known template id.
 * Exact match first, else last substring match (case-insensitive), else "default".
 */
function resolveDeviceTemplate(deviceType, templateIds) {
    var temps = templateIds || [];
    if (deviceType == null || deviceType === '') {
        return 'default';
    }
    if (temps.indexOf(deviceType) >= 0) {
        return deviceType;
    }
    var template = null;
    for (var f = 0; f < temps.length; f++) {
        if (String(deviceType).toLowerCase().includes(String(temps[f]).toLowerCase())) {
            template = temps[f];
        }
    }
    return template == null ? 'default' : template;
}

function removeDevicesByDashDevIds(dashboard, ids) {
    if (!dashboard || !Array.isArray(dashboard.devices) || !ids) {
        return 0;
    }
    var removed = 0;
    for (var deviceId of Object.values(ids)) {
        for (var i = 0; i < dashboard.devices.length; i++) {
            if (dashboard.devices[i].dashDevId == deviceId) {
                dashboard.devices.splice(i, 1);
                removed++;
                break;
            }
        }
    }
    return removed;
}

function createDashboardRecord(name, id) {
    return {
        id: id,
        name: name,
        css: 'none',
        devices: []
    };
}

function buildBlankTile(newId) {
    return {
        name: 'Blank Tile',
        type: 'Blank',
        id: 'Blank_' + newId,
        template: 'Blank',
        enabled: true,
        order: '1',
        dashDevId: newId
    };
}

module.exports = {
    findDashboard,
    findDashDevice,
    listEnabledDeviceRefs,
    nextDashboardId,
    resolveDeviceTemplate,
    removeDevicesByDashDevIds,
    createDashboardRecord,
    buildBlankTile
};
