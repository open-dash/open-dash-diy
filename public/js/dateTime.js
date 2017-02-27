$(document).ready(function() {
    //alert("test");
    setInterval(function() {
        var thisDate = new Date();
        $('#dateTime').html(thisDate.toDateString() + "<br/>" + thisDate.toTimeString().replace(" (", "<br/>("));
    }, 1000);

});