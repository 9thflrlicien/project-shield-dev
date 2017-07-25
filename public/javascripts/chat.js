$(document).ready(function() {
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
  var user1 = $("#user1");
  var user2 = $("#user2");
  var user3 = $("#user3");
  var user4 = $("#user4");
  var user5 = $("#user5");
  var user6 = $("#user6_inn");
  var user7 = $("#user7_inn");
  var searchBox = $('#searchBox');
  var socket = io.connect();
  var user_list = [];
  var person = "";
  var count = 0;
  var t = [];
  var t_value;
  var t_key;
  var receiver;
  var historyMsg_users = [];
  var historyMsg_agents = [];
  var avgChatTime;
  var sumChatTime;
  var sortUp = true;

  //extend jquery, let searching case insensitive
  $.extend($.expr[':'], {
    'containsi': function(elem, i, match, array) {
      return (elem.textContent || elem.innerText || '').toLowerCase()
      .indexOf((match[3] || "").toLowerCase()) >= 0;
    }
  });
  searchBox.change(function () {
    var FIND_COLOR = "rgb(255, 255, 192)";
    var searchStr = searchBox.val();

    if( searchStr == "" ) {
      displayAll();
    }
    else {
      $('.tablinks').each( function() {
        //find his content parent
        let id = $(this).attr('rel');

        //hide no search_str msg
        $("div #"+id+" .random").css("display", "none");
        $("div #"+id+" .message").css("display", "none");

        //display searched msg
        $("div #"+id+" .random:containsi("+searchStr+")").css("display", "");
        $("div #"+id+" .message:containsi("+searchStr+")").css("display", "");

        //get search_str msg # link
        $("div #"+id+" .random:containsi("+searchStr+")").on("click", function() {    //when clicing searched msg

          $(this).attr("id", "ref");    //msg immediately add link

          searchBox.val("");    //then cancel searching mode,
          displayAll();         //display all msg

          window.location.replace("/chat#ref"); //then jump to the #link added
          $(this).attr("id", "");   //last remove link
        });

        //if this customer already no msg...    (dont know how to clean code QQ)
        let flag = false;
        for( let i=0; i<$("div #"+id+" .random").length; i++ ) {
          if( $("div #"+id+" .random").eq(i).css("display") != "none" ) {
            flag = true;
            break;
          }
        }
        if( !flag ) for( let i=0; i<$("div #"+id+" .message").length; i++ ) {
          if( $("div #"+id+" .message").eq(i).css("display") != "none" ) {
            flag = true;
            break;
          }
        }

        //then hide the customer's tablinks
        if( !flag ) $(this).css("background-color", "");
        else $(this).css("background-color", FIND_COLOR);

      });
    }
    function displayAll() {
      $('.tablinks').each( function() {
        let id = $(this).attr('rel');
        $("div #"+id+" .random").css({
          "background-color": "",
          "display": ""
        }).off("click");

        $("div #"+id+" .message").css({
          "background-color": "",
          "display": ""
        }).off("click");

        $(this).css("background-color","").show();
      });
    }
  });   //end searchBox change func

  function clickMsg(){
    var target = $(this).attr('rel');
    $("#"+target).show().siblings().hide();

    let CLICKED_COLOR = "rgba(221,221,221,1)";
    let DEFAULT_COLOR = "rgba(0,0,0,0)"
    $(".tablinks").css("background-color",DEFAULT_COLOR);
    $(this).css("background-color",CLICKED_COLOR);

    console.log('clickMsg executed');
  }

  function sortUsers() {
    let arr = $('.list-group .tablinks');
    if( sortUp ) {
      console.log("Sort up!");
      arr.sort(function(a,b) {
        return ( $(a).attr("data-avg_chat_time") < $(b).attr("data-avg_chat_time") );
      });
      sortUp = false;
      $('.list-group').append(arr);
    }
    else {
      console.log("Sort down!");
      arr.sort(function(a,b) {
        return ( $(a).attr("data-avg_chat_time") > $(b).attr("data-avg_chat_time") );
      });
      sortUp = true;
      $('.list-group').append(arr);
    }
  } //end sortUsers func

  $(document).on('click', '.tablinks' , clickMsg);
  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '.tablinks_head', sortUsers);

  if (window.location.pathname === '/chat') {
    console.log("Start loading history message...");
    setTimeout(loadMsg, 10);
    setTimeout(agentName, 100);
  } // set agent name

  function loadMsg() {
    database.ref('chats/users').once('value', snap => {
      console.log("Loading user history msg...");
      let testVal = snap.val();
      let myIds = Object.keys(testVal);
      for (var i = 0; i < myIds.length; i++) {
        historyMsg_users.push(snap.child(myIds[i]).val());
      }
      console.log("User history msg load complete");
    });
    database.ref('chats/agents').once('value', snap => {
      console.log("Loading agent history msg...");
      let testVal = snap.val();
      let myIds = Object.keys(testVal);
      for (var i = 0; i < myIds.length; i++) {
        historyMsg_agents.push(snap.child(myIds[i]).val());
      }
      console.log("Agent history msg load complete");
    });
  } //end loadMsg func

  function agentName() {
    while( person=="" ) {
      person = prompt("Please enter your name");
    }
    if (person != null) {
      socket.emit('new user', person, (data) => {
        if(data){
        } else {
          nicknameError.html('username is already taken');
        }
      });
      printAgent.append("Welcome <b>" + person + "</b>! You're now on board.");
    }
    else {
      window.location.replace("/");
    } //'name already taken'功能未做、push agent name 未做
  }

  /*  =======  To indentify the right receiver  =====  */
  function defReceiver(){
    socket.emit('receiver', receiver, (data) => {
      console.log("data:");
      console.log(data);
    });
    console.log('receiver sent to www');
  }

  /*  =======  CODES FROM GITHUB: NICKNAME  ======  */

  nicknameForm.submit((e) => {
    e.preventDefault();
    socket.emit('new user', nicknameInput.val(), (data) => {
      if(data){
        $('#nickWrap').hide();
        $('#contentWrap').show();
      } else {
        nicknameError.html('username is already taken');
      }
    });
    nicknameInput.val('');
  });

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

  /*  =========== to assign the right receiverId  =========  */

  socket.on('send message', messageInput.val(), (data) =>{

  })

  /*  =================================  */
  // // nickname
  //   person.submit((e) => {

  //     e.preventDefault();
  //     socket.emit('new user', person.val(), (data) => {

  //     if (data){
  //         console.log('nickname successfully input');
  //       } else {
  //         nicknameError.html('username is already taken');
  //       }
  //     });

  //     person.val('');
  //   });


  // socket.on('usernames', (data) => {
  //   var html = '';
  //   for(i=0; i < data.length; i++){
  //     html += data[i] + '<br />';
  //   }
  //   users.html(html);
  // });

  socket.on('new message', (data) => {
    displayMessage(data);
    displayClient(data);

    // messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  });

  socket.on('whisper', (data) => {
    messageContent.append('<span class="whisper"><b>' + data.name + ': </b>' + data.msg + "</span><br/>");
  });

  function displayMessage(data) {

    let chat_number = 1;
    var dataName = data.name;

    var namefound = (name_list.indexOf(dataName) > -1); //if client exists
    /*     var n, dataName ;
    dataName = document.getElementsById(data.name);
    for (n = 0; n < dataName.length; n++) { */

    //  messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");

    if (namefound == true) {
      //append new msg in existed window
      console.log('namefound');
      console.log('im: '+dataName);

      if(dataName == person && data.id !== undefined){
        console.log('yes existed agent msg identified');
        var n;
        for (n=0; n < t_value+1; n++){
          console.log('yes it gets to the for loop');
          console.log('n is currently looping to')
          console.log(n);
          console.log('Is n already == t_value?')
          console.log(n == t_value);

          var k = t[n].key;
          console.log('the below is t[n].key');
          console.log(t[n].key);

          if ( $("#"+k).is(':visible')){
            console.log('yes it knows what is visible');
            var gotIt;
            gotIt = k;
            console.log('the following is gotIt');
            console.log(gotIt);
            receiver = gotIt;
            console.log('tell me whats receiver');
            console.log(receiver);
            defReceiver();

            $("#"+gotIt).append("<p class=\"message\"><strong>" + data.name + toTimeStr(data.time) + ": </strong>"+ data.msg + "<br/></p>");
            console.log('agent reply appended to according canvas');

          }//if if
          else{
            console.log('no the n is not visible, do it again')

          }
        }//for

      }//if agent
      else if (dataName){

        $("#"+dataName).append("<p class=\"message\"><strong>" + data.name + toTimeStr(data.time) + ": </strong>"+ data.msg + "<br/></p>");
        console.log('appended to according canvas');
      }//if

    }//close if
    else{
      console.log('new msg append to canvas');
      let users_pastMsg = historyMsg_users.filter(msg => {
        return msg.user == data.name;
      });
      let agents_pastMsg = historyMsg_agents.filter(msg => {
        return msg.user == data.name;
      });

      //THIS PART SORT USER & AGENT HISTORY MSG INTO TIME CONTINUOUS
      let historyMsg = [];
//      let historyMsgStr = "";
      let timeArr = [];
      let i=0;
      let j=0;
      let iFlag = (users_pastMsg.length==0);
      let jFlag = (agents_pastMsg.length==0);
      if( users_pastMsg.length==0 && agents_pastMsg.length==0 ) {
        //you are agent or you are new new user
      }
      else {
        //you are user
        while( ! ( iFlag && jFlag ) ) {
          while( ( !iFlag ) && (jFlag || isEarly ( users_pastMsg[i].messageTime, agents_pastMsg[j].messageTime ) ) ) {
            //↑ while ( still exist unloaded user msg )
            // && (there's no unloaded agent msg || now user msg is early then now agent msg )
            //then { load next index user msg; }
            historyMsg.push(users_pastMsg[i]);
        //    historyMsgStr += toUserStr( users_pastMsg[i] );
            timeArr.push(new Date(users_pastMsg[i].messageTime).getTime());
            i++;
            if( i==users_pastMsg.length ) {
              iFlag = true;
              break;
            };
          }
          while( (!jFlag ) && ( iFlag || isEarly ( agents_pastMsg[j].messageTime, users_pastMsg[i].messageTime ) ) ) {

            historyMsg.push(agents_pastMsg[j]);
        //    historyMsgStr += toAgentStr( agents_pastMsg[j] );
            timeArr.push(new Date(agents_pastMsg[j].messageTime).getTime());
            j++;
            if( j==agents_pastMsg.length ) {
              jFlag = true;
              break;
            };
          }
        }
      }
      //SORT BOTH MSG DONE

      //THIS PART DIVIDE HISTORY MSG INTO DIFFERENT DAYS
      let historyMsgStr = "<p class='randomDay' style='text-align: center'><strong><italic>"
        + "-------------------------------------------------------No More History Message-------------------------------------------------------"
        + "</italic></strong></p>";
      let nowDateStr = "";
      for( let i in historyMsg ) {
        let d = new Date(historyMsg[i].messageTime );
        if( d.toDateString()!=nowDateStr ) {  //change day
          nowDateStr = d.toDateString();
          historyMsgStr += "<p class='randomDay' style='text-align: center'><strong>" + nowDateStr + "</strong></p>";
        }
        if( historyMsg[i].hasOwnProperty("agent") ) {
          historyMsgStr += toAgentStr( historyMsg[i] );
        }
        else historyMsgStr += toUserStr( historyMsg[i] );
      }
      historyMsgStr += "<p class='randomDay' style='text-align: center'><strong><italic>"
        + "-------------------------------------------------------Present Message-------------------------------------------------------"
        +" </italic></strong></p>";
      //DIVIDE MSG INTO DIFFERENT DAYS DONE

      //some liitle function here
      function isEarly( in1, in2 ) {
        time1 = new Date(in1).getTime();
        time2 = new Date(in2).getTime();
        return ( time1 < time2 );
      }
      function toUserStr( msg ) {
        return "<p class='random'>" + msg.user + toTimeStr(msg.messageTime) + ": " + msg.message + "<br/></p>";
      }
      function toAgentStr( msg ) {
        return "<p class='random'>" + msg.agent + toTimeStr(msg.messageTime) + ": " + msg.message + "<br/></p>";
      }

      computeChatTime(timeArr)/60000;
      if( isNaN(avgChatTime) ) avgChatTime = 0;
      if( isNaN(sumChatTime) ) sumChatTime = 0;
      function computeChatTime(timeArr) {
        let times = [];
        let i=0;
        const GAP = 1000*60*10; //10 min
        let headTime;
        let tailTime;
        while( i<timeArr.length ) {
          headTime = tailTime = timeArr[i];
          while( timeArr[i]-tailTime < GAP ) {
            tailTime = timeArr[i];
            i++;
            if( i==timeArr.length ) break;
          }
          var num = tailTime-headTime;
          if( num<1000 ) num = 1000;
          times.push(num);
        }
        let sum = 0;
        for( let i in times ) sum += times[i];
        sum /= 60000;
        sumChatTime = sum;
        avgChatTime = sum/times.length;
      }


      canvas.append(
        "<div id=\"" + data.name + "\" class=\"tabcontent\"style=\"display: none;\">" +
        "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x</span>" +
        historyMsgStr+
        "<p class=\"message\"><strong>" + data.name + toTimeStr(data.time) + ": </strong>" + data.msg + "<br/></p></div>"
      );// close append

    }//else

    // }// if

  }//function

  function displayClient(data) {
    var i = data.name;
    var namefound = (name_list.indexOf(i) > -1);
    //       var namefound = (t_value > -1); //if client existed retrieved by key value

    if (namefound) {
      console.log('user existed');
    }else if (i == 'notice'){
      console.log('notice sent');
    }else {
      if (i == person){
        console.log('agent username loaded');
        name_list.push(data.name);
        t.push({key:data.name, value:count});
        console.log(t);
        t_value = t[count].value ;
        console.log('the below is t_value');
        console.log(t_value);
        t_key = t[count].key;
        count ++;

        console.log('is data.name == person? \(should be yes coz were now in the if agent');
        console.log(i == person);

        if   (data.name == person && data.id != undefined){
          console.log('yes agent msg identified');

          for (var n=0; n < t_value; n++){
            console.log('yes it gets to the for loop');
            var k = t[n].key;

            if ( $("#"+k).is(':visible')){
              console.log('yes it knows it is visible');
              var gotIt;
              gotIt = k;
              console.log('the following is gotIt');
              console.log(gotIt);
              receiver = gotIt;
              console.log('Tell me whats receiver');
              console.log(receiver);
              defReceiver();

              $("#"+gotIt).append("<p class=\"message\"><strong>" + data.name + toTimeStr(data.time) + ": </strong>"+ data.msg + "<br/></p>");
              console.log('agent reply appended to according canvas');
            }//if if

          }//for

        }//if agent

      }else{
        clients.append("<b><button  rel=\""+data.name+"\" class=\"tablinks\""
        + "data-avg_chat_time=\""+ avgChatTime.toFixed(0)+"\" "
        + "data-sum_chat_time=\""+ sumChatTime.toFixed(0)+"\"> "
        + data.name + " avg chat time = " + avgChatTime.toFixed(0)+ "</button></b>");
        name_list.push(data.name);
        t.push({key:data.name, value:count});
        console.log(t);
        t_value = t[count].value ;
        t_key = t[count].key;
        count ++;

        //            console.log(name_list);
      }//close else
    }//close else

  }//close client function

  function toDateStr( input ) {
    var str = " ";
    let date = new Date(input);
    str += date.getFullYear() + '/' + addZero(date.getMonth()+1) + '/' + addZero(date.getDate()) + ' ';

    var week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    str += week[date.getDay()] + ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes());
    return str;
  }
  function toTimeStr( input ) {
    let date = new Date(input);
    return " (" + addZero(date.getHours()) + ':' + addZero(date.getMinutes()) + ") ";
  }

  function addZero(val){
    return val<10 ? '0'+val : val;
  }
}); //document ready close tag
