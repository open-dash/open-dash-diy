var devices;
var routines;
var locations;
var modes;

$(function() {
    $("#getDevices").on('click', function(e) {
        $('#loading').show();
        $('#deviceTable').empty();
        $.ajax({
            type: 'GET',
            url: '/api/smartthings/devices',
            success: function(data) {
                $('#loading').hide();
                $('#saveDevices').show();
                devices = data;
                var table = "<table class='table table-bordered table-condensed'><tr><th>Id</th><th>Display Name</th><th>Type</th> <th>Commands</th><th>Last Updated</th></tr>";
                $.each(data, function(i, item) {
                    table += "<tr><td>" + data[i].id + "</td><td>" + data[i].name + "</td><td>" + data[i].type + "</td><td>" + JSON.stringify(data[i].commands) + "</td><td>" + data[i].date + "</td></tr>";
                });
                table += "</table>";
                $('#devicelist').append(table);
            }
        });
    });

    $("#getRoutines").on('click', function(e) {
        $('#loadingRoutines').show();
        $('#routineTable').empty();
        $.ajax({
            type: 'GET',
            url: '/api/smartthings/routines',
            success: function(data) {
                $('#loadingRoutines').hide();
                $('#saveRoutines').show();
                routines = data;
                var table = "<table class='table table-bordered table-condensed'><tr><th>Label / Name</th><th>Id</th></tr>";
                $.each(data, function(i, item) {
                    table += "<tr><td>" + data[i].label + "</td><td>" + data[i].id + "</td></tr>";
                });
                table += "</table>";
                $('#routineTable').append(table);
            }
        });
    });

    $("#getLocations").on('click', function(e) {
        $('#loadingLocations').show();
        $('#locationsArea').empty();
        $.ajax({
            type: 'GET',
            url: '/api/smartthings/locations',
            success: function(data) {
                $('#loadingLocations').hide();
                $('#saveLocations').show();
                locations = data;
                var result = "";
                for (var i in data) {
                    result += "<div>" + i + ": ";
                    if (i == "currentMode") {
                        for (var x in data[i]) {
                            result += "<div>" + x + ": " + data[i][x] + "</div>";
                        }
                    } else if (i == "hubs") {
                        data[i].forEach(hub => {
                            result += "<div>" + hub.id + "</div><div>" + hub.name + "</div>";
                        });
                    } else {
                        result += data[i] + "</div>";
                    }
                }
                $('#locationsArea').append(result);
            }
        });
    });

    $("#getModes").on('click', function(e) {
        $('#loadingModes').show();
        $('#modesTable').empty();
        $.ajax({
            type: 'GET',
            url: '/api/smartthings/modes',
            success: function(data) {
                $('#loadingModes').hide();
                $('#saveModes').show();
                modes = data;
                result = "";
                data.forEach(mode => {
                    result += "<div>" + mode.id + " : " + mode.name + "</div>";
                })
                $('#modesArea').append(result);
            }
        });
    });



    $("#saveDevices").on('click', function(e) {
        $.ajax({
            type: 'POST',
            url: '/api/smartthings/devices/save',
            dataType: 'json',
            data: JSON.stringify(devices),
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#results').text("Successfully Saved");
                //location.reload();
            }
        });
    });

    $("#saveRoutines").on('click', function(e) {
        $.ajax({
            type: 'POST',
            url: '/api/smartthings/routines/save',
            dataType: 'json',
            data: JSON.stringify(routines),
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#results_routines').text("Successfully Saved");
                //location.reload();
            }
        });
    });

    $("#saveLocations").on('click', function(e) {
        $.ajax({
            type: 'POST',
            url: '/api/smartthings/locations/save',
            dataType: 'json',
            data: JSON.stringify(locations),
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#results_locations').text("Successfully Saved");
                //location.reload();
            }
        });
    });

    $("#saveModes").on('click', function(e) {
        $.ajax({
            type: 'POST',
            url: '/api/smartthings/modes/save',
            dataType: 'json',
            data: JSON.stringify(modes),
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#results_modes').text("Successfully Saved");
                //location.reload();
            }
        });
    });
});