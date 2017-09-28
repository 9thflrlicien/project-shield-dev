var name_list = []; //list of all users
var user_list = []; // user list for checking on idle chat rooms

const LOADING_MSG_AND_ICON = "<p class='message-day' style='text-align: center'><strong><i>" +
"Loading History Messages..." +
"</i></strong><span class='loadingIcon'></span></p>";
const NO_HISTORY_MSG = "<p class='message-day' style='text-align: center'><strong><i>" +
"-沒有更舊的歷史訊息-" +
"</i></strong></p>";

$(document).ready(function() {
  var socket = io.connect(); //socket
  var printAgent = $('#printAgent'); //agent welcome text
  // var messageForm = $('#send-message'); //button for agent to send message
  var messageInput = $('#message'); //input for agent to send message
  var canvas = $("#canvas"); //panel of message canvas
  var userId = "";
  var person = "agentColman"; //agent name
  var infoCanvas = $("#infoCanvas");
  var sortRecentBool = true; //bool for sort recent time up or down
  var sortTotalBool = true; //bool for sort total time up or down
  var sortFirstBool = true; //bool for sort first time up or down
  var sortRecentBool = true; //bool for sort recent time up or down

  var userProfiles = []; //array which store all user's profile
  var buffer; //buffer which store now user's profile
  var infoTable = $('.info_input_table'); //user info table
  var TagsData; //data of user info tags

  var filterDataBasic = { //option of filter age, recent_chat_time, first_chat_time
    age: ['0', '20', '30', '40', '50', '60', '60 up'],
    recent: ['< 10 min', '10 min', '30 min', '60 min', '2 hr', '12 hr', '1 day', '1 week', '1 month', '1 month up'],
    first: ['< 1 day', '1 day', '1 week', '2 week', '1 month', '3 month', '6 month', '1 year', '1 year up']
  };
  var filterDataCustomer = {}; //option of filter customized tags

  const COLOR = {
    FIND: "#A52A2A",
    CLICKED: "#ccc",
  }
  let n = 0;

  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '.tablinks', clickUserTablink);
  $(document).on('click', '.topright', clickSpan);
  $(document).on('click', '#userInfoBtn', showProfile);
  $(document).on('click', '.userInfo-td[modify="true"]', editProfile);
  $(document).on('click', '.edit-button', changeProfile);
  $(document).on('click', '#userInfo-submit', submitProfile);
  $(document).on('change', '.multiselect-container', multiselect_change);
  $(document).on('click', '#upImg', upImg);
  $(document).on('click', '#upVid', upVid);
  $(document).on('click', '#upAud', upAud);
  $(document).on('click', '#submitMsg', submitMsg);
  $(document).on('click', '#submitMemo', submitMemo);

  // 群組名稱
  $(document).on('dblclick', '.myText', openTitle); // 點開編輯群組名稱
  $(document).on('click', '#save-group-btn', groupSubmit); // 完成編輯群組名稱
  $('#message').on('keydown', function(event){
    if(event.keyCode == 13){
      document.getElementById('submitMsg').click();
    }
  })
  $('#message_memo').on('keydown', function(event){
    if(event.keyCode == 13){
      document.getElementById('submitMemo').click();
    }
  })
  $(document).on('click', '.dropdown-menu', function(event) {
    event.stopPropagation();
  });
  $(document).on('click', '.nav-link', toggleInfoPanel);
  $(document).on('click', '.filterArea h4', function() {
    $(this).siblings().toggle(200, 'easeInOutCubic');
    $(this).children('i').toggle();
  });
  $('.onclick_show').on('click', function(e){
    // console.log('onclick_show exe');
    var target = $(this).attr('rel');
    e.preventDefault();
    if ($("#"+target).is(":visible")){
      $("#"+target).fadeOut();
      $(".uploadArea").css('top',0);
      $(this).attr('active','false');
    }else{
      $("#"+target).css('display','flex').siblings().hide();
      $(".uploadArea").css('top',-60);
      $(this).attr('active','true').siblings().attr('active','false');;
    }
  });//onclick_show

  //---------------------ticket.js----------------------

  var ticketInfo = {} ;
  var contactInfo = {} ;
  var agentInfo = {} ;
  var socket = io.connect();

  var yourdomain = 'fongyu';
  var api_key = '4qydTzwnD7xRGaTt7Hqw';
  var ticket_content = $('.ticket-content');

  $(document).ready(function() {

    $(document).on('click', '#form-submit', submitAdd) //新增ticket
    $(document).on('click', '.ticket_content',moreInfo) ;
    $(document).on('click', "#ticketInfo-submit", updateStatus) ;
    $(document).on('click', '.edit', showInput) ;
    $(document).on('click','.inner', function (event) {
      event.stopPropagation();
    });
    $(document).on('focusout', '.inner', hideInput);
    $(document).on('keypress', '.inner',function (e) {
      if(e.which == 13) $(this).blur() ;
    });

    $("#exampleInputAmount").keyup(searchBar);

  });

  function loadTable(userId){
    $('.ticket-content').empty();
    $('.ticket_memo').empty();
    var ticket_memo_list = [];
    $.ajax(
      {
        url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets?include=requester",
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "Authorization": "Basic " + btoa(api_key + ":x")
        },
        success: function(data, textStatus, jqXHR) {

          for(let i=0;i < data.length;i++){
            console.log("freshdesk data[i], i="+i);
            console.log(data[i]);
            if (data[i].subject == userId){

              ticketInfo = data;
              $('.ticket-content').prepend(
                '<tr id="'+i+'" class="ticket_content" data-toggle="modal" data-target="#ticketInfoModal">'+
                '<td class="data_id" style="border-left: 5px solid '+priorityColor(data[i].priority)+'">' + data[i].id + '</td>' +
                '<td>' + data[i].requester.name + '</td>' +
                '<td>' + data[i].description.substr(0,10) + '...</td>' +
                '<td class="status">' + statusNumberToText(data[i].status) + '</td>' +
                '<td class="priority">' + priorityNumberToText(data[i].priority) + '</td>' +
                '<td>'+displayDate(data[i].due_by)+'</td>' +
                '<td>'+ dueDate(data[i].due_by)+'</td>' +
                '</tr>'
              );
              ticket_memo_list.push(String(data[i].id));


            }
          }
        },
        error: function(jqXHR, tranStatus) {
          console.log('error');
        }
      }
    );
    setTimeout(function(){
      for (var i=0; i<ticket_memo_list.length; i++){
        console.log("ticket id = "+ticket_memo_list[i]);
        $.ajax(
          {
            url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets/"+ticket_memo_list[i]+"/conversations",
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
              "Authorization": "Basic " + btoa(api_key + ":x")
            },
            success: function(data, textStatus, jqXHR) {
              console.log("data = ");
              console.log(data);
              for(let i=0;i < data.length;i++){
                console.log("data.length = "+data.length);
                ticketInfo = data;
                $('.ticket_memo').append(data[i].body);
                // }
              }
            },
            error: function(jqXHR, tranStatus) {
              console.log(jqXHR);
              console.log(tranStatus);
              console.log('error');
            }
          }
        );
      }
    }, 2000);
  }


  function showInput() {
    let prop = $(this).parent().children("th").text() ;
    let original = $(this).text() ;
    if(prop.indexOf('due date') != -1 ){
      let day = new Date(original) ;
      day = Date.parse(day)+8*60*60*1000 ;
      day = new Date(day) ;
      // console.log(day);
      $(this).html(
        "<input type='datetime-local' class='inner' value='"+
        day.toJSON().substring(0,23)
        +"'></input>"
      );
    }
    else if(prop == 'description'){
      $(this).html(
        "<textarea  class='inner' rows=4' cols='50'>"+
        original+
        "</textarea>"
      );
    }
    else{
      $(this).html(
        "<input type='text' class='inner' value='"+
        original+
        "' autofocus>"
      );
    }
  }
  function hideInput() {
    let change = $(this).val();
    if($(this).attr('type')== 'datetime-local'){
      $(this).parent().html(displayDate(change)) ;
    }
    $(this).parent().html(change) ;
  }

  function updateStatus() {
    let select = $(".select"),
    editable = $(".edit"),
    input = $("input");
    let name, value, json = '{' ;
    let obj = {} ;
    let id = $(this).attr("val") ;

    input.each(function () {$(this).blur();});

    // alert(editable.length) ;
    for(let i=0;i<editable.length;i++){
      name = editable.eq(i).parent().children("th").text().split(" ") ;
      value = editable.eq(i).text() ;
      json += '"'+name[0]+'":"'+value+'",';
    }
    // alert(select.length) ;
    for(let i=0;i<select.length;i++){
      name = select.eq(i).parent().parent().children("th").text() ;
      value = select.eq(i).val() ;
      // alert(name+":"+value) ;
      json += '"'+name+'":'+value+',';
    }

    json += '"id":"'+id+'"}' ;
    console.log(json) ;
    obj = JSON.parse(json) ;

    if(confirm("Are you sure to change ticket?")) {
      socket.emit('update ticket',obj);
      setTimeout(() => {
        location.reload();
      }, 1000)
    }


  }

  function showSelect(prop,n) {
    // let prop = $(this).parent().children("th").text() ;
    // alert(prop) ;
    let html = "<select class='select'>" ;
    if(prop == 'priority'){
      html += "<option value="+n+">"+priorityNumberToText(n)+"</option>" ;
      for(let i=1;i<5;i++){
        if(i == n) continue ;
        html += "<option value="+i+">"+priorityNumberToText(i)+"</option>" ;
      }

    }
    else if(prop == 'status'){

      html += "<option value="+n+">"+statusNumberToText(n)+"</option>" ;
      for(let i=2;i<6;i++){
        if(i == n) continue ;
        html += "<option value="+i+">"+statusNumberToText(i)+"</option>" ;
      }
    }
    else if(prop == 'responder'){
      html += "<option value="+n+">"+responderName(n)+"</option>" ;
      for(let i in agentInfo){
        let id = agentInfo[i].id ;
        if( id == n) continue ;
        html += "<option value="+id+">"+responderName(id)+"</option>" ;
      }
    }
    html += "</select>" ;
    return html ;
    // $(this).html(html);
  }

  function moreInfo() {
    let display ;
    let i = $(this).attr('id');
    console.log("id = "+i);
    let Tinfo = ticketInfo[i];
    let Cinfo ;
    let Ainfo ;

    $("#ID_num").text(Tinfo.id) ;
    $("#ID_num").css("background-color",priorityColor(Tinfo.priority)) ;

    display =
    '<tr>'+
    '<th>responder</th>'+
    '<td>'+showSelect('responder',Tinfo.responder_id)+'</td>'+
    '</tr><tr>'+
    '<th>priority</th>'+
    '<td>'+showSelect('priority',Tinfo.priority)+'</td>'+
    '</tr><tr>'+
    '<th>status</th>'+
    '<td>'+showSelect('status',Tinfo.status)+'</td>'+
    '</tr><tr>'+
    '<th>description</th>'+
    '<td class="edit">'+Tinfo.description+'</td>'+
    '</tr><tr>'+
    '<th>due date '+dueDate(Tinfo.due_by)+'</th>'+
    '<td class="edit">'+displayDate(Tinfo.due_by)+'</td>'+
    '</tr><tr>'+
    '<th>creat date</th>'+
    '<td>'+displayDate(Tinfo.created_at)+'</td>'+
    '</tr><tr>'+
    '<th>last update</th>'+
    '<td>'+displayDate(Tinfo.updated_at)+'</td>'+
    '</tr>' ;

    for(let j in contactInfo){
      if(contactInfo[j].id == Tinfo.requester_id) {
        Cinfo = contactInfo[j] ;
        display +=
        '<tr>'+
        '<th>requester</th>'+
        '<td>'+Cinfo.name+'</td>'+
        '</tr><tr>'+
        '<th>requester email</th>'+
        '<td>'+Cinfo.email+'</td>'+
        '</tr><tr>'+
        '<th>requester phone</th>'+
        '<td>'+Cinfo.phone+'</td>'+
        '</tr>'
        break ;
      }
    }

    for(let j in agentInfo){
      if(agentInfo[j].id == Tinfo.requester_id) {
        Ainfo = agentInfo[j] ;
        display +=
        '<tr>'+
        '<th>requester(<span style="color:red">agent</span>)</th>'+
        '<td>'+Ainfo.contact.name+'</td>'+
        '</tr><tr>'+
        '<th>requester email</th>'+
        '<td>'+Ainfo.contact.email+'</td>'+
        '</tr><tr>'+
        '<th>requester phone</th>'+
        '<td>'+Ainfo.contact.phone+'</td>'+
        '</tr>'
        break ;
      }
    }

    $(".info_input_table").html('') ;
    $(".modal-header").css("border-bottom","3px solid "+priorityColor(Tinfo.priority)) ;
    $(".modal-title").text(Tinfo.subject) ;
    $("#ticketInfo-submit").attr("val",Tinfo.id) ;
    $(".info_input_table").append(display);
  }

  function displayDate(date) {
    let origin = new Date(date) ;
    origin = origin.getTime();
    let gmt8 = new Date(origin );

    let yy = gmt8.getFullYear(),
    mm = gmt8.getMonth()+1,
    dd = gmt8.getDate(),
    hr = gmt8.getHours(),
    min= gmt8.getMinutes(),
    sec= gmt8.getSeconds();

    return yy+"/"+mm+"/"+dd+" "+hr+":"+min+":"+sec ;
  }

  function dueDate(day) {
    let html = '' ;
    let nowTime = new Date().getTime() ;
    let dueday = Date.parse(displayDate(day)) ;
    let hr = dueday - nowTime ;
    hr /= 1000*60*60 ;
    // hr = Math.round(hr) ;
    // return hr ;
    if(hr<0) html = '<span class="overdue">overdue</span>' ;
    else html = '<span class="non overdue">response due</span>' ;
    return html ;
  }
  function responderName(id) {
    for(let i in agentInfo){
      if(agentInfo[i].id == id) return agentInfo[i].contact.name ;
    }
    return "unassigned" ;
  }
  function addZero(n) {
    n = Number();
  }


  function submitAdd(){
    let subject = $('#form-subject').val();
    let email = $('#form-email').val();
    let phone = $('#form-phone').val();
    let status = $('#form-status option:selected').text();
    let priority = $('#form-priority option:selected').text();
    let description = $('#form-description').val();
    ticket_data = '{ "description": "'+description+'", "subject": "'+subject+'", "email": "'+email+'", "phone": "'+phone+'", "priority": '+priorityTextToMark(priority)+', "status": '+statusTextToMark(status)+' }';
    // console.log(ticket_data)

    // 驗證
    let email_reg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/;
    let phone_reg = /\b[0-9]+\b/;
    if(!email_reg.test(email)){
      $('#error').append('請輸入正確的email格式');
      $('#form-email').css('border', '1px solid red');
      setTimeout(() => {
        $('#error').empty();
        $('#form-email').css('border', '1px solid #ccc');
      }, 3000);
    } else if(!phone_reg.test(phone)) {
      $('#error').append('請輸入正確的電話格式');
      $('#form-phone').css('border', '1px solid red');
      setTimeout(() => {
        $('#error').empty();
        $('#form-phone').css('border', '1px solid #ccc');
      }, 3000);
    } else if($('#form-subject').val().trim() === '') {
      $('#error').append('請輸入主題');
      $('#form-subject').css('border', '1px solid red');
      setTimeout(() => {
        $('#error').empty();
        $('#form-subject').css('border', '1px solid #ccc');
      }, 3000);
    } else if($('#form-description').val().trim() === '') {
      $('#error').append('請輸入內容');
      $('#form-description').css('border', '1px solid red');
      setTimeout(() => {
        $('#error').empty();
        $('#form-description').css('border', '1px solid #ccc');
      }, 3000);
    } else {
      $.ajax(
        {
          url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets",
          type: 'POST',
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          headers: {
            "Authorization": "Basic " + btoa(api_key + ":x")
          },
          data: ticket_data,
          success: function(data, textStatus, jqXHR) {
            // console.log('works');
          },
          error: function(jqXHR, tranStatus) {
            x_request_id = jqXHR.getResponseHeader('X-Request-Id');
            response_text = jqXHR.responseText;
          }
        }
      );

      $('#form-subject').val('');
      $('#form-email').val('');
      $('#form-phone').val('');
      $('#form-description').val('');

      setTimeout(() => {
        location.href = '/ticket';
      }, 1000)
    }

  }

  function priorityTextToMark(priority){
    switch(priority) {
      case 'Urgent':
      return 4;
      break;
      case 'High':
      return 3;
      break;
      case 'Medium':
      return 2;
      break;
      default:
      return 1;
    }
  }

  function statusTextToMark(status){
    switch(status) {
      case 'Closed':
      return 5;
      break;
      case 'Resolved':
      return 4;
      break;
      case 'Pending':
      return 3;
      break;
      default:
      return 2;
    }
  }

  function priorityColor(priority) {
    switch(priority) {
      case 4:
      return 'rgb(230, 100, 100)';
      break;
      case 3:
      return 'rgb(233, 198, 13)';
      break;
      case 2:
      return 'rgb(113, 180, 209)';
      break;
      case 1:
      return 'rgb(126, 215, 170)';
      break;
      default:
      return 'N/A';
    }
  }

  function statusNumberToText(status){
    switch(status) {
      case 5:
      return 'Closed';
      break;
      case 4:
      return 'Resolved';
      break;
      case 3:
      return 'Pending';
      break;
      default:
      return 'Open';
    }
  }

  function priorityNumberToText(priority){
    switch(priority) {
      case 4:
      return 'Urgent';
      break;
      case 3:
      return 'High';
      break;
      case 2:
      return 'Medium';
      break;
      default:
      return 'Low';
    }
  }

  function searchBar(){
    let content = $('.ticket-content tr');
    let val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

    content.show().filter(function() {
      var text1 = $(this).text().replace(/\s+/g, ' ').toLowerCase();
      return !~text1.indexOf(val);
    }).hide();
  }

  //------------------end ticket---------------------


  $(document).on('click', '.userInfo-td[modify="false"]', function() {
    if( $(this).find('input').length==0 ) {
      //如果現在是非編輯狀態
      console.log(".userInfo-td click");
      let val = $(this).text();        //抓目前的DATA
      $(this).html('<input type="text" value="' +val + '"></input>'); //把element改成input，放目前的DATA進去
      $(this).find('input').select();   //自動FOCUS該INPUT
    }
  });

  $(document).on('keypress', '.userInfo-td input', function(e) {
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) {
      //如果按了ENTER
      console.log(".tag-name-input keypress");
      $(this).blur(); //就離開此INPUT，觸發on blur事件
    }
  });
  $(document).on('blur', '.userInfo-td input', function() {
    //當USER離開此INPUT
    console.log(".userInfo-td-input blur");
    let val = $(this).val();  //抓INPUT裡的資料
    if( !val ) val="new tag";
    $(this).parent().html(val);   //將INPUT元素刪掉，把資料直接放上去
  });

  // mouse hover the chatApp
  $("#chatApp").hover(
    function() {
      console.log('this is hovered');

      $(this).css('width', '250px').find('h4').delay(50).fadeIn();
    },
    function() {
      $(this).css('width', '70px').find('h4').hide();
    }
  );
  // mouse hover the memo
  $(".memo").hover(
    function() {
      $(this).css('width', '400px');
    },
    function() {
      $(this).css('width', '45%');
    }
  );
  // mouse cli the ticket
  $("#infoCanvas").hover(
    function() {
      $(this).css('width', '600px');
      $('.memo').css('margin-left', '30%');
    },
    function() {
      $(this).css('width', '100%');
      $('.memo').css('margin-left', '0%');
    }
  );
  // select a group
  $('.chatApp_item[open="true"]').click(function() {
    $('.choose').hide();
    $('.error').hide();
    $(this).addClass('select').siblings().removeClass('select'); // 對點選以外的選項都隱藏

    let id = $(this).attr('id');
    $("#user").children('#' + id + '_room').show('fast').siblings('.tablinks_area').hide(); // 對應的id以外的選項都隱藏

    let title = $(this).children('h4').text();
    $(".filter_head #title").html(title);
  });

  $(document).on("mouseenter", ".message", function() {
    // console.log("HAA");
    $(this).find('.sender').show();
  });
  $(document).on("mouseleave", ".message", function() {
    // console.log("888");
    $(this).find('.sender').hide();
  });

  setInterval(() => {
    closeIdleRoomTry();
  }, 20000);

  if (window.location.pathname === '/chat') {
    socket.emit("get tags from chat");
    let timer_1 = setInterval( function() {
      if( !auth.currentUser ) {
        // console.log("currentUser not loaded yet!");
        return;
      }
      else {
        clearInterval(timer_1);
        userId = auth.currentUser.uid;
        // console.log("userId = "+userId);
        database.ref('users/' + userId).once('value', snap => {
          // console.log(snap.val());
          let id1 = snap.val().chanId_1;
          let id2 = snap.val().chanId_2;
          let secret1 = snap.val().chanSecret_1;
          let secret2 = snap.val().chanSecret_2;
          let token1 = snap.val().chanAT_1;
          let token2 = snap.val().chanAT_2;
          if((id1 === undefined || id1 === null || id1 === '' ||
          secret1 === undefined || secret1 === null || secret1 === '' ||
          token1 === undefined || token1 === null || token1 === '' )&&
          (id2 === undefined || id2 === null || id2 === '' ||
          secret2 === undefined || secret2 === null || secret2 === '' ||
          token2 === undefined || token2 === null || token2 === '' ))
          {
            $('.error').append('您還沒有做聊天設定，請至Settings做設定。');
            setTimeout(() => {
              $('.error').text('');
            }, 10000)
          } else if((id1 === undefined || id1 === null || id1 === '' ||
          secret1 === undefined || secret1 === null || secret1 === '' ||
          token1 === undefined || token1 === null || token1 === '')||
          (id2 === undefined || id2 === null || id2 === '' ||
          secret2 === undefined || secret2 === null || secret2 === '' ||
          token2 === undefined || token2 === null || token2 === ''))
          {
            socket.emit('update bot', [
              {
                channelId: id1,
                channelSecret: secret1,
                channelAccessToken: token1
              },
              {
                channelId: id2,
                channelSecret: secret2,
                channelAccessToken: token2
              },
            ]);
            $('.error').append('您其中一個LINE群組還沒有做聊天設定，如有需要請至Settings做設定。');
            setTimeout(() => {
              $('.error').text('');
            }, 10000);

          } else {
            socket.emit('update bot', [
              {
                channelId: id1,
                channelSecret: secret1,
                channelAccessToken: token1
              },
              {
                channelId: id2,
                channelSecret: secret2,
                channelAccessToken: token2
              },
            ]);
          }
        });
        agentName();
        // loadChatRoom();
        // console.log("Start loading Line channel...");
        socket.emit('request line channel', userId);
      }
    }, 10);

    setTimeout(() => { // 載入群組名稱
      loadChatGroupName();
    }, 1000)
  }

  socket.on('response line channel', (data) => {
    $('.tablinks_area#Line_1_room').attr('rel', data.chanId_1);
    $('.tablinks_area#Line_2_room').attr('rel', data.chanId_2);
    // console.log("Line channel loading complete!");

    // console.log("Start loading history message...");
    socket.emit('get json from back');
  })

  socket.on('push json to front', (data) => {
    //www emit data of history msg
    // console.log("push json to front");
    for (i in data) pushMsg(data[i]); //one user do function one time
    setTimeout(function() {
      for (i in data) pushInfo(data[i]);
    }, 500);
    sortUsers("recentTime", sortRecentBool, function(a, b) {
      return a < b;
    }); //sort users by recent time
    closeIdleRoomTry();
    // $('.tablinks_head').text('Loading complete'); //origin text is "network loading"
  });

  socket.on('push user ticket', (data) => {
    // console.log(data);
    let id = data.id;
    let ticket = data.ticket;
    let content = '';
    for (let i in ticket) {
      content +=
      "<div class='card text-center ticket-card'>" +
      "<div class='ticket-card-header' " +
      "style='color:white;background-color:" + priorityColor(ticket[i].priority) + "'>" +
      "ticket No." + ticket[i].id +
      "</div>" +
      "<div class='card-body'>" +
      "<h4 class='card-title'>" + ticket[i].subject + "</h4>" +
      "<p class='card-text'>" + ticket[i].description + "</p>" +
      "</div>" +
      "<div class='card-footer text-muted'>" +
      "Create at " + CreateDate(ticket[i].created_at) + " ago" +
      "</div>" +
      "</div>"
    }
    $("#" + id + "-info").children("#ticket").append(content);
  });

  socket.on('upload history msg from back', data => {
    console.log('get uploaded history msg');
    let msgContent = $('#' + data.userId + '-content' + '[rel="'+data.channelId+'"]');

    let origin_height = msgContent[0].scrollHeight;
    msgContent.find('.message:first').remove();
    msgContent.find('.message-day:lt(3)').remove();

    msgContent.prepend(historyMsg_to_Str(data.messages));
    let now_height = msgContent[0].scrollHeight;
    msgContent.animate({
      scrollTop: now_height - origin_height
    }, 0);

    if (msgContent.attr('data-position') > 0) msgContent.prepend(LOADING_MSG_AND_ICON);
    else msgContent.prepend(NO_HISTORY_MSG);
  });

  socket.on('new message', (data) => {
    console.log("receive socket! data = ");
    console.log(data);
    // console.log(data);
    // if www push "new message"
    // console.log("Message get! identity=" + data.owner + ", name=" + data.name);
    // owner = "user", "agent" ; name = "Colman", "Ted", others...
    if( !data.channelId ) data.channelId = "FB";
    displayMessage(data, data.channelId); //update canvas
    displayClient(data, data.channelId); //update tablinks

    // if (data.owner === "user") change_document_title(data.name); //not done yet
    if (name_list.indexOf(data.channelId+data.id) == -1) { //if its never chated user, push his name into name list
      name_list.push(data.channelId+data.id);
      console.log("new user!!! push into name_list!");
    }
  });

  socket.on('new user profile', function(data) {
    console.log('new user come in from www!');
    // console.log(data);
    userProfiles[data.userId] = data;
  });

  /*  =================================  */

  socket.on("push tags to chat", data => {
    TagsData = data;
    initialFilterWay();
    initialFilterSilder();
  });

  $('#selectBy').on('change', function() {
    let selected = [];

    if ($(this).find('input:checked').length > 5) {
      $(this).find('#warning').text('最多五個選項');
      return;
    } else {
      $(this).find('#warning').html('&nbsp;');
      $(this).find('input:checked').each(function() {
        selected.push($(this).attr('value'));
      });
      $('.filterBar').each(function() {
        let filter_way = $(this).attr('id');
        if (selected.indexOf(filter_way) != -1) {
          $(this).show();
          $('#filter_VIP等級').show();
        } else $(this).hide();
      });
    }
  });

  $('#filterBtn').on('click', function() {
    $('.tablinks').each(function() {
      $(this).show();
      let userId = $(this).attr('rel');
      let profile = userProfiles[userId];
      // console.log("now filter user " + userId + ", profile:");
      // console.log(profile);

      if ($('#filter_age').is(':visible')) {
        let user_option = profile['年齡'];
        if (user_option) {
          let user_age = parseInt(user_option);
          let min = $('#filter_age .multiselect-selected-text').attr('min');
          let max = $('#filter_age .multiselect-selected-text').attr('max');
          console.log("user_age = " + user_age + ", min=" + min + ",max=" + max);
          if (user_age < min || user_age > max) {
            $(this).hide();
            return;
          }
        }
      }
      if ($('#filter_place').is(':visible')) {
        user_option = profile['地區'];
        select_option = $('#filter_place .multiselect-selected-text').text();
        if (user_option && select_option != "全選") {
          console.log(userId + " place = " + user_option + "select_option = " + select_option);
          if (select_option.indexOf(user_option) == -1) {
            $(this).hide();
            return;
          }
        }
      }

      if ($('#filter_recent').is(':visible')) {
        user_option = profile['上次聊天時間'];
        if (user_option) {
          let min = $('#filter_recent .multiselect-selected-text').attr('min');
          let max = $('#filter_recent .multiselect-selected-text').attr('max');
          let user_time_gap = Date.now() - user_option;
          console.log("user_option = " + user_option + " user_time_gap = " + user_time_gap + " min=" + min + ",max=" + max);
          if (user_time_gap < min || user_time_gap > max) {
            $(this).hide();
            return;
          }
        }
      }
      if ($('#filter_first').is(':visible')) {
        user_option = profile['firstChat'];
        if (user_option) {
          let min = $('#filter_first .multiselect-selected-text').attr('min');
          let max = $('#filter_first .multiselect-selected-text').attr('max');
          let user_time_gap = Date.now() - user_option;
          console.log(" user_option = " + user_option + " user_time_gap = " + user_time_gap + " min=" + min + ",max=" + max);
          if (user_time_gap < min || user_time_gap > max) {
            $(this).hide();
            return;
          }
        }
      } //end if
      if ($('#filter_VIP等級').is(':visible')) {
        user_option = profile['VIP等級'];
        select_option = $('#filter_VIP等級 .multiselect-selected-text').text();
        console.log('this is select_option on line 627');
        // console.log(select_option);
        if (select_option != "全選") {
          if (!user_option) {
            $(this).hide();
            return;
          }

        }
      }
      for (let way in filterDataCustomer) {
        if ($('#filter_' + way).is(':visible')) {
          user_option = profile[way];
          select_option = $('#filter_' + way + ' .multiselect-selected-text').text();

          if (select_option != "全選") {


            if (!user_option) {
              $(this).hide();
              return;
            }
            // console.log(userId + ", " + way + "=" + user_option + ", select_option=" + select_option);
            user_option = user_option.split(',');
            // console.log(user_option);
            let i;
            for (i = 0; i < user_option.length; i++) {
              if (select_option.indexOf(user_option[i]) != -1) break;
            } //for
            if (i == user_option.length) {
              $(this).hide();
              return;
            } //if
          } //if全選
        }
      } //end for

    });
  });

  $('#filterBtn-clean').on('click', function() {
    $('.tablinks').show();
    $('.filterSlider').slider("values", [0, 999]);
    $('.filterBar .filterSelect').find('input[type="checkbox"]').prop('checked', true);
    $('.filterSelect').parent().parent().find('.multiselect-selected-text').text('全選');
  });

  //extend jquery, let searching case insensitive
  $.extend($.expr[':'], {
    'containsi': function(elem, i, match, array) {
      return (elem.textContent || elem.innerText || '').toLowerCase()
      .indexOf((match[3] || "").toLowerCase()) >= 0;
    }
  });

  $('.datepicker').datepicker({
    dateFormat: 'yy-mm-dd'
  });

  $('.filterClean').on('click', function() {
    $('#startdate').val('');
    $('#enddate').val('');
    $('.tablinks').show();
    displayAll();
  });

  $('.filterDate').on('click', function() {
    let filterWay = $(this).attr('id');
    let startTime = new Date($('#startdate').val()).getTime();
    let endTime = new Date($('#enddate').val()).getTime();

    if (startTime > endTime) alert('startTime must early then endTime');
    else {
      $('.tablinks').each(function() {
        let val = $(this).attr('data-' + filterWay);
        if (val < startTime || val > (endTime + 86400000)) $(this).hide();
        else $(this).show();
      });
    }
  });

  $('.filterTime').on('click', function() {
    $('#startdate').val('');
    $('#enddate').val('');

    let filterWay = $(this).attr('id');
    let val = $('#filterTimeSelect').val();
    let a;
    let b;
    if (val == 0) {
      a = 0;
      b = 5;
    } else if (val == 1) {
      a = 5;
      b = 10;
    } else if (val == 2) {
      a = 10;
      b = 30;
    } else if (val == 3) {
      a = 30;
      b = 60;
    } else if (val == 4) {
      a = 60;
      b = 9999999;
    } else alert(val);

    $('.tablinks').each(function() {
      let val = $(this).attr('data-' + filterWay);
      if (val > a && val < b) $(this).show();
      else $(this).hide();
    });
  });

  socket.on('push inside chat', (data) => {
    console.log("YO");
    console.log(data);
    for( let i in data ) pushInsideMsg(data[i]);
  });

  $(document).on('click', '.inside-tablinks', function() {
    let id = $(this).attr('id');
    $('.tabcontent#'+id).show();

    $("#inside-selected").removeAttr('id').css("background-color", "");   //selected tablinks change, clean prev's color
    $(this).attr('id','inside-selected').css("background-color",COLOR.CLICKED);    //clicked tablinks color

    let target = $(this).attr('id');         //find the message canvas
    let rel = $(this).attr('rel');
    $('#'+id).show().siblings().hide();   //show it, and close others
    $('#'+target+'-content' + "[rel='"+rel+"']").scrollTop($('#'+target+'-content' + "[rel='"+rel+"']")[0].scrollHeight);   //scroll to down

    console.log('click tablink executed');
  });

  // inner functions
  function pushMsg(data) {
    // console.log(data);
    // one user do function one time; data structure see file's end
    let historyMsg = data.Messages;
    let profile = data.Profile;
    // console.log(profile);

    let historyMsgStr = "";
    if (data.position != 0) {
      //if there's still history messages unloaded
      historyMsgStr += LOADING_MSG_AND_ICON; //history message string head
    }
    else {
      historyMsgStr += NO_HISTORY_MSG; //history message string head
    }

    historyMsgStr += historyMsg_to_Str(historyMsg);
    historyMsgStr += "<p class='message-day' style='text-align: center'><strong><italic>" +
    "-即時訊息-" +
    " </italic></strong></p>"; //history message string tail
    // end of history message

    $('#user-rooms').append('<option value="' + profile.userId + '">' + profile.nickname + '</option>'); //new a option in select bar
    let lastMsg = historyMsg[historyMsg.length - 1];
    // let font_weight = profile.unRead ? "bold" : "normal"; //if last msg is by user, then assume the msg is unread by agent
    let font_weight = "normal";
    let lastMsgStr = '<br><div id="msg" style="font-weight: ' + font_weight + '; font-size:8px; margin-left:12px;">' + lastMsg.message + "</div>";
    let msgTime = '<div style="float:right;font-size:8px; font-weight:normal">' + toTimeStr_minusQuo(lastMsg.time) + '</div>';
    // display last message at tablinks

    if(profile.channelId === undefined || profile.channelId === "FB"){
      // console.log('to fb');
      if( profile.channelId === undefined ) profile.channelId = "FB";
      // name_list.push(profile.channelId+profile.userId); //make a name list of all chated user
      $('#fb-clients').append(
        "<b><button style='text-align:left' class='tablinks'" +
        "name='" + profile.userId + "' rel='" + profile.channelId + "'" +
        "data-avgTime='" + profile.avgChat + "' " +
        "data-totalTime='" + profile.totalChat + "' " +
        "data-chatTimeCount='" + profile.chatTimeCount + "' " +
        "data-firstTime='" + profile.firstChat + "' " +
        "data-recentTime='" + lastMsg.time + "' >"+
        "<div class='img_holder'>" +
        "<img src='" + profile.photo + "' alt='無法顯示相片'>" +
        "</div>" +
        "<div class='msg_holder'>" +
        profile.nickname +
        lastMsgStr +
        "</div>" +
        "<div class='agentImg_holder'>" +
        "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
        "</div>" +
        "<div class='unread_msg' style='display:none;'>" + profile.unRead + "</div>" +
        "</button></b>"
      ); //new a tablinks
    } else if(profile.channelId === $('#Line_1_room').attr('rel')){
      // console.log('to room 1');
      $('#line1-clients').append(
        "<b><button style='text-align:left' class='tablinks'" +
        "name='" + profile.userId + "' rel='" + profile.channelId + "'" +
        "data-avgTime='" + profile.avgChat + "' " +
        "data-totalTime='" + profile.totalChat + "' " +
        "data-chatTimeCount='" + profile.chatTimeCount + "' " +
        "data-firstTime='" + profile.firstChat + "' " +
        "data-recentTime='" + lastMsg.time + "' >"+
        "<div class='img_holder'>" +
        "<img src='" + profile.photo + "' alt='無法顯示相片'>" +
        "</div>" +
        "<div class='msg_holder'>" +
        profile.nickname +
        lastMsgStr +
        "</div>" +
        "<div class='agentImg_holder'>" +
        "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
        "</div>" +
        "<div class='unread_msg' style='display:none;'>" + profile.unRead + "</div>" +
        "</button></b>"
      ); //new a tablinks
    } else if(profile.channelId === $('#Line_2_room').attr('rel')){

      // console.log('to room 2');
      $('#line2-clients').append(
        "<b><button style='text-align:left' class='tablinks'" +
        "name='" + profile.userId + "' rel='" + profile.channelId + "'" +
        "data-avgTime='" + profile.avgChat + "' " +
        "data-totalTime='" + profile.totalChat + "' " +
        "data-chatTimeCount='" + profile.chatTimeCount + "' " +
        "data-firstTime='" + profile.firstChat + "' " +
        "data-recentTime='" + lastMsg.time + "' >"+
        "<div class='img_holder'>" +
        "<img src='" + profile.photo + "' alt='無法顯示相片'>" +
        "</div>" +
        "<div class='msg_holder'>" +
        profile.nickname +
        lastMsgStr +
        "</div>" +
        "<div class='agentImg_holder'>" +
        "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
        "</div>" +
        "<div class='unread_msg' style='display:none;'>" + profile.unRead + "</div>" +
        "</button></b>"
      ); //new a tablinks
    } else {
      // console.log('not found');
      // console.log("profile.channelId: " + profile.channelId);
    }

    if(profile.channelId === undefined || profile.channelId == "FB"){
      canvas.append( //push string into canvas
        '<div id="' + profile.userId + '" rel="FB" class="tabcontent"style="display: none;">' +
        '<span class="topright">x&nbsp;&nbsp;&nbsp</span>' +
        "<div id='" + profile.userId + "-content' rel='FB' class='messagePanel' data-position='" + data.position + "'>" +
        historyMsgStr + "</div>" +
        "</div>"
      ); // close append
    } else {
      canvas.append( //push string into canvas
        '<div id="' + profile.userId + '" rel="'+profile.channelId+'" class="tabcontent"style="display: none;">' +
        '<span class="topright">x&nbsp;&nbsp;&nbsp</span>' +
        "<div id='" + profile.userId + "-content' rel='"+profile.channelId+"' class='messagePanel' data-position='" + data.position + "'>" +
        historyMsgStr + "</div>" +
        "</div>"
      ); // close append
    }

    if (data.position != 0) $('#' + profile.userId + '-content' + '[rel="'+profile.channelId+'"]').on('scroll', function() {
      detecetScrollTop($(this));
    });

    if (profile.unRead == 0 || false) {
      $("#unread_" + n + "").hide();
    }
    else {
      $("#unread_" + n + "").show();
    }
    n++;

    name_list.push(profile.channelId+profile.userId); //make a name list of all chated user
    userProfiles[profile.userId] = profile;
    // console.log(name_list);
  } // end of pushMsg

  function agentName() {
    //enter agent name
    database.ref('users/' + userId).once('value', snap => {
      let profInfo = snap.val();
      let profId = Object.keys(profInfo);
      person = profInfo.nickname; //從DB獲取agent的nickname

      if (person) {
        socket.emit('new user', person, (data) => {
          if (data) {} //check whether username is already taken
          else {
            alert('username is already taken');
            person = prompt("Please enter your name"); //update new username
            database.ref('users/' + userId).update({
              nickname: person
            });
          }
        });
      }
      else {
        // console.log('name2');
        person = prompt("Please enter your name"); //if username not exist,update username
        database.ref('users/' + userId).update({
          nickname: person
        });
      }
      // printAgent.html("Welcome <b>" + person + "</b>! You're now on board.");
    });
  } // end of agentName

  function displayMessage(data, channelId) {
    // update canvas
    // console.log(data);
    console.log(channelId+data.id);
    if (name_list.indexOf(channelId+data.id) !== -1) { //if its chated user
      let str;

      let designated_chat_room_msg_time = $("#" + data.id + "-content" + "[rel='"+channelId+"']").find(".message:last").attr('rel');
      if (data.time - designated_chat_room_msg_time >= 900000) { // 如果現在時間多上一筆聊天記錄15分鐘
        $("#" + data.id + "-content" + "[rel='"+channelId+"']").append('<p class="message-day" style="text-align: center"><strong>-新訊息-</strong></p>');
      }
      if (data.owner == "agent") str = toAgentStr(data.message, data.name, data.time);
      else str = toUserStr(data.message, data.name, data.time);

      $("#" + data.id + "-content" + "[rel='"+channelId+"']").append(str); //push message into right canvas
      $('#' + data.id + '-content' + "[rel='"+channelId+"']").scrollTop($('#' + data.id + '-content' + '[rel="'+channelId+'"]')[0].scrollHeight); //scroll to down
    } //close if
    else { //if its never chated user
      let historyMsgStr = NO_HISTORY_MSG;

      if (data.owner == "agent") historyMsgStr += toAgentStr(data.message, data.name, data.time);
      else historyMsgStr += toUserStr(data.message, data.name, data.time);

      canvas.append( //new a canvas
        '<div id="' + data.id + '" class="tabcontent" style="display: none;">' +
        '<span class="topright">x&nbsp;</span>' +
        '<div id="' + data.id + '-content" rel="'+channelId+'" class="messagePanel">' +
        historyMsgStr +
        '</div></div>'
      ); // close append

      $('#user-rooms').append('<option value="' + data.id + '">' + data.name + '</option>'); //new a option in select bar
    }
  } // end of displayMessage

  function displayClient(data, channelId) {
    // console.log(data);
    // console.log(channelId+data.id);
    // console.log(data.message);
    //update tablinks
    let font_weight = data.owner == "user" ? "bold" : "normal"; //if msg is by user, mark it unread

    console.log(name_list);
    console.log(name_list.indexOf(channelId+data.id) > -1);
    if (name_list.indexOf(data.channelId+data.id) > -1) {
      let target = $('.tablinks_area[rel="'+channelId+'"]').find(".tablinks[name='" + data.id + "'][rel='"+channelId+"']");
      target.find("#msg").html(toTimeStr(data.time) + data.message).css("font-weight", font_weight); // 未讀訊息字體變大
      target.find('.unread_msg').html(data.unRead).css("display", "block"); // 未讀訊息數顯示出來
      target.attr("data-recentTime", data.time);
      // update tablnks's last msg
      // console.log('data.unRead on line 400');
      // console.log(data.unRead);
      if (data.unRead == 0 || data.unRead == false || data.unRead == 'undefined') {
        console.log('im here');
        target.find('.unread_msg').html(data.unRead).css("display", "none");
      }
      n++;

      let ele = target.parents('b'); //buttons to b
      ele.remove();
      $('.tablinks_area[rel="'+channelId+'"]>.list-group:first').prepend(ele);
    }
    else { //new user, make a tablinks
      // pictureUrl
      console.log('new user');

      $('.tablinks_area[rel="'+channelId+'"]>.list-group:first').prepend(
        "<b><button style='text-align:left' name='" + data.id + "' rel='" + channelId + "' class='tablinks'>" +
        "<div class='img_holder'>" +
        "<img src='" + data.pictureUrl + "' alt='無法顯示相片'>" +
        "</div>" +
        "<div class='msg_holder'>" +
        data.name +
        "<br />" +
        data.message +
        "</div>" +
        "<div class='unread_msg'>" + data.unRead + "</div>" +
        "<div class='agentImg_holder'>" +
        "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
        "</div>" +
        "</button></b>"
      );

      infoCanvas.append(
        '<div class="card-group" id="' + data.id + '-info" style="display:none">' +
        '<div class="card-body" id="profile">' +
        "<div class='photoContainer'>" +
        '<img src="' + data.pictureUrl + '" alt="無法顯示相片" style="width:128px;height:128px;">' +
        "</div>" +
        "<table class='panelTable'>" +
        "<tbody>" +
        "<tr>" +
        "<th class='userInfo-th' id='nickname'>nickname</th>" +
        "<td class='userInfo-td' id='nickname' type='text' set='single' modify='false'>" +
        "<p id='td-inner'>" + data.name + "</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='年齡'>年齡</th>" +
        "<td class='userInfo-td' id='年齡' type='text' set='single' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='性別'>性別</th>" +
        "<td class='userInfo-td' id='性別' type='single_select' set='男,女' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='地區'>地區</th>" +
        "<td class='userInfo-td' id='地區' type='text' set='single' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='address'>address</th>" +
        "<td class='userInfo-td' id='address' type='text' set='single' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='telephone'>telephone</th>" +
        "<td class='userInfo-td' id='telephone' type='text' set='single' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='備註'>備註</th>" +
        "<td class='userInfo-td' id='備註' type='text' set='multi' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='TAG'>TAG</th>" +
        "<td class='userInfo-td' id='TAG' type='multi_select' set='奧客,未付費,廢話多,敢花錢,常客,老闆的好朋友,外國人,窮學生,花東團abc123,台南團abc456' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='VIP等級'>VIP等級</th>" +
        "<td class='userInfo-td' id='VIP等級' type='single_select' set='鑽石會員,白金會員,普通銅牌,超級普通會員' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='下次聯絡客戶時間'>下次聯絡客戶時間</th>" +
        "<td class='userInfo-td' id='下次聯絡客戶時間' type='time' set='' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "<p></p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='首次聊天時間'>首次聊天時間</th>" +
        "<td class='userInfo-td' id='首次聊天時間' type='time' set='' modify='false'>" +
        "<p id='td-inner'></p>" +
        "<p></p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='上次聊天時間'>上次聊天時間</th>" +
        "<td class='userInfo-td' id='上次聊天時間' type='time' set='' modify='false'>" +
        "<p id='td-inner'></p>" +
        "<p></p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='總共聊天時間'>總共聊天時間</th>" +
        "<td class='userInfo-td' id='總共聊天時間' type='text' set='single' modify='false'>" +
        "<p id='td-inner'></p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='聊天次數'>聊天次數</th>" +
        "<td class='userInfo-td' id='聊天次數' type='text' set='single' modify='false'>" +
        "<p id='td-inner'></p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='平均每次聊天時間'>平均每次聊天時間</th>" +
        "<td class='userInfo-td' id='平均每次聊天時間' type='text' set='single' modify='false'>" +
        "<p id='td-inner'></p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='客人的抱怨'>客人的抱怨</th>" +
        "<td class='userInfo-td' id='客人的抱怨' type='text' set='multi' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='付費階段'>付費階段</th>" +
        "<td class='userInfo-td' id='付費階段' type='single_select' set='等待報價,已完成報價，等待付費,已完成付費,要退錢' modify='false'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        '</div>' +
        '<div class="card-body" id="ticket" style="display:none; "></div>' +
        '<div class="card-body" id="todo" style="display:none; ">'+
        '<div class="ticket">'+
        '<table>'+
        '<thead>'+
        '<tr>'+
        '<th> ID </th>'+
        '<th> 客戶姓名 </th>'+
        '<th> 內容 </th>'+
        '<th> 狀態 </th>'+
        '<th> 優先 </th>'+
        '<th> 到期 </th>'+
        '<th><input type="text" class="ticket_search_bar" id="exampleInputAmount" value="" placeholder="Search"></th>'+
        '</tr>'+
        '</thead>'+
        '<tbody class="ticket-content">'+
        '</tbody>'+
        '</table>'+
        '</div>'+
        '</div>' +
        '</div>' +
        '</div>'
      );
    }
  } // end of displayClient

  function clickUserTablink() {
    console.log('click tablink executed');

    // 把未讀訊息數歸零
    let userId = $(this).attr('name');
    let roomId = $(this).attr('rel');
    let selectedId = [];
    let outerInfo, outerId, innerInfo;
    // console.log(userId, roomId);
    database.ref('chats/Data').once('value', outersnap => {
      outerInfo = outersnap.val();
      outerId = Object.keys(outerInfo);
      for(let i in outerId){
        database.ref('chats/Data/' + outerId[i]).once('value', innersnap => {
          innerInfo = innersnap.val();
          if(innerInfo.Profile.userId === userId && innerInfo.Profile.channelId === roomId){
            selectedId.push(outerId[i]);
            database.ref('chats/Data/' + selectedId[0] + '/Profile').update({
              unRead: 0
            });
          }
        });
      }
    });
    // setTimeout(() => {
    //
    // }, 2000)

    loadTable(userId);

    $(".tablinks#selected").removeAttr('id').css("background-color", ""); //selected tablinks change, clean prev's color
    $(this).attr('id', 'selected').css("background-color", COLOR.CLICKED); //clicked tablinks color

    $(this).find('.unread_msg').hide(); // 已讀 把未讀的區塊隱藏
    if ($(this).find('#msg').css("font-weight") === "bold") {
      $(this).find('#msg').css("font-weight", "normal"); //read msg, let msg dis-bold
      let channelId = $(this).parents('.tablinks_area').attr('rel');
      socket.emit("read message", {
        channelId: channelId,
        id: $(this).attr('rel')
      }); //tell socket that this user isnt unRead
    }

    let targetRel = $(this).attr('rel'); //find the message rel
    let targetId = $(this).attr('name'); //find the message id

    $('#user-rooms').val(targetId); //change value in select bar
    $("#" + targetId + "-info" + "[rel='"+targetRel+"-info']").show().siblings().hide();

    $("#" + targetId + "[rel='"+targetRel+"']").show().siblings().hide(); //show it, and close others
    $("#" + targetId + "[rel='"+targetRel+"']"+'>#' + targetId + '-content' + '[rel="'+targetRel+'"]').scrollTop($('#' + targetId + '-content' + '[rel="'+targetRel+'"]')[0].scrollHeight); //scroll to down

    let profile = userProfiles[targetId];
    // console.log(profile);
    $('#prof_nick').text(profile.nickname);
  } // end of clickUserTablink

  function toggleInfoPanel() {
    $(this).attr("active", 'true').parent().siblings().children().attr("active", 'false'); // 把其他的tab都收起來
    let panel = $(this).text().trim().toLowerCase();
    let translate = infoPanelTranslate(panel);
    $('.card-group:visible').find('#' + translate).show().siblings().hide();
  } // end of toggleInfoPanel

  function infoPanelTranslate(word){ // 暫時解
    switch(word){
      case '待辦事項':
      return 'todo';
      break;
      case '個人資料':
      return 'profile';
      break;
      default:
      break;
    }
  }

  function clickSpan() {
    let userId = $(this).parent().hide().attr("id");
    $(".tablinks[rel='" + userId + "'] ").removeAttr('id').css("background-color", ""); //clean tablinks color
  } // end of clickSpan


  function loadPanelProfile(profile) {
    for (let i in profile.email) {
      socket.emit('get ticket', {
        email: profile.email[i],
        id: profile.userId
      });
    }
    let html = "<table class='panelTable'>";
    for (let i in TagsData) {
      let name = TagsData[i].name;
      let type = TagsData[i].type;
      let set = TagsData[i].set;
      let modify = TagsData[i].modify;
      let tdHtml = "";
      if (name === '客戶編號') continue;
      if (name === '電子郵件') {
        for (let i in profile[name]) {
          tdHtml += '<p id="td-inner">' + profile[name][i] + '</p>';
        }
      } else if (type == 'text' || type == 'single_select') {
        if (profile[name] != undefined && profile[name] != null && profile[name] != "") tdHtml = '<p id="td-inner">' + profile[name] + '</p>';
        else tdHtml = '<p id="td-inner">尚未輸入</p>';
      } else if (type == "time") {
        if (profile[name] != undefined && profile[name] != null && profile[name] != "") {
          let d = new Date(profile[name]);
          tdHtml = '<p id="td-inner">' + d.getFullYear() + '/' + addZero(d.getMonth() + 1) + '/' + addZero(d.getDate()) + ' ' + addZero(d.getHours()) + ':' + addZero(d.getMinutes()) + '<p>';
        } else tdHtml = '<p id="td-inner">尚未輸入<p>';
      } else if (type == 'multi_select') {
        if (profile[name] == undefined || profile[name] == null || profile[name] == "") tdHtml = '<p id="td-inner">尚未輸入</p>';
        else {
          let arr = profile[name].split(",");
          for (let i in arr) tdHtml += '<span id="td-inner" class="tagSpan">' + arr[i] + '</span></br>';
        }
      }
      html +=
      '<tr>' +
      '<th class="userInfo-th" id="' + name + '">' + name + '</th>' +
      '<td class="userInfo-td" id="' + name + '" type="' + type + '" set="' + set + '" modify="false">' + tdHtml + '</td>';
    }
    html += "</table>";
    return html;
  } // end of loadPanelProfile

  function pushInfo(data) {
    let profile = data.Profile;
    infoCanvas.append(
      '<div class="card-group" id="' + profile.userId + '-info" rel="'+profile.channelId+'-info" style="display:none">' +
      '<div class="card-body" id="profile">' +
      "<div class='photoContainer'>" +
      '<img src="' + profile.photo + '" alt="無法顯示相片" style="width:128px;height:128px;">' +
      "</div>" +
      loadPanelProfile(profile) +
      '</div>' +
      '<div class="card-body" id="ticket" style="display:none; "></div>' +
      '<div class="card-body" id="todo" style="display:none; ">'+
      '<div class="ticket">'+
      '<table>'+
      '<thead>'+
      '<tr>'+
      '<th class="table-sort"> ID <i class="fa fa-fw fa-sort"></i></th>'+
      '<th class="table-sort"> 客戶姓名 <i class="fa fa-fw fa-sort"></i></th>'+
      '<th class="table-sort"> 內容 <i class="fa fa-fw fa-sort"></i></th>'+
      '<th class="table-sort"> 狀態 <i class="fa fa-fw fa-sort"></i></th>'+
      '<th class="table-sort"> 優先 <i class="fa fa-fw fa-sort"></i></th>'+
      '<th class="table-sort"> 到期 <i class="fa fa-fw fa-sort"></i></th>'+
      '<th><input type="text" class="ticket_search_bar" id="exampleInputAmount" value="" placeholder="搜尋"></th>'+
      '</tr>'+
      '</thead>'+
      '<tbody class="ticket-content">'+
      '</tbody>'+
      '</table>'+
      '</div>'+
      '</div>' +
      '</div>' +
      '</div>'
    );
  } // end of pushInfo

  function detecetScrollTop(ele) {
    if (ele.scrollTop() == 0) {
      let tail = parseInt(ele.attr('data-position'));
      let head = parseInt(ele.attr('data-position')) - 20;
      if (head < 0) head = 0;
      let request = {
        userId: ele.parent().attr('id'),
        head: head,
        tail: tail
      };
      if (head == 0) ele.off('scroll');
      ele.attr('data-position', head);
      socket.emit('upload history msg from front', request);
      console.log('upload! head = ' + head + ', tail = ' + tail);
    }
  } // end of detecetScrollTop

  function loadChatRoom(){
    console.log(userId);
    var chatObj;
    database.ref('users/' + userId).on('value', snap => {
      let chatInfo = snap.val();
      // console.log(chatInfo);
      chatObj = [
        {
          channelId: chatInfo.chanId_1,
          channelSecret: chatInfo.chanSecret_1,
          channelAccessToken: chatInfo.chanAT_1
        },
        {
          channelId: chatInfo.chanId_2,
          channelSecret: chatInfo.chanSecret_2,
          channelAccessToken: chatInfo.chanAT_2
        }
      ];
      socket.emit('chat to server', chatObj);
    });
  } // end of loadChatRoom

  function submitMemo(e){
    e.preventDefault();
    var ticket_id = $(this).parent().siblings().find(".data_id").text(); //把memo存到該客戶的第一張ticket裡

    $('.ticket_memo').prepend('<div><p>'+$('#message_memo').val()+'</p></div>');
    var ticket_memo = '{ "body": "'+$('#message_memo').val()+'", "private" : false }';
    $.ajax(
      {
        url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets/"+ticket_id[0]+"/notes",
        type: 'POST',
        contentType: "multipart/form-data",
        dataType: "json",
        headers: {
          "Authorization": "Basic " + btoa(api_key + ":x")
        },
        data: ticket_memo,
        success: function(data, textStatus, jqXHR) {
        },
        error: function(jqXHR, tranStatus) {
          x_request_id = jqXHR.getResponseHeader('X-Request-Id');
          response_text = jqXHR.responseText;
          console.log(response_text);
        }
      }
    );
    $('#message_memo').val("");
  }

  function submitMsg(e){
    e.preventDefault();
    // console.log($(this).parent().parent().siblings('#canvas').find('[style="display: block;"]').attr('rel'));
    // console.log($(this).parent().parent().parent().siblings('#user').find('.tablinks_area[style="display: block;"]').attr('id'));
    let sendObj = {
      id: "",
      msg: messageInput.val(),
      msgtime: Date.now(),
      room: $(this).parent().parent().parent().siblings('#user').find('.tablinks_area[style="display: block;"]').attr('id'),
      channelId: $(this).parent().parent().siblings('#canvas').find('[style="display: block;"]').attr('rel')
    };
    console.log(sendObj);
    sendObj.id = $("#user-rooms option:selected").val();
    socket.emit('send message', sendObj); //socket.emit
    messageInput.val('');
  } // end of submitMsg

  function submitProfile() {
    if ($('.edit-button:visible').length > 0) {
      alert('please check all tags change');
    } else if (confirm("Are you sure to change profile?")) {
      // console.log(buffer);
      socket.emit('update profile', buffer);
      $('.modal').modal('hide');
      userProfiles[buffer.userId] = JSON.parse(JSON.stringify(buffer)); //clone object
      $('.tablinks[rel=' + buffer.userId + ']').find('#nick').text(buffer.nickname);
    }
  } // end of submitProfile

  function initialFilterSilder() {
    $('.filterSlider').slider({
      orientation: "vertical",
      range: true,
      min: 0,
      step: 1,
      values: [-100, 100]
    }).each(function() {
      let id = $(this).attr('id');
      $(this).slider("option", "max", filterDataBasic[id].length - 1);
      let count = $(this).slider("option", "max") - $(this).slider("option", "min");
      for (let i in filterDataBasic[id]) {
        var el = $('<label>' + filterDataBasic[id][i] + '</label>').css('top', 100 - (i / count * 100) + '%');
        $(this).append(el);
      }
    });

    $('.filterSlider#age').slider("option", "change", function(event, ui) {
      let data = filterDataBasic["age"];
      let values = $(this).slider("values");
      let str = "";
      let min = 0;
      let max = 999;
      if (values[1] - values[0] == data.length - 1) str = "全選";
      else if (values[1] == values[0]) str = "未篩選";
      else {
        str = data[values[0]] + "~" + data[values[1]];
        min = parseInt(data[values[0]]);
        if (data[values[1]].indexOf('up') == -1) max = parseInt(data[values[1]]);
      }
      $(this).parent().parent().find('.multiselect-selected-text').text(str).attr('min', min).attr('max', max);
    });

    function toTimeStamp(str) {
      if (str.indexOf('up') != -1) return 9999999999999;
      else if (str.indexOf('<') != -1) return -99999;

      let num = parseInt(str);
      let unit = str.substr(str.indexOf(' ') + 1);
      if (unit == 'min') return num * 1000 * 60;
      else if (unit == 'hr') return num * 1000 * 60 * 60;
      else if (unit == 'day') return num * 1000 * 60 * 60 * 24;
      else if (unit == 'week') return num * 1000 * 60 * 60 * 24 * 7;
      else if (unit == 'month') return num * 1000 * 60 * 60 * 24 * 30;
      else if (unit == 'year') return num * 1000 * 60 * 60 * 24 * 365;
    }
    $('.filterSlider#recent').slider("option", "change", function(event, ui) {
      let data = filterDataBasic["recent"];
      let values = $(this).slider("values");
      let str = "";
      let min = -99999;
      let max = 9999999999999;
      if (values[1] - values[0] == data.length - 1) str = "全選";
      else if (values[1] == values[0]) str = "未篩選";
      else {
        str = data[values[0]] + "~" + data[values[1]];
        min = toTimeStamp(data[values[0]]);
        max = toTimeStamp(data[values[1]]);
      }
      $(this).parent().parent().find('.multiselect-selected-text').text(str).attr('min', min).attr('max', max);
    });
    $('.filterSlider#first').slider("option", "change", function(event, ui) {
      let data = filterDataBasic["first"];
      let values = $(this).slider("values");
      let str = "";
      let min = -99999;
      let max = 9999999999999;
      if (values[1] - values[0] == data.length - 1) str = "全選";
      else if (values[1] == values[0]) str = "未篩選";
      else {
        str = data[values[0]] + "~" + data[values[1]];
        min = toTimeStamp(data[values[0]]);
        max = toTimeStamp(data[values[1]]);
      }
      $(this).parent().parent().find('.multiselect-selected-text').text(str).attr('min', min).attr('max', max);
    });
  } // end of initialFilterSilder

  function initialFilterWay() {
    if (!TagsData) return;

    TagsData.map(function(ele) {
      if (ele.type.indexOf('select') != -1) {
        filterDataCustomer[ele.name] = ele.set;
      }
    });

    // console.log("filterDataCustomer: ");
    // console.log(filterDataCustomer);
    for (let way in filterDataCustomer) {
      if (way != 'VIP等級') {
        $('#selectBy').append('<li><input type="checkbox" value="filter_' + way + '">' + way + '</li>');
        $('.filterPanel').append(
          '<div class="filterUnit filterBar btn-group" id="filter_' + way + '" style="display:none;">' +
          '<button class="filter_btn" data-toggle="dropdown" aria-expanded="false">' +
          way + ':<span class="multiselect-selected-text">全選</span>' +
          '<b class="caret"></b></button>' +
          '<ul class="multiselect-container dropdown-menu">' +
          '<div class="filterSelect" id="' + way + '">' +
          '</div></ul></div>'
        );

        filterDataCustomer[way].map(function(option) {
          $('.filterSelect#' + way).append('<li><input type="checkbox" value="' + option + '" checked>' + option + '</li>');
        });
      }
    }
  } // end of initialFilterWay


  // ===============Colman=======================

  $(document).on('click', '.table-sort', function() {
    let index = $(this).index();
    let compare;
    let icon = $(this).find('i');
    if( icon.attr('class').indexOf('fa-sort-up')==-1 ) {
      compare = sortUp;
      icon.attr('class','fa fa-fw fa-sort-up');
    }
    else {
      compare = sortDown;
      icon.attr('class','fa fa-fw fa-sort-down');
    }
    $(this).siblings().find('i').attr('class','fa fa-fw fa-sort');

    let trs = $(this).parents('table').find('tbody').find('tr');
    for( let i=0; i<trs.length; i++ ) {
      for( let j=i+1; j<trs.length; j++ ) {
        let a = trs.eq(i).find('td').eq(index).text();
        let b = trs.eq(j).find('td').eq(index).text();
        if( compare( a, b ) ) {
          let tmp = trs[i];
          trs[i] = trs[j];
          trs[j] = tmp;
        }
      }
    }
    trs.eq(1).parent().append(trs);

    function sortUp( a, b ) {
      return a>b;
    }
    function sortDown( a, b ) {
      return a<b;
    }
  });

  $(document).on('keyup', '.ticket_search_bar', function(e) {
      console.log(".ticket_search_bar key press");
      let searchStr = $(this).val();

      let trs = $(this).parents('table').find('tbody').find('tr');
      trs.each(function() {
        let text = $(this).text();
        if( text.indexOf(searchStr)==-1 ) $(this).hide();
        else $(this).show();
      });
  });
  // ============Colman end======================

}); //document ready close tag




