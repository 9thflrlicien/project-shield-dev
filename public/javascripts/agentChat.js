$(document).ready(function() {
  var socket = io.connect();    //socket

  var printAgent = $('#printAgent');  //agent welcome text
  var messageForm = $('#send-message'); //button for agent to send message
  var messageInput = $('#message');     //input for agent to send message
  var messageContent = $('#chat');      //what's this

  var clients = $('#clients');        //online rooms of tablinks
  var idles = $('#idle-roomes');      //idle rooms of tablinks
  var name_list = [];                 //list of all users
  var user_list = []; // user list for checking on idle chat rooms

  var canvas = $("#canvas");          //panel of message canvas
  var person = "";         //agent name
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
  var TagsData;                       //data of user info tags

  var filterDataBasic = {
    age:['0', '20', '30', '40', '50', '60', '60 up'],
    recent:['< 10 min', '10 min', '30 min', '60 min', '2 hr', '12 hr', '1 day', '1 week', '1 month', '1 month up'],
    first:['< 1 day', '1 day', '1 week', '2 week', '1 month', '3 month', '6 month', '1 year', '1 year up']
  };
  var filterDataCustomer = {};

  const COLOR = {
    FIND: "#A52A2A",
    CLICKED: "#ccc",
  }


  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '.tablinks', clickUserTablink);
  $(document).on('click', '.topright', clickSpan);
  $(document).on('click', '#testBtn', testfunc );



  function testfunc() {
    $('#testBtn').text();
    // socket.emit('get json from agentChat');
    socket.emit('new room agentChat',
      {
        roomName: "客服群組",
        roomId: (new Date()).getTime().toString(),
        agent: [
          "NICK0305",
          "FillNickNam"
        ],
        description: "asdfasdfasdfasdf"
      }
    );
  }
  $(document).on('click', '#userInfoBtn', showProfile);
  $(document).on('click', '.userInfo-td[modify="true"]', editProfile);
  $(document).on('click', '.edit-button', changeProfile);
  $(document).on('click','#userInfo-submit',submitProfile);
  $(document).on('change', '.multiselect-container', multiselect_change);
  $(document).on('click','.dropdown-menu', function(event){
    event.stopPropagation();
  });

  setInterval(() => {
    closeIdleRoomTry();
  }, 20000);

  if (window.location.pathname === '/agentChat') {
    agentName(); //enter agent name
    console.log("Start loading history message...");
    setTimeout(function() {
      socket.emit('get json from agentChat');
    }, 10);  //load history msg
  }

  function closeIdleRoomTry() {
    let early_time = Date.now() - 15*60*1000;        //15min before now
    let last = clients.find('.tablinks').last();      //last user in online room
    while( last && last.attr('data-recentTime') < early_time ) {    //while last of online user should push into idle room
      // console.log("push " + last.attr('rel') + " to idle!");
      let b = last.parents('b');
      b.remove();
      idles.prepend(b);
      last = clients.find('.tablinks').last();
    }
  }

  socket.on('push json to agentChat', (data) => {
      //www emit data of history msg
    console.log("push json to front");
    for( i in data ) pushMsg(data[i]);    //one user do function one time
    sortUsers("recentTime", sortRecentBool, function(a,b){ return a<b; } );
    closeIdleRoomTry();
    $('.tablinks_head').text('Loading complete'); //origin text is "network loading"
  });
  function pushMsg(data){
    //one user do function one time; data structure see file's end
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
    $('#user-rooms').append('<option value="' + profile.roomId + '">' + profile.roomName + '</option>');  //new a option in select bar

    let lastMsg = historyMsg[historyMsg.length-1];    //this part code is temporary
    let font_weight = profile.unRead ? "bold" : "normal";  //if last msg is by user, then assume the msg is unread by agent
    let lastMsgStr = '<br><span id="msg" style="font-weight: '+ font_weight + '">' + toTimeStr(lastMsg.time) + lastMsg.message + "</span>";
    //display last message at tablinks

    clients.append("<b><button rel=\""+profile.roomId+"\" class=\"tablinks\"> "
      + '<span id="nick">' + profile.roomName + '</span>'
      + lastMsgStr
      + "</button></b>"
    );    //new a tablinks

    name_list.push(profile.roomId); //make a name list of all chated user
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

  function agentName() {
    person = prompt("Please enter your name");
    printAgent.html("Welcome <b>" + person + "</b>! You're now on board.");
    return;
    //enter agent name
    var userId = auth.currentUser.uid;
    database.ref('users/' + userId).on('value', snap => {
      let profInfo = snap.val();
      let profId = Object.keys(profInfo);
      let person = snap.child(profId[0]).val().nickname;  //從DB獲取agent的nickname
      // console.log(person);

      if (person != '' && person != null) {
        socket.emit('new user', person, (data) => {
          // console.log(data);
          if(data){}   //check whether username is already taken
          else {
            alert('username is already taken');
            person = prompt("Please enter your name");  //update new username
            database.ref('users/' + userId + '/' + profId).update({nickname : person});
          }
        });
      }
      else{
        person = prompt("Please enter your name");  //if username not exist,update username
        database.ref('users/' + userId + '/' + profId).update({nickname : person});
      }
    });
  }

  function clickUserTablink() {
    $("#selected").attr('id','').css("background-color", "");   //selected tablinks change, clean prev's color
    $(this).attr('id','selected').css("background-color",COLOR.CLICKED);    //clicked tablinks color

    if( $(this).find('#msg').css("font-weight")=="bold" ) {
      $(this).find('#msg').css("font-weight", "normal");                //read msg, let msg dis-bold
      // socket.emit("read message", {id: $(this).attr('rel')} );          //tell socket that this user isnt unRead
    }

    let target = $(this).attr('rel');         //find the message canvas
    $("#"+target).show().siblings().hide();   //show it, and close others
    $('#user-rooms').val(target);             //change value in select bar
    $('#'+target+'-content').scrollTop($('#'+target+'-content')[0].scrollHeight);   //scroll to down

    console.log('click tablink executed');
  }

  function clickSpan() {  //close the message canvas
    let userId = $(this).parent().css("display", "none").attr("id");
    $(".tablinks[rel='" + userId +"'] ").attr("id", "").css("background-color","");   //clean tablinks color
  }

  socket.on('new message agentChat', (data) => {
    console.log(data);
    console.log("Message get! name = " + data.name);
    //owner = "user", "agent" ; name = "Colman", "Ted", others...
    displayMessage( data ); //update canvas
    displayClient( data );  //update tablinks

    if( name_list.indexOf(data.roomId) == -1 ) {  //if its never chated user, push his name into name list
      name_list.push(data.roomId);
      console.log("push into name_list!");
    }
    else console.log("this msgOwner already exist");
  });

  function displayMessage( data ) {     //update canvas
    if (name_list.indexOf(data.roomId) !== -1) {    //if its chated user
      let str;

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
      console.log('new user msg append to canvas');

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

      $('#user-rooms').append('<option value="' + data.roomId + '">' + data.name + '</option>');
      //new a option in select bar
    }
  }//function

  function displayClient( data ) {    //update tablinks
    let font_weight = data.name==person ? "bold" : "normal";   //if msg is by user, mark it unread

    if (name_list.indexOf(data.roomId) !== -1 ) {
      console.log('user existed');
      let target = $(".tablinks[rel='"+data.roomId+"']");
      target.find("#msg").html(toTimeStr(data.time)+data.message).css("font-weight", font_weight);
      target.attr("data-recentTime", data.time);
      //update tablnks's last msg

      let b = target.parents('b'); //buttons to b
      b.remove();
      clients.prepend(b);
    }
    else{     //new user, make a tablinks
      clients.prepend('<b><button rel="' + data.roomId + '" class="tablinks"><span id="nick">' + data.name
        + "</span><br><span id='msg' style='font-weight: " + font_weight + "'>" + toTimeStr(data.time)
        + data.message +  "</span></button></b>"
      );
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

    if ($( "#user-rooms option:selected" ).val()=='全選') {
      for (let i=0; i < name_list.length;i++) {
        sendObj.roomId = name_list[i];
        socket.emit('send message agentChat', sendObj , (data) => {
          messageContent.append('<span class="error">' + data + "</span><br/>");
          console.log('this is name_list[i]');
          console.log(name_list[i]);
        });//snap=
      };//for
    }
    else if( $("#user-rooms option:selected" ).val()=='對可見用戶發送' ) {
      $('.tablinks:visible').each(function() {
        console.log($(this).attr('rel'));
        sendObj.roomId = $(this).attr('rel');
        socket.emit('send message agentChat', sendObj, (data) => {
          messageContent.append('<span class="error">' + data + "</span><br/>");
        });
      });

    }
    else {
      sendObj.roomId = $("#user-rooms option:selected").val();
      socket.emit('send message agentChat', sendObj, (data) => {
        messageContent.append('<span class="error">' + data + "</span><br/>");
      });//socket.emit

    }//else
    messageInput.val('');
  });
  //
  // function selectAll(){
  //   if ($( "#user-rooms option:selected" ).val()=='全選'){
  //     designated_user_id = name_list;
  //     select = 'true';
  //   }
  //   else{
  //     designated_user_id = $( "#user-rooms option:selected" ).val();
  //     select = 'false';
  //   }
  // }

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
      $("div #"+id+"-content"+" .message").css("display", "").off("click");

      $(this).css("color","");
    });
  }

  searchBox.on('keypress', function (e) {
    //not clean code ><,  just some search function
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code != 13) return;

    let searchStr = $(this).val().toLowerCase();
    if( searchStr == "" ) {
      displayAll();
    }
    else {
      let way = $('.searchSelect').val();
      if( way=="tag" || way=="remark" ) {
        displayAll();
        let wayStr = "";
        if( way=="tag" ) wayStr = "TAG";
        else if( way=="remark" ) wayStr = "備註";
        for( let i in roomProfiles ) {
          let text = roomProfiles[i][wayStr];
          if( text && text.toLowerCase().indexOf(searchStr)!=-1 ) {
            let userId = roomProfiles[i].userId;
            console.log("482, userId = "+userId+", i = "+i);
            $('.tablinks[rel="'+userId+'"]').css("color", COLOR.FIND);
          }
        }
      }
      else {
        $('.tablinks').each( function() {
          //find his content parent
          let id = $(this).attr('rel');
          let panel = $("div #"+id+"-content");

          //display searched msg & push #link when onclick
          panel.find(".message").each(function() {
            let text = $(this).find('.'+way).text();
            if( text.toLowerCase().indexOf(searchStr)!=-1 ) {
              $(this).css("display", "").on( "click", when_click_msg );
            }
            else $(this).css("display", "none");
            // +':containsi('+searchStr+')') )
          });

          //when onclick, get search_str msg # link
          function when_click_msg() {    //when clicing searched msg
            $(this).attr("id", "ref");    //msg immediately add link
            searchBox.val("");    //then cancel searching mode,
            displayAll();         //display all msg
            window.location.replace("/chatAll#ref"); //then jump to the #link added
            $(this).attr("id", "");   //last remove link
          };

          //if this customer already no msg...
          let color = "";
          panel.find(".message").each(function() {
            if($(this).css("display")!="none") {
              color = COLOR.FIND;
              return false;
            }
          });
          //then hide the customer's tablinks
          $(this).css("color", color);


          // panel.find(".message-day").each(function() {
          //   console.log("index: "+ panel.find('p').index( $(this) ) );
          // });

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


  function showProfile() {
    let target = $('#selected').attr('rel'); //get useridd of current selected user
    if( target==undefined ) {
      infoTable.html("please choose an user");
      return;
    }
    console.log("show profile of userId " + target);
    reload_tags();
    showTargetProfile(roomProfiles[target]);
  }
  function reload_tags(){
    infoTable.empty();

    infoTable.append( '<tr>'
      + '<th class="userInfo-th" id="name">name</th>'
      + '<th class="userInfo-td" id="roomName" type="text" set="single" modify="true"><p id="td-inner">尚未輸入<p></th>'
      + '<td class="edit-button yes " name="yes">yes</td>'
      + '<td class="edit-button no " name="no">no</td> </tr>'
    );
    infoTable.append( '<tr>'
      + '<th class="userInfo-th" id="roomId">roomId</th>'
      + '<th class="userInfo-td" id="roomId" type="text" modify="false"><p id="td-inner">尚未輸入<p></th>'
      + '<td class="edit-button yes " name="yes">yes</td>'
      + '<td class="edit-button no " name="no">no</td> </tr>'
    );
    infoTable.append( '<tr>'
      + '<th class="userInfo-th" id="description">description</th>'
      + '<th class="userInfo-td" id="description" type="text" set="multi" modify="true"><p id="td-inner">尚未輸入<p></th>'
      + '<td class="edit-button yes " name="yes">yes</td>'
      + '<td class="edit-button no " name="no">no</td> </tr>'
    );
  }

  function showTargetProfile(profile) {
    console.log(profile);
    buffer = JSON.parse(JSON.stringify(profile));   //clone object
    $('.userPhoto').attr('src', buffer.photo? buffer.photo: "" );

    $('.info_input_table .userInfo-td').each( function() {
      let data = buffer[ $(this).attr('id') ];
      let type = $(this).attr('type');
      let inner = $(this).find('#td-inner');

      if( data!=undefined && data!=null && data!="" ) {
        console.log("data of user's " + $(this).attr('id') + " found!");
        if( type=='text' ) inner.text(data);
        else if( type=='single_select' ) inner.val(data);
        else if( type=="multi_select" ) {
          inner.attr('data',data);
          inner.find('.multiselect-selected-text').text(data);
          let arr = data.split(',');

          inner.find('input').prop('checked', false);
          for( let j in arr ) {
            inner.find('input[value="' + arr[j] + '"]').prop('checked', true);
          }
        }
        else if( type=='time' ) {
          let d = new Date(data);
          inner.val(d.getFullYear()+'-'+addZero(d.getMonth()+1)+'-'+addZero(d.getDate())+'T'+addZero(d.getHours())+':'+addZero(d.getMinutes()));
        }
      }
      else {    ///if undefined, load default string, not prev string
        if( type=='text' ) inner.text("尚未輸入");
        else if( type=='single_select' ) inner.val("");
        else if( type=="multi_select" ) {
          inner.attr('data',"");
          inner.find('.multiselect-selected-text').text("");
          inner.find('input').attr('checked', false);
        }
        else if( type=='time' ) inner.val("");
      }
    });
  }

  function editProfile() {
    if( $(this).parent().children('.edit-button').is(':visible') ) return;
    else $(this).parent().children('.edit-button').show(); //show yes/no button
    ///on click, off click has some strange bug, so change way ><

    let type = $(this).attr('type');
    let set = $(this).attr('set');
    let text = $(this).find('#td-inner').text();

    if( type=='text' ) {
      if( set=='single' ) $(this).empty().html('<input type="text" class="textarea" id="td-inner" value="' + text +'" />');
      else if( set=='multi' ) $(this).empty().html('<textarea type="text" class="textarea" id="td-inner" rows="4" columns = "20" style="resize: none;" >'+text+'</textarea>');
      else console.log("error 646");
    }
    else if( type=='single_select' ) {
      //do nothing
    }
    else if( type=='time' ) {
      //do nothing
    }
    else if( type=='multi_select' ) {
      // $(this).empty().html('<input type="text" class="textarea" id="td-inner" value="' + text +'" />');
    }
    $(this).find('#td-inner').select();
  }

  // $(document).on('click', '#select-all', function(event) {multiselect_all(event.target);});
  //
  // function multiselect_all( box ) {
  //   console.log("select all !");
  //   if( $(box).prop('checked') == true ) {
  //     console.log("checked");
  //     $(box).parent().parent().find('input').prop('checked', 'checked');
  //   }
  //   else {
  //     console.log("UN");
  //     $(box).parent().parent().find('input').prop('checked', false);
  //   }
  // }

  function multiselect_change() {
    let boxes = $(this).find('input');
    let arr = [];
    boxes.each(function() {
      if( $(this).is(':checked') ) arr.push( $(this).val() );
    });
    if( arr.length==boxes.length ) arr="全選";
    else arr = arr.join(',');
    $(this).parent().find($('.multiselect-selected-text')).text(arr);
  }

  function changeProfile(edit) {
    let td = $(this).parent().children('.userInfo-td');
    let id = td.attr('id');
    let type = td.attr('type');
    let inner = td.find('#td-inner');

    $(this).parent().children('.edit-button').hide();  //hide yes/no button

    if( $(this).attr('name')=='yes' ){  //confirm edit, change data in buffer instead of DB
      let content;
      if( type=="text") {
        content = inner.val();
        if( !content ) content = "尚未輸入";
        td.html('<p id="td-inner">'+content+'</p>');
      }
      else if( type=='single_select' ) content = inner.val();
      else if( type=="multi_select" ) {
        content = inner.find('.multiselect-selected-text').text();
      }
      else if( type=="time" ) {
        content = new Date(inner.val()).getTime();
      }
      buffer[id] = content;
      console.log("content = "+content);
    }
    else{  //deny edit, restore data before editing
      let origin = buffer[id];
      if( origin==undefined ) origin = "";
      console.log("origin = "+origin);

      if( type=="text") {
        if( !origin ) origin = "尚未輸入";
        td.html('<p id="td-inner">'+origin+'</p>');
      }
      else if( type=='single_select' ) inner.val(origin);
      else if( type=="multi_select" ) {
        inner.find('.multiselect-selected-text').text(origin);

        inner.find('input').prop('checked', false);
        if( origin!=undefined && origin!="" && origin!=null ){
          let arr = origin.split(',');
          for( let j in arr ) inner.find('input[value="' + arr[j] + '"]').prop('checked', true);
        }
      }
      else if( type=="time" ) {
        let d = new Date(origin);
        console.log("date = "+d.toString());
        inner.val(d.getFullYear()+'-'+addZero(d.getMonth()+1)+'-'+addZero(d.getDate())+'T'+addZero(d.getHours())+':'+addZero(d.getMinutes()));
      }
    }
        // td.on('click',editProfile); //restore click of userInfo-td
        // console.log("open click"); //on click, off click has some bug QQ
  }

  function submitProfile() {
    if( $('.edit-button:visible').length>0 ) {
      alert('please check all tags change');
    }
    else if( confirm("Are you sure to change profile?") ){
      console.log(buffer);
      socket.emit('update profile agentChat',buffer);
      $('.modal').modal('hide');
      roomProfiles[buffer.roomId] = JSON.parse(JSON.stringify(buffer));   //clone object
      $('.tablinks[rel='+buffer.roomId+']').find('#nick').text(buffer.roomName);
    }
  }

  $(document).on('click','#userInfo-cancel',function() {
  });

  function historyMsg_to_Str( messages ) {
    let returnStr = "";
    let nowDateStr = "";
    let prevTime = 0;
    console.log(messages);
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
