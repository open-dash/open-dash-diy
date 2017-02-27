$(document).ready(function() {
    //alert("test");
    $.ajax({
        type: 'GET',
        url: '/api/weather',
        success: function(data) {
            //console.log(weather);
            $('#weather1').html(data.weather);
            $('#weather2').html(data.temperature_string);
            $('#weather3').html(data.display_location.full);
        }
    });
});