function groupSubmit() {
  let userId = auth.currentUser.uid;
  let thegroup = $(this).siblings('.myText').attr('id');
  let groupname = $(this).siblings('input').val();
  if (confirm('確認更改群組名稱為「'+thegroup+'」？')){ // 暫時解
    if(thegroup === 'group1'){
      database.ref('users/' + userId).update({
        group1: groupname
      });

    } else if(thegroup === 'group2'){
      database.ref('users/' + userId).update({
        group2: groupname
      });
    } else if(thegroup === 'fbgroup'){
      database.ref('users/' + userId).update({
        fbgroup: groupname
      });
    } else {
      console.log('update fail');
    }
    $('#'+thegroup).text(groupname)
    $(this).siblings().hide();
    $(this).hide();
    $(this).siblings('.software_icon').show();
    $(this).siblings('.myText').show();
    alert('群組名稱已修改為'+thegroup);
  }
}//end groupSubmit

function closeIdleRoomTry() {
  let early_time = Date.now() - 15 * 60 * 1000; //15min before now
  let lastForFb = $('#fb-clients').find('.tablinks:last'); //last user in online room
  let lastForLine1 = $('#line1-clients').find('.tablinks:last'); //last user in online room
  let lastforLine2 = $('#line2-clients').find('.tablinks:last'); //last user in online room
  while (lastForFb && lastForFb.attr('data-recentTime') < early_time) { //while last of online user should push into idle room
    lastForFb.parents('b').remove();
    $('#fb-idle-roomes').prepend(lastForFb.parents('b'));
    lastForFb = $('#fb-clients').find('.tablinks:last');
  }
  while ( lastForLine1 && lastForLine1.attr('data-recentTime') < early_time ) { //while last of online user should push into idle room
    lastForLine1.parents('b').remove();
    $('#line1-idle-roomes').prepend(lastForLine1.parents('b'))
    lastForLine1 = $('#line1-clients').find('.tablinks:last');
  }
  while ( lastforLine2 && lastforLine2.attr('data-recentTime') < early_time ) { //while last of online user should push into idle room
    lastforLine2.parents('b').remove();
    $('#line2-idle-roomes').prepend(lastforLine2.parents('b'));
    lastforLine2 = $('#line2-clients').find('.tablinks:last');
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

  for (let i = 0; i < total_users; i++) {
    user_list.push(canvas_all_children[i].getAttribute('id'));
    convert_list = Array.prototype.slice.call(canvas_all_children[i].getElementsByClassName("messagePanel")[0].getElementsByClassName("message"));
    canvas_last_child_time_list.push(convert_list.slice(-1)[0].getAttribute('rel'))
    if (over_fifteen_min - canvas_last_child_time_list[i] >= 60000) {
      // 更改display client的東西
      console.log('id = ' + user_list[i] + ' passed idle time');
      // item_move_down = $('[rel="'+user_list[i]+'"]').parent();
      $('#idle-roomes').append($('[rel="' + user_list[i] + '"]').parent());
      $('#clients').find('[rel="' + user_list[i] + '"]').remove();
    } else {
      console.log('id = ' + user_list[i] + ' passed chat time');
      // item_move_up = $('[rel="'+user_list[i]+'"]').parent();
      $('#clients').append($('[rel="' + user_list[i] + '"]').parent());
      $('#idle-roomes').find('[rel="' + user_list[i] + '"]').remove();
    }
  }
  user_list = [];
  convert_list = [];
  canvas_last_child_time_list = [];
}

function displayAll() {
  $('.tablinks').each(function() {
    let id = $(this).attr('id');
    let rel = $(this).attr('rel');
    $("div #" + id + "-content" + "[rel='"+rel+"']" + " .message").show().off("click");
    $(this).css("color", "");
  });
} // end of displayAll

function sortUsers(ref, up_or_down, operate) {
  let arr = $('#clients b');
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      let a = arr.eq(i).children(".tablinks").attr("data-" + ref) - '0';
      let b = arr.eq(j).children(".tablinks").attr("data-" + ref) - '0';
      if (up_or_down == operate(a, b)) {
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
    }
  }
  $('#clients').append(arr);

} //end of sortUsers

