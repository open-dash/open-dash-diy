var devices = [];
$(function() {
    $("#addBlankTile").on('click', function(e) {
        var id = this.dataset.id;
        var emptyDevice = {};
        emptyDevice.type = "blank";
        $.ajax({
            type: 'POST',
            url: '/api/dashboard/' + id + '/add',
            dataType: 'json',
            data: JSON.stringify(emptyDevice),
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#results').text("Successfully Saved");
                location.reload();
            }
        });
    });

    $("#saveDashboard").on('click', function(e) {
        var id = this.dataset.id;
        var css = $('#css').val();
        //alert($('#dashName').val());
        $.ajax({
            type: 'POST',
            url: '/api/dashboard/' + id + '/save',
            dataType: 'json',
            data: '{ "name": ' + JSON.stringify($('#dashName').val()) + ', "css" : ' + css + ' }',
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#saveResults').html("Successfully Saved");
            }
        });
    });

    $("#addDashboardDevices").on('click', function(e) {
        var id = this.dataset.id;
        var dashboardDevices = [];
        $.each($('.deviceCheckbox'), function(key, value) {
            if (this.checked) {
                dashboardDevices.push(this.id.replace("cb_", ""));
            }
        });
        //alert(dashboardDevices);
        $.ajax({
            type: 'POST',
            url: '/api/dashboard/' + id + '/add',
            dataType: 'json',
            data: JSON.stringify(dashboardDevices),
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#results').text("Successfully Saved");
                location.reload();
            }
        });
    });

    $("#addCamera").on('click', function(e) {
        var id = this.dataset.id; //need to get dashboard id
        var camera = $('#cameras').val(); //should be 1
        //alert(camera);
        if (camera != "na") {
            $.ajax({
                type: 'POST',
                url: '/api/dashboard/' + id + '/addcamera',
                dataType: 'json',
                data: '{ "id": ' + JSON.stringify(camera) + ' }',
                contentType: 'application/json',
                complete: function(data) {
                    // do something
                    $('#results').text("Successfully Added");
                    location.reload();
                }
            });
        } else {
            alert("Select a Camera First!");
        }
    });

    $("#removeDashboardDevices").on('click', function(e) {
        var id = this.dataset.id; //need to get dashboard id
        var dashboardDevices = []; //need to get selected ids of devices to add.
        $.each($('.dashboardCheckbox'), function(key, value) {
            if (this.checked) {
                dashboardDevices.push(this.id.replace("cb_", ""));
            }
        });
        //alert(dashboardDevices);
        $.ajax({
            type: 'POST',
            url: '/api/dashboard/' + id + '/remove',
            dataType: 'json',
            data: JSON.stringify(dashboardDevices),
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#results').text("Successfully Saved");
                location.reload();
            }
        });
    });
});

$(document).ready(function() {
    var cssId = $('#cssId').val();
    $('#css').val(cssId);
});

function toggle(source) {
    checkboxes = document.getElementsByName('deviceCB');
    checkboxes.forEach((cb) => { cb.checked = source.checked });
}

function toggleDashboard(source) {
    checkboxes = document.getElementsByName('dashboardCB');
    checkboxes.forEach((cb) => { cb.checked = source.checked });
}

$(document).ready(function() {
    $.each($('.checkbox'), function(key, value) {
        devices.push(this.id.replace("cb_", ""));
    });
});