$(document).ready(function() {
  var users = $('#users');
  var nicknameError = $('#nickError');
  var clients = $('#clients');
  var printAgent = $('#printAgent');
  var canvas = $("#canvas");
  var searchBox = $('#searchBox');
  var socket = io.connect();
  var person = "";
  var historyMsg_users = [];
  var historyMsg_agents = [];
  var historyMsgList = [];
  var avgChatTime;
  var sumChatTime;
  var sortUp = true;
  var FIND_COLOR = "rgb(255, 255, 192)";
  var CLICKED_COLOR = "rgba(221,221,221,1)";
  var DEFAULT_COLOR = "rgba(0,0,0,0)"

  $(document).on('click', '.tablinks' , clickMsg);
  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '.tablinks_head', sortUsers);

  if (window.location.pathname === '/history') {
    console.log("Start loading history message...");
    loadMsg();  //Colman: dont know how to execute func in order QQ
    setTimeout(agentName, 100);

  } // set agent name

  function loadMsg(){
    database.ref('chats/users').once('value', snap => {
      console.log("Loading user history msg...");
      let testVal = snap.val();
      let myIds = Object.keys(testVal);
      for (var i = 0; i < myIds.length; i++) {
        historyMsg_users.push(snap.child(myIds[i]).val());
      }
      console.log("User history msg load complete");

      database.ref('chats/agents').once('value', snap => {
        console.log("Loading agent history msg...");
        let testVal = snap.val();
        let myIds = Object.keys(testVal);
        for (var i = 0; i < myIds.length; i++) {
          historyMsg_agents.push(snap.child(myIds[i]).val());
        }
        console.log("Agent history msg load complete");
        filterMsg();
      });
    });
  } //end loadMsg func

  var MsgList = function(userName, messages, cutIndex) {
    this.userName = userName;
    this.messages = messages;
    this.cutIndex = cutIndex;
  }

  function filterMsg(){

    // historyMsg_agents = historyMsg_agents.filter(msg => {
    //   return msg.user != undefined;
    // });

    while( historyMsg_agents.length>0 ) {
      var msgList = [];
      let nowUser = historyMsg_agents[0].user;
      let i=0;
      while( i<historyMsg_agents.length ) {
        if( historyMsg_agents[i].user == nowUser ) {
          msgList.push(historyMsg_agents[i]);
          historyMsg_agents.splice(i,1);
        }
        else i++;
      }
      console.log("finish, now msgList = "+msgList.length+", user = "+nowUser+", remain length = "+historyMsg_agents.length);
      historyMsgList.push(new MsgList(nowUser, msgList, msgList.length));

    }
    console.log("agentList : ");
    console.log(historyMsgList);

    while( historyMsg_users.length>0 ) {
      var msgList = [];
      let nowUser = historyMsg_users[0].user;
      let i=0;
      while( i<historyMsg_users.length ) {
        if( historyMsg_users[i].user == nowUser ) {
          msgList.push(historyMsg_users[i]);
          historyMsg_users.splice(i,1);
        }
        else i++;
      }
      console.log("finish, now msgList = "+msgList.length+", user = "+nowUser+", remain length = "+historyMsg_users.length);

      for( i=0; i<historyMsgList.length; i++ ) {
        if( nowUser == historyMsgList[i].userName ) {
          historyMsgList[i].messages = historyMsgList[i].messages.concat(msgList);
          break;
        }
      }
      if( i==historyMsgList.length ) {
        historyMsgList.push(new MsgList(nowUser, msgList, 0));
      }

    }
    console.log("Final History Messages List : ");
    console.log(historyMsgList);

    clients.html("");
    for( i in historyMsgList ) doMsgs(historyMsgList[i]);
  }

  function doMsgs( msgList ) {
    let agents_pastMsg = msgList.messages.slice( 0, msgList.cutIndex );
    let users_pastMsg = msgList.messages.slice( msgList.cutIndex, msgList.length );

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
    let historyMsgStr = "<p class='randomDay' style='text-align: center'><strong><i>"
      + "-------------------------------------------------------No More History Message-------------------------------------------------------"
      + "</i></strong></p>";
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
    historyMsgStr += "<p class='randomDay' style='text-align: center'><strong><i>"
      +"<a href='/chat?id="+msgList.userName+"'>"
      + "-------------------------------------------------------Chat With User-------------------------------------------------------"
      +"</a></i></strong></p>";
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

    computeChatTime(timeArr);
    if( isNaN(avgChatTime)||avgChatTime<1 ) avgChatTime = 1;
    if( isNaN(sumChatTime)||sumChatTime<1 ) sumChatTime = 1;
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
      "<div id=\"" + msgList.userName + "\" class=\"tabcontent\"style=\"display: none;\">" +
      "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x</span>" +
      historyMsgStr
    );// close append

    clients.append("<b><button  rel=\""+msgList.userName+"\" class=\"tablinks\""
    + "data-avg_chat_time=\""+ avgChatTime.toFixed(0)+"\" "
    + "data-sum_chat_time=\""+ sumChatTime.toFixed(0)+"\"> "
    + msgList.userName + " avg chat time = " + avgChatTime.toFixed(0)+ "</button></b>");

  }

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

          window.location.replace("/history#ref"); //then jump to the #link added
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
    let cleancolor = "";
    if( searchBox.val()!="" ) {
    //  console.log("val ="+searchBox.va)
      cleancolor = FIND_COLOR;
    }
    $("#selected").attr('id','').css("background-color", cleancolor);
    $(this).attr('id','selected').css("background-color",CLICKED_COLOR);

    var target = $(this).attr('rel');
    $("#"+target).show().siblings().hide();

    console.log('clickMsg executed');
  }

  function sortUsers() {
    let arr = $('.list-group b');
    if( sortUp ) {
      console.log("Sort up!");
      for( let i=0; i<arr.length-1; i++ ) {
        for( let j=i+1; j<arr.length; j++ ) {
          let a = arr.eq(i).children(".tablinks").attr("data-avg_chat_time")-'0';
          let b = arr.eq(j).children(".tablinks").attr("data-avg_chat_time")-'0';
          if( a<b ) {
            let tmp = arr[i];   arr[i] = arr[j];    arr[j] = tmp;
          }
        }
      }
      sortUp = false;
      $('.list-group').append(arr);
    }
    else {
      console.log("Sort down!");
      for( let i=0; i<arr.length-1; i++ ) {
        for( let j=i+1; j<arr.length; j++ ) {
          let a = arr.eq(i).children(".tablinks").attr("data-avg_chat_time")-'0';
          let b = arr.eq(j).children(".tablinks").attr("data-avg_chat_time")-'0';
          if( a>b ) {
            let tmp = arr[i];   arr[i] = arr[j];    arr[j] = tmp;
          }
        }
      }
      sortUp = true;
      $('.list-group').append(arr);
    }
  } //end sortUsers func

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
