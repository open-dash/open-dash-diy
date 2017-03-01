var tiles = [];
var devices = [];

$(document).ready(function() {
    //alert(value.id);

    var dashboard = $('#dashboard');
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
        var i = 1;
        devices.forEach(dev => {
            $.get('/device/' + dashboard[0].dataset.id + '/' + dev.id, function(data, status) {
                if (status == "success") {
                    tiles.push({ "order": dev.order, "html": data });
                    finallyShowTiles(i);
                    i++;
                }
            });
        });
    });

    //Add Right Menu options specific to dashboard view
    var dashMenu = $('<br/>Dashboard Options<br/><button class="button " style="width:100px;"><a href="#" onClick="showEdit();">Show Edit</a></button><br/><button class="button " style="width:100px;"><a href="#" onClick="hideEdit();">Hide Edit</a></button><br/>');
    $('#wrapper').find('.charm').append(dashMenu);

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
            if (currentVal) {
                cmd = "on";
            }
            if (!currentVal) {
                cmd = "off";
            }
            console.log("cmd to send : " + cmd);
            $.getJSON('/api/smartthings/devices/' + id + "/" + cmd, function(data, status) {
                var x = status;
            });
            break;
        case "setLevel": //setLevel cmd is changed
            console.log("setLevel to : " + actionval);
            $.getJSON('/api/smartthings/devices/' + id + "/" + actioncmd + "/" + actionval, function(data, status) {
                var x = status;
            });
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

function sortByOrder(x, y) {
    return ((x.order == y.order) ? 0 : ((x.order > y.order) ? 1 : -1));
}

var finallyShowTiles = function(index) {
    if (index >= devices.length) {
        var sortedTiles = tiles.sort(sortByOrder);
        sortedTiles.forEach(tile => {
            $(dashboard).append(tile.html);
        });
        showTiles();
    }
}

function showEdit() {
    //alert('do something');
    var dashboard = $('#dashboard');
    var tiles = $('#dashboard').find('.tile');
    for (var tile in tiles) {
        if (tile < tiles.length) {
            var badge = $('<span class="tile-badge bg-darkGreen fg-white"><a href="/dashboards/' + dashboard[0].dataset.id + '/device/' + tiles[tile].id + '">Edit</a>')
            $(tiles[tile]).append(badge);
        }
    };
}

function hideEdit() {
    //alert('do something');
    var dashboard = $('#dashboard');
    var tiles = $('#dashboard').find('.tile-badge').hide();
}