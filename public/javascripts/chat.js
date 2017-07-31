$(document).ready(function() {
  var socket = io.connect();
  var users = $('#users');
  var messageForm = $('#send-message');
  var messageInput = $('#message');
  var messageContent = $('#chat');
  var clients = $('#clients');
  var printAgent = $('#printAgent');
  var canvas = $("#canvas");
  var searchBox = $('#searchBox');
  var name_list = [];
  var person = prompt("Please enter your name");
  var historyMsg_users = [];
  var historyMsg_agents = [];
  var avgChatTime;
  var sumChatTime;
  var sortAvgBool = true;
  const COLOR = {
    FIND: "rgb(255, 255, 192)",
    CLICKED: "#ccc",
  }
  const IDENTITY = {
    USER: 1,
    AGENT: 2,
    NEW_USER: 3
  };

  function clickMsg(){
    ///let the clicked tablinks change color, cancel previous clicked button's color
    let cleancolor = "";
    if( searchBox.val()!="" ) {
      cleancolor = COLOR.FIND;
    }
    $("#selected").attr('id','').css("background-color", cleancolor);
    $(this).attr('id','selected').css("background-color",COLOR.CLICKED);

    var target = $(this).attr('rel');
    $("#"+target).show().siblings().hide();

    console.log('click tablink executed');
  }
  function clickSpan() {
    let userId = $(this).parent().css("display", "none").attr("id");
    $(".tablinks[rel='" + userId +"'] ").attr("id", "").css("background-color","");
  }

  $(document).on('click', '.tablinks', clickMsg);
  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '.topright', clickSpan);
  //$(document).on('click', '.tablinks_head', sortAvgChatTime);

  if (window.location.pathname === '/chat') {
    console.log("Start loading history message...");
    setTimeout(loadMsg, 10);
    setTimeout(agentName, 100);
    //   setTimeout(loadMsg, 100);
  } // set agent name

  function loadMsg() {
    console.log("Start loading msg...");
    database.ref('chats/users2').once('value', snap => {
      console.log("Loading user history msg...");
      let testVal = snap.val();
      let myIds = Object.keys(testVal);
      for (var i = 0; i < myIds.length; i++) {
        historyMsg_users.push(snap.child(myIds[i]).val());
      }
      console.log("User history msg load complete");

      database.ref('chats/agents2').once('value', snap => {
        console.log("Loading agent history msg...");
        let testVal = snap.val();
        let myIds = Object.keys(testVal);
        for (var i = 0; i < myIds.length; i++) {
          historyMsg_agents.push(snap.child(myIds[i]).val());
        }
        console.log("Agent history msg load complete");

        $('.tablinks_head').text("Users Online");
      });
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
          alert('username is already taken');
        }
      });
      name_list.push(person); //Colman: add agent name into list here
      printAgent.append("Welcome <b>" + person + "</b>! You're now on board.");
    }
    else {
      window.location.replace("/");
    } //'name already taken'功能未做、push agent name 未做
  }

  messageForm.submit((e) => {
    e.preventDefault();
    let designated_user_id = $( "#user-rooms option:selected" ).val();
    socket.emit('send message', {id: designated_user_id , msg: messageInput.val()}, (data) => {
      messageContent.append('<span class="error">' + data + "</span><br/>");
      ///no this thing QQ
    });
    // socket.emit('send message', messageInput.val(), (data) => {
    //     messageContent.append('<span class="error">' + data + "</span><br/>");
    // });
    messageInput.val('');
  });

  socket.on('usernames', (data) => {
    var html = '';
    for (i = 0; i < data.length; i++) {
      html += data[i] + '<br />';
    }
    users.html(html);
  });


  /*  =================================  */

  socket.on('new message', (data) => {
    var msgOwner = "";  ///userName or agentName
    var identity = -1;  ///user, agent or new_user
    if( data.hasOwnProperty("agentName") ) {
      msgOwner = data.agentName;
      identity = IDENTITY.AGENT;
    }
    else if( data.hasOwnProperty("userName") ) {
      msgOwner = data.userName;
      if( name_list.indexOf(msgOwner) > -1 ) identity = IDENTITY.USER;
      else identity = IDENTITY.NEW_USER;
    }
    else console.log("ERROR! no agentName, no userName. so what is this???");

    console.log("Message get! identity = " + identity + ", msgOwner = " + msgOwner);
    if( identity == IDENTITY.NEW_USER ) {
      name_list.push(msgOwner);
      console.log("push into name_list!");
    }
    else console.log("this msgOwner already exist");

    displayMessage( data, msgOwner, identity );
    displayClient( data, msgOwner, identity );

    // messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  });

  function displayMessage( data, msgOwner, identity ) {

    if (identity != IDENTITY.NEW_USER) {
      //append new msg in existed window
      ///no matter he's agent or user, just push name and msg into correct canvas BY ID
      $("#" + data.id + "-content").append("<p class=\"message\"><strong>" + msgOwner + toTimeStr(data.messageTime) + ": </strong>"+ data.message + "<br/></p>");

    } //close if
    else {
      if (msgOwner == person && data.id !== undefined) {
        ///dont understand this if statement QQ
        console.log("Get into 160 if");
        console.log('yes existed agent msg identified');
        // for (let n = 0; n < t_value + 1; n++) {
        if ($("#" + data.id).is(':visible')) {
          console.log('appended agent message');
          $("#" + data.id + "-content").append("<p class=\"message\"><strong>" + data.agentName + toTimeStr(data.messageTime) + ": </strong>"+ data.message + "<br/></p>");
        } //if if
        else {
          console.log('no the n is not visible, do it again')
        }
        // } //for
      }
      else {
        ///identity = NEW_USER
        console.log('new user msg append to canvas');
        $('#user-rooms').append('<option value="' + data.id + '">' + msgOwner + '</option>');

        ///loading that user's history msg
        let users_pastMsg = historyMsg_users.filter(msg => {
          return msg.id == data.id;
        });
        let agents_pastMsg = historyMsg_agents.filter(msg => {
          return msg.id == data.id;
        });

        //THIS PART SORT USER & AGENT HISTORY MSG INTO TIME CONTINUOUS
        let historyMsg = [];
        let i=0;
        let j=0;
        let iFlag = (users_pastMsg.length==0);
        let jFlag = (agents_pastMsg.length==0);
        while( !iFlag || !jFlag ) {
          while( ( !iFlag ) && (jFlag || users_pastMsg[i].messageTime < agents_pastMsg[j].messageTime ) ) {
            //↑ while ( still exist unloaded user msg  && (there's no unloaded agent msg || now user msg is early then now agent msg ) )
            //then { load next index user msg; }
            historyMsg.push(users_pastMsg[i]);
            i++;
            if( i==users_pastMsg.length ) iFlag = true;
          }
          while( (!jFlag ) && ( iFlag || agents_pastMsg[j].messageTime< users_pastMsg[i].messageTime ) ) {

            historyMsg.push(agents_pastMsg[j]);
            j++;
            if( j==agents_pastMsg.length ) jFlag = true;
          }
        }
        //SORT BOTH MSG DONE

        //THIS PART DIVIDE HISTORY MSG INTO DIFFERENT DAYS
        let historyMsgStr = "<p class='random-day' style='text-align: center'><strong><italic>"
          + "-------------------------------------------------------No More History Message-------------------------------------------------------"
          + "</italic></strong></p>";
        let nowDateStr = "";
        for( let i in historyMsg ) {
          let d = new Date( historyMsg[i].messageTime );
          if( d.toDateString()!=nowDateStr ) {  //two msg'day is diff => change day, push day msg
            nowDateStr = d.toDateString();
            historyMsgStr += "<p class='random-day' style='text-align: center'><strong>" + nowDateStr + "</strong></p>";
          }
          if( identity==IDENTITY.AGENT ) {
            historyMsgStr += toAgentStr( historyMsg[i] );
          }
          else historyMsgStr += toUserStr( historyMsg[i] );
        }
        historyMsgStr += "<p class='random-day' style='text-align: center'><strong><italic>"
          + "-------------------------------------------------------Present Message-------------------------------------------------------"
          +" </italic></strong></p>";
        //DIVIDE MSG INTO DIFFERENT DAYS DONE

        //some liitle function here
        function toUserStr( msg ) {
          return "<p class='random'>" + msg.userName + toTimeStr(msg.messageTime) + ": " + msg.message + "<br/></p>";
        }
        function toAgentStr( msg ) {
          return "<p class='random'>" + msg.agentName + toTimeStr(msg.messageTime) + ": " + msg.message + "<br/></p>";
        }
        ///if want to sort online user, compute information here

        canvas.append(
          "<div id=\"" + data.id + "\" class=\"tabcontent\"style=\"display: none;\">"
          + "<span class=\"topright\">x&nbsp;</span>"
          + "<div id='" + data.id + "-content' class='messagePanel'>" + historyMsgStr
          + "<p class=\"message\"><strong>" + data.userName + toTimeStr(data.messageTime) + ": </strong>" + data.message + "<br/></p>"
          + "</div></div>"
        );// close append
      } //else
    }
  }//function

  function displayClient( data, msgOwner, identity ) {
    if (identity != IDENTITY.NEW_USER) {
      ///agent or already online user , update tablinks' latest msg BY ID
      console.log('user existed');
      $(".tablinks[rel='"+data.id+"'] span").text(toTimeStr(data.messageTime) + remove_href_msg(data.message));
    }
    else if(identity == IDENTITY.NEW_USER){
      ///new user, make a tablinks
      clients.append("<b><button rel=\"" + data.id + "\" class=\"tablinks\" >" + data.userName
        + "<br><span style='font-weight: normal'>" + toTimeStr(data.messageTime)
        + remove_href_msg(data.message) +  "</span></button></b>"
      );
    }
    else {
      console.log("271 its impossible");
    }//close else

    function remove_href_msg(msg) {
      if( msg.indexOf('target="_blank"')!=-1 && msg.indexOf('href')!=-1 ) {
        let aPos = msg.indexOf('target="_blank"');
        let bPos = msg.indexOf('href');
        if( bPos>aPos ) { ///image, video, audio, location
          if( msg.indexOf('image')!=-1 ) return "send a image";
          else if( msg.indexOf('audio')!=-1 ) return "send an audio";
          else if( msg.indexOf('video')!=-1 ) return "send a video";
          else if( msg.indexOf('https://www.google.com.tw/maps/') != -1) return "send a location";
        }
        else {  ///url
          let cPos = msg.lastIndexOf('target');
          return msg.substring( bPos+6, cPos-2 ) ;
        }
      }
      else return msg;
    }

  } //close client function

  //extend jquery, let searching case insensitive
  $.extend($.expr[':'], {
    'containsi': function(elem, i, match, array) {
      return (elem.textContent || elem.innerText || '').toLowerCase()
      .indexOf((match[3] || "").toLowerCase()) >= 0;
    }
  });

  searchBox.change(function () {
    var searchStr = searchBox.val();

    if( searchStr == "" ) {
      displayAll();
    }
    else {
      $('.tablinks').each( function() {
        //find his content parent
        let id = $(this).attr('rel');

        //hide no search_str msg
        $("div #"+id+"-content"+" .random").css("display", "none");
        $("div #"+id+"-content"+" .message").css("display", "none");

        //display searched msg & push #link when onclick
        $("div #"+id+"-content"+" .random:containsi("+searchStr+")")
          .css("display", "").on( "click", when_click_msg );
        $("div #"+id+"-content"+" .message:containsi("+searchStr+")")
          .css("display", "").on( "click", when_click_msg );

        //when onclick, get search_str msg # link
        function when_click_msg() {    //when clicing searched msg

          $(this).attr("id", "ref");    //msg immediately add link

          searchBox.val("");    //then cancel searching mode,
          displayAll();         //display all msg

          window.location.replace("/chat#ref"); //then jump to the #link added
          $(this).attr("id", "");   //last remove link
        };

        //if this customer already no msg...    (dont know how to clean code QQ)
        let flag = false;
        for( let i=0; i<$("div #"+id+"-content"+" .random").length; i++ ) {
          if( $("div #"+id+"-content"+" .random").eq(i).css("display") != "none" ) {
            flag = true;
            break;
          }
        }
        if( !flag ) for( let i=0; i<$("div #"+id+"-content"+" .message").length; i++ ) {
          if( $("div #"+id+"-content"+" .message").eq(i).css("display") != "none" ) {
            flag = true;
            break;
          }
        }

        //then hide the customer's tablinks
        if( !flag ) $(this).css("background-color", "");
        else $(this).css("background-color", COLOR.FIND);

      });
    }
    function displayAll() {
      $('.tablinks').each( function() {
        let id = $(this).attr('rel');
        $("div #"+id+"-content"+" .random").css({
          "background-color": "",
          "display": ""
        }).off("click");

        $("div #"+id+"-content"+" .message").css({
          "background-color": "",
          "display": ""
        }).off("click");

        $(this).css("background-color","");
      });
    }
  });   //end searchBox change func

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

  function closeIdleRoom() {
    let over_fifteen_min = new Date();
    let user_list = [];
    let find_user_id;
    let total_users = document.getElementById('canvas').childNodes.length;
    let canvas = $('#canvas');
    for(let i=0;i<total_users;i++) {
      user_list.push()
    }
    setInterval(() => {

    }, 900000)
  }

}); //document ready close tag
