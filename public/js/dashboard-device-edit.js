$(document).ready(function() {
    var x = $('#templateValue').text().replace("template: ", "").toLowerCase();
    //console.log(x);
    $('#template').val(x);
    if ($('#enabledValue').text() == "true") {
        $('#enabled').prop('checked', true);
    }

    $('#saveDashDevice').on("click", function() {
        var data = {};
        data.id = this.dataset.id;
        data.dashid = this.dataset.dashid;
        data.name = $('#name').val();
        data.enabled = $('#enabled').prop("checked");
        data.order = $('#order').val();
        data.template = $('#template').val();
        //console.log(data);

        $.ajax({
            type: 'POST',
            url: '/api/dashboard/' + data.dashid + '/device/' + data.id + '/save',
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#results').text("Successfully Saved");
                location.reload();
            }
        });
    });
});