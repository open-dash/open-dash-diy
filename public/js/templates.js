 var editor = CodeMirror.fromTextArea(document.getElementById("templateEditor"), { lineNumbers: true, lineWrapping: true });
 editor.setSize(800, 500);
 $(function() {
     $("#save").on('click', function(e) {
         e.preventDefault();
         var id = $("#id").val();
         if (id == "") {
             id = $('#tempMenu').find('li').length;
         }
         var name = $("#name").val();
         var content = editor.getDoc().getValue();
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
                     $('#results').text("Successfully Saved, refresh page to see changes");
                     //setInterval(function() { location.reload() }, 1000);
                     //Session.set("result", "Successfully Saved, refresh page to see changes");
                     //Session.set("tempId", id);
                     //setInterval(function () {
                     //location.reload();
                     //}, 2000);
                     window.location = "/templates/" + id;
                 }
             });
         }
     });

     $("#name").on('click', function(e) {
         e.preventDefault();
     });

     $("#new").on('click', function(e) {
         //e.preventDefault();
         //get count of templates + 1
         var id = $("#tempMenu").find("li").length;
         $("#id").val(id);
         var name = $("#name").val("");
         //var content = editor.getDoc().getValue();
         editor.getDoc().setValue("");
         var content = $('#templateEditor').val("");
         window.location = "/templates";
     });

     $("#delete").on('click', function(e) {
         e.preventDefault();
         var id = $("#id").val();
         if (id != "") {
             $.ajax({
                 type: 'DELETE',
                 url: '/api/templates/' + id,
                 dataType: 'json',
                 data: JSON.stringify({ "id": id }),
                 contentType: 'application/json',
                 complete: function(data) {
                     // do something
                     $('#results').text("Successfully Deleted, reload page to see changes");
                     //var results = "Successfully Deleted";
                     //Session.set(result, "Successfully Deleted");
                     //setInterval(function () {
                     //location.reload()
                     //}, 2000);
                     window.location = "/templates";
                 }
             });
         } else { alert("Can't delete an empty template"); }
     });

     /*$(".leaf").on('click', function(e) {
         var id = this.id.replace("temp_", "");
         var name = this.textContent;
         $.ajax({
             type: 'GET',
             url: '/api/templates/' + id + '',
             //dataType: 'json',
             //data: JSON.stringify(emptyDevice),
             //contentType: 'application/json',
             complete: function(data) {
                 //$('#templateEditor').val(data.responseText);
                 editor.getDoc().setValue(data.responseText);
                 $('#name').val(name);
                 $('#id').val(id);
             }
         });
     });*/

 });

 $(document).ready(function() {
     var id = $('#id').val();
     if (id != "") {
         $.getJSON('/api/templates/' + id + '', function(data) {
             //$('#templateEditor').val(data.responseText);
             editor.getDoc().setValue(data.css);
             $('#name').val(data.name);
             //$('#id').val(id);

         });
     }
 });