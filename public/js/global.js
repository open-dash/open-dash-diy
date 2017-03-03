$(document).ready(function() {
    $('#right-charm .button').on('click', function(e) {
        //alert('button clicked');
        var url = "";
        if ($(this).attr('href')) {
            url = $(this).attr('href');
        } else {
            url = $(this).find('a').attr('href');
        }
        e.preventDefault();
        window.location = url
    });

});