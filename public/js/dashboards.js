$(function() {
    $("#addDash").on('click', function(e) {
        var name = $('#newDashName').val();
        var dashName = '{ "name": "' + name + '" }';
        $.ajax({
            type: 'POST',
            url: '/api/dashboard/add',
            dataType: 'json',
            data: dashName,
            contentType: 'application/json',
            error: function(err) {
                //alert(err);
            },
            complete: function(data) {
                // do something
                $('#results').text("Successfully Saved");
                location.reload();
            }
        });
    });

});


$(document).ready(function() {
    //alert("test");

});