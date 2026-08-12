$(document).ready(function() {
    //alert("test");
    getWeather();
});

setInterval(function() {
    getWeather();
}, 5200);

var getWeather = function() {
    $.ajax({
        type: 'GET',
        url: '/api/weather',
        success: function(data) {
            //console.log(weather);
            $('#weather1').html(data.weather);
            $('#weather2').html(data.temperature_string);
            $('#weather3').html(data.display_location.full);
        },
        error: function(jqXHR, data, error) {
            $('#weather1').html(data);
            $('#weather2').html(error);
            $.Notify({
                caption: 'Potential Problem Communicating with SmartThings',
                content: 'There was an error "' + error + '"',
                type: 'alert',
                keepOpen: true
            });
        }
    });
};