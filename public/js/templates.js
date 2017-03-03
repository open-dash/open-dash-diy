 var editor = CodeMirror.fromTextArea(document.getElementById("templateEditor"), { lineNumbers: true, lineWrapping: true });
 editor.setSize(800, 500);
 if (JSON && JSON.stringify && JSON.parse) var Session = Session || (function() {

     // window object
     var win = window.top || window;

     // session store
     var store = (win.name ? JSON.parse(win.name) : {});

     // save store on page unload
     function Save() {
         win.name = JSON.stringify(store);
     };

     // page unload event
     if (window.addEventListener) window.addEventListener("unload", Save, false);
     else if (window.attachEvent) window.attachEvent("onunload", Save);
     else window.onunload = Save;

     // public methods
     return {

         // set a session variable
         set: function(name, value) {
             store[name] = value;
         },

         // get a session value
         get: function(name) {
             return (store[name] ? store[name] : undefined);
         },

         // clear session
         clear: function() { store = {}; },

         // dump session data
         dump: function() { return JSON.stringify(store); }

     };

 })();

 $(function() {
     $("#save").on('click', function(e) {
         var id = $("#id").val();
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
                     $('#results').text("Successfully Saved");
                     //setInterval(function() { location.reload() }, 1000);
                     Session.set("result", "Successfully Saved");
                     Session.set("tempId", id);
                     //setInterval(function () {
                     location.reload();
                     //}, 2000);
                 }
             });
         }
     });

     $("#new").on('click', function(e) {
         //get count of templates + 1
         var id = $("#tempMenu").find("li").length;
         $("#id").val(id);
         var name = $("#name").val("");
         //var content = editor.getDoc().getValue();
         editor.getDoc().setValue("");
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
                 var results = "Successfully Deleted";
                 Session.set(result, "Successfully Deleted");
                 //setInterval(function () {
                 location.reload()
                     //}, 2000);
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
                 //$('#templateEditor').val(data.responseText);
                 editor.getDoc().setValue(data.responseText);
                 $('#name').val(name);
                 $('#id').val(id);
             }
         });
     });

 });

 $(document).ready(function() {
     var id = $("#tempMenu").find("li").length;
     $("#id").val(id);
     if (Session.get("result") != "") {
         $('#results').text(Session.get("result"));
         Session.set("result", "");
     }
     if (Session.get("tempId") && Session.get("tempId") != "") {
         $.ajax({
             type: 'GET',
             url: '/api/templates/' + Session.get("tempId") + '',
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
     }
 });