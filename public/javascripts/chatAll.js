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
//  var person = prompt("Please enter your name");
  var historyMsg_users = [];
  var historyMsg_agents = [];
  var avgChatTime;
  var sumChatTime;
  var sortAvgBool = true;
  const COLOR = {
    FIND: "rgb(255, 255, 192)",
    CLICKED: "#ccc",
  }

  function clickMsg(){
    //let the clicked tablinks change color, cancel previous clicked button's color
    let cleancolor = "";
    if( searchBox.val()!="" ) {
      cleancolor = COLOR.FIND;
    }
    $("#selected").attr('id','').css("background-color", cleancolor);   //clean other's color
    $(this).attr('id','selected').css("background-color",COLOR.CLICKED);    //clicked tablinks color
    $(this).find('span').css("font-weight", "normal");                //read msg, let msg dis-bold

    var target = $(this).attr('rel');         //find the message canvas
    $("#"+target).show().siblings().hide();   //show it, and close others
    $('#'+target+'-content').scrollTop($('#'+target+'-content')[0].scrollHeight);   //scroll to down

    console.log('click tablink executed');
  }
  function clickSpan() {  //close the message canvas
    let userId = $(this).parent().css("display", "none").attr("id");
    $(".tablinks[rel='" + userId +"'] ").attr("id", "").css("background-color","");   //clean tablinks color
  }

  $(document).on('click', '.tablinks', clickMsg);
  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '.topright', clickSpan);
  $(document).on('click', '#userInfoBtn', showProfile);
  $(document).on('click', '.userInfo-td', editProfile);
  $(document).on('click', '.edit-button', changeProfile);
  $(document).on('click','#userInfo-submit',submitProfile)
  //$(document).on('click', '.tablinks_head', sortAvgChatTime);

  if (window.location.pathname === '/chatAll') {
    console.log("Start loading history message...");
    setTimeout(loadMsg, 10);  //load history msg
    setTimeout(agentName, 300); //enter agent name
  }

  function loadMsg() {
    console.log("Start loading msg...");
    socket.emit('get json from back');    //emit a request to www, request for history msg
  } //end loadMsg func

  socket.on('push json to front', (data) => {   //www emit data of history msg
    console.log("push json to front");
    // console.log(data);          //console all history message
    for( i in data ) pushMsg(data[i]);    ///one user do function one time
    $('.tablinks_head').text('Loading complete'); //origin text is "network loading"
  });

  function pushMsg(data){     //one user do function one time; data structure see line 450
    let historyMsg = data.Messages;
    let profile = data.Profile;   ///PROFILE at here
    name_list.push(profile.userId); //make a name list of all chated user


    let historyMsgStr = "<p class='random-day' style='text-align: center'><strong><i>"
      + "-------------------------------------------------------No More History Message-------------------------------------------------------"
      + "</i></strong></p>";    //history message string head

    let nowDateStr = "";
    for( let i in historyMsg ) {    //this loop plus date info into history message, like "----Thu Aug 01 2017----"
      let d = new Date( historyMsg[i].time ).toDateString();   //get msg's date
      if( d != nowDateStr ) {  //if (now msg's date != previos msg's date), change day
        nowDateStr = d;
        historyMsgStr += "<p class='random-day' style='text-align: center'><strong>" + nowDateStr + "</strong></p>";  //plus date info
      }
      if( historyMsg[i].owner == "agent" ) {    //plus every history msg into string
        historyMsgStr += toAgentStr(historyMsg[i].message, historyMsg[i].name, historyMsg[i].time);
      }
      else historyMsgStr += toUserStr(historyMsg[i].message, historyMsg[i].name, historyMsg[i].time);
    }

    historyMsgStr += "<p class='random-day' style='text-align: center'><strong><italic>"
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
    let font_weight = lastMsg.owner=="user" ? "bold" : "normal";  //if last msg is by user, then assume the msg is unread by agent
    let lastMsgStr = "";
    lastMsgStr = "<br><span style='font-weight: "+ font_weight + "'>" + toTimeStr(lastMsg.time) + remove_href_msg(lastMsg.message) + "</span>";
    //display last message at tablinks

    let avgChatTime;
    let totalChatTime;
    if( profile.recentChat != lastMsg.time) {   //it means database should update chat time of this user
      let timeArr = [];       //some calculate
      for( let i in historyMsg ) timeArr.push(historyMsg[i].time);
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
      for( let j in times ) sum += times[j];
      sum /= 60000;
      totalChatTime = sum;
      avgChatTime = sum/times.length;
      console.log("total = " + totalChatTime);
      console.log("avg = ");
      console.log(avgChatTime);
      console.log("times.length = ");
      console.log(times.length);
      if( isNaN(avgChatTime)||avgChatTime<1 ) avgChatTime = 1;
      if( isNaN(totalChatTime)||totalChatTime<1 ) totalChatTime = 1;

      socket.emit("update chat time", {   //tell www to update this user's chat time info
        id: profile.userId,
        avgTime: avgChatTime,
        totalTime: totalChatTime,
        recentTime: lastMsg.time
      });
    }
    else {      //it means database dont need update, just get info from DB
      avgChatTime = profile.avgChat;
      totalChatTime = profile.totalChat;
    }

    clients.append("<b><button rel=\""+profile.userId+"\" class=\"tablinks\""
      + "data-avgTime=\""+ avgChatTime +"\" "
      + "data-totalTime=\"" + totalChatTime +"\" "
      + "data-firstTime=\"" + profile.firstChat +"\" "
      + "data-recentTime=\"" + lastMsg.time +"\"> "
      + profile.nickname
      + lastMsgStr
      + "</button></b>"
    );    //new a tablinks

  }

  function agentName() {    //enter agent name
    let userId = auth.currentUser.uid;

    database.ref('users/' + userId).on('value', snap => {
      let profInfo = snap.val();
      let profId = Object.keys(profInfo);
      let person = snap.child(profId[0]).val().username;
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
    });
  }

  messageForm.submit((e) => {   //submit to_send message to user
    e.preventDefault();
    let designated_user_id = $( "#user-rooms option:selected" ).val();
    socket.emit('send message2', {id: designated_user_id , msg: messageInput.val()}, (data) => {
      messageContent.append('<span class="error">' + data + "</span><br/>");
      //no this thing QQ
    });
    // socket.emit('send message', messageInput.val(), (data) => {
    //     messageContent.append('<span class="error">' + data + "</span><br/>");
    // });
    messageInput.val('');
  });

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
      let historyMsgStr = "<p class='random-day' style='text-align: center'><strong><italic>"
        + "-------------------------------------------------------No More History Message-------------------------------------------------------"
        + "</italic></strong></p>";

      historyMsgStr += "<p class='random-day' style='text-align: center'><strong><italic>"
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
      $(".tablinks[rel='"+data.id+"'] span").text(toTimeStr(data.time) + remove_href_msg(data.message)).css("font-weight", font_weight);
      //update tablnks's last msg
    }
    else{
      //new user, make a tablinks

      clients.append("<b><button rel=\"" + data.id + "\" class=\"tablinks\" >" + data.name
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

          window.location.replace("/chatAll#ref"); //then jump to the #link added
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

  $('.datepicker').datepicker({
    dateFormat: 'yy-mm-dd'
  });
  $('.filterClean').on('click', function() {
    $('#startdate').val('');
    $('#enddate').val('');
    $('#timeVal').val('');
    $('.tablinks').show();
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
    let time = parseInt($('#timeVal').val());

    if( isNaN(time) ) alert('pls input time value');
    else {
      $('.tablinks').each(function() {
        let val = $(this).attr('data-'+filterWay);
        $(this).hide();
        // console.log("updown val = ");
        // console.log()
        if( $('#up_down').val()=='>' && val>time ) $(this).show();
        else if( $('#up_down').val()=='<' && val<time ) $(this).show();
      });
    }
  });

  function toAgentStr(msg, name, time) {
    return "<p class='random' style='text-align: right;'>" + msg + "<strong> : " + name + toTimeStr(time) + "</strong><br/></p>";
  }
  function toUserStr(msg, name, time) {
    return "<p class='random'><strong>" + name + toTimeStr(time) + ": </strong>" + msg + "<br/></p>";
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

  function remove_href_msg(msg) {   ///let last msg display correct, not well tested, may many bug
    if(msg.indexOf('image')!=-1 ) return "send a image";
    else if( msg.indexOf('audio')!=-1 ) return "send an audio";
    else if( msg.indexOf('video')!=-1 ) return "send a video";
    else if( msg.indexOf('target="_blank"')!=-1 && msg.indexOf('href')!=-1 ) {
      let aPos = msg.indexOf('target="_blank"');
      let bPos = msg.indexOf('href');
      if( bPos>aPos ) { //image, video, audio, location
        if( msg.indexOf('image')!=-1 ) return "send a image";
        else if( msg.indexOf('audio')!=-1 ) return "send an audio";
        else if( msg.indexOf('video')!=-1 ) return "send a video";
        else if( msg.indexOf('https://www.google.com.tw/maps/') != -1) return "send a location";
      }
      else {  //url
        let cPos = msg.lastIndexOf('target');
        return msg.substring( bPos+6, cPos-2 ) ;
      }
    }
    else return msg;
  }
/*======================= warren ====================================*/
  var buffer;
  function showProfile() {
    var target = $('#selected').attr('rel'); //get useridd of current selected user
    console.log("show profile");
    socket.emit('get profile',{id: target}) ;
  }
  socket.on('show profile',(data) => {
    var Th = $('.userInfo-th') ;
    var Td = $('.userInfo-td') ;
    var but = $('.edit-button');
    for(let i in but){but.eq(i).hide();} //hide all yes/no buttons
    for(let i in Th ){Th.eq(i).text(Th.eq(i).attr('id')+' : ') ;}
    $('.modal-title').html(data.nickname);
    let key ;
    buffer = data ;  //storage profile in buffer zone
    for(let j in Td){
      for(let key in data ){
        if(key == Td.eq(j).attr('id')){
          Td.eq(j).text(data[key]); //show each profile data
          if(key == 'userId'||key == 'totalChat'){Td.eq(j).click(false);}  //disable editing of userid and totalchat
        }
      }
    }
  });
  function editProfile() {
    let name = $(this).attr('id');
    $(this).html('<input type="text" class="textarea" placeholder="'+name+'">');
    $(this).parent().children('.edit-button').show(); //show yes/no button
    $(this).children().focus(function () {
        $(this).click(false);  //disable click when editing
    })
  }
  function changeProfile(edit) {
    let id = $(this).parent().children('.userInfo-td').attr('id');
    let name = $(this).attr('name');
    let content =   $(this).parent().children('.userInfo-td').children().val();  //get agent's input
    let origin = '';

    for(let i in buffer){
        if(i == id ){
          origin = buffer[i]; //storage original profile data
        }
    }
    $(this).parent().children('.userInfo-td').on('click',editProfile); //restore click of userInfo-td
    $(this).parent().children('.edit-button').hide();  //hide yes/no button

    if(name == 'yes'){  //confirm edit, change data in buffer instead of DB
      for(let i in buffer){
        if(i == id ){
          buffer[i] = content ;
          $(this).parent().children('.userInfo-td').html(buffer[i]);
          break;
        }
      }
    }else{  //deny edit, restore data before editing
      $(this).parent().children('.userInfo-td').html(origin);
    }
  }
  function submitProfile() {
    let r = confirm("Are you sure to change profile?");
    if(r){
      socket.emit('update profile',buffer);
    }else{}
  }

  /*to receive other profile data go to chat All.ejs
  add tr/th/td whose id should be the profile data you want to add*/


//  socket.on('push profile',(data) =>{
  //  console.log("push profile");
    //let th = $('.info_input_table').children('th');
//    for(let i in th){th.innerText = th.id;}
  //})


}); //document ready close tag
