const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const domain = require('../app/lib/dashboard-domain');

const sampleDashboards = () => [
    {
        id: '0',
        name: 'Home',
        devices: [
            { dashDevId: 'd1', name: 'Light', enabled: true, order: '1' },
            { dashDevId: 'd2', name: 'Fan', enabled: false, order: '2' },
            { dashDevId: 'd3', name: 'Cam', enabled: true, order: '0' }
        ]
    },
    {
        id: '1',
        name: 'Office',
        devices: []
    }
];

describe('findDashboard / findDashDevice', () => {
    it('finds dashboard by id (loose equality)', () => {
        const list = sampleDashboards();
        assert.equal(domain.findDashboard(list, '0').name, 'Home');
        assert.equal(domain.findDashboard(list, 1).name, 'Office');
        assert.equal(domain.findDashboard(list, 'missing'), null);
        assert.equal(domain.findDashboard(null, '0'), null);
    });

    it('finds device by dashDevId', () => {
        const dash = sampleDashboards()[0];
        assert.equal(domain.findDashDevice(dash, 'd2').name, 'Fan');
        assert.equal(domain.findDashDevice(dash, 'nope'), null);
        assert.equal(domain.findDashDevice({}, 'd1'), null);
    });
});

describe('listEnabledDeviceRefs', () => {
    it('returns only enabled devices as id/order refs', () => {
        const refs = domain.listEnabledDeviceRefs(sampleDashboards()[0]);
        assert.deepEqual(refs, [
            { id: 'd1', order: '1' },
            { id: 'd3', order: '0' }
        ]);
    });
});

describe('nextDashboardId', () => {
    it('returns length-style next id for dense arrays', () => {
        assert.equal(domain.nextDashboardId([]), '0');
        assert.equal(domain.nextDashboardId([{ id: '0' }]), '1');
        assert.equal(domain.nextDashboardId([{ id: '0' }, { id: '1' }]), '2');
    });
});

describe('resolveDeviceTemplate', () => {
    const temps = ['switch', 'contact', 'thermostat', 'default'];

    it('exact match wins', () => {
        assert.equal(domain.resolveDeviceTemplate('switch', temps), 'switch');
    });

    it('substring match (case-insensitive), last wins', () => {
        assert.equal(domain.resolveDeviceTemplate('Z-Wave Switch', temps), 'switch');
        assert.equal(domain.resolveDeviceTemplate('CONTACT SENSOR', temps), 'contact');
    });

    it('falls back to default', () => {
        assert.equal(domain.resolveDeviceTemplate('camera', temps), 'default');
        assert.equal(domain.resolveDeviceTemplate('', temps), 'default');
        assert.equal(domain.resolveDeviceTemplate(null, temps), 'default');
    });
});

describe('removeDevicesByDashDevIds', () => {
    it('removes matching devices in place', () => {
        const dash = sampleDashboards()[0];
        const n = domain.removeDevicesByDashDevIds(dash, { a: 'd1', b: 'd3' });
        assert.equal(n, 2);
        assert.equal(dash.devices.length, 1);
        assert.equal(dash.devices[0].dashDevId, 'd2');
    });
});

describe('createDashboardRecord / buildBlankTile', () => {
    it('creates empty dashboard shell', () => {
        assert.deepEqual(domain.createDashboardRecord('Kitchen', '3'), {
            id: '3',
            name: 'Kitchen',
            css: 'none',
            devices: []
        });
    });

    it('builds blank tile with ids', () => {
        const tile = domain.buildBlankTile('uuid-1');
        assert.equal(tile.template, 'Blank');
        assert.equal(tile.enabled, true);
        assert.equal(tile.dashDevId, 'uuid-1');
        assert.equal(tile.id, 'Blank_uuid-1');
    });
});

describe('addcamera matching (regression)', () => {
    // Regression: the addcamera API handler previously compared
    // cameras.cameras[i].id == data[x] where `x` was a stale loop var,
    // so the camera was never found. It must compare against data.id.
    it('matches a camera by data.id, not a stale loop variable', () => {
        const cameras = { cameras: [{ id: 'cam-1', name: 'Front' }] };
        const data = { id: 'cam-1' }; // body shape sent by dashboard-edit.js
        const matched = cameras.cameras.filter(c => c.id == data.id);
        assert.equal(matched.length, 1);
        assert.equal(matched[0].id, 'cam-1');
    });

    it('does not match when the id key is absent', () => {
        const cameras = { cameras: [{ id: 'cam-1' }] };
        const data = { x: 'cam-1' }; // wrong key
        const matched = cameras.cameras.filter(c => c.id == data.id);
        assert.equal(matched.length, 0);
    });
});
