$(document).ready(function() {
  var socket = io.connect();
  var users = $('#users');
  var messageForm = $('#send-message');
  var messageInput = $('#message');
  var messageContent = $('#chat');
  var clients = $('#clients');
  var idles = $('#idle-roomes');
  var printAgent = $('#printAgent');
  var canvas = $("#canvas");
  var searchBox = $('.searchBox');
  var name_list = [];
  var userProfiles = [];
  var person = "agentColman";
  var historyMsg_users = [];
  var historyMsg_agents = [];
  var user_list = []; // user list for checking on idle chat rooms
  var avgChatTime;
  var sumChatTime;
  var sortAvgBool = true;
  var sortTotalBool = true;
  var sortFirstBool = true;
  var sortRecentBool = true;
  var infoTable = $('.info_input_table');

  const COLOR = {
    FIND: "#A52A2A",
    CLICKED: "#ccc",
  }

  function clickMsg(){
    $("#selected").attr('id','').css("background-color", "");   //selected tablinks change, clean prev's color
    $(this).attr('id','selected').css("background-color",COLOR.CLICKED);    //clicked tablinks color

    if( $(this).find('span').css("font-weight")=="bold" ) {
      $(this).find('span').css("font-weight", "normal");                //read msg, let msg dis-bold
      socket.emit("read message", {id: $(this).attr('rel')} );          //tell socket that this user isnt unRead
    }

    var target = $(this).attr('rel');         //find the message canvas
    $("#"+target).show().siblings().hide();   //show it, and close others
    $('#user-rooms').val(target);             //change value in select bar
    $('#'+target+'-content').scrollTop($('#'+target+'-content')[0].scrollHeight);   //scroll to down

    console.log('click tablink executed');
  }
  function clickSpan() {  //close the message canvas
    let userId = $(this).parent().css("display", "none").attr("id");
    $(".tablinks[rel='" + userId +"'] ").attr("id", "").css("background-color","");   //clean tablinks color
  }

  function closeIdleRoomTry() {
    let early_time = Date.now() - 15*60*1000;        //15min before now
    let last = clients.find('.tablinks').last();      //last user in online room
    while( last && last.attr('data-recentTime') < early_time ) {    //while last of online user should push into idle room
      console.log("push " + last.attr('rel') + " to idle!");
      let b = last.parents('b');
      b.remove();
      idles.prepend(b);
      last = clients.find('.tablinks').last();
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
        item_move_down = $('[rel="'+user_list[i]+'"]').parent();
        $('#idle-roomes').append(item_move_down);
        $('#clients').find('[rel="'+user_list[i]+'"]').remove();
      }
      else {
        console.log('id = '+user_list[i]+' passed chat time');
        item_move_down = $('[rel="'+user_list[i]+'"]').parent();
        $('#clients').append(item_move_down);
        $('#idle-roomes').find('[rel="'+user_list[i]+'"]').remove();
      }
    }
    // console.log(user_list);

    user_list = [];
    convert_list = [];
    canvas_last_child_time_list = [];
  }
  setInterval(() => {
    closeIdleRoomTry();
  }, 20000)

  $(document).on('click', '.tablinks', clickMsg);
  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '.topright', clickSpan);
  $(document).on('click', '#userInfoBtn', showProfile);
  $(document).on('click', '.userInfo-td[modify="true"]', editProfile);
  $(document).on('click', '.edit-button', changeProfile);
  $(document).on('click','#userInfo-submit',submitProfile);

  if (window.location.pathname === '/chatAll') {
    console.log("Start loading history message...");
    setTimeout(function() {
      socket.emit('get json from back');
    }, 10);  //load history msg
    setTimeout(agentName, 100); //enter agent name
    setTimeout(function() {
      socket.emit("get tags from chat")
    }, 100);
  }

  socket.on('push json to front', (data) => {   //www emit data of history msg
    console.log("push json to front");
    for( i in data ) pushMsg(data[i]);    //one user do function one time
    sortUsers("recentTime", sortRecentBool, function(a,b){ return a<b; } );
    closeIdleRoomTry();
    $('.tablinks_head').text('Loading complete'); //origin text is "network loading"
  });

  function pushMsg(data){     //one user do function one time; data structure see file's end
    let historyMsg = data.Messages;
    let profile = data.Profile;

    let historyMsgStr = "<p class='message-day' style='text-align: center'><strong><i>"
      + "-------------------------------------------------------No More History Message-------------------------------------------------------"
      + "</i></strong></p>";    //history message string head

    let nowDateStr = "";
    let prevTime = 0;
    for( let i in historyMsg ) {    //this loop plus date info into history message, like "----Thu Aug 01 2017----"
      let d = new Date( historyMsg[i].time ).toDateString();   //get msg's date
      if( d != nowDateStr ) {  //if (now msg's date != previos msg's date), change day
        nowDateStr = d;
        historyMsgStr += "<p class='message-day' style='text-align: center'><strong>" + nowDateStr + "</strong></p>";  //plus date info
      }


      if( historyMsg[i].time - prevTime > 15*60*1000 ) { //if out of 15min section, new a section
        historyMsgStr += "<p class='message-day' style='text-align: center'><strong>" + toDateStr(historyMsg[i].time) + "</strong></p>";  //plus date info
      }
      prevTime = historyMsg[i].time;

      if( historyMsg[i].owner == "agent" ) {    //plus every history msg into string
        historyMsgStr += toAgentStr(historyMsg[i].message, historyMsg[i].name, historyMsg[i].time);
      }
      else historyMsgStr += toUserStr(historyMsg[i].message, historyMsg[i].name, historyMsg[i].time);
    }

    historyMsgStr += "<p class='message-day' style='text-align: center'><strong><italic>"
      + "-------------------------------------------------------Present Message-------------------------------------------------------"
      +" </italic></strong></p>";   //history message string tail

    canvas.append(    //push string into canvas
      "<div id=\"" + profile.userId + "\" class=\"tabcontent\"style=\"display: none;\">"
       + "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x&nbsp;&nbsp;&nbsp;</span>"
       + "<div id='" + profile.userId + "-content' class='messagePanel'>" + historyMsgStr + "</div>"
       + "</div>"
    );// close append
    $('#user-rooms').append('<option value="' + profile.userId + '">' + profile.nickname + '</option>');  //new a option in select bar

    let lastMsg = historyMsg[historyMsg.length-1];    //this part code is temporary
    let font_weight = profile.unRead ? "bold" : "normal";  //if last msg is by user, then assume the msg is unread by agent
    let lastMsgStr = "";
    lastMsgStr = "<br><span style='font-weight: "+ font_weight + "'>" + toTimeStr(lastMsg.time) + remove_href_msg(lastMsg.message) + "</span>";
    //display last message at tablinks

    let avgChatTime;
    let totalChatTime;
    let chatTimeCount;
    if( profile.recentChat != lastMsg.time) {   //it means database should update chat time of this user
      let timeArr = [];       //some calculate
      for( let i in historyMsg ) timeArr.push(historyMsg[i].time);
      let times = [];
      let i=0;
      const GAP = 1000*60*15; //15 min
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
      for( let j in times ) sum += times[j];
      sum /= 60000;
      totalChatTime = sum;
      avgChatTime = sum/times.length;
      chatTimeCount = times.length;
      if( isNaN(avgChatTime)||avgChatTime<1 ) avgChatTime = 1;
      if( isNaN(totalChatTime)||totalChatTime<1 ) totalChatTime = 1;

      socket.emit("update chat time", {   //tell www to update this user's chat time info
        id: profile.userId,
        avgTime: avgChatTime,
        totalTime: totalChatTime,
        chatTimeCount: chatTimeCount,
        recentTime: lastMsg.time
      });
      profile.avgTime = avgChatTime;
      profile.totalTime = totalChatTime;
      profile.chatTimeCount = chatTimeCount;
      profile.recentTime = lastMsg.time;
    }
    else {      //it means database dont need update, just get info from DB
      avgChatTime = profile.avgChat;
      totalChatTime = profile.totalChat;
      chatTimeCount = profile.chatTimeCount;
    }

    clients.append("<b><button rel=\""+profile.userId+"\" class=\"tablinks\""
      + "data-avgTime=\""+ avgChatTime +"\" "
      + "data-totalTime=\"" + totalChatTime +"\" "
      + "data-chatTimeCount=\"" + chatTimeCount +"\" "
      + "data-firstTime=\"" + profile.firstChat +"\" "
      + "data-recentTime=\"" + lastMsg.time +"\"> "
      + profile.nickname
      + lastMsgStr
      + "</button></b>"
    );    //new a tablinks

    name_list.push(profile.userId); //make a name list of all chated user
    userProfiles.push(profile);
  }

  function agentName() {    //enter agent name
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
      printAgent.append("Welcome <b>" + person + "</b>! You're now on board.");
    }
    else {
      window.location.replace("/");
    } //'name already taken'功能未做、push agent name 未做
  }
  socket.on("push tags to chat", data=> {
    console.log("data:");
    console.log(data);
    let count = 0;
    for( let i in data ) {
      let name = data[i].name;
      let type = data[i].type;
      let set = data[i].set;
      let modify = data[i].modify;
      let tdHtml = "";
      if( type=='text' ) tdHtml = '<p id="td-inner">尚未輸入<p>';
      else if( type=="time" && modify=="true" ) tdHtml = '<input type="datetime-local" id="td-inner"></input>';
      else if( type=="time" && modify=="false" ) tdHtml = '<input type="datetime-local" id="td-inner" readOnly></input>';
      else if( type=='single_select' ) {
        if( modify=="true" ) tdHtml = '<select id="td-inner">';
        else tdHtml = '<select id="td-inner" disabled>';
        for( let j in set ) tdHtml += '<option value="' + set[j] + '">' + set[j] + '</option>';
        tdHtml += '</select>';
      }
      else if( type=='multi_select' ) {
        tdHtml = '<div class="btn-group" id="td-inner" data="">';
        if( modify=="true") tdHtml += '<button type="button" data-toggle="dropdown" aria-expanded="false">';
        else tdHtml += '<button type="button" data-toggle="dropdown" aria-expanded="false" disabled>';
        tdHtml += '<span class="multiselect-selected-text"></span><b class="caret"></b></button>'
          + '<ul class="multiselect-container dropdown-menu">';
        for( let j in set ) tdHtml += '<li><input type="checkbox" value="' + set[j] + '">' + set[j] + '</li>';
        tdHtml += '</ul></div>';
      }
      infoTable.append( '<tr>'
        + '<th class="userInfo-th" id="' + name + '">' + name + '</th>'
        + '<th class="userInfo-td" id="' + name + '" type="' + type + '" set="' + set +'" modify="' + modify +'">' + tdHtml + '</th>'
        + '<td class="edit-button yes " name="yes">yes</td>'
        + '<td class="edit-button no " name="no">no</td> </tr>'
      );
    }
    $('.multiselect-container').on('change', function() {
      let arr = [];
      $(this).find('input').each(function() {
        if( $(this).is(':checked') ) arr.push( $(this).val() );
      });
      arr = arr.join(',');
      $(this).parent().attr("data", arr)
        .find($('.multiselect-selected-text')).text(arr);
    });
  });

  messageForm.submit((e) => {
    e.preventDefault();
    selectAll();

    if (Array.isArray(designated_user_id)) {
      for (var i=0; i < name_list.length;i++) {
        console.log(i+'at line212');
        socket.emit('send message2', {id: name_list[i] , msg: messageInput.val()}, (data) => {
          messageContent.append('<span class="error">' + data + "</span><br/>");
          console.log('this is designated_user_id[i]');
          console.log(designated_user_id[i]);
        });//snap=
      };//for
    }
    else {
      socket.emit('send message2', {id: designated_user_id , msg: messageInput.val()}, (data) => {
        messageContent.append('<span class="error">' + data + "</span><br/>");
      });//socket.emit

    }//else
    messageInput.val('');
  });
  function selectAll(){
    if ($( "#user-rooms option:selected" ).val()=='全選'){
      designated_user_id = name_list;
      select = 'true';
    }
    else{
      designated_user_id = $( "#user-rooms option:selected" ).val();
      select = 'false';
    }
  }

  socket.on('usernames', (data) => {    //maybe no use now
    var html = '';
    for (i = 0; i < data.length; i++) {
      html += data[i] + '<br />';
    }
    users.html(html);
  });


  /*  =================================  */

  socket.on('new message2', (data) => {   //if www push "new message2"
    console.log("Message get! identity = " + data.owner + ", name = " + data.name);
    //owner = "user", "agent" ; name = "Colman", "Ted", others...
    displayMessage( data ); //update canvas
    displayClient( data );  //update tablinks

    if( name_list.indexOf(data.id) == -1 ) {  //if its never chated user, push his name into name list
      name_list.push(data.id);
      console.log("push into name_list!");
    }
    else console.log("this msgOwner already exist");

    // messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  });

  function displayMessage( data ) {     //update canvas

    if (name_list.indexOf(data.id) !== -1) {    //if its chated user
      let str;
      if( data.owner == "agent" ) str = toAgentStr(data.message, data.name, data.time);
      else str = toUserStr(data.message, data.name, data.time);
      $("#" + data.id + "-content").append(str);    //push message into right canvas
      $('#'+data.id+'-content').scrollTop($('#'+data.id+'-content')[0].scrollHeight);  //scroll to down

    } //close if
    else {              //if its never chated user
      console.log('new user msg append to canvas');

      //THIS PART DIVIDE HISTORY MSG INTO DIFFERENT DAYS
      let historyMsgStr = "<p class='message-day' style='text-align: center'><strong><italic>"
        + "-------------------------------------------------------No More History Message-------------------------------------------------------"
        + "</italic></strong></p>";

      historyMsgStr += "<p class='message-day' style='text-align: center'><strong><italic>"
        + "-------------------------------------------------------Present Message-------------------------------------------------------"
        +" </italic></strong></p>";

      if( data.owner == "agent" ) historyMsgStr += toAgentStr(data.message, data.name, data.time);
      else historyMsgStr += toUserStr(data.message, data.name, data.time);

      canvas.append(      //new a canvas
        "<div id=\"" + data.id + "\" class=\"tabcontent\"style=\"display: none;\">"
        + "<span class=\"topright\">x&nbsp;</span>"
        + "<div id='" + data.id + "-content' class='messagePanel'>"
         + historyMsgStr
        + "</div></div>"
      );// close append

      $('#user-rooms').append('<option value="' + data.id + '">' + data.name + '</option>');
      //new a option in select bar
    }
  }//function

  function displayClient( data ) {    //update tablinks
    let font_weight = data.owner=="user" ? "bold" : "normal";   //if msg is by user, mark it unread

    if (name_list.indexOf(data.id) !== -1 ) {
      console.log('user existed');
      let target = $(".tablinks[rel='"+data.id+"']");
      target.find("span").text(toTimeStr(data.time)+remove_href_msg(data.message)).css("font-weight", font_weight);
      target.attr("data-recentTime", data.time);
      //update tablnks's last msg

      let b = target.parents('b'); //buttons to b
      b.remove();
      clients.prepend(b);
    }
    else{
      //new user, make a tablinks
      clients.prepend("<b><button rel=\"" + data.id + "\" class=\"tablinks\" >" + data.name
        + "<br><span style='font-weight: " + font_weight + "'>" + toTimeStr(data.time)
        + remove_href_msg(data.message) +  "</span></button></b>"
      );
    }
  } //close client function

  //extend jquery, let searching case insensitive
  $.extend($.expr[':'], {
    'containsi': function(elem, i, match, array) {
      return (elem.textContent || elem.innerText || '').toLowerCase()
      .indexOf((match[3] || "").toLowerCase()) >= 0;
    }
  });

  searchBox.change(function () {    //not clean code ><,  just some search function
    var searchStr = searchBox.val();

    if( searchStr == "" ) {
      displayAll();
    }
    else {
      $('.tablinks').each( function() {
        //find his content parent
        let id = $(this).attr('rel');
        let panel = $("div #"+id+"-content");
        //hide no search_str msg
        panel.find(".message").css("display", "none");

        //display searched msg & push #link when onclick
        panel.find(".message:containsi("+searchStr+")")
          .css("display", "").on( "click", when_click_msg );

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
  });   //end searchBox change func
  function displayAll() {
    $('.tablinks').each( function() {
      let id = $(this).attr('rel');
      $("div #"+id+"-content"+" .message").css("display", "").off("click");

      $(this).css("color","");
    });
  }

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

  function sortAvgChatTime() {
    sortUsers("avgTime", sortAvgBool, function(a,b){ return a<b; } );
    var tmp = !sortAvgBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortAvgBool = tmp;
  }
  function sortTotalChatTime() {
    sortUsers("totalTime", sortTotalBool, function(a,b){ return a<b; } );
    var tmp = !sortTotalBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortTotalBool = tmp;
  }
  function sortFirstChatTime() {
    sortUsers("firstTime", sortFirstBool, function(a,b){ return a>b; } );
    var tmp = !sortFirstBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortFirstBool = tmp;
  }
  function sortRecentChatTime() {
    sortUsers("recentTime", sortRecentBool, function(a,b){ return a<b; } );
    var tmp = !sortRecentBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortRecentBool = tmp;
  }


  var buffer;
  function showProfile() {
    let target = $('#selected').attr('rel'); //get useridd of current selected user
    if( target==undefined ) return;
    console.log("show profile of userId " + target);
    socket.emit('get profile',{id: target}) ;
  }
  socket.on('show profile',(data) => {
    buffer = data;

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
        console.log("data of user's " + $(this).attr('id') + " undefined!");
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

  });

  // function showProfile() {
  //   var target = $('#selected').attr('rel'); //get useridd of current selected user
  //   console.log("show profile");
  //   socket.emit('get profile',{id: target}) ;
  // }
  // socket.on('show profile',(data) => {
  //   var Th = $('.userInfo-th');
  //   var Td = $('.userInfo-td');
  //   var but = $('.edit-button');
  //   for(let i in but){but.eq(i).hide();}
  //   for(let i in Th ){Th.eq(i).text(Th.eq(i).attr('id')+' : ') ;}
  //   let key ;
  //   buffer = data ;  //storage profile in buffer zone
  //   Td.each( function() {
  //     key = $(this).attr('id');
  //     if( data.hasOwnProperty(key) ) $(this).text(data[key]); //show each profile data
  //     else $(this).text("");
  //     if(key == 'userId'||key == 'totalChat'){$(this).click(false);}  //disable editing of userid and totalchat
  //   });
  // });
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
        td.html('<p id="td-inner">'+content+'</p>');
      }
      else if( type=='single_select' ) content = inner.val();
      else if( type=="multi_select" ) {
        content = inner.attr('data');
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

      if( type=="text") td.html('<p id="td-inner">'+origin+'</p>');
      else if( type=='single_select' ) inner.val(origin);
      else if( type=="multi_select" ) {
        inner.attr('data',origin);
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
  }

    // td.on('click',editProfile); //restore click of userInfo-td
    // console.log("open click"); //on click, off click has some bug QQ

  function submitProfile() {
    let r = confirm("Are you sure to change profile?");
    if(r){
      console.log(buffer);
      socket.emit('update profile',buffer);
    }
  }


  function toAgentStr(msg, name, time) {
    return "<p class='message' rel='" + time + "' style='text-align: right;'>" + msg + "<strong> : " + name + toTimeStr(time) + "</strong><br/></p>";
  }
  function toUserStr(msg, name, time) {
    return "<p class='message' rel='" + time + "'><strong>" + name + toTimeStr(time) + ": </strong>" + msg + "<br/></p>";
  }

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

  function remove_href_msg(msg) {   //let last msg display correct, not well tested, may many bug
    // if( msg.indexOf('target="_blank"')!=-1 && msg.indexOf('href')!=-1 ) {
    //   let aPos = msg.indexOf('target="_blank"');
    //   let bPos = msg.indexOf('href');
    //   if( bPos>aPos ) { //image, video, audio, location
    //     if( msg.indexOf('image')!=-1 ) return "send a image";
    //     else if( msg.indexOf('audio')!=-1 ) return "send an audio";
    //     else if( msg.indexOf('video')!=-1 ) return "send a video";
    //     else if( msg.indexOf('https://www.google.com.tw/maps/') != -1) return "send a location";
    //   }
    //   else {  //url
    //     let cPos = msg.lastIndexOf('target');
    //     return msg.substring( bPos+6, cPos-2 ) ;
    //   }
    // }
    // else return msg;
    return msg;
  }


}); //document ready close tag


// Data: [
//   -KqMcXFiOawbOmg: {
//     Profile: {
//       nickname: "Nick",
//       userId: "U123456782452345",
//       unRead: true    //agent hasnt read user's newest msg yet
//       address: "",
//       age: 18,
//       telephone: "0987654321",
//       avgChat: 13,  //user chat for 13 min per times
//       totalChat: 39,  //user chat for 39 min totally
//       firstChat: 1501487574140,   //user's first chat time
//       recentChat: 1501577478051,  //user's recent chat time
//     },
//     Messages: [
//       0: {
//         owner: "user",  //"user" or "agent"
//         name: "Nick",   //"Nick", "AgentNick"
//         time: 15345674568,
//         message: "Hi there!"
//       },
//       1: {
//         owner: "agent",  //"user" or "agent"
//         name: "AgentNick",   //"Nick", "AgentNick"
//         time: 15345677568,
//         message: "Hi there!"
//       },
//     ]
//
//   },
//   -KqwedgKsdfyBssweoP: {
//
//   }.
// ]
