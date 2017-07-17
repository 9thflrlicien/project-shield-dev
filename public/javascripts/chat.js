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
  var canvas1 = $("#canvas1");
  var canvas2 = $("#canvas2");
  var canvas3 = $("#canvas3");
  var user1 = $("#user1");
  var user2 = $("#user2");
  var user3 = $("#user3");
  var user4 = $("#user4");
  var user5 = $("#user5");
  var user_list = [];




  
  $(document).on('click', '#signout-btn', logout); //登出

  if(window.location.pathname === '/chat'){
    setTimeout(agentName, 100);
    setTimeout(loadMsg,100);
  }// set agent name


/*  =========================================================  */ 
function loadMsg(){
  $('#clients').empty();
  $('#canvas').empty();


  database.ref('chats/users').on('value', snap => {
    let dataArray = [];
    let testVal = snap.val();
    let myIds = Object.keys(testVal);



    for(var i=0;i < myIds.length;i++){
      dataArray.push(snap.child(myIds[i]).val());
      

//       var namefound = (user_list.indexOf(dataArray[i].user) > -1);//if client exists

//       if (namefound){

//        if (dataArray[i].user == 'U8322eb28b5b3c1f5b2d101620daa71ed'){
//           console.log('user1 found');
//           user1.append(
//           '<tr>' +
//             '<td>' + dataArray[i].message + '</td>' +
//             '<td>' + dataArray[i].messageTime + '</td>' +
//            '</tr>'
//            );}

//         else if (dataArray[i].user == 'U376b6ec748e32f594cf2f6248800d094'){

//          user2.append(
//           '<tr>' +
//             '<td>' + dataArray[i].message + '</td>' +
//             '<td>' + dataArray[i].messageTime + '</td>' +
//            '</tr>'
//         );}

//         else if (dataArray[i].user == 'Udeadbeefdeadbeefdeadbeefdeadbeef'){
//         user3.append(
//           '<tr>' +
//             '<td>' + dataArray[i].message + '</td>' +
//             '<td>' + dataArray[i].messageTime + '</td>' +
//            '</tr>'
//         );}
//         else if (dataArray[i].user == 'U3919284a3de4cd0c0b570090c3dc9943'){
//         user4.append(
//           '<tr>' +
//             '<td>' + dataArray[i].message + '</td>' +
//             '<td>' + dataArray[i].messageTime + '</td>' +
//            '</tr>'
//         );}

//         else if (dataArray[i].user == 'U39dc316178dbca5a9e85f4a10aa4210e'){

//         user5.append(
//           '<tr>' +
//             '<td>' + dataArray[i].message + '</td>' +
//             '<td>' + dataArray[i].messageTime + '</td>' +
//            '</tr>'
//         );}

// }//namefound

// else {
//          $('#clients').append(
//           '<tr>' +
//             '<td><button id="'+dataArray[i].user+'" class="tablinks"><b>' + dataArray[i].user + '</b></button></td>'+'</tr>'
//         );


//         user_list.push(dataArray[i].user);   


// }//else


      }// for loop

      let arr1 = dataArray.filter(user1 => {
        // console.log(user1);
        return user1.user == 'U8322eb28b5b3c1f5b2d101620daa71ed';
      })

      console.log(arr1.length);
      


  });//database

}//function

 $(document).on('click', "#U8322eb28b5b3c1f5b2d101620daa71ed", function(){user1.show();user2.hide();user3.hide();user4.hide();user5.hide();canvas1.hide();canvas2.hide();canvas3.hide()});
 $(document).on('click', "#U376b6ec748e32f594cf2f6248800d094", function(){user2.show();user1.hide();user3.hide();user4.hide();user5.hide();canvas1.hide();canvas2.hide();canvas3.hide()});
 $(document).on('click', "#Udeadbeefdeadbeefdeadbeefdeadbeef", function(){user3.show();user2.hide();user1.hide();user4.hide();user5.hide();canvas1.hide();canvas2.hide();canvas3.hide()});
 $(document).on('click', "#U3919284a3de4cd0c0b570090c3dc9943", function(){user4.show();user2.hide();user3.hide();user1.hide();user5.hide();canvas1.hide();canvas2.hide();canvas3.hide()});
 $(document).on('click', "#U39dc316178dbca5a9e85f4a10aa4210e", function(){user5.show();user2.hide();user3.hide();user4.hide();user1.hide();canvas1.hide();canvas2.hide();canvas3.hide()});
/*  ==================================================  */

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

  // socket.on('usernames', (data) => {
  //   var html = '';
  //   for(i=0; i < data.length; i++){
  //     html += data[i] + '<br />';
  //   }
  //   users.html(html);
  // });

  socket.on('new message', (data) => {
    displayMessage(data);
    displayClient(data)

    // messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  });

  socket.on('whisper', (data) => {
    messageContent.append('<span class="whisper"><b>' + data.name + ': </b>' + data.msg + "</span><br/>");
  });

  // socket.on('load old messages', docs => {
  //   for(i=0; i < data.length; i++){
  //     displayMessage(docs[i]);
  //   }
  // });

 
  function displayClient(data){
      var i = data.name;
      var namefound = (name_list.indexOf(i) > -1);

        if (namefound){
 
           console.log('user existed');
        }else {
           clients.append("<b><button id=\""+data.name+"\" class=\"tablinks\"> "+data.name+"</button></b>");
           name_list.push(data.name);   
           console.log(name_list); 

        }
      
  }

  function displayMessage(data){
      var i = data.name;
      var namefound = (name_list.indexOf(i) > -1);//if client exists
 /*     var n, dataName ;
      dataName = document.getElementsById(data.name);
      for (n = 0; n < dataName.length; n++) { */
          
      //  messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");

        if (namefound){
          //append new msg in existed window
 
          if (name_list.indexOf(i)==1){   
                       console.log('found1');

          canvas1.append("<p><strong>" + data.name + ": </strong>" + data.msg + "<br/></p>");

        }else if (name_list.indexOf(i)==2){
          console.log('found2');
            canvas2.append("<p><strong>" + data.name + ": </strong>" + data.msg + "<br/></p>");

         }else if (name_list.indexOf(i)==3){
          console.log('found3');
            canvas3.append("<p><strong>" + data.name + ": </strong>" + data.msg + "<br/></p>");
          }

        }else {
            canvas.append("<div id=\"chat\" class=\"tabcontent\"><span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x</span><div id=\""+data.name+"\"><p>"+
            "<strong>" + data.name + ": </strong>" + data.msg + "<br/></p></div>");
        
          
        }

  $(document).on('click', "#U0cbbba0d281fc5b095caaacac73fd1b5", function(){canvas1.show();canvas2.hide();canvas3.hide();user1.hide();user2.hide();user3.hide();user4.hide();user5.hide()});
 $(document).on('click', "#U52b2014e2905721d4072e65407653235", function(){canvas2.show();canvas1.hide();canvas3.hide();user1.hide();user2.hide();user3.hide();user4.hide();user5.hide()});
 $(document).on('click', "#U636956e3c62bdeecab26ea39be27cccc", function(){canvas3.show();canvas1.hide();canvas2.hide();user3.hide();user2.hide();user1.hide();user4.hide();user5.hide()});

      
      
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

}



 });//document ready close tag














