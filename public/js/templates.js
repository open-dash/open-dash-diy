$(function() {
    $("#save").on('click', function(e) {
        var id = $("#id").val();
        var name = $("#name").val();
        var content = $('#templateEditor').val();
        if (name == "") {
            alert('Please Enter A Name');
        } else {
            $.ajax({
                type: 'POST',
                url: '/api/templates/' + id + '/save',
                dataType: 'json',
                data: JSON.stringify({ "content": content, "name": name }),
                contentType: 'application/json',
                complete: function(data) {
                    // do something
                    $('#results').text("Successfully Saved");
                    setInterval(function() { location.reload() }, 1000);
                }
            });
        }
    });

    $("#new").on('click', function(e) {
        //get count of templates + 1
        var id = $("#tempMenu").find("li").length;
        $("#id").val(id);
        var name = $("#name").val("");
        var content = $('#templateEditor').val("");
    });

    $("#delete").on('click', function(e) {
        var id = $("#id").val();
        $.ajax({
            type: 'DELETE',
            url: '/api/templates/' + id,
            dataType: 'json',
            data: JSON.stringify({ "id": id }),
            contentType: 'application/json',
            complete: function(data) {
                // do something
                $('#results').text("Successfully Deleted");
                setInterval(function() { location.reload() }, 5000);
            }
        });
    });

    $(".leaf").on('click', function(e) {
        var id = this.id.replace("temp_", "");
        var name = this.textContent;
        $.ajax({
            type: 'GET',
            url: '/api/templates/' + id + '',
            //dataType: 'json',
            //data: JSON.stringify(emptyDevice),
            //contentType: 'application/json',
            complete: function(data) {
                $('#templateEditor').text(data.responseText);
                $('#name').val(name);
                $('#id').val(id);
            }
        });
    });

});

$(document).ready(function() {
    var id = $("#tempMenu").find("li").length;
    $("#id").val(id);

});