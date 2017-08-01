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

  function clickMsg(){
    //let the clicked tablinks change color, cancel previous clicked button's color
    let cleancolor = "";
    if( searchBox.val()!="" ) {
      cleancolor = COLOR.FIND;
    }
    $("#selected").attr('id','').css("background-color", cleancolor);
    $(this).attr('id','selected').css("background-color",COLOR.CLICKED);
    $(this).find('span').css("font-weight", "normal");

    var target = $(this).attr('rel');
    $("#"+target).show().siblings().hide();
    $('#'+target+'-content').scrollTop($('#'+target+'-content')[0].scrollHeight);

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

  if (window.location.pathname === '/chatAll') {
    console.log("Start loading history message...");
    setTimeout(loadMsg, 10);
    setTimeout(agentName, 100);
    //   setTimeout(loadMsg, 100);
  } // set agent name

  function loadMsg() {
    console.log("Start loading msg...");
    socket.emit('get json from back');
  } //end loadMsg func

  socket.on('push json to front', (data) => {
    console.log("push json to front");
    console.log(data);
    for( i in data ) pushMsg(data[i]);    ///one user do function one time
    $('.tablinks_head').text('Loading complete');
  });

  function pushMsg(data){
    let historyMsg = data.Messages;
    let profile = data.Profile;   ///PROFILE at here
    name_list.push(profile.userId);

    console.log("data messages:");
    console.log(historyMsg);

    let historyMsgStr = "<p class='random-day' style='text-align: center'><strong><i>"
      + "-------------------------------------------------------No More History Message-------------------------------------------------------"
      + "</i></strong></p>";
    let nowDateStr = "";
    for( let i in historyMsg ) {
      let d = new Date( historyMsg[i].time );
      if( d.toDateString()!=nowDateStr ) {  //change day
        nowDateStr = d.toDateString();
        historyMsgStr += "<p class='random-day' style='text-align: center'><strong>" + nowDateStr + "</strong></p>";
      }
      if( historyMsg[i].owner == "agent" ) {
        historyMsgStr += toAgentStr(historyMsg[i].message, historyMsg[i].name, historyMsg[i].time);
      }
      else historyMsgStr += toUserStr(historyMsg[i].message, historyMsg[i].name, historyMsg[i].time);
    }

    historyMsgStr += "<p class='random-day' style='text-align: center'><strong><italic>"
      + "-------------------------------------------------------Present Message-------------------------------------------------------"
      +" </italic></strong></p>";

    canvas.append(
      "<div id=\"" + profile.userId + "\" class=\"tabcontent\"style=\"display: none;\">"
       + "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x&nbsp;&nbsp;&nbsp;</span>"
       + "<div id='" + profile.userId + "-content' class='messagePanel'>" + historyMsgStr + "</div>"
       + "</div>"
    );// close append
    $('#user-rooms').append('<option value="' + profile.userId + '">' + profile.nickname + '</option>');

    let lastMsg = historyMsg[historyMsg.length-1];
    let font_weight = lastMsg.owner=="user" ? "bold" : "normal";
    let lastMsgStr = "";
    lastMsgStr = "<br><span style='font-weight: "+ font_weight + "'>" + toTimeStr(lastMsg.time) + remove_href_msg(lastMsg.message) + "</span>";


    let avgChatTime;
    let totalChatTime;
    if( profile.recentChat != lastMsg.time) {
      let timeArr = [];
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

      socket.emit("update chat time", {
        id: profile.userId,
        avgTime: avgChatTime,
        totalTime: totalChatTime,
        recentTime: lastMsg.time
      });
    }
    else {
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
    );

  }

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
    socket.emit('send message2', {id: designated_user_id , msg: messageInput.val()}, (data) => {
      messageContent.append('<span class="error">' + data + "</span><br/>");
      //no this thing QQ
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

  socket.on('new message2', (data) => {

    console.log("Message get! identity = " + data.owner + ", name = " + data.name);

    displayMessage( data );
    displayClient( data );

    if( name_list.indexOf(data.id) == -1 ) {
      name_list.push(data.id);
      console.log("push into name_list!");
    }
    else console.log("this msgOwner already exist");

    // messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  });

  function displayMessage( data ) {

    if (name_list.indexOf(data.id) !== -1) {
      //append new msg in existed window
      //no matter he's agent or user, just push name and msg into correct canvas BY ID
      let str;
      if( data.owner == "agent" ) str = toAgentStr(data.message, data.name, data.time);
      else str = toUserStr(data.message, data.name, data.time);
      $("#" + data.id + "-content").append(str);
      $('#'+data.id+'-content').scrollTop($('#'+data.id+'-content')[0].scrollHeight);

    } //close if
    else {
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

      canvas.append(
        "<div id=\"" + data.id + "\" class=\"tabcontent\"style=\"display: none;\">"
        + "<span class=\"topright\">x&nbsp;</span>"
        + "<div id='" + data.id + "-content' class='messagePanel'>"
         + historyMsgStr
        + "</div></div>"
      );// close append

      $('#user-rooms').append('<option value="' + data.id + '">' + data.name + '</option>');

    }
  }//function

  function displayClient( data ) {
    let font_weight = data.owner=="user" ? "bold" : "normal";

    if (name_list.indexOf(data.id) !== -1 ) {
      //agent or already online user , update tablinks' latest msg BY ID
      console.log('user existed');
      $(".tablinks[rel='"+data.id+"'] span").text(toTimeStr(data.time) + remove_href_msg(data.message)).css("font-weight", font_weight);
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

  function remove_href_msg(msg) {
    if( msg.indexOf('target="_blank"')!=-1 && msg.indexOf('href')!=-1 ) {
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

}); //document ready close tag
