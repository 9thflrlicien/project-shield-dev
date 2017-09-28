$(document).ready(function() {
  var socket = io.connect();    //socket

  var printAgent = $('#printAgent');  //agent welcome text
  var messageForm = $('#send-message'); //button for agent to send message
  var messageInput = $('#message');     //input for agent to send message

  var clients = $('#clients');        //online rooms of tablinks
  var idles = $('#idle-roomes');      //idle rooms of tablinks
  var room_list = [];                 //list of all users

  var canvas = $("#canvas");          //panel of message canvas
  var person = "";         //agent name
  var agent_list_id = [];
  var agent_list_nick = [];
  const LOADING_MSG_AND_ICON = "<p class='message-day' style='text-align: center'><strong><i>"
    + "Loading History Messages..."
    + "</i></strong><span class='loadingIcon'></span></p>";

  var searchBox = $('.searchBox');    //input of search box
  var sortAvgBool = true;             //bool for sort average time up or down
  var sortTotalBool = true;           //bool for sort total time up or down
  var sortFirstBool = true;           //bool for sort first time up or down
  var sortRecentBool = true;          //bool for sort recent time up or down

  var roomProfiles = [];
  var buffer;                         //buffer which store now user's profile
  var infoTable = $('.info_input_table'); //user info table
  var infoModal = $('#roomInfoModal');
  var TagsData;                       //data of user info tags

  var filterDataBasic = {
    recent:['< 10 min', '10 min', '30 min', '60 min', '2 hr', '12 hr', '1 day', '1 week', '1 month', '1 month up'],
    first:['< 1 day', '1 day', '1 week', '2 week', '1 month', '3 month', '6 month', '1 year', '1 year up']
  };

  const COLOR = {
    FIND: "#A52A2A",
    CLICKED: "#ccc",
  }

  $(document).on('click', '#testBtn', testfunc );

  function testfunc() {
  }

  $(document).on('click', '#signout-btn', logout); //登出

  if (window.location.pathname === '/agentChat') {
    getAgentList();
    let timer_1 = setInterval(function() {
      if( !auth.currentUser ) console.log("firebase auth not loaded yet");
      else {
        clearInterval( timer_1 );
        agentName();
      }
    }, 100);
  }

  function getAgentList() {
    database.ref().child('users/').once('value', snap => {
      let users = snap.val();
      for( let prop in users ) {
        agent_list_nick.push(users[prop].nickname);
        agent_list_id.push(prop);
      }
      console.log(agent_list_id);
      console.log(agent_list_nick);
    });
  }

  function agentName() {
    let userId = auth.currentUser.uid;

    database.ref('users/' + userId).once('value', snap => {
      let profInfo = snap.val();
      let profId = Object.keys(profInfo);
      person = profInfo.nickname;  //從DB獲取agent的nickname

      if (person != '' && person != null) {
        socket.emit('new user', person, (data) => {
          // console.log(data);
          if(data){}   //check whether username is already taken
          else {
            alert('username is already taken');
            person = prompt("Please enter your name");  //update new username
            database.ref('users/' + userId ).update({nickname : person});
          }
        });
      }
      else{
        person = prompt("Please enter your name");  //if username not exist,update username
        database.ref('users/' + userId ).update({nickname : person});
      }

      printAgent.html("Welcome <b>" + person + "</b>! You're now on board.");
      socket.emit('get json from agentChat', { id: userId } );
    });
  }

  socket.on('push json to agentChat', (data) => {
    console.log("push json to front");
    for( i in data ) pushMsg(data[i]);    //one room do function one time
    sortUsers("recentTime", sortRecentBool, function(a,b){ return a<b; } );
    closeIdleRoomTry();
    $('.tablinks_head').text('Loading complete'); //origin text is "network loading"
  });

  function pushMsg(data){
    //one room do function one time
    let historyMsg = data.Messages;
    let profile = data.Profile;

    let historyMsgStr = "";
    if( data.position!=0 ) {
      historyMsgStr += LOADING_MSG_AND_ICON;    //history message string head
    }
    else {
      historyMsgStr += "<p class='message-day' style='text-align: center'><strong><i>"
      + "-------------------------------------------------------No More History Message-------------------------------------------------------"
      + "</i></strong></p>";    //history message string head
    }

    historyMsgStr += historyMsg_to_Str(historyMsg);
    historyMsgStr += "<p class='message-day' style='text-align: center'><strong><italic>"
      + "-------------------------------------------------------Present Message-------------------------------------------------------"
      +" </italic></strong></p>";   //history message string tail

    canvas.append(    //push string into canvas
      "<div id=\"" + profile.roomId + "\" class=\"tabcontent\"style=\"display: none;\">"
       + "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x&nbsp;&nbsp;&nbsp;</span>"
       + "<div id='" + profile.roomId + "-content' class='messagePanel' position='"+data.position+"'>"
        + historyMsgStr + "</div>"
       + "</div>"
    );// close append
    if( data.position!=0 ) $('#'+profile.roomId+'-content').on('scroll', function() {
      detecetScrollTop($(this));
    });
    $('#room-select').append('<option value="' + profile.roomId + '">' + profile.roomName + '</option>');  //new a option in select bar

    let lastMsg = historyMsg[historyMsg.length-1];    //this part code is temporary
    let font_weight = "normal";  //if last msg is by user, then assume the msg is unread by agent
    if( profile.unRead && profile.unRead.indexOf(person)!=-1 ) font_weight = "bold";
    let lastMsgStr = '<br><span id="msg" style="font-weight: '+ font_weight + '">' + toTimeStr(lastMsg.time) + lastMsg.message + "</span>";
    //display last message at tablinks

    clients.append("<b><button rel=\""+profile.roomId+"\" class=\"tablinks\" "
      + "data-recentTime=" + lastMsg.time + "> "
      + '<span id="roomName">' + profile.roomName + '</span>'
      + lastMsgStr
      + "</button></b>"
    );    //new a tablinks

    room_list.push(profile.roomId); //make a name list of all chated user
    roomProfiles[profile.roomId] = profile;
  }

  function detecetScrollTop( ele ) {
    if( ele.scrollTop()==0 ) {
      let tail = ele.attr('position');
      let head = ele.attr('position')>20 ? ele.attr('position')-20 : 0;
      let request = {
        roomId: ele.parent().attr('id'),
        head: parseInt(head),
        tail: parseInt(tail)
      };
      if( head==0 ) ele.off('scroll');
      ele.attr('position', head);
      socket.emit('upload history msg from front agentChat', request);
      console.log('upload! head = '+head+', tail = '+tail);
    }
  }

  socket.on('upload history msg from back agentChat', data=>{
    console.log('get uploaded history msg');
    let msgContent = $('#'+data.roomId+'-content');

    let origin_height = msgContent[0].scrollHeight;
    msgContent.find('.message:first').remove();
    msgContent.find('.message-day:lt(3)').remove();

    msgContent.prepend(historyMsg_to_Str(data.messages));
    let now_height = msgContent[0].scrollHeight;
    msgContent.animate({scrollTop: now_height - origin_height}, 0);

    if( msgContent.attr('position')>0 ) msgContent.prepend(LOADING_MSG_AND_ICON);
    else msgContent.prepend(
      "<p class='message-day' style='text-align: center'><strong><i>"
      + "-------------------------------------------------------No More History Message-------------------------------------------------------"
      + "</i></strong></p>"
    );
  });

  setInterval( closeIdleRoomTry, 20000);

  function closeIdleRoomTry() {
    let early_time = Date.now() - 15*60*1000;        //15min before now
    let last = clients.find('.tablinks').last();      //last user in online room
    while( last && last.attr('data-recentTime') < early_time ) {    //while last of online user should push into idle room
      let b = last.parents('b');
      b.remove();
      idles.prepend(b);
      last = clients.find('.tablinks').last();
    }
  }

  $(document).on('click', '.tablinks', function() {
    $("#selected").removeAttr('id').css("background-color", "");   //selected tablinks change, clean prev's color
    $(this).attr('id','selected').css("background-color",COLOR.CLICKED);    //clicked tablinks color

    let target = $(this).attr('rel');         //find the message canvas
    $("#"+target).show().siblings().hide();   //show it, and close others
    $('#'+target+'-content').scrollTop($('#'+target+'-content')[0].scrollHeight);   //scroll to down
    $('#room-select').val(target);             //change value in select bar

    if( $(this).find('#msg').css("font-weight")=="bold" ) {
      $(this).find('#msg').css("font-weight", "normal");                //read msg, let 0msg dis-bold
      socket.emit("read message agentChat", {reader: person, roomId: target} );          //tell socket that this user isnt unRead
    }
  });

  $(document).on('click', '.topright', function() {
    //close the message canvas
    let roomId = $(this).parent().hide().attr("id");
    $(".tablinks[rel='" + roomId +"'] ").removeAttr('id').css("background-color","");   //clean tablinks color
  });

  $(document).on('click', '#newGroupBtn', function() {
    reload_tags();
    infoModal.find('.roomInfo-td#roomId').find('#td-inner').text(Date.now());
    infoModal.find('.roomInfo-td#owner').find('#td-inner').text(person);
    infoModal.find('.roomInfo-td#agent').find('.autocomplete').text("");
    let id = agent_list_id[ agent_list_nick.indexOf(person) ];
    infoModal.find('.roomInfo-td#agent').prepend('<span class="agent-in-room" rel="'+id+'"><p class="name">'+person+'</p>'
      + '<p class="delete">&times;</p></span>'
    );
  });

  $(document).on('click', '#roomInfoBtn', function() {
    let target = $('#selected').attr('rel'); //get useridd of current selected user
    if( target ){
      console.log("show profile of roomId " + target);
      reload_tags();
      showTargetProfile(roomProfiles[target]);
    }
    else infoTable.html("please choose a room");
  });

  $(document).on('click', '.roomInfo-td[modify="true"]', function() {
    if( $(this).find('input').length!=0 || $(this).find('textarea').length!=0 ) return;

    let set = $(this).attr('set');
    let text = $(this).find('#td-inner').text();

    if( set=='single' ) $(this).empty().html('<input type="text" class="textarea" id="td-inner" value="' + text +'" />');
    else if( set=='multi' ) $(this).empty().html('<textarea type="text" class="textarea" id="td-inner" rows="4" columns = "20" style="resize: none;" >'+text+'</textarea>');
    else console.log("error 646");

    $(this).find('#td-inner').select();
  });
  $(document).on('keypress', '.roomInfo-td .textarea', function(e) {
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) $(this).blur();
  });
  $(document).on('blur', '.roomInfo-td .textarea', function() {
    let val = $(this).val() ? $(this).val() : "尚未輸入";
    $(this).parent().html( '<p id="td-inner">'+val+'</p>');
  });

  $(document).on('DOMNodeInserted', '.autocomplete', function() {
    $('.autocomplete').autocomplete({
      source: agent_list_nick,
      appendTo: '.modal-body',
      select: function(event, ui) {
        let nick = ui.item.label;
        let id = agent_list_id[ agent_list_nick.indexOf(nick) ];
        $(event.target).parent().append('<span class="agent-in-room" rel="'+id+'"><p class="name">'+nick+'</p>'
          + '<p class="delete">&times;</p></span>'
          + '<input type="text" class="autocomplete" id="td-inner" />'
        ).find('.autocomplete').select();
        $(event.target).remove();
      }
    });
  });
  $(document).on('click', '.agent-in-room .delete', function() {
    $(this).parent().remove();
  });

  $(document).on('click','#roomInfo-submit',function() {
    if( ! confirm("Are you sure to change profile?") ) return;

    let data = {};
    infoModal.find('.roomInfo-td').each(function() {
      let id = $(this).attr('id');
      if( id=="agent" ) {
        let arr = [];
        $(this).find('.agent-in-room').each(function() {
          arr.push( $(this).attr('rel') );
        });
        console.log(arr);
        data[id] = arr;
      }
      else {
        data[id] = $(this).find('#td-inner').text();
      }
    })
    console.log(data);
    socket.emit('update profile agentChat',data);
    $('.modal').modal('hide');

    roomProfiles[data.roomId] = JSON.parse(JSON.stringify(data));   //clone object
    $('.tablinks[rel='+data.roomId+']').find('#roomName').text(data.roomName);
  });



  socket.on('new message agentChat', (data) => {
    console.log("get mesg!!");
    displayMessage( data ); //update canvas
    displayClient( data );  //update tablinks

    if( room_list.indexOf(data.roomId) == -1 ) {  //if its never chated user, push his name into name list
      room_list.push(data.roomId);
      console.log("new room! push into room_list!");
    }
  });

  function displayMessage( data ) {
    //update canvas
    if (room_list.indexOf(data.roomId) !== -1) {    //if its chated user
      let str = "";

      let rooms = $("#" + data.roomId + "-content p.message");
      let designated_chat_room_msg_time = rooms[rooms.length-1].getAttribute('rel');
      // console.log(designated_chat_room_length);
      // console.log(designated_chat_room_msg_time);
      // 如果現在時間多上一筆聊天記錄15分鐘
      if(data.time - designated_chat_room_msg_time >= 900000){
        $("#" + data.roomId + "-content").append('New Session starts-------------------');
      }
      if( data.name==person ) str = toAgentStr(data.message, data.name, data.time);
      else str = toUserStr(data.message, data.name, data.time);

      $("#"+data.roomId+"-content").append(str);    //push message into right canvas
      $('#'+data.roomId+'-content').scrollTop($('#'+data.roomId+'-content')[0].scrollHeight);  //scroll to down
    } //close if
    else {              //if its never chated user
      let historyMsgStr = "<p class='message-day' style='text-align: center'><strong><italic>"
        + "-------------------------------------------------------No More History Message-------------------------------------------------------"
        + "</italic></strong></p>";

      historyMsgStr += "<p class='message-day' style='text-align: center'><strong><italic>"
        + "-------------------------------------------------------Present Message-------------------------------------------------------"
        +" </italic></strong></p>";

      if( data.name==person ) historyMsgStr += toAgentStr(data.message, data.name, data.time);
      else historyMsgStr += toUserStr(data.message, data.name, data.time);

      canvas.append(      //new a canvas
        "<div id=\"" + data.roomId + "\" class=\"tabcontent\"style=\"display: none;\">"
        + "<span class=\"topright\">x&nbsp;</span>"
        + "<div id='" + data.roomId + "-content' class='messagePanel'>"
         + historyMsgStr
        + "</div></div>"
      );// close append

      //new a option in select bar
    }
  }//function

  function displayClient( data ) {
    //update tablinks
    let font_weight = data.name!=person ? "bold" : "normal";   //if msg is by user, mark it unread

    if (room_list.indexOf(data.roomId) !== -1 ) {
      let target = $(".tablinks[rel='"+data.roomId+"']");
      target.find("#msg").html( toTimeStr(data.time)+data.message ).css("font-weight", font_weight);
      target.attr("data-recentTime", data.time);
      //update tablnks's last msg

      let b = target.parents('b'); //buttons to b
      b.remove();
      clients.prepend(b);
    }
    else{     //new user, make a tablinks
      clients.prepend('<b><button rel="' + data.roomId + '" class="tablinks"><span id="roomName">' + data.roomName
        + "</span><br><span id='msg' style='font-weight: " + font_weight + "'>" + toTimeStr(data.time)
        + data.message +  "</span></button></b>"
      );
      $('#room-select').append('<option value="' + data.roomId + '">' + data.roomName + '</option>');
    }
  } //close client function

  messageForm.submit((e) => {
    e.preventDefault();
    let sendObj = {
      roomId: "",
      msg: messageInput.val(),
      msgtime: Date.now(),
      sender: person
    };
    if ($( "#room-select option:selected" ).val()=='全選') {
      room_list.map(function(id) {
        sendObj.roomId = id;
        socket.emit('send message agentChat', sendObj);//snap=
      });
    }
    else if( $("#room-select option:selected" ).val()=='對可見用戶發送' ) {
      $('.tablinks:visible').each(function() {
        sendObj.roomId = $(this).attr('rel');
        socket.emit('send message agentChat', sendObj);
      });
    }
    else {
      sendObj.roomId = $("#room-select option:selected").val();
      socket.emit('send message agentChat', sendObj);//socket.emit
    }//else
    messageInput.val('');
  });

  /*  =================================  */

  //extend jquery, let searching case insensitive
  $.extend($.expr[':'], {
    'containsi': function(elem, i, match, array) {
      return (elem.textContent || elem.innerText || '').toLowerCase()
      .indexOf((match[3] || "").toLowerCase()) >= 0;
    }
  });

  function displayAll() {
    $('.tablinks').each( function() {
      let id = $(this).attr('rel');
      $("div #"+id+"-content"+" .message").show().off("click");
      $(this).css("color","");
    });
  }

  searchBox.on('keypress', function (e) {
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code != 13) return;

    let searchStr = $(this).val().toLowerCase();
    if( searchStr == "" ) {
      displayAll();
    }
    else {
      let way = $('.searchSelect').val();
      if( way=="description" ) {
        displayAll();
        for( let i in roomProfiles ) {
          let text = roomProfiles[i]["description"];
          if( text && text.toLowerCase().indexOf(searchStr)!=-1 ) {
            let roomId = roomProfiles[i].roomId;
            $('.tablinks[rel="'+roomId+'"]').css("color", COLOR.FIND);
          }
        }
      }
      else {
        $('.tablinks').each( function() {
          //find his content parent
          let panel = $("div #" + $(this).attr('rel')+"-content");

          //display searched msg & push #link when onclick
          let color = "";
          panel.find(".message").each(function() {
            let text = $(this).find('.'+way).text();
            if( text.toLowerCase().indexOf(searchStr)!=-1 ) {
              $(this).show().on( "click", when_click_msg );
              color = COLOR.FIND;
            }
            else $(this).hide();
          });
          $(this).css("color", color);

          //when onclick, get search_str msg # link
          function when_click_msg() {    //when clicing searched msg
            $(this).attr("id", "ref");    //msg immediately add link
            searchBox.val("");    //then cancel searching mode,
            displayAll();         //display all msg
            window.location.replace("/agentChat#ref"); //then jump to the #link added
            $(this).removeAttr("id");   //last remove link
          };
        });
      }
    }
  });   //end searchBox change func

  $('.filterClean').on('click', function() {
    $('.tablinks').show();
    searchBox.val('');
    displayAll();
  });

  function sortUsers(ref, up_or_down, operate) {
    let arr = $('#clients b');
    for( let i=0; i<arr.length-1; i++ ) {
      for( let j=i+1; j<arr.length; j++ ) {
        let a = arr.eq(i).children(".tablinks").attr("data-"+ref)-'0';
        let b = arr.eq(j).children(".tablinks").attr("data-"+ref)-'0';
        if( up_or_down == operate(a, b) ) {
          let tmp = arr[i];   arr[i] = arr[j];    arr[j] = tmp;
        }
      }
    }
    $('#clients').append(arr);
  } //end sort func

  function sortAvgChatTime() {
    sortUsers("avgTime", sortAvgBool, function(a,b){ return a<b; } );
    let tmp = !sortAvgBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortAvgBool = tmp;
  }
  function sortTotalChatTime() {
    sortUsers("totalTime", sortTotalBool, function(a,b){ return a<b; } );
    let tmp = !sortTotalBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortTotalBool = tmp;
  }
  function sortFirstChatTime() {
    sortUsers("firstTime", sortFirstBool, function(a,b){ return a>b; } );
    let tmp = !sortFirstBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortFirstBool = tmp;
  }
  function sortRecentChatTime() {
    sortUsers("recentTime", sortRecentBool, function(a,b){ return a<b; } );
    let tmp = !sortRecentBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortRecentBool = tmp;
  }

  $(document).on('change', '.multiselect-container', function() {
    let boxes = $(this).find('input');
    let arr = [];
    boxes.each(function() {
      if( $(this).is(':checked') ) arr.push( $(this).val() );
    });
    if( arr.length==boxes.length ) arr="全選";
    else arr = arr.join(',');
    $(this).parent().find($('.multiselect-selected-text')).text(arr);
  });
  $(document).on('click','.dropdown-menu', function(event){
    event.stopPropagation();
  });

  function reload_tags(){
    console.log("reload_tags");
    infoTable.empty();

    infoTable.append( '<tr>'
      + '<th class="roomInfo-th" id="name">群組名稱</th>'
      + '<th class="roomInfo-td" id="roomName" type="text" set="single" modify="true"><p id="td-inner">尚未輸入</p></th>'
    );
    infoTable.append( '<tr>'
      + '<th class="roomInfo-th" id="roomId">roomId</th>'
      + '<th class="roomInfo-td" id="roomId" type="text" modify="false"><p id="td-inner">尚未輸入</p></th>'
    );
    infoTable.append( '<tr>'
      + '<th class="roomInfo-th" id="owner">創立者</th>'
      + '<th class="roomInfo-td" id="owner" type="text" modify="false"><p id="td-inner">尚未輸入</p></th>'
    );
    infoTable.append( '<tr>'
      + '<th class="roomInfo-th" id="description">群組描述</th>'
      + '<th class="roomInfo-td" id="description" type="text" set="multi" modify="true"><p id="td-inner">尚未輸入</p></th>'
    );
    infoTable.append( '<tr>'
      + '<th class="roomInfo-th" id="agent">成員名單</th>'
      + '<th class="roomInfo-td" id="agent" type="text" set="contact" modify="true"><input type="text" class="autocomplete" id="td-inner" /></th>'
    );
  }

  function showTargetProfile(profile) {
    infoModal.find('.roomInfo-td').each( function() {
      let data = profile[ $(this).attr('id') ];
      if( $(this).attr('id')=="agent" ) {
        $(this).find('.autocomplete').text("");
        for( let i in data ) {
          let id = data[i];
          let nick = agent_list_nick[ agent_list_id.indexOf(id) ];
          $(this).prepend( '<span class="agent-in-room" rel="'+id+'"><p class="name">'+nick+'</p>'
            + '<p class="delete">&times;</p></span>'
          );
        }
      }
      else {
        let inner = $(this).find('#td-inner');
        if( data!=undefined && data!=null && data!="" )  inner.text(data);
        else inner.text("尚未輸入");
      }
    });
  }

  function historyMsg_to_Str( messages ) {
    let returnStr = "";
    let nowDateStr = "";
    let prevTime = 0;
    for( let i in messages ) {    //this loop plus date info into history message, like "----Thu Aug 01 2017----"
      let d = new Date( messages[i].time ).toDateString();   //get msg's date
      if( d != nowDateStr ) {  //if (now msg's date != previos msg's date), change day
        nowDateStr = d;
        returnStr += "<p class='message-day' style='text-align: center'><strong>" + nowDateStr + "</strong></p>";  //plus date info
      }

      if( messages[i].time - prevTime > 15*60*1000 ) { //if out of 15min section, new a section
        returnStr += "<p class='message-day' style='text-align: center'><strong>" + toDateStr(messages[i].time) + "</strong></p>";  //plus date info
      }
      prevTime = messages[i].time;

      if( messages[i].name == person ) {    //plus every history msg into string
        returnStr += toAgentStr(messages[i].message, messages[i].name, messages[i].time);
      }
      else returnStr += toUserStr(messages[i].message, messages[i].name, messages[i].time);
    }
    return returnStr;
  }

  function toAgentStr(msg, name, time) {
    return '<p class="message" rel="' + time + '" style="text-align: right;" title="' + toDateStr(time) + '"><span class="content">' + msg + '</span><strong> : <span class="sender">' + name + '</span><span class="sendTime">' + toTimeStr(time) + '</span></strong><br/></p>';
  }
  function toUserStr(msg, name, time) {
    return '<p class="message" rel="' + time + '" title="' + toDateStr(time) + '"><strong><span class="sender">' + name + '</span><span class="sendTime">' + toTimeStr(time) + '</span>: </strong><span class="content">' + msg + '</span><br/></p>';
  }

  function toDateStr( input ) {
    let str = " ";
    let date = new Date(input);
    str += date.getFullYear() + '/' + addZero(date.getMonth()+1) + '/' + addZero(date.getDate()) + ' ';

    let week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    str += week[date.getDay()] + ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes());
    return str;
  }
  function toTimeStr( input ) {
    let date = new Date(input);
    return " (" + addZero(date.getHours()) + ':' + addZero(date.getMinutes()) + ") ";
  }

  function change_document_title(name) {
    // $(document).prop('title', 'SHEILD chat ver2');
  }
  function addZero(val){
    return val<10 ? '0'+val : val;
  }
}); //document ready close tag
