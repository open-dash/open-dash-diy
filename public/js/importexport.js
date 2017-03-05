$(document).ready(function() {

});



$("#btnImport").on('click', function(e) {

});

$("#btnExport").on('click', function(e) {
    //get selected styles
    var styleids = [];
    $.each($('.styles'), function(key, value) {
        if (this.checked) {
            styleids.push(this.id.replace("cb_", ""));
        }
    });
    //get selected templates
    var tempids = [];
    $.each($('.templates'), function(key, value) {
        if (this.checked) {
            tempids.push(this.id.replace("cb_", ""));
        }
    });
    var exported = {};

    exported.styles = styleids;
    exported.templates = tempids;

    $.ajax({
        type: 'POST',
        url: '/api/importexport/export',
        dataType: 'json',
        data: JSON.stringify(exported),
        contentType: 'application/json',
        complete: function(data) {
            // do something
            $('#results').text("Successfully Saved");
            //location.reload();
            var blob = new Blob([data.responseText], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "Open-Dash-Export.json");
        }
    });

});



function toggle(source) {
    checkboxes = document.getElementsByName('styleCB');
    checkboxes.forEach((cb) => { cb.checked = source.checked });
}

function toggleTemplates(source) {
    checkboxes = document.getElementsByName('templateCB');
    checkboxes.forEach((cb) => { cb.checked = source.checked });
}