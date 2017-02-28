$(document).ready(function() {
    //alert(value.id);

    var dashboard = $('#dashboard');
    var devices = [];
    $.getJSON('/api/dashboard/' + dashboard[0].dataset.id + '/devices', function(data, status) {
        devices = data.sort(function(a, b) {
            var sortStatus = 0;
            if (parseInt(a.order) < parseInt(b.order)) {
                sortStatus = -1;
            } else if (parseInt(a.order) > parseInt(b.order)) {
                sortStatus = 1;
            }

            return sortStatus;
        });
        dashboard.html("");
        $('#dashboard').css('background-image', 'url(https://lh4.googleusercontent.com/-N0Ic1VbN2UE/Ui_eJHugZ2I/AAAAAAAAFzg/P9N-QNQisVI/s1280-w1280-c-h720/farm_in_the_prairie.jpg)');
        devices.forEach(dev => {
            $.get('/device/' + dashboard[0].dataset.id + '/' + dev.id, function(data, status) {
                if (status == "success") {
                    $(dashboard).append(data);
                    showTiles();
                }
            });
        });
    });
});


$(document.body).on('click', '.tile', function(e) {
    var id = this.id;
    console.log(id)
    console.log("target is: " + e.target.className);
    var action = $(this).find('.' + e.target.className);
    var actioncmd = action[0].dataset.action;
    var actiontoggle = action[0].dataset.command;
    var actionval = action.val();

    switch (actioncmd) {
        case "switch": //switch is clicked
            var currentVal = $(action).prop("checked");
            var cmd = "toggle";
            if (currentVal == "off") {
                cmd = "on";
            }
            if (currentVal == "on") {
                cmd = "off";
            }
            console.log("cmd to send : " + cmd);
            $.getJSON('/api/devices/' + id + "/" + cmd, function(data, status) {});
            break;
        case "setLevel": //setLevel cmd is changed
            console.log("setLevel to : " + actionval);
            $.getJSON('/api/devices/' + id + "/" + actioncmd + "/" + actionval, function(data, status) {});
            break;
            //TODO: Insert other commands here, remember to set data-action="cmd name" in the object that holds the value and triggers the command.
        default:
            console.log("no matching data-action found, is it set in the template?");
            break;
    }
});

var showTiles = function() {
    var tiles = $(".tile, .tile-small, .tile-sqaure, .tile-wide, .tile-large, .tile-big, .tile-super");

    $.each(tiles, function() {
        var tile = $(this);
        setTimeout(function() {
            tile.css({
                opacity: .85,
                "-webkit-transform": "scale(1)",
                "transform": "scale(1)",
                "-webkit-transition": ".3s",
                "transition": ".3s"
            });
        }, Math.floor(Math.random() * 500));
    });
};