function priorityColor(priority) {
  switch (priority) {
    case 4:
    return 'rgb(230, 100, 100)';
    break;
    case 3:
    return 'rgb(233, 198, 13)';
    break;
    case 2:
    return 'rgb(113, 180, 209)';
    break;
    case 1:
    return 'rgb(126, 215, 170)';
    break;
    default:
    return 'N/A';
  }
} // end of priorityColor

function CreateDate(day) {
  let html = '';
  let nowTime = new Date().getTime();
  let dueday = Date.parse(displayDate(day));
  let sec = (nowTime - dueday) / 1000;

  if (sec < 60) return Math.round(sec) + " second(s)";
  else {
    let min = sec / 60;
    if (min < 60) return Math.round(min) + " minute(s)";
    else {
      let hr = min / 60;
      if (hr < 48) return Math.round(hr) + " hours(s)";
      else {
        let day = Math.floor(hr / 24);
        hr %= 24;
        return day + " day(s) " + Math.round(hr) + " hour(s) ";
      }
    }
  }
} // end of CreateDate

function displayDate(date) {
  let origin = new Date(date);
  origin = origin.getTime();
  let gmt8 = new Date(origin);

  let yy = gmt8.getFullYear(),
  mm = gmt8.getMonth() + 1,
  dd = gmt8.getDate(),
  hr = gmt8.getHours(),
  min = gmt8.getMinutes(),
  sec = gmt8.getSeconds();

  return yy + "/" + mm + "/" + dd + " " + hr + ":" + min + ":" + sec;
} // end of displayDate

