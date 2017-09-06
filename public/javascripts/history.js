$(document).ready(function() {
  var clients = $('#clients');
  var canvas = $("#canvas");
  var searchBox = $('.searchBox');
  var historyMsg_users = [];
  var historyMsg_agents = [];
  var historyMsgList = [];
  var sortAvgBool = true;
  var sortTotalBool = true;
  var sortFirstBool = true;
  var sortRecentBool = true;
  const COLOR = {
    FIND: "rgb(255, 255, 192)",
    CLICKED: "#ccc",
    DEFAULT: ""
  }
  var QQcount = 0;

  $(document).on('click', '.tablinks' , clickUser);
  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '#sortAvg', sortAvgChatTime);
  $(document).on('click', '#sortTotal', sortTotalChatTime);
  $(document).on('click', '#sortFirst', sortFirstChatTime);
  $(document).on('click', '#sortRecent', sortRecentChatTime);

  function clickUser(){
    //let the user tablinks lighting, other user dis-lighting
    let cleancolor = "";
    if( searchBox.val()!="" ) {
      cleancolor = COLOR.FIND;
    }
    $("#selected").attr('id','').css("background-color", cleancolor);
    $(this).attr('id','selected').css("background-color",COLOR.CLICKED);
    // $(".active").attr('class','tablinks').css("background-color", cleancolor);
    // $(this).attr('class','active');//.css("background-color",CLICKED_COLOR);

    //let message content panel show, other user's hide
    var target = $(this).attr('rel');
    $("#"+target).show().siblings().hide();

    //push user info
    let str="";
    str += "avgTime = " + $(this).attr('data-avgTime') + "min";
    str += "<br>totalTime = " + $(this).attr('data-totalTime') + "min";
    str += "<br>firstTime = " + toDateStr( $(this).attr('data-firstTime')-'0' );
    str += "<br>recentTime = " + toDateStr( $(this).attr('data-recentTime')-'0' );
    $('.tab_user-info').html(str);
    console.log('clickUser executed');
  }

  if (window.location.pathname === '/history') {
    loadMsg();  //Colman: dont know how to execute func in order QQ

  } // set agent name

  function loadMsg(){
    console.log("Start loading history message...");
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
        divide_Msg_by_diff_user();
      });
    });
  } //end loadMsg func

  var MsgList = function(id, messages, cutIndex) {
    this.id = id;
    this.messages = messages;
    this.cutIndex = cutIndex;
  }

  function divide_Msg_by_diff_user(){
    while( historyMsg_agents.length>0 ) {
      var msgList = [];
      let nowId = historyMsg_agents[0].id;
      let i=0;
      while( i<historyMsg_agents.length ) {
        if( historyMsg_agents[i].id == nowId ) {
          msgList.push(historyMsg_agents[i]);
          historyMsg_agents.splice(i,1);
        }
        else i++;
      }
      console.log("finish, now msgList = "+msgList.length+", user = "+nowId+", remain length = "+historyMsg_agents.length);
      historyMsgList.push(new MsgList(nowId, msgList, msgList.length));

    }
    console.log("agentList : ");
    console.log(historyMsgList);

    while( historyMsg_users.length>0 ) {
      var msgList = [];
      let nowId = historyMsg_users[0].id;
      let i=0;
      while( i<historyMsg_users.length ) {
        if( historyMsg_users[i].id == nowId ) {
          msgList.push(historyMsg_users[i]);
          historyMsg_users.splice(i,1);
        }
        else i++;
      }
      console.log("finish, now msgList = "+msgList.length+", user = "+nowId+", remain length = "+historyMsg_users.length);

      for( i=0; i<historyMsgList.length; i++ ) {
        if( nowId == historyMsgList[i].id ) {
          historyMsgList[i].messages = historyMsgList[i].messages.concat(msgList);
          break;
        }
      }
      if( i==historyMsgList.length ) {
        historyMsgList.push(new MsgList(nowId, msgList, 0));
      }

    }
      console.log(100);
    console.log("Final History Messages List : ");
      console.log(120);
    console.log(historyMsgList);
      console.log(130);

    clients.html("");
    for( i in historyMsgList ) combine_and_push_Msgs(historyMsgList[i]);
  }

  function combine_and_push_Msgs( msgList ) {
    console.log(140);
    let agents_pastMsg = msgList.messages.slice( 0, msgList.cutIndex );
    let users_pastMsg = msgList.messages.slice( msgList.cutIndex, msgList.length );
    console.log(144);
    let userName = users_pastMsg[0].userName;
    //THIS PART SORT USER & AGENT HISTORY MSG INTO TIME CONTINUOUS
    let historyMsg = [];
    let timeArr = [];
    let i=0;
    let j=0;
    let iFlag = (users_pastMsg.length==0);
    let jFlag = (agents_pastMsg.length==0);
    console.log(150);
    while( !iFlag || !jFlag ) {
      while( ( !iFlag ) && (jFlag || users_pastMsg[i].messageTime < agents_pastMsg[j].messageTime ) ) {
        //↑ while ( still exist unloaded user msg )
        // && (there's no unloaded agent msg || now user msg is early then now agent msg )
        //then { load next index user msg; }
        historyMsg.push(users_pastMsg[i]);
        timeArr.push(users_pastMsg[i].messageTime);
        i++;
        if( i==users_pastMsg.length ) iFlag = true;
      }
      while( (!jFlag ) && ( iFlag || agents_pastMsg[j].messageTime < users_pastMsg[i].messageTime ) ) {

        historyMsg.push(agents_pastMsg[j]);
        timeArr.push(agents_pastMsg[j].messageTime);
        j++;
        if( j==agents_pastMsg.length ) jFlag = true;
      }
    }
    //SORT BOTH MSG DONE

    //THIS PART DIVIDE HISTORY MSG INTO DIFFERENT DAYS
    let historyMsgStr = "<p class='random-day' style='text-align: center'><strong><i>"
      + "-------------------------------------------------------No More History Message-------------------------------------------------------"
      + "</i></strong></p>";
    let nowDateStr = "";
    for( let i in historyMsg ) {
      let d = new Date( historyMsg[i].messageTime );
      if( d.toDateString()!=nowDateStr ) {  //change day
        nowDateStr = d.toDateString();
        historyMsgStr += "<p class='random-day' style='text-align: center'><strong>" + nowDateStr + "</strong></p>";
      }
      if( historyMsg[i].hasOwnProperty("agentName") ) {
        historyMsgStr += toAgentStr( historyMsg[i] );
      }
      else historyMsgStr += toUserStr( historyMsg[i] );
    }
    //to chat with user:
      // historyMsgStr += "<p class='random-day' style='text-align: center'><strong><i>"
      //   +"<a href='/chat?id="+msgList.id+"'>"
      //   + "-------------------------------------------------------Chat With User-------------------------------------------------------"
      //   +"</a></i></strong></p>";
    //DIVIDE MSG INTO DIFFERENT DAYS DONE

    //some liitle function here
    function toUserStr( msg ) {
      return "<p class='random'>" + msg.userName + toTimeStr(msg.messageTime) + ": " + msg.message + "<br/></p>";
    }
    function toAgentStr( msg ) {
      return "<p class='random'>" + msg.agentName + toTimeStr(msg.messageTime) + ": " + msg.message + "<br/></p>";
    }

    let firstTime = historyMsg[0].messageTime;
    let recentTime = historyMsg[historyMsg.length-1].messageTime;
    let avgChatTime;
    let totalChatTime;

    computeChatTime(timeArr);
    if( isNaN(avgChatTime)||avgChatTime<1 ) avgChatTime = 1;
    if( isNaN(totalChatTime)||totalChatTime<1 ) totalChatTime = 1;

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
      totalChatTime = sum;
      avgChatTime = sum/times.length;
    }

    canvas.append(
      "<div id=\"" + msgList.id + "\" class=\"tabcontent\"style=\"display: none;\">"
       + "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x&nbsp;&nbsp;&nbsp;</span>"
       + "<div id='" + msgList.id + "-content' class='messagePanel'>" + historyMsgStr + "</div>"
       + "</div>"
    );// close append
    clients.append("<b><button  rel=\""+msgList.id+"\" class=\"tablinks\""
    + "data-avgTime=\""+ avgChatTime.toFixed(0)+"\" "
    + "data-totalTime=\"" + totalChatTime.toFixed(0)+"\" "
    + "data-firstTime=\"" + firstTime+"\" "
    + "data-recentTime=\"" + recentTime+"\"> "
    + userName + "</button></b>");

  }

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

          window.location.replace("/history#ref"); //then jump to the #link added
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

  function sortUsers(ref, up_or_down, operate) {
    let arr = $('.list-group b');
    for( let i=0; i<arr.length-1; i++ ) {
      for( let j=i+1; j<arr.length; j++ ) {
        let a = arr.eq(i).children(".tablinks").attr("data-"+ref)-'0';
        let b = arr.eq(j).children(".tablinks").attr("data-"+ref)-'0';
        if( up_or_down == operate(a, b) ) {
          let tmp = arr[i];   arr[i] = arr[j];    arr[j] = tmp;
        }
      }
    }
    $('.list-group').append(arr);

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

  //  abandon func
  // function sortAvgChatTime() {
  //   let arr = $('.list-group b');
  //   if( sortAvgBool ) {
  //     console.log("Sort up!");
  //     for( let i=0; i<arr.length-1; i++ ) {
  //       for( let j=i+1; j<arr.length; j++ ) {
  //         let a = arr.eq(i).children(".tablinks").attr("data-avgTime")-'0';
  //         let b = arr.eq(j).children(".tablinks").attr("data-avgTime")-'0';
  //         if( a<b ) {
  //           let tmp = arr[i];   arr[i] = arr[j];    arr[j] = tmp;
  //         }
  //       }
  //     }
  //     sortAvgBool = false;
  //     $('.list-group').append(arr);
  //   }
  //   else {
  //     console.log("Sort down!");
  //     for( let i=0; i<arr.length-1; i++ ) {
  //       for( let j=i+1; j<arr.length; j++ ) {
  //         let a = arr.eq(i).children(".tablinks").attr("data-avgTime")-'0';
  //         let b = arr.eq(j).children(".tablinks").attr("data-avgTime")-'0';
  //         if( a>b ) {
  //           let tmp = arr[i];   arr[i] = arr[j];    arr[j] = tmp;
  //         }
  //       }
  //     }
  //     sortAvgBool = true;
  //     $('.list-group').append(arr);
  //   }
  // } //end sortAvgChatTime func

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
