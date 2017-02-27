var devices;

$(function() {
    $("#getDevices").on('click', function(e) {
        $('#loading').show();
        $('#deviceTable').empty();
        $.ajax({
            type: 'GET',
            url: '/api/devices',
            success: function(data) {
                $('#loading').hide();
                $('#saveDevices').show();
                devices = data;
                var table = "<table class='table table-bordered table-condensed'><th>Id</th><th>Display Name</th><th>Type</th> <th>Commands</th><th>Last Updated</th>";
                $.each(data, function(i, item) {
                    table += "<tr><td>" + data[i].id + "</td><td>" + data[i].name + "</td><td>" + data[i].type + "</td><td>" + JSON.stringify(data[i].commands) + "</td><td>" + data[i].date + "</td></tr>";
                });
                table += "</table>";
                $('#devicelist').append(table);
            }
        });
    });

    $("#saveDevices").on('click', function(e) {
        $.ajax({
            type: 'POST',
            url: '/api/devices/save',
            dataType: 'json',
            data: JSON.stringify(devices),
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#results').text("Successfully Saved");
                location.reload();
            }
        });
    });
});