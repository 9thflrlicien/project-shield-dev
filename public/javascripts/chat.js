$(document).ready(function() {
  var socket = io.connect();
  var users = $('#users');
  var nicknameForm = $('#setNick');
  var nicknameError = $('#nickError');
  var nicknameInput = $('#nickname');
  var messageForm = $('#send-message');
  var messageInput = $('#message');
  var messageContent = $('#chat');
  var clients = $('#clients');
  var name_list = ['test'];
  var newUsers = $('#newUsers');
  var printAgent = $('#printAgent');
  var canvas = $("#canvas");




  
  $(document).on('click', '#signout-btn', logout); //登出

  if(window.location.pathname === '/chat'){
    setTimeout(agentName, 100);
  }// set agent name

//  $(document).on('click', '#showchat', showChat);//showChat

 /* function showChat(){
    setTimeout(loadMes, 1000);

  
*/
 /* socket.on('new client', function(data, callback){

    callback(true);
    socket.receiverId = data;
    clients.push(socket.receiverId);
    updateClientnames();
  });

socket.on('get clients', function(data){
  var html = '';
  for(let i = 0; i < data.length;i++){
    html += '<li class="list-group">'+data[i]+'</li><br/>';

  }
  clients.html(html);
});

  function updateClientnames(){
    io.sockets.emit('get clients', clients);
  }

  socket.on('disconncet', function(data){
    clients.splice(clients.indexOf(socket.receiverId),1)
    updateClientnames();
  });*/


//    let clients_length = clients.children().length;
//    for (let i=0; i<clients_length; i++){
        // clients.append('<li><b>' + data.name[i] + "</b></li>");
//      if(data.name != clients.children()[i]){

  

/*function loadMes(){

let userId = auth.Ic;
database.ref('chats/' + userId).on('value', snap => {
    let dataArray = [];
    let testVal = snap.val();
    let myIds = Object.keys(testVal);
    console.log(myIds.length);
    for (var i = 0; i < myIds.length; i++) {
        dataArray.push(snap.child(myIds[i]).val());
        $('#loadMsg').append(
            ' < tr >' +
            ' < td > ' +'Youre now connected to client: '+ receiverId + ' < /td>' +
            ' < td > ' + dataArray[i].msg + ' < /td>' +
            ' < /tr>'
        );
    }
});

}
*/
/*  =========================================================  */ 

    function agentName() {
    var person = prompt("Please enter your name");
    if (person != null) {
        printAgent.append("Welcome <b>" + person + "</b>! You're now on board.");
    }//'name already taken'功能未做
}
  

  messageForm.submit((e) => {
    e.preventDefault();
    socket.emit('send message', messageInput.val(), (data) => {
      messageContent.append('<span class="error">' + data + "</span><br/>");
    });
    messageInput.val('');
  });

  socket.on('usernames', (data) => {
    var html = '';
    for(i=0; i < data.length; i++){
      html += data[i] + '<br />';
    }
    users.html(html);
  });

  socket.on('new message', (data) => {
    displayMessage(data);
    displayClient(data)
    // messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  });

  socket.on('whisper', (data) => {
    messageContent.append('<span class="whisper"><b>' + data.name + ': </b>' + data.msg + "</span><br/>");
  });

  socket.on('load old messages', docs => {
    for(i=0; i < data.length; i++){
      displayMessage(docs[i]);
    }
  });

 

  function displayMessage(data){
      var i = data.name;
      var namefound = (name_list.indexOf(i) > -1);
 /*     var n, dataName ;
      dataName = document.getElementsById(data.name);
      for (n = 0; n < dataName.length; n++) { */
          
      //  messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");

        if (namefound){
          //append new msg in existed window
 
           console.log('found');   

        }else {
            canvas.append("<div id=\""+ data.name +"\" class=\"tabcontent\"><span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x</span><div id=\"chat\""+
            "<strong>" + data.name + ": </strong>" + data.msg + "<br/></div>"+
            "<form action=\"\" id=\"send-message\"><input size=\"35\" id=\"message\" /><input type=\"submit\"/></form></div>");
        
          
        }
      
      
        }



  function displayClient(data){
      var i = data.name;
      var namefound = (name_list.indexOf(i) > -1);
      var ct = document.getElementById("chat");

        if (namefound){
 
           console.log('found');

        }else if (namefound == name_list.indexOf(1)){
           clients.append("<b><button onclick=\"ct.style.display=\'block\'\" class=\"tablinks\">"+data.name+"</button>");
           name_list.push(data.name);   
           console.log(name_list);        

        }else {
           clients.append("<b><button onclick=\"ct.style.display=\'block\'\" class=\"tablinks\"> "+data.name+"</button></b>");
           name_list.push(data.name);   
           console.log(name_list); 



          
        }
      
  }

 function openCity(evt, cityName) {
    var a, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (a = 0; a < tabcontent.length; a++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (a = 0; a < tablinks.length; a++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";


// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();
}

function displayMsg(evt, cityName) {
    var x = document.getElementById(data.name);
    if (x.style.display === 'none') {
        x.style.display = 'block';
    } else {
        x.style.display = 'none';
    }
}


 });//document ready close tag














