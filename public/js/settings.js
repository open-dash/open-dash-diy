$(function() {
    $("#saveBtn").on('click', function(e) {
        var settings = '{ "token" : "' + $('#token').val() + '", "apiUrl" : "' + $('#apiUrl').val() + '", "clientId" : "' + $('#clientId').val() + '", "clientSecret" : "' + $('#clientSecret').val() + '", "port" : "' + $('#port').val() + '" }';
        $.ajax({
            type: 'POST',
            url: '/api/settings/save',
            dataType: 'json',
            data: settings,
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
    if ($('#port').val() == "") {
        $('#port').val("3000");
    }
});