$(document).ready(function() {
  var socket = io.connect();    //socket
  // var unreadCount = 0;

  var users = $('#users');      //what's this
  var printAgent = $('#printAgent');  //agent welcome text
  var messageForm = $('#send-message'); //button for agent to send message
  var messageInput = $('#message');     //input for agent to send message
  var messageContent = $('#chat');      //what's this

  var clients = $('#clients');        //online rooms of tablinks
  var idles = $('#idle-roomes');      //idle rooms of tablinks
  var name_list = [];                 //list of all users
  var user_list = []; // user list for checking on idle chat rooms

  var canvas = $("#canvas");          //panel of message canvas
  var person = "agentColman";         //agent name
  var agentId;                        //agent ID in firebase

  const LOADING_MSG_AND_ICON = "<p class='message-day' style='text-align: center'><strong><i>"
    + "Loading History Messages..."
    + "</i></strong><span class='loadingIcon'></span></p>";
  const NO_HISTORY_MSG = "<p class='message-day' style='text-align: center'><strong><i>"
    + "-------------------------------------------------------No More History Message-------------------------------------------------------"
    + "</i></strong></p>";

  var searchBox = $('.searchBox');    //input of search box
  var sortRecentBool = true;          //bool for sort recent time up or down

  var userProfiles = [];              //array which store all user's profile
  var buffer;                         //buffer which store now user's profile
  var infoTable = $('.info_input_table'); //user info table
  var TagsData;                       //data of user info tags

  var filterDataBasic = {             //option of filter age, recent_chat_time, first_chat_time
    age:['0', '20', '30', '40', '50', '60', '60 up'],
    recent:['< 10 min', '10 min', '30 min', '60 min', '2 hr', '12 hr', '1 day', '1 week', '1 month', '1 month up'],
    first:['< 1 day', '1 day', '1 week', '2 week', '1 month', '3 month', '6 month', '1 year', '1 year up']
  };
  var filterDataCustomer = {};        //option of filter customized tags

  const COLOR = {
    FIND: "#A52A2A",
    CLICKED: "#ccc",
  }


  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '.tablinks', clickUserTablink); //open user's canvas
  $(document).on('click', '.topright', clickSpan);        //close now user's canvas
  $(document).on('click', '#userInfoBtn', showProfile);   //open user's profile
  $(document).on('click', '.userInfo-td[modify="true"]', editProfile);  //get into modify the column
  $(document).on('click', '.edit-button', changeProfile);   //confirm modify of single column
  $(document).on('click','#userInfo-submit',submitProfile); //confirm modify of user's whole profile
  $(document).on('change', '.multiselect-container', multiselect_change); //execute when multi-select change option
  $(document).on('click','.dropdown-menu', function(event){    //dont let dropdown-menu close by auto
    event.stopPropagation();
  });

  setInterval(() => {     //close idle room 1 time per 20 sec
    closeIdleRoomTry();
  }, 20000);

  if (window.location.pathname === '/chatAll') {
    console.log("Start loading history message...");
    setTimeout(function() {
      socket.emit('get json from back');    //send request for chat data to back-end
    }, 10);  //load history msg
    setTimeout(agentName, 1500); //enter agent name
    setTimeout(function() {   //send request for tag data to back-end
      socket.emit("get tags from chat");
    }, 10);
  }

  function closeIdleRoomTry() {
    let early_time = Date.now() - 15*60*1000;        //15min before now
    let last = clients.find('.tablinks:last');      //last user in online room
    while( last && last.attr('data-recentTime') < early_time ) {    //while last of online user should push into idle room
      let ele = last.parents('b');        //push last user
      ele.remove();                       //remove first
      idles.prepend(ele);                 //prepend to top of idle room
      last = clients.find('.tablinks:last');  //get next element of last online user
    }
  }

  function closeIdleRoom() {
    // declare current datetime and parse into ms
    // get the message sent time in ms
    let new_date = new Date();
    let over_fifteen_min = Date.parse(new_date);
    let canvas_last_child_time_list = [];
    //convert from htmlcollection to array
    let convert_list;
    // client list on the left needs to move down when idle more than a certain times
    let item_move_down;
    let item_move_up;
    // 這邊需要依照canvas裡面的聊天室做處理
    let canvas = document.getElementById('canvas');
    // check how many users are chatting
    let total_users = document.getElementById('canvas').children.length;
    // children under canvas
    let canvas_all_children = canvas.children;

    for(let i=0;i<total_users;i++) {
      user_list.push(canvas_all_children[i].getAttribute('id'));
      convert_list = Array.prototype.slice.call( canvas_all_children[i].getElementsByClassName("messagePanel")[0].getElementsByClassName("message") );
      canvas_last_child_time_list.push(convert_list.slice(-1)[0].getAttribute('rel'))
      if(over_fifteen_min - canvas_last_child_time_list[i] >= 60000) {
        // 更改display client的東西
        console.log('id = '+user_list[i]+' passed idle time');
        // item_move_down = $('[rel="'+user_list[i]+'"]').parent();
        $('#idle-roomes').append($('[rel="'+user_list[i]+'"]').parent());
        $('#clients').find('[rel="'+user_list[i]+'"]').remove();
      }
      else {
        console.log('id = '+user_list[i]+' passed chat time');
        // item_move_up = $('[rel="'+user_list[i]+'"]').parent();
        $('#clients').append($('[rel="'+user_list[i]+'"]').parent());
        $('#idle-roomes').find('[rel="'+user_list[i]+'"]').remove();
      }
    }
    user_list = [];
    convert_list = [];
    canvas_last_child_time_list = [];
  }

  socket.on('push json to front', (data) => {
    //www emit data of history msg
    console.log("push json to front");
    for( i in data ) pushMsg(data[i]);    //one user do function one time
    sortUsers("recentTime", sortRecentBool, function(a,b){ return a<b; } );   //sort users by recent time
    closeIdleRoomTry();
    $('.tablinks_head').text('Loading complete'); //origin text is "network loading"
  });
  function pushMsg(data){
    //one user do function one time; data structure see file's end
    let historyMsg = data.Messages;
    let profile = data.Profile;

    let historyMsgStr = "";
    if( data.position!=0 ) {    //if there's still history messages unloaded
      historyMsgStr += LOADING_MSG_AND_ICON;    //history message string head
    }
    else {
      historyMsgStr += NO_HISTORY_MSG   //history message string head
    }

    historyMsgStr += historyMsg_to_Str(historyMsg);
    historyMsgStr += "<p class='message-day' style='text-align: center'><strong><italic>"
      + "-------------------------------------------------------Present Message-------------------------------------------------------"
      +" </italic></strong></p>";   //history message string tail

    canvas.append(    //push string into canvas
      '<div id="' + profile.userId + '" class="tabcontent"style="display: none;">'
       + '<span class="topright">x&nbsp;&nbsp;&nbsp</span>'
       + "<div id='" + profile.userId + "-content' class='messagePanel' data-position='"+data.position+"'>"
        + historyMsgStr + "</div>"
       + "</div>"
    );// close append
    if( data.position!=0 ) $('#'+profile.userId+'-content').on('scroll', function() {
      detecetScrollTop( $(this) );
    });
    $('#user-rooms').append('<option value="' + profile.userId + '">' + profile.nickname + '</option>');  //new a option in select bar

    let lastMsg = historyMsg[historyMsg.length-1];
    let font_weight = profile.unRead ? "bold" : "normal";  //if last msg is by user, then assume the msg is unread by agent
    let lastMsgStr = '<br><span id="msg" style="font-weight: '+ font_weight + '">' + toTimeStr(lastMsg.time) + lastMsg.message + "</span>";
    //display last message at tablinks

    clients.append("<b><button rel=\""+profile.userId+"\" class=\"tablinks\""
      + "data-avgTime=\""+ profile.avgChat +"\" "
      + "data-totalTime=\"" + profile.totalChat +"\" "
      + "data-chatTimeCount=\"" + profile.chatTimeCount +"\" "
      + "data-firstTime=\"" + profile.firstChat +"\" "
      + "data-recentTime=\"" + lastMsg.time +"\"> "
      + '<span id="nick">' + profile.nickname + '</span>'
      + lastMsgStr
      + "</button></b>"
    );    //new a tablinks

    name_list.push(profile.userId); //make a name list of all chated user
    userProfiles[profile.userId] = profile;
  }

  function detecetScrollTop( ele ) {
    if( ele.scrollTop()==0 ) {    //if scroll to top of canvas
      let tail = parseInt(ele.attr('data-position'));   //get early 20 messages of this user canvas
      let head = parseInt(ele.attr('data-position')) - 20;
      if( head<0 ) head = 0;
      let request = {       //socket object
        userId: ele.parent().attr('id'),    //userid
        head: head,                   //to get messages's index head
        tail: tail                    //to get messages's index tail
      };
      if( head==0 ) ele.off('scroll');    //if no more unloaded messages, stop detect scroll to top event
      ele.attr('data-position', head);    //if some messages unloaded yet, update head of messages index
      socket.emit('upload history msg from front', request);  //send request for early messages
      console.log('upload! head = '+head+', tail = '+tail);
    }
  }
  socket.on('upload history msg from back', data=>{
    //get response of early messages
    console.log('get uploaded history msg');
    let msgContent = $('#'+data.userId+'-content');

    let origin_height = msgContent[0].scrollHeight;
    msgContent.find('.message:first').remove();
    msgContent.find('.message-day:lt(3)').remove();

    msgContent.prepend(historyMsg_to_Str(data.messages));
    let now_height = msgContent[0].scrollHeight;
    msgContent.animate({scrollTop: now_height - origin_height}, 0);

    if( msgContent.attr('data-position')>0 ) msgContent.prepend(LOADING_MSG_AND_ICON);
    else msgContent.prepend(NO_HISTORY_MSG);
  });

  function agentName() {
    //enter agent name
    agentId = auth.currentUser.uid;
    database.ref('users/' + agentId).once('value', snap => {
      let profInfo = snap.val();
      let profId = Object.keys(profInfo);
      person = profInfo.nickname;  //從DB獲取agent的nickname

      if (person != '' && person != null) {
        socket.emit('new user', person, (data) => {
          if(data){}   //check whether username is already taken
          else {
            alert('username is already taken');
            person = prompt("Please enter your name");  //update new username
            database.ref('users/' + agentId ).update({nickname : person});
          }
        });
      }
      else{
        person = prompt("Please enter your name");  //if username not exist,update username
        database.ref('users/' + agentId ).update({nickname : person});
      }
      printAgent.html("Welcome <b>" + person + "</b>! You're now on board.");
    });
  }

  function clickUserTablink(){
    $("#selected").removeAttr('id').css("background-color", "");   //selected tablinks change, clean prev's color
    $(this).attr('id','selected').css("background-color",COLOR.CLICKED);    //clicked tablinks color

    if( $(this).find('#msg').css("font-weight")=="bold" ) {
      $(this).find('#msg').css("font-weight", "normal");                //read msg, let msg dis-bold
      socket.emit("read message", {id: $(this).attr('rel')} );          //tell socket that this user isnt unRead
    }

    let target = $(this).attr('rel');         //find the message canvas
    $("#"+target).show().siblings().hide();   //show it, and close others
    $('#user-rooms').val(target);             //change value in select bar
    $('#'+target+'-content').scrollTop($('#'+target+'-content')[0].scrollHeight);   //scroll to down

    console.log('click tablink executed');
  }

  function clickSpan() {
    //close the message canvas
    let userId = $(this).parent().hide().attr("id");
    $(".tablinks[rel='" + userId +"'] ").removeAttr('id').css("background-color", "");   //clean tablinks color
  }

  socket.on('new message2', (data) => {
     //if www push "new message2"
    console.log("Message get! identity=" + data.owner + ", name=" + data.name);
    //owner = "user", "agent" ; name = "Colman", "Ted", others...
    displayMessage( data ); //update canvas
    displayClient( data );  //update tablinks

    if( data.owner=="user" ) change_document_title(data.name);    //not done yet
    if( name_list.indexOf(data.id) == -1 ) {  //if its never chated user, push his name into name list
      name_list.push(data.id);
      console.log("new user!!! push into name_list!");
    }
  });

  function displayMessage( data ) {
    //update canvas
    if (name_list.indexOf(data.id) !== -1) {    //if its chated user
      let str;

      let designated_chat_room_msg_time = $("#" + data.id + "-content").find(".message:last").attr('rel');
      if(data.time - designated_chat_room_msg_time >= 900000){    // 如果現在時間多上一筆聊天記錄15分鐘
        $("#" + data.id + "-content").append('<p class="message-day" style="text-align: center"><strong>-------------------New Session starts-------------------</strong></p>');
      }
      if( data.owner == "agent" ) str = toAgentStr(data.message, data.name, data.time);
      else str = toUserStr(data.message, data.name, data.time);

      $("#" + data.id + "-content").append(str);    //push message into right canvas
      $('#'+data.id+'-content').scrollTop($('#'+data.id+'-content')[0].scrollHeight);  //scroll to down
    } //close if
    else {              //if its never chated user
      let historyMsgStr = NO_HISTORY_MSG;

      if( data.owner == "agent" ) historyMsgStr += toAgentStr(data.message, data.name, data.time);
      else historyMsgStr += toUserStr(data.message, data.name, data.time);

      canvas.append(      //new a canvas
        '<div id="'+data.id+'" class="tabcontent" style="display: none;">'
        + '<span class="topright">x&nbsp;</span>'
        + '<div id="'+data.id+'-content" class="messagePanel">'
         + historyMsgStr
        + '</div></div>'
      );// close append

      $('#user-rooms').append('<option value="'+data.id+'">' +data.name+ '</option>');  //new a option in select bar
    }
  }//function

  function displayClient( data ) {
    //update tablinks
    let font_weight = data.owner=="user" ? "bold" : "normal";   //if msg is by user, mark it unread

    if (name_list.indexOf(data.id) !== -1 ) {
      let target = $(".tablinks[rel='"+data.id+"']");
      target.find("#msg").html( toTimeStr(data.time)+data.message ).css( "font-weight", font_weight );
      target.attr("data-recentTime", data.time);
      //update tablnks's last msg

      let ele = target.parents('b'); //buttons to b
      ele.remove();
      clients.prepend(ele);
    }
    else{     //new user, make a tablinks
      clients.prepend('<b><button rel="' + data.id + '" class="tablinks"><span id="nick">' + data.name
        + "</span><br><span id='msg' style='font-weight: " + font_weight + "'>" + toTimeStr(data.time)
        + data.message +  "</span></button></b>"
      );
    }
  } //close client function
  socket.on('new user profile', function(data){
    console.log('new user come in from www!');
    console.log(data);
    userProfiles[data.userId] = data;
  });

  messageForm.submit((e) => {
    e.preventDefault();
    let sendObj = {
      id: "",
      msg: messageInput.val(),
      msgtime: Date.now()
    };

    if( $("#user-rooms option:selected").val() == '全選' ) {
      name_list.map( function(id) {
        sendObj.id = id;
        socket.emit('send message2', sendObj);
      })
    }
    else if( $("#user-rooms option:selected").val() == '對可見用戶發送' ) {
      $('.tablinks:visible').each(function() {
        sendObj.id = $(this).attr('rel');
        socket.emit('send message2', sendObj);
      });
    }
    else {
      sendObj.id = $("#user-rooms option:selected").val();
      socket.emit('send message2', sendObj);//socket.emit
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

  socket.on("push tags to chat", data=> {
    TagsData = data;
    initialFilterWay();
    initialFilterSilder();
  });

  function initialFilterWay() {
    if( !TagsData ) return;

    TagsData.map( function(ele) {
      if( ele.type.indexOf('select')!=-1 ) {
        filterDataCustomer[ele.name] = ele.set;
      }
    });

    console.log("filterDataCustomer: ");
    console.log(filterDataCustomer);
    for( let way in filterDataCustomer ) {
      $('#selectBy').append('<li><input type="checkbox" value="filter_'+way+'">'+way+'</li>');
      $('.filterPanel').append(
        '<div class="filterUnit filterBar btn-group" id="filter_'+way+'" style="display:none;">'
        + '<button data-toggle="dropdown" aria-expanded="false">'
        + way + ':<span class="multiselect-selected-text">全選</span>'
        + '<b class="caret"></b></button>'
        + '<ul class="multiselect-container dropdown-menu">'
        + '<div class="filterSelect" id="'+way+'">'
        + '</div></ul></div>'
      );

      filterDataCustomer[way].map( function(option) {
        $('.filterSelect#'+way).append('<li><input type="checkbox" value="'+option+'" checked>'+option+'</li>');
      });
    }
  }

  function initialFilterSilder() {
    $('.filterSlider').slider({
      orientation: "vertical",
      range: true,
      min: 0,
      step: 1,
      values: [-100, 100]
    }).each(function() {
      let id = $(this).attr('id');
      $(this).slider( "option", "max", filterDataBasic[id].length-1 );
      let count = $(this).slider("option", "max") - $(this).slider("option", "min");
      for (let i in filterDataBasic[id]) {
        var el = $('<label>' + filterDataBasic[id][i] + '</label>').css('top', 100-(i/count*100) + '%');
        $(this).append(el);
      }
    });

    $('.filterSlider#age').slider( "option", "change", function(event, ui){
      let data = filterDataBasic["age"];
      let values = $(this).slider("values");
      let str = "";
      let min = 0;
      let max = 999;
      if( values[1]-values[0] == data.length-1 ) str="全選";
      else if( values[1]==values[0] ) str="未篩選";
      else {
        str = data[values[0]] + "~" + data[values[1]];
        min = parseInt( data[values[0]] );
        if( data[values[1]].indexOf('up')==-1 ) max = parseInt( data[values[1]] );
      }
      $(this).parent().parent().find('.multiselect-selected-text').text(str).attr('min',min).attr('max',max);
    });

    function toTimeStamp(str) {
      if( str.indexOf('up')!=-1 ) return 9999999999999;
      else if( str.indexOf('<')!=-1 ) return -99999;

      let num = parseInt(str);
      let unit = str.substr(str.indexOf(' ')+1);
      if( unit=='min' ) return num*1000*60;
      else if( unit=='hr' ) return num*1000*60*60;
      else if( unit=='day' ) return num*1000*60*60*24;
      else if( unit=='week' )  return num*1000*60*60*24*7;
      else if( unit=='month' )  return num*1000*60*60*24*30;
      else if( unit=='year' )  return num*1000*60*60*24*365;
    }
    $('.filterSlider#recent').slider( "option", "change", function(event, ui){
      let data = filterDataBasic["recent"];
      let values = $(this).slider("values");
      let str = "";
      let min = -99999;
      let max = 9999999999999;
      if( values[1]-values[0] == data.length-1 ) str="全選";
      else if( values[1]==values[0] ) str="未篩選";
      else {
        str = data[values[0]] + "~" + data[values[1]];
        min = toTimeStamp( data[values[0]] );
        max = toTimeStamp( data[values[1]] );
      }
      $(this).parent().parent().find('.multiselect-selected-text').text(str).attr('min',min).attr('max',max);
    });
    $('.filterSlider#first').slider( "option", "change", function(event, ui){
      let data = filterDataBasic["first"];
      let values = $(this).slider("values");
      let str = "";
      let min = -99999;
      let max = 9999999999999;
      if( values[1]-values[0] == data.length-1 ) str="全選";
      else if( values[1]==values[0] ) str="未篩選";
      else {
        str = data[values[0]] + "~" + data[values[1]];
        min = toTimeStamp( data[values[0]] );
        max = toTimeStamp( data[values[1]] );
      }
      $(this).parent().parent().find('.multiselect-selected-text').text(str).attr('min',min).attr('max',max);
    });
  }

  $('#selectBy').on('change',function() {
    let selected = [];
    if( $(this).find('input:checked').length>5 ) {
      $(this).find('#warning').text('at most 5 filter way');
      return;
    }
    else {
      $(this).find('#warning').html('&nbsp;');
      $(this).find('input:checked').each(function() {
        selected.push($(this).attr('value'));
      });
      $('.filterBar').each(function() {
        let filter_way = $(this).attr('id');
        if( selected.indexOf(filter_way)!=-1 ) $(this).show();
        else $(this).hide();
      });
    }
  });

  $('#filterBtn').on('click', function() {
    $('.tablinks').each(function() {
      $(this).show();
      let userId = $(this).attr('rel');
      let profile = userProfiles[userId];
      console.log("now filter user "+userId+", profile:");
      console.log(profile);

      if( $('#filter_age').is(':visible') ) {
        let user_option = profile['年齡'];
        if( user_option ) {
          let user_age = parseInt(user_option);
          let min = $('#filter_age .multiselect-selected-text').attr('min');
          let max = $('#filter_age .multiselect-selected-text').attr('max');
          console.log("user_age = "+user_age + ", min="+min+",max="+max);
          if( user_age < min || user_age > max ) {
            $(this).hide();
            return;
          }
        }
      }
      if( $('#filter_place').is(':visible') ) {
        user_option = profile['地區'];
        select_option = $('#filter_place .multiselect-selected-text').text();
        if( user_option && select_option!="全選") {
          console.log(userId+" place = "+user_option + "select_option = "+select_option);
          if( select_option.indexOf(user_option)==-1 ) {
            $(this).hide();
            return;
          }
        }
      }

      if( $('#filter_recent').is(':visible') ) {
        user_option = profile['上次聊天時間'];
        if( user_option ) {
          let min = $('#filter_recent .multiselect-selected-text').attr('min');
          let max = $('#filter_recent .multiselect-selected-text').attr('max');
          let user_time_gap = Date.now()-user_option;
          console.log("user_option = "+user_option + " user_time_gap = "+user_time_gap+" min="+min+",max="+max);
          if( user_time_gap < min || user_time_gap > max ) {
            $(this).hide();
            return;
          }
        }
      }
      if( $('#filter_first').is(':visible') ) {
        user_option = profile['firstChat'];
        if( user_option ) {
          let min = $('#filter_first .multiselect-selected-text').attr('min');
          let max = $('#filter_first .multiselect-selected-text').attr('max');
          let user_time_gap = Date.now() - user_option;
          console.log(" user_option = "+user_option + " user_time_gap = "+user_time_gap+" min="+min+",max="+max);
          if( user_time_gap < min || user_time_gap > max ) {
            $(this).hide();
            return;
          }
        }
      }

      for( let way in filterDataCustomer ) {
        if( $('#filter_'+way).is(':visible') ) {
          user_option = profile[way];
          select_option = $('#filter_'+way+' .multiselect-selected-text').text();
          if( select_option!="全選") {
            if( !user_option ) {
              $(this).hide();
              return;
            }
            console.log(userId+", "+way+"="+user_option + ", select_option="+select_option);
            user_option = user_option.split(',');
            console.log(user_option);
            let i;
            for( i=0; i<user_option.length; i++ ) {
              if( select_option.indexOf(user_option[i])!=-1 ) break;
            }
            if( i==user_option.length ) {
              $(this).hide();
              return;
            }
          }
        }
      }

    });
  });
  $('#filterBtn-clean').on('click', function() {
    $('.tablinks').show();
    $('.filterSlider').slider("values",[0,999]);
    $('.filterBar .filterSelect').find('input[type="checkbox"]').prop('checked',true);
    $('.filterSelect').parent().parent().find('.multiselect-selected-text').text('全選');
  });

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
      if( way=="remark" ) {
        displayAll();
        for( let i in userProfiles ) {
          let text = userProfiles[i]["備註"];
          if( text && text.toLowerCase().indexOf(searchStr)!=-1 ) {
            let userId = userProfiles[i].userId;
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
          let color = "";
          panel.find(".message").each(function() {
            let text = $(this).find('.'+way).text();
            if( text.toLowerCase().indexOf(searchStr)!=-1 ) {
              color = COLOR.FIND;
              $(this).show().on( "click", when_click_msg );
            }
            else $(this).hide();
            // +':containsi('+searchStr+')') )
          });
          $(this).css("color", color);

          //when onclick, get search_str msg # link
          function when_click_msg() {    //when clicing searched msg
            $(this).attr("id", "ref");    //msg immediately add link
            searchBox.val("");    //then cancel searching mode,
            displayAll();         //display all msg
            window.location.replace("/chatAll#ref"); //then jump to the #link added
            $(this).removeAttr("id");   //last remove link
          };
        });
      }

    }
  });   //end searchBox change func

  $('.datepicker').datepicker({
    dateFormat: 'yy-mm-dd'
  });
  $('.filterClean').on('click', function() {
    $('#startdate').val('');
    $('#enddate').val('');
    $('.tablinks').show();
    searchBox.val('');
    displayAll();
  })
  $('.filterDate').on('click', function(){
      let filterWay = $(this).attr('id');
      let startTime = new Date($('#startdate').val()).getTime();
      let endTime = new Date($('#enddate').val()).getTime();

      if(startTime>endTime) alert('startTime must early then endTime');
      else {
        $('.tablinks').each(function() {
          let val = $(this).attr('data-'+filterWay);
          if( val<startTime || val>(endTime+86400000) ) $(this).hide();
          else $(this).show();
        });
      }
  });
  $('.filterTime').on('click', function(){
    $('#startdate').val('');
    $('#enddate').val('');

    let filterWay = $(this).attr('id');
    let val = $('#filterTimeSelect').val();
    let a;  let b;
    if( val==0) { a=0; b=5; }
    else if( val==1) { a= 5; b=10; }
    else if( val==2) { a=10; b=30; }
    else if( val==3) { a=30; b=60; }
    else if( val==4) { a=60; b=9999999; }
    else alert(val);

    $('.tablinks').each(function() {
      let val = $(this).attr('data-'+filterWay);
      if( val>a && val<b ) $(this).show();
      else $(this).hide();
    });
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
  function sortRecentChatTime() {
    sortUsers("recentTime", sortRecentBool, function(a,b){ return a<b; } );
    sortRecentBool = !sortRecentBool;
  }


  function showProfile() {
    let target = $('#selected').attr('rel'); //get useridd of current selected user
    if( target==undefined ) {
      infoTable.html("please choose an user");
      return;
    }
    console.log("show profile of userId " + target);
    reload_tags();
    showTargetProfile(userProfiles[target]);
  }
  function reload_tags(){
    infoTable.empty();
    for( let i in TagsData ) {
      let name = TagsData[i].name;
      let type = TagsData[i].type;
      let set = TagsData[i].set;
      let modify = TagsData[i].modify;
      let tdHtml = "";
      if( type=='text' ) tdHtml = '<p id="td-inner">尚未輸入<p>';
      else if( type=="time" && modify==true ) tdHtml = '<input type="datetime-local" id="td-inner"></input>';
      else if( type=="time" && modify==false ) tdHtml = '<input type="datetime-local" id="td-inner" readOnly></input>';
      else if( type=='single_select' ) {
        if( modify==true ) tdHtml = '<select id="td-inner">';
        else tdHtml = '<select id="td-inner" disabled>';
        for( let j in set ) tdHtml += '<option value="' + set[j] + '">' + set[j] + '</option>';
        tdHtml += '</select>';
      }
      else if( type=='multi_select' ) {
        tdHtml = '<div class="btn-group" id="td-inner" data="">';
        if( modify==true) tdHtml += '<button type="button" data-toggle="dropdown" aria-expanded="false">';
        else tdHtml += '<button type="button" data-toggle="dropdown" aria-expanded="false" disabled>';
        tdHtml += '<span class="multiselect-selected-text"></span><b class="caret"></b></button>'
          + '<ul class="multiselect-container dropdown-menu">';
          // + '<li><button value="全選" id="select-all">全選</li>';
        for( let j in set ) tdHtml += '<li><input type="checkbox" value="' + set[j] + '">' + set[j] + '</li>';
        tdHtml += '</ul></div>';
      }
      infoTable.append( '<tr>'
        + '<th class="userInfo-th" id="' + name + '">' + name + '</th>'
        + '<th class="userInfo-td" id="' + name + '" type="' + type + '" set="' + set +'" modify="' + modify +'">' + tdHtml + '</th>'
        + '<td class="edit-button yes" name="yes">yes</td>'
        + '<td class="edit-button no" name="no">no</td>'
        + '</tr>'
      );
    }
  }

  function showTargetProfile(profile) {
    buffer = JSON.parse(JSON.stringify(profile));   //clone object
    $('.userPhoto').attr('src', buffer.photo? buffer.photo: "" );

    $('.info_input_table .userInfo-td').each(function() {
      let data = buffer[ $(this).attr('id') ];
      let type = $(this).attr('type');
      let inner = $(this).find('#td-inner');

      if( data ) {
        if( type=='text' ) inner.text(data);
        else if( type=='single_select' ) inner.val(data);
        else if( type=="multi_select" ) {
          inner.attr('data',data);
          inner.find('.multiselect-selected-text').text(data);

          let arr = data.split(',');
          inner.find('input').each(function() {
            if( arr.indexOf( $(this).val() ) != -1 ) $(this).prop('checked', true);
            else $(this).prop('checked', false);
          });
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
      else if( set=='multi' ) $(this).empty().html('<textarea type="text" class="textarea" id="td-inner" rows="4" columns="20" style="resize: none;" >'+text+'</textarea>');
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

      if( type=="text") {
        if( !origin ) origin = "尚未輸入";
        td.html('<p id="td-inner">'+origin+'</p>');
      }
      else if( type=='single_select' ) inner.val(origin);
      else if( type=="multi_select" ) {
        inner.find('.multiselect-selected-text').text(origin);

        inner.find('input').prop('checked', false);
        if( origin ){
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
  }

  function submitProfile() {
    if( $('.edit-button:visible').length>0 ) {
      alert('please check all tags change');
    }
    else if( confirm("Are you sure to change profile?") ){
      console.log(buffer);
      socket.emit('update profile',buffer);
      $('.modal').modal('hide');
      userProfiles[buffer.userId] = JSON.parse(JSON.stringify(buffer));   //clone object
      $('.tablinks[rel='+buffer.userId+']').find('#nick').text(buffer.nickname);
    }
  }

  $(document).on('click','#userInfo-cancel', function() {
  });

  $(document).on('click', '#addCalendar-submit', function() {
    console.log("addCalendar submit");
    let title      = $('#title #td-inner').val();
    let start_date = $('#start_date #td-inner').val();
    let end_date   = $('#end_date #td-inner').val();
    let description = $('#description #td-inner').val();
    let allDay = $('#allday').prop('checked');

    let flag = true;
    if( !title || !start_date || !end_date ) {
      $('#cal-error-msg').show();
      flag = false;
    }
    else $('#cal-error-msg').hide();

    if( Date.parse(end_date) <= Date.parse(start_date) ) {
      $('#tim-error-msg').show();
      flag = false;
    }
    else $('#tim-error-msg').hide();

    if( !flag ) return;

    if( allDay ) {
      start_date = ISODateString( start_date );
      end_date = ISOEndDate( end_date );
    }
    let obj = {
      title: title,
      start: start_date,
      end: end_date,
      description: description,
      allDay: allDay
    };
    database.ref('cal-events/' + agentId ).push(obj);

    $('#addCalendarModal').modal('hide');
    $('#addCalendar-clear').click();
  });   //end on click

  socket.on('chat calendar remind', function(data) {
    $('#title #td-inner').val('待辦事項 '+data.userName);
    $('#start_date #td-inner').val(ISODateTimeString(Date.now()));
    $('#end_date #td-inner').val(ISODateString(data.date));
    $('#description #td-inner').val("UID = "+data.userId + "\n"+data.msg);

    let animate_count = 0;
    let calendar_icon_animate = setInterval( function() {
      let icon = $('#add-calendar-icon');
      if( animate_count%2 ) icon.css('background-color', "");
      else icon.css('background-color', "red");
      if( animate_count>10 ) clearInterval(calendar_icon_animate);
      else animate_count++;
    }, 500);
  });

  $(document).on('click', '#addCalendar-clear', function() {
    $('#title #td-inner').val('');
    $('#start_date #td-inner').val('');
    $('#end_date #td-inner').val('');
    $('#description #td-inner').val('');
    $('#allday').prop('checked', false);
  })

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

      if( messages[i].owner == "agent" ) {    //plus every history msg into string
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

  function ISOEndDate(d) {
    d = new Date(d);
    if( d.getHours()==0 && d.getMinutes()==0 ) return ISODateString( d );
    else return ISODateString( moment(d).add('days', 1) );
  }
  function ISODateString(d) {
    d = new Date(d);
    return d.getFullYear()+'-'
         + addZero(d.getMonth()+1)+'-'
         + addZero(d.getDate())+'T'
         + '00:00';
  }
  function ISODateTimeString(d) {
    d = new Date(d);
    function pad(n) {return n<10 ? '0'+n : n}
    return d.getFullYear()+'-'
         + pad(d.getMonth()+1)+'-'
         + pad(d.getDate())+'T'
         + pad(d.getHours())+':'
         + pad(d.getMinutes());
  }

  function change_document_title(name) {
    // $(document).prop('title', 'SHEILD chat ver2');
  }
  function addZero(val){
    return val<10 ? '0'+val : val;
  }
}); //document ready close tag