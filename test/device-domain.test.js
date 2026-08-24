const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const domain = require('../app/lib/dashboard-domain');

// Regression: the /device/:dashId/:id handler in app/controllers/device.js
// previously initialized `dashboard` to {} (an empty object) and called
// `dashboard.devices.forEach(...)` without a guard. When the dashboard id
// was not found in `dashboards.dashboards`, `dashboard.devices` was
// undefined and `.forEach` threw
// `Cannot read properties of undefined (reading 'forEach')`, causing a 500
// instead of a 404 for the missing device.
//
// The fixed handler now resolves the dashboard via domain.findDashboard and
// the device via domain.findDashDevice, then returns a 404 when either is
// null. These tests verify that composition: the domain helpers must return
// null (not throw) for the same inputs that used to crash the handler.
function resolveTile(dashboards, dashId, id) {
    const dashboard = domain.findDashboard(dashboards.dashboards, dashId);
    if (!dashboard) return null;
    return domain.findDashDevice(dashboard, id);
}

describe('getTile (device controller) regression', () => {
    it('returns the device whose dashDevId matches', () => {
        const dashboards = {
            dashboards: [
                {
                    id: '0',
                    devices: [
                        { dashDevId: 'd1', name: 'Light' },
                        { dashDevId: 'd2', name: 'Fan' }
                    ]
                }
            ]
        };
        const device = resolveTile(dashboards, '0', 'd2');
        assert.equal(device.name, 'Fan');
    });

    it('returns null when the dashboard id is not found', () => {
        const dashboards = {
            dashboards: [
                { id: '0', devices: [{ dashDevId: 'd1' }] }
            ]
        };
        assert.equal(resolveTile(dashboards, '99', 'd1'), null);
    });

    it('returns null when the dashboard has no devices key', () => {
        const dashboards = {
            dashboards: [
                { id: '1' } // no devices array
            ]
        };
        assert.equal(resolveTile(dashboards, '1', 'd1'), null);
    });

    it('returns null when the device is not in the dashboard', () => {
        const dashboards = {
            dashboards: [
                {
                    id: '0',
                    devices: [{ dashDevId: 'd1' }]
                }
            ]
        };
        assert.equal(resolveTile(dashboards, '0', 'zzz'), null);
    });

    it('handles the empty-dashboards list without throwing', () => {
        const dashboards = { dashboards: [] };
        assert.equal(resolveTile(dashboards, '0', 'd1'), null);
    });
});