function sortRecentChatTime() {
  sortUsers("recentTime", sortRecentBool, function(a, b) {
    return a < b;
  });
  sortRecentBool = !sortRecentBool;
} // end of sortRecentChatTime


function showProfile() {
  console.log("show profile");
  let target = $('.tablinks#selected').attr('rel'); //get useridd of current selected user
  if (target == undefined) {
    infoTable.html("please choose an user");
    return;
  }
  // console.log("show profile of userId " + target);
  reload_tags();
  showTargetProfile(userProfiles[target]);
} // end of showProfile

function reload_tags() {
  infoTable.empty();
  for (let i in TagsData) {
    let name = TagsData[i].name;
    let type = TagsData[i].type;
    let set = TagsData[i].set;
    let modify = TagsData[i].modify;
    let tdHtml = "";
    if (type == 'text') tdHtml = '<p id="td-inner">尚未輸入<p>';
    else if (type == "time" && modify == true) tdHtml = '<input type="datetime-local" id="td-inner"></input>';
    else if (type == "time" && modify == false) tdHtml = '<input type="datetime-local" id="td-inner" readOnly></input>';
    else if (type == 'single_select') {
      if (modify == true) tdHtml = '<select id="td-inner">';
      else tdHtml = '<select id="td-inner" disabled>';
      for (let j in set) tdHtml += '<option value="' + set[j] + '">' + set[j] + '</option>';
      tdHtml += '</select>';
    } else if (type == 'multi_select') {
      tdHtml = '<div class="btn-group" id="td-inner" data="">';
      if (modify == true) tdHtml += '<button type="button" data-toggle="dropdown" aria-expanded="false">';
      else tdHtml += '<button type="button" data-toggle="dropdown" aria-expanded="false" disabled>';
      tdHtml += '<span class="multiselect-selected-text"></span><b class="caret"></b></button>' +
      '<ul class="multiselect-container dropdown-menu">';
      // + '<li><button value="全選" id="select-all">全選</li>';
      for (let j in set) tdHtml += '<li><input type="checkbox" value="' + set[j] + '">' + set[j] + '</li>';
      tdHtml += '</ul></div>';
    }
    infoTable.append(
      '<tr>' +
      '<th class="userInfo-th" id="' + name + '">' + name + '</th>' +
      '<th class="userInfo-td" id="' + name + '" type="' + type + '" set="' + set + '" modify="' + modify + '">' + tdHtml + '</th>' +
      '<td class="edit-button yes" name="yes">yes</td>' +
      '<td class="edit-button no" name="no">no</td>' +
      '</tr>'
    );
    // prof_userName.append(prof_name);
  }
} // end of reload_tags

