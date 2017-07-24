$(document).ready(function() {var users = $('#users');
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
    var sortUp = true;

    //extend jquery, let searching case insensitive
    $.extend($.expr[':'], {
      'containsi': function(elem, i, match, array)
      {
        return (elem.textContent || elem.innerText || '').toLowerCase()
        .indexOf((match[3] || "").toLowerCase()) >= 0;
      }
    });
    searchBox.change(function () {
        var FIND_COLOR = "rgb(255, 255, 192)";
        var searchStr = searchBox.val();
        console.log("searchStr = "+searchStr);

        if( searchStr == "" ) {
            $('.tablinks').each( function() {
                let id = $(this).attr('rel');
                $("div #"+id+" .random").css({
                    "background-color": "",
                    "display": ""
                });
                $("div #"+id+" .message").css({
                    "background-color": "",
                    "display": ""
                });
                $(this).show();
              });
        }
        else {
            $('.tablinks').each( function() {
                //find his content parent
                let id = $(this).attr('rel');

                // //hide no search msg
                // $("div #"+id+" .random").css({
                //     "background-color": ""
                // });
                // $("div #"+id+" .random:containsi("+searchStr+")").css({
                //     "background-color": FIND_COLOR
                // });
                // $("div #"+id+" .message").css({
                //     "background-color": ""
                // });
                // $("div #"+id+" .message:containsi("+searchStr+")").css({
                //     "background-color": FIND_COLOR
                // });
                //
                // //if this content already no msg,
                //     //dont know how to clean code QQ
                // let flag = false;
                // for( let i=0; i<$("div #"+id+" .random").length; i++ ) {
                //     if( $("div #"+id+" .random").eq(i).css("background-color") == FIND_COLOR ) {
                //         flag = true;
                //         break;
                //     }
                // }
                // if( !flag ) for( let i=0; i<$("div #"+id+" .message").length; i++ ) {
                //     if( $("div #"+id+" .message").eq(i).css("background-color") == FIND_COLOR  ) {
                //         flag = true;
                //         break;
                //     }
                // }
                //
                // console.log("flag = "+flag);
                //
                // //hide tablinks
                // if( !flag ) $(this).hide();
                // else $(this).show();

                //hide no search_str msg
                $("div #"+id+" .random").css("display", "none");
                $("div #"+id+" .message").css("display", "none");
                //display searched msg
                $("div #"+id+" .random:containsi("+searchStr+")").css("display", "");
                $("div #"+id+" .message:containsi("+searchStr+")").css("display", "");

                //get search_str msg # link
                $("div #"+id+" .random:containsi("+searchStr+")").on("click", function() {
                    //when clicing searched msg

                    $(this).attr("id", "ref");
                    //msg immediately add link
                    $("div #"+id+" .random").css("display", "");
                    $("div #"+id+" .message").css("display", "");
                    //then cancel searching mode, display all msg
                    window.location.replace("/chat#ref");
                    $(this).attr("id", "");
                    //then jump to the #link added
                });

                //if this customer already no msg...
                        //dont know how to clean code QQ
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
    });
        // function getObjectKeyIndex(obj, keyToFind) {
        //     var n = 0, key;

        //     for (key in obj) {
        //         if (key == keyToFind) {
        //             return n;
        //             console.log('this is the index of key i: '+n);
        //         }

        //          n++;
        //         }

        //         return null;
        //     }//function getObjectKeyIndex


    function clickMsg(){
        var target = $(this).attr('rel');
        $("#"+target).show().siblings().hide();
        console.log('clickMsg executed')
    }
    $(document).on('click', '.tablinks' , clickMsg);
    $(document).on('click', '#signout-btn', logout); //登出
    $(document).on('click', '.tablinks_head', function() {
        let arr = $('.list-group .tablinks');

        if( sortUp ) {
            arr.sort(function(a,b) {
                let aVal = $(a).attr("data-avg_chat_time");
                console.log(aVal);
                let bVal = $(b).attr("data-avg_chat_time");
                console.log(bVal);
                return (aVal > bVal);
            });
            sortUp = false;
            $('.list-group').append(arr);
        }
        else {
            arr.sort(function(a,b) {
                let aVal = $(a).attr("data-avg_chat_time");
                console.log(aVal);
                let bVal = $(b).attr("data-avg_chat_time");
                console.log(bVal);
                return (aVal < bVal);
            });
            sortUp = true;
            $('.list-group').append(arr);
        }
    });

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

    // socket.on('load old messages', docs => {
    //   for(i=0; i < data.length; i++){
    //     displayMessage(docs[i]);
    //   }
    // });



    function displayMessage(data) {

        let chat_number = 1;
        var i = data.name;

        // console.log(data);

        // } else {

        //    var namefound = (t_value > -1); //if client existed retrieved by key value
        //    console.log(namefound);

         var namefound = (name_list.indexOf(i) > -1); //if client exists
        /*     var n, dataName ;
             dataName = document.getElementsById(data.name);
             for (n = 0; n < dataName.length; n++) { */

        //  messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");

        if (namefound == true) {
            //append new msg in existed window
            console.log('namefound');
            console.log('im: '+i);

                if(i == person && data.id !== undefined){
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

                            $("#"+gotIt).append("<p class=\"message\"><strong>" + data.name + data.time + ": </strong>"+ data.msg + "<br/></p>");
                            console.log('agent reply appended to according canvas');

                           }//if if
                        else{
                            console.log('no the n is not visible, do it again')

                        }
                    }//for

                }//if agent
                else if (i){

                    $("#"+i).append("<p class=\"message\"><strong>" + data.name + data.time + ": </strong>"+ data.msg + "<br/></p>");
                    console.log('appended to according canvas');
                }//if

                // else if (i == person && data.id != undefined){

                //                                 for (var n=0; n < length.t_value; n++){

                //                 var k = t[n].key;


                //         if ($("#"+k).style.dispaly="block"){
                //             $("#"+k).append("<p><strong>"+data.name+": </strong>"+ data.msg + "<br/></p>");
                //             console.log('agent reply appended to according canvas')
                //             }//if block

                //         }//for


                // }//else if i == agent


//             if ( i == 'U0cbbba0d281fc5b095caaacac73fd1b5') {
//                 console.log('found1');

//                 canvas1.append("<p>" + data.msg + "<br/></p>");


//             } else if (i == 'U52b2014e2905721d4072e65407653235') {

//                 console.log('found2');
//                 canvas2.append("<p>" + data.msg + "<br/></p>");


//             } else if (i =='U636956e3c62bdeecab26ea39be27cccc') {

//                 console.log('found3');
//                 canvas3.append("<p>" + data.msg + "<br/></p>");


// } else if (i === "Ue369116591fbd2d13a7eb5f0ff12547b") {


//             $('#user7').show();
//             user7.prepend('<tr>' +
//                 '<td>Ue369116591fbd2d13a7eb5f0ff12547b: ' + data.msg + '</td>' + '</tr>');


//          }//else if

    // else{


    //     chatNumberNeeded == name_list.indexOf(i)
    //     var k = 'chat'+chatNumberNeeded
    //     theid = $('existed but undefined')
    //     return theid


    //     console.log('msg appended');
    //     tooadd.append("<p>" + data.msg + "<br/></p>");


    // }//else

     }//close if
     else{

            console.log('new msg append to canvas');
//             if (i == 'U0cbbba0d281fc5b095caaacac73fd1b5'){
//                 console.log('append msg to canvas1');
//                 canvas1.append(
//                 "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x</span>" +
//                 "<div id=\"" + data.name + "\">" +
//                 "<h7>" +
//                 "<strong>" + data.name + ":</strong></h7><br/><p>" + data.msg + "<br/></p></div>"


//                     );
//             }else if (i == 'U636956e3c62bdeecab26ea39be27cccc'){
//                 canvas3.append(
//                 "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x</span>" +
//                 "<div id=\"" + data.name + "\">" +
//                 "<p>" +
//                 "<strong>" + data.name + ": </strong><br/>" + data.msg + "<br/></p></div>"
// );


//             }else if (i == 'U52b2014e2905721d4072e65407653235'){
//                 console.log('append msg to canvas2');

//                 canvas2.append(
//                 "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x</span>" +
//                 "<div id=\"" + data.name + "\">" +
//                 "<p>" +
//                 "<strong>" + data.name + ": </strong><br/>" + data.msg + "<br/></p></div>"
// );

//         }else{

            let users_pastMsg = historyMsg_users.filter(msg => {
                return msg.user == data.name;
            });
            let agents_pastMsg = historyMsg_agents.filter(msg => {
                return msg.user == data.name;
            });

            //THIS PART SORT USER & AGENT MSGS INTO TIME CONTINUOUS
             var historyMsgStr = "";
             var timeArr = [];
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

                      historyMsgStr += toUserStr( users_pastMsg[i] );
                      console.log(new Date(users_pastMsg[i].messageTime).getTime());
                      timeArr.push(new Date(users_pastMsg[i].messageTime).getTime());
                      i++;
                      if( i==users_pastMsg.length ) {
                          iFlag = true;
                          break;
                      };
                  }
                  while( (!jFlag ) && ( iFlag || isEarly ( agents_pastMsg[j].messageTime, users_pastMsg[i].messageTime ) ) ) {
                      historyMsgStr += toAgentStr( agents_pastMsg[j] );
                      console.log(new Date(agents_pastMsg[j].messageTime).getTime());
                      timeArr.push(new Date(agents_pastMsg[j].messageTime).getTime());
                      j++;
                      if( j==agents_pastMsg.length ) {
                          jFlag = true;
                          break;
                      };
                  }
               }
             }

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
             function toTimeStr( input ) {
                console.log("inputStr = "+input+"end");
                var str = " ";
                let date = new Date(input);

                str += date.getFullYear()+'/';

                let tmp = date.getMonth()+1;
                if( tmp<10 ) str += '0';
                str += tmp+'/';

                tmp = date.getDate();
                if( tmp<10 ) str += '0';
                str += tmp+' ';

                var week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                str += week[date.getDay()]+' ';

                str += date.getHours()+':';
                str += date.getMinutes();

                console.log("str = "+str+"end");
                return str;
             }

            avgChatTime = computeChatTime(timeArr)/60000;
            if( isNaN(avgChatTime) ) avgChatTime = 0;
            console.log("average chatTime = " + avgChatTime + "min");

            function computeChatTime(timeArr) {
                for( let i in timeArr ) console.log("timearr["+i+"] = "+timeArr[i]);
                let times = [];
                let i=0;
                const GAP = 1000*60*10; //10 min

                let headTime;
                let tailTime;

                while( i<timeArr.length ) {
                    headTime = tailTime = timeArr[i];
                    i++;
                    while( timeArr[i]-tailTime < GAP ) {
                        tailTime = timeArr[i];
                        i++;
                        if( i==timeArr.length ) break;
                    }
                    // console.log("tail-head = "+(tailTime-headTime));
                    // console.log("tail = "+new Date(tailTime).toString());
                    // console.log("head = "+new Date(headTime).toString());
                    var num = tailTime-headTime;
                    if( num<1000 ) num = 1000;
                    times.push(num);
                }
                let sum = 0;
                for( let i in times ) {
                    console.log("times = "+times[i]);
                    sum += times[i]
                }
                return sum/times.length;
            }
            canvas.append(
                "<div id=\"" + data.name + "\" class=\"tabcontent\"style=\"display: none;\">" +
                "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x</span>" +
                historyMsgStr+
                "<p class=\"message\"><strong>" + data.name + data.time + ": </strong>" + data.msg + "<br/></p></div>");// close append
            // for( i in users_pastMsg) {
            //     canvas.append(
            //         "<p><strong>"+data.name+": </strong>"+ users_pastMsg[i].message + "<br/></p>"
            //     );
            // }
            // canvas.append("</div>");

        // }

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


                            $("#"+gotIt).append("<p class=\"message\"><strong>" + data.name + data.time + ": </strong>"+ data.msg + "<br/></p>");
                            console.log('agent reply appended to according canvas');


                           }//if if

                        }//for

                    }//if agent

           }else{
            clients.append("<b><button  rel=\""+data.name+"\" class=\"tablinks\""
              + "data-avg_chat_time=\""+ avgChatTime.toFixed(0)+"\"> "
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

        //     $(document).on('click', "#U0cbbba0d281fc5b095caaacac73fd1b5", function() {
        //     canvas1.show();
        //     canvas2.hide();
        //     canvas3.hide();
        //     user1.hide();
        //     user2.hide();
        //     user3.hide();
        //     user4.hide();
        //     user5.hide()
        // });
        // $(document).on('click', "#U52b2014e2905721d4072e65407653235", function() {
        //     canvas2.show();
        //     canvas1.hide();
        //     canvas3.hide();
        //     user1.hide();
        //     user2.hide();
        //     user3.hide();
        //     user4.hide();
        //     user5.hide()
        // });
        // $(document).on('click', "#U636956e3c62bdeecab26ea39be27cccc", function() {
        //     canvas3.show();
        //     canvas1.hide();
        //     canvas2.hide();
        //     user3.hide();
        //     user2.hide();
        //     user1.hide();
        //     user4.hide();
        //     user5.hide()
        // });

    }//close client function





        /*  =========================================================  */
    //     function loadMsg() {
    //         $('#clients').empty();
    //         $('#canvas').empty();

    //         database.ref('chats/users').on('value', snap => {
    //             let historyMsg_users = [];
    //             let testVal = snap.val();
    //             let myIds = Object.keys(testVal);
    //             // console.log(testVal);


    //             for (var i = 0; i < 5; i++) {
    //                 $('#canvas').empty();  // "應該是很關鍵的CODE但須結合Dynamic ID"
    //                 console.log(i);
    //                 historyMsg_users.push(snap.child(myIds[i]).val());
    //                 console.log(historyMsg_users);

    //                 var namefound = (user_list.indexOf(historyMsg_users[i].user) > -1); //if client exists

    //                 if (namefound) {

    //                     if (historyMsg_users[i].user == "U0cbbba0d281fc5b095caaacac73fd1b5") {
    //                         console.log('user1 found');
    //                         user1.append(
    //                             '<tr>' +
    //                             '<td>' + historyMsg_users[i].message + '</td>' +
    //                             '<td>' + historyMsg_users[i].messageTime + '</td>' +
    //                             '</tr>'
    //                         );
    //                     } else if (historyMsg_users[i].user == 'U376b6ec748e32f594cf2f6248800d094') {

    //                         user2.append(
    //                             '<tr>' +
    //                             '<td>' + historyMsg_users[i].message + '</td>' +
    //                             '<td>' + historyMsg_users[i].messageTime + '</td>' +
    //                             '</tr>'
    //                         );
    //                     } else if (historyMsg_users[i].user == "U52b2014e2905721d4072e65407653235") {
    //                         user3.append(
    //                             '<tr>' +
    //                             '<td>' + historyMsg_users[i].message + '</td>' +
    //                             '<td>' + historyMsg_users[i].messageTime + '</td>' +
    //                             '</tr>'
    //                         );
    //                     } else if (historyMsg_users[i].user == 'U3919284a3de4cd0c0b570090c3dc9943') {
    //                         user4.append(
    //                             '<tr>' +
    //                             '<td>' + historyMsg_users[i].message + '</td>' +
    //                             '<td>' + historyMsg_users[i].messageTime + '</td>' +
    //                             '</tr>'
    //                         );
    //                     } else if (historyMsg_users[i].user == "U976afdecc6ba7f25bc04c9c520e5490e") {

    //                         user5.append(
    //                             '<tr>' +
    //                             '<td>' + historyMsg_users[i].message + '</td>' +
    //                             '<td>' + historyMsg_users[i].messageTime + '</td>' +
    //                             '</tr>'
    //                         );
    //                     }

    //                 } //namefound
    //                 else {
    //                     $('#clients').append(
    //                         '<tr>' +
    //                         '<td><button id="' + historyMsg_users[i].user + '" class="tablinks"><b>' + historyMsg_users[i].user + '</b></button></td>' + '</tr>'
    //                     );


    //                     user_list.push(historyMsg_users[i].user);


    //                 } //else

    //             } // for loop
    // });//snap

    // }//function

        //         // user1
        //         let arr1 = historyMsg_users.filter(user1 => {
        //             return user1.user == 'U52b2014e2905721d4072e65407653235';
        //         });
        //         // console.log(arr1.length);
        //         for (let j = 0; j < arr1.length; j++) {
        //             user1.prepend(
        //                 '<tr>' +
        //                 '<td>U52b2014e2905721d4072e65407653235: ' + arr1[j].message + '</td>' +
        //                 // '<td>' + arr1[j].messageTime + '</td>' +
        //                 '</tr>'
        //             );

        //         }

        //         // user2
        //         let arr2 = historyMsg_users.filter(user2 => {
        //             return user2.user == 'U376b6ec748e32f594cf2f6248800d094';
        //         });
        //         // console.log(arr1.length);
        //         for (let j = 0; j < arr2.length; j++) {
        //             user2.prepend(
        //                 '<tr>' +
        //                 '<td>U376b6ec748e32f594cf2f6248800d094: ' + arr2[j].message + '</td>' +
        //                 // '<td>' + arr1[j].messageTime + '</td>' +
        //                 '</tr>'
        //             );

        //         }

        //         // user3
        //         let arr3 = historyMsg_users.filter(user3 => {
        //             return user3.user == 'Udeadbeefdeadbeefdeadbeefdeadbeef';
        //         });
        //         // console.log(arr1.length);
        //         for (let j = 0; j < arr3.length; j++) {
        //             user3.prepend(
        //                 '<tr>' +
        //                 '<td>Udeadbeefdeadbeefdeadbeefdeadbeef: ' + arr3[j].message + '</td>' +
        //                 // '<td>' + arr1[j].messageTime + '</td>' +
        //                 '</tr>'
        //             );

        //         }

        //         // user4
        //         let arr4 = historyMsg_users.filter(user4 => {
        //             return user4.user == 'U3919284a3de4cd0c0b570090c3dc9943';
        //         });
        //         // console.log(arr1.length);
        //         for (let j = 0; j < arr4.length; j++) {
        //             user4.prepend(
        //                 '<tr>' +
        //                 '<td>U3919284a3de4cd0c0b570090c3dc9943: ' + arr4[j].message + '</td>' +
        //                 // '<td>' + arr1[j].messageTime + '</td>' +
        //                 '</tr>'
        //             );

        //         }

        //         // user5
        //         let arr5 = historyMsg_users.filter(user5 => {
        //             return user5.user == 'U39dc316178dbca5a9e85f4a10aa4210e';
        //         });
        //         // console.log(arr1.length);
        //         for (let j = 0; j < arr5.length; j++) {
        //             user5.prepend(
        //                 '<tr>' +
        //                 '<td>U39dc316178dbca5a9e85f4a10aa4210e: ' + arr5[j].message + '</td>' +
        //                 // '<td>' + arr1[j].messageTime + '</td>' +
        //                 '</tr>'
        //             );

        //         }

        //         let arr6 = historyMsg_users.filter(user6 => {
        //             return user6.user == 'U0cbbba0d281fc5b095caaacac73fd1b5';
        //         });
        //         // console.log(arr1.length);
        //         for (let j = 0; j < arr6.length; j++) {
        //             user6.prepend(
        //                 '<tr>' +
        //                 '<td>U0cbbba0d281fc5b095caaacac73fd1b5: ' + arr6[j].message + '</td>' +
        //                 // '<td>' + arr1[j].messageTime + '</td>' +
        //                 '</tr>'
        //             );

        //         }

        //         let arr7 = historyMsg_users.filter(user7 => {
        //             return user7.user == 'Ue369116591fbd2d13a7eb5f0ff12547b';
        //         });
        //         // console.log(arr1.length);
        //         for (let j = 0; j < arr7.length; j++) {
        //             user7.prepend(
        //                 '<tr>' +
        //                 '<td>Ue369116591fbd2d13a7eb5f0ff12547b: ' + arr7[j].message + '</td>' +
        //                 '</tr>'
        //             );

        //         }


        //     }); //database

        // } //function

    // HISTORY CHATS BUTTONS
        // $(document).on('click', "#U0cbbba0d281fc5b095caaacac73fd1b5", function() {
        //     user1.show();
        //     user2.hide();
        //     user3.hide();
        //     user4.hide();
        //     user5.hide();
        //     canvas1.hide();
        //     canvas2.hide();
        //     canvas3.hide()
        // });
        // $(document).on('click', "#U376b6ec748e32f594cf2f6248800d094", function() {
        //     user2.show();
        //     user1.hide();
        //     user3.hide();
        //     user4.hide();
        //     user5.hide();
        //     canvas1.hide();
        //     canvas2.hide();
        //     canvas3.hide()
        // });
        // $(document).on('click', "#U52b2014e2905721d4072e65407653235", function() {
        //     user3.show();
        //     user2.hide();
        //     user1.hide();
        //     user4.hide();
        //     user5.hide();
        //     canvas1.hide();
        //     canvas2.hide();
        //     canvas3.hide()
        // });
        // $(document).on('click', "#U3919284a3de4cd0c0b570090c3dc9943", function() {
        //     user4.show();
        //     user2.hide();
        //     user3.hide();
        //     user1.hide();
        //     user5.hide();
        //     canvas1.hide();
        //     canvas2.hide();
        //     canvas3.hide()
        // });
        // $(document).on('click', "#U976afdecc6ba7f25bc04c9c520e5490e", function() {
        //     user5.show();
        //     user2.hide();
        //     user3.hide();
        //     user4.hide();
        //     user1.hide();
        //     canvas1.hide();
        //     canvas2.hide();
        //     canvas3.hide()
        // });
        /*  ==================================================  */

}); //document ready close tag
