 var editor = CodeMirror.fromTextArea(document.getElementById("styleEditor"), { lineNumbers: true, lineWrapping: true });
 editor.setSize(800, 500);
 $(function() {
     $("#save").on('click', function(e) {
         var id = $("#id").val();
         var name = $("#name").val();
         //var content = $('#styleEditor').val();
         var content = editor.getDoc().getValue();
         if (name == "") {
             alert('Please Enter A Name');
         } else {
             $.ajax({
                 type: 'POST',
                 url: '/api/styles/' + id + '/save',
                 dataType: 'json',
                 data: JSON.stringify({ "content": content, "name": name }),
                 contentType: 'application/json',
                 complete: function(data) {
                     // do something
                     $('#results').text("Successfully Saved");
                     setInterval(function() { location.reload() }, 2000);
                 }
             });
         }
     });

     $("#new").on('click', function(e) {
         //get count of templates + 1
         var id = $("#tempMenu").find("li").length;
         $("#id").val(id);
         var name = $("#name").val("");
         var content = $('#styleEditor').val("");
     });

     $("#delete").on('click', function(e) {
         var id = $("#id").val();
         $.ajax({
             type: 'DELETE',
             url: '/api/styles/' + id,
             dataType: 'json',
             data: JSON.stringify({ "id": id }),
             contentType: 'application/json',
             complete: function(data) {
                 // do something
                 $('#results').text("Successfully Deleted");
                 setInterval(function() { location.reload() }, 2000);
             }
         });
     });

     $(".leaf").on('click', function(e) {
         var id = this.id.replace("temp_", "");
         var name = this.textContent;
         $.ajax({
             type: 'GET',
             url: '/api/styles/' + id + '',
             //dataType: 'json',
             //data: JSON.stringify(emptyDevice),
             //contentType: 'application/json',
             complete: function(data) {
                 //$('#styleEditor').val(data.responseText);
                 editor.getDoc().setValue(data.responseText);
                 $('#name').val(name);
                 $('#id').val(id);
                 if (id == "0") {
                     $('#name').prop('disabled', true);
                 } else {
                     $('#name').prop('disabled', false);
                 }
             }
         });
     });

 });

 $(document).ready(function() {
     var id = $("#tempMenu").find("li").length;
     $("#id").val(id);

 });