function showTargetProfile(profile) {
  buffer = JSON.parse(JSON.stringify(profile)); //clone object

  var nick = buffer.nickname;
  console.log(nick);
  $('#prof_nick').text(nick);

  $('.info_input_table .userInfo-td').each(function() {
    let data = buffer[$(this).attr('id')];
    let type = $(this).attr('type');
    let inner = $(this).find('#td-inner');

    if (data) {
      if (type == 'text') inner.text(data);
      else if (type == 'single_select') inner.val(data);
      else if (type == "multi_select") {
        inner.attr('data', data);
        inner.find('.multiselect-selected-text').text(data);

        let arr = data.split(',');
        inner.find('input').each(function() {
          if (arr.indexOf($(this).val()) != -1) $(this).prop('checked', true);
          else $(this).prop('checked', false);
        });
      } else if (type == 'time') {
        let d = new Date(data);
        inner.val(d.getFullYear() + '-' + addZero(d.getMonth() + 1) + '-' + addZero(d.getDate()) + 'T' + addZero(d.getHours()) + ':' + addZero(d.getMinutes()));
      }
    } else { ///if undefined, load default string, not prev string
      if (type == 'text') inner.text("尚未輸入");
      else if (type == 'single_select') inner.val("");
      else if (type == "multi_select") {
        inner.attr('data', "");
        inner.find('.multiselect-selected-text').text("");
        inner.find('input').attr('checked', false);
      } else if (type == 'time') inner.val("");
    }
  });
} // end of showTargetProfile

function editProfile() {
  if ($(this).parent().children('.edit-button').is(':visible')) return;
  else $(this).parent().children('.edit-button').show(); //show yes/no button
  ///on click, off click has some strange bug, so change way ><

  let type = $(this).attr('type');
  let set = $(this).attr('set');
  let text = $(this).find('#td-inner').text();

  if (type == 'text') {
    if (set == 'single') $(this).empty().html('<input type="text" class="textarea" id="td-inner" value="' + text + '" />');
    else if (set == 'multi') $(this).empty().html('<textarea type="text" class="textarea" id="td-inner" rows="4" columns = "20" style="resize: none;" >' + text + '</textarea>');
    else console.log("error 646");
  } else if (type == 'single_select') {
    //do nothing
  } else if (type == 'time') {
    //do nothing
  } else if (type == 'multi_select') {
    // $(this).empty().html('<input type="text" class="textarea" id="td-inner" value="' + text +'" />');
  }
  $(this).find('#td-inner').select();
} // end of editProfile

function multiselect_change() {
  let boxes = $(this).find('input');
  let arr = [];
  boxes.each(function() {
    if ($(this).is(':checked')) arr.push($(this).val());
  });
  if (arr.length == boxes.length) arr = "全選";
  else arr = arr.join(',');
  $(this).parent().find($('.multiselect-selected-text')).text(arr);
} // end of multiselect_change

function changeProfile(edit) {
  let td = $(this).parent().children('.userInfo-td');
  let id = td.attr('id');
  let type = td.attr('type');
  let inner = td.find('#td-inner');

  $(this).parent().children('.edit-button').hide(); //hide yes/no button

  if ($(this).attr('name') == 'yes') { //confirm edit, change data in buffer instead of DB
    let content;
    if (type == "text") {
      content = inner.val();
      if (!content) content = "尚未輸入";
      td.html('<p id="td-inner">' + content + '</p>');
    } else if (type == 'single_select') content = inner.val();
    else if (type == "multi_select") {
      content = inner.find('.multiselect-selected-text').text();
    } else if (type == "time") {
      content = new Date(inner.val()).getTime();
    }
    buffer[id] = content;
    // console.log("content = " + content);
  } else { //deny edit, restore data before editing
    let origin = buffer[id];
    if (origin == undefined) origin = "";

    if (type == "text") {
      if (!origin) origin = "尚未輸入";
      td.html('<p id="td-inner">' + origin + '</p>');
    } else if (type == 'single_select') inner.val(origin);
    else if (type == "multi_select") {
      inner.find('.multiselect-selected-text').text(origin);

      inner.find('input').prop('checked', false);
      if (origin) {
        let arr = origin.split(',');
        for (let j in arr) inner.find('input[value="' + arr[j] + '"]').prop('checked', true);
      }
    } else if (type == "time") {
      let d = new Date(origin);
      console.log("date = " + d.toString());
      inner.val(d.getFullYear() + '-' + addZero(d.getMonth() + 1) + '-' + addZero(d.getDate()) + 'T' + addZero(d.getHours()) + ':' + addZero(d.getMinutes()));
    }
  }
} // end of changeProfile

function pushInsideMsg(data) {
  let messages = data.Messages;
  let profile = data.Profile;

  let historyMsgStr = NO_HISTORY_MSG;
  historyMsgStr += historyMsg_to_Str(messages);
  historyMsgStr += "<p class='message-day' style='text-align: center'><strong><italic>"
  + "-即時訊息-"
  +" </italic></strong></p>";   //history message string tail

  $('#inside-group-canvas').append(    //push string into canvas
    '<div id="' + profile.roomId + '" class="tabcontent" style="display: none;">'
    + '<span class="topright">x&nbsp;&nbsp;&nbsp</span>'
    + "<div id='" + profile.roomId + "-content' rel='"+profile.channelId+"' class='messagePanel' >"
    + historyMsgStr + "</div>"
    + "</div>"
  );// close append

  $('#inside-group-container').append('<div class="inside-tablinks-container"><button class="inside-tablinks" rel="'+profile.roomId+'">'+profile.roomName+'</button></div>');

  // $('#inside-group-container').append('<button class="inside-tablinks" rel="'+profile.roomId+'">'+profile.roomName+'</button>');
  // $('#inside-group-container').append('<button class="inside-tablinks" rel="'+profile.roomId+'">'+profile.roomName+'</button>');
}

function historyMsg_to_Str(messages) {
  let returnStr = "";
  let nowDateStr = "";
  let prevTime = 0;
  for (let i in messages) {
    //this loop plus date info into history message, like "----Thu Aug 01 2017----"
    let d = new Date(messages[i].time).toDateString(); //get msg's date
    if (d != nowDateStr) {
      //if (now msg's date != previos msg's date), change day
      nowDateStr = d;
      returnStr += "<p class='message-day' style='text-align: center'><strong>" + nowDateStr + "</strong></p>"; //plus date info
    }

    if (messages[i].time - prevTime > 15 * 60 * 1000) {
      //if out of 15min section, new a section
      returnStr += "<p class='message-day' style='text-align: center'><strong>" + toDateStr(messages[i].time) + "</strong></p>"; //plus date info
    }
    prevTime = messages[i].time;

    if (messages[i].owner == "agent") {
      //plus every history msg into string
      returnStr += toAgentStr(messages[i].message, messages[i].name, messages[i].time);
    } else returnStr += toUserStr(messages[i].message, messages[i].name, messages[i].time);
  }
  return returnStr;
} // end of historyMsg_to_Str

function upImg() {
  var imgAtt = '/image ' + $('#attImgFill').val();
  // $('#message').val('<img src="' + imgAtt);
  socket.emit('send message', sendObj);

} // end of upImg

function upVid() {
  var vidAtt = $('#attVidFill').val();
  $('#message').val('<video controls><source src="' + vidAtt);
} // end of upVid

function upAud() {
  var audAtt = $('#attAudFill').val();
  $('#message').val('<audio controls><source src="' + audAtt);
} // upAud

function toAgentStr(msg, name, time) {
  if (msg.startsWith("<img")) {
    return '<p class="message" rel="' + time + '" style="text-align: right;line-height:250%" title="' + toDateStr(time) + '"><span  class="sendTime">' + toTimeStr(time) + '</span><span class="content">  ' + msg + '</span><strong><span class="sender">: ' + name + '</span></strong><br/></p>';
  } else {
    return '<p class="message" rel="' + time + '" style="text-align: right;line-height:250%" title="' + toDateStr(time) + '"><span  class="sendTime">' + toTimeStr(time) + '</span><span class="content" style="border:1px solid #b5e7a0; padding:8px; border-radius:10px; background-color:#b5e7a0">  ' + msg + '</span><strong><span class="sender">: ' + name + '</span></strong><br/></p>';
  }
} // end of toAgentStr

function toUserStr(msg, name, time) {
  if (msg.startsWith("<img")) {
    return '<p style="line-height:250%" class="message" rel="' + time + '" title="' + toDateStr(time) + '"><strong><span class="sender">' + name + ': </span></strong><span class="content">  ' + msg + '</span><span class="sendTime">' + toTimeStr(time) + '</span><br/></p>';
  } else {
    return '<p style="line-height:250%" class="message" rel="' + time + '" title="' + toDateStr(time) + '"><strong><span class="sender">' + name + ': </span></strong><span style="border:1px solid lightgrey;background-color:lightgrey; padding:8px; border-radius:10px" class="content">  ' + msg + '</span><span class="sendTime">' + toTimeStr(time) + '</span><br/></p>';
  }
} // end of toUserStr

function toDateStr(input) {
  let str = " ";
  let date = new Date(input);
  str += date.getFullYear() + '/' + addZero(date.getMonth() + 1) + '/' + addZero(date.getDate()) + ' ';

  let week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  str += week[date.getDay()] + ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes());
  return str;
} // end of toDateStr

function toTimeStr(input) {
  let date = new Date(input);
  return " (" + addZero(date.getHours()) + ':' + addZero(date.getMinutes()) + ") ";
} // end of toTimeStr

function toTimeStr_minusQuo(input) {
  let date = new Date(input);
  return addZero(date.getHours()) + ':' + addZero(date.getMinutes());
} // end of toTimeStr_minusQuo

function addZero(val) {
  return val < 10 ? '0' + val : val;
} // end of addZero

function loadChatGroupName(){
  let uid = auth.currentUser.uid;

  database.ref('users/' + uid).once('value', snap => {
    // console.log(snap.val());

    if(snap.val().group1 === undefined || snap.val().group2 === undefined || snap.val().fbgroup === undefined){
      $('.error').text('群組名稱沒有設定，請於設定頁面更改。');
      sendTime(() => {
        $('.error').text('')
      }, 5000);
    } else {
      // 群組名稱
      $('#group1').text(snap.val().group1);
      $('#group2').text(snap.val().group2);
      $('#fbgroup').text(snap.val().fbgroup);
      // 群組input的名稱
      $('#inputgroup1').val(snap.val().group1);
      $('#inputgroup2').val(snap.val().group2);
      $('#inputfbgroup').val(snap.val().fbgroup);
    }

  });
} // end of loadChatGroupName

function openTitle() {
  let room = $(this).attr('id');
  $(this).hide();
  $(this).siblings().show();
} // end of openTitle
