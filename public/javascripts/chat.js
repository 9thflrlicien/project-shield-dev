var name_list = []; // list of all users
var room_list = []; // room ID for line
var user_list = []; // user list for checking on idle chat rooms

var fbCount = 0;
var line1Count = 0;
var line2Count = 0;

const LOADING_MSG_AND_ICON = "<p class='message-day' style='text-align: center'><strong><i>" +
"Loading History Messages..." +
"</i></strong><span class='loadingIcon'></span></p>";
const NO_HISTORY_MSG = "<p class='message-day' style='text-align: center'><strong><i>" +
"-沒有更舊的歷史訊息-" +
"</i></strong></p>";

var ticketInfo = {};
var contactInfo = {};
var agentInfo = {};
var socket = io.connect();

var yourdomain = 'fongyu';
var api_key = 'UMHU5oqRvapqkIWuOdT8';

$(document).ready(function(){
  var socket = io.connect(); //socket
  var printAgent = $('#printAgent'); //agent welcome text
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
  var TagsData; //data of user info tags

  var filterDataBasic = { //option of filter age, recent_chat_time, first_chat_time
    age: ['0', '20', '30', '40', '50', '60', '60 up'],
    recent: ['< 10 min', '10 min', '30 min', '60 min', '2 hr', '12 hr', '1 day', '1 week', '1 month', '1 month up'],
    first: ['< 1 day', '1 day', '1 week', '2 week', '1 month', '3 month', '6 month', '1 year', '1 year up']
  };
  var filterDataCustomer = {}; //option of filter customized tags

  const COLOR = {
    FIND: "#ff0000",
    CLICKED: "#ccc",
    FINDBACK: "#ffff00"
  }
  let n = 0;

  $(document).on('click', '#signout-btn', logout); // 登出
  $(document).on('click', '.tablinks', clickUserTablink); // 群組清單裡面選擇客戶
  $(document).on('click', '.topright', clickSpan);
  $(document).on('change', '.multiselect-container', multiselect_change);
  $(document).on('click', '#upImg', upImg); // 傳圖
  $(document).on('click', '#upVid', upVid); // 傳影
  $(document).on('click', '#upAud', upAud); // 傳音
  $(document).on('click', '#submitMsg', submitMsg); // 訊息送出
  $(document).on('click', '#form-submit', submitAdd) //新增ticket
  $(document).on('click', '#submitMemo', submitMemo); // 新增ticket備註
  $(document).on('click', '.ticket_content',moreInfo);
  $(document).on('click', "#ticketInfo-submit", updateStatus);
  $(document).on('click', '.edit', showInput);
  $(document).on('focusout', '.inner', hideInput);
  $(document).on('keypress', '.inner',function (e) {
    if(e.which == 13) $(this).blur() ;
  });
  $('#message').on('keydown', function(event){ // 按enter可以發送訊息
    if(event.keyCode == 13){
      document.getElementById('submitMsg').click();
    }
  });
  $('#message_memo').on('keydown', function(event){
    if(event.keyCode == 13){
      document.getElementById('submitMemo').click();
    }
  });
  $(document).on('click', '.dropdown-menu', function(event){
    event.stopPropagation();
  });
  $(document).on('click', '.nav-link', toggleInfoPanel); // 客戶資料tab更換
  $(document).on('click', '.filterArea h4', function(){
    $(this).siblings().toggle(200, 'easeInOutCubic');
    $(this).children('i').toggle();
  });
  // user profile edit
  $(document).on('click', '.userInfo-td[modify="true"] p#td-inner', function(){
    // console.log(".userInfo-td click");
    let val = $(this).text();        //抓目前的DATA
    let td = $(this).parents('.userInfo-td');
    td.html('<input id="td-inner" type="text" value="' +val + '"></input>'); //把element改成input，放目前的DATA進去
    td.find('input').select();   //自動FOCUS該INPUT
  });
  $(document).on('keypress', '.userInfo-td[modify="true"] input[type="text"]', function(e){
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) {
      //如果按了ENTER
      console.log("input keypress");
      $(this).blur(); //就離開此INPUT，觸發on blur事件
    }
  });
  $(document).on('blur', '.userInfo-td[modify="true"] input[type="text"]', function(){
    //當USER離開此INPUT
    console.log(".userInfo-td-input blur");
    let val = $(this).val();  //抓INPUT裡的資料
    if( !val ) val="尚未輸入";
    $(this).parent().html('<p id="td-inner">'+val+'</p>');   //將INPUT元素刪掉，把資料直接放上去
  });
  $('.hidden_group_name').mouseover(function(){ // 秀群組名稱
    $(this).show();
  })
  // 傳圖，音，影檔功能
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

  $("#infoCanvas").hover(
    function(){
      $(this).css('width', '500px');
      $('.memo').css('margin-left', '30%');
    },
    function(){
      $(this).css('width', '100%');
      $('.memo').css('margin-left', '0%');
    }
  ); // infoCanvas
  // ===============Colman=======================
  $(document).on('keyup', '.ticket_search_bar', function(e){
      console.log(".ticket_search_bar key press");
      let searchStr = $(this).val();
      let trs = $(this).parents('table').find('tbody').find('tr');
      trs.each(function() {
        let text = $(this).text();
        if( text.indexOf(searchStr)==-1 ) $(this).hide();
        else $(this).show();
      });
  });
  $(document).on('click', '.table-sort', function(){
    let index = $(this).index();
    let compare;
    let icon = $(this).find('i');
    if( icon.attr('class').indexOf('fa-sort-up')==-1 ){
      compare = sortUp;
      icon.attr('class','fa fa-fw fa-sort-up');
    }else{
      compare = sortDown;
      icon.attr('class','fa fa-fw fa-sort-down');
    }
    $(this).siblings().find('i').attr('class','fa fa-fw fa-sort');
    let trs = $(this).parents('table').find('tbody').find('tr');
    for( let i=0; i<trs.length; i++ ){
      for( let j=i+1; j<trs.length; j++ ){
        let a = trs.eq(i).find('td').eq(index).text();
        let b = trs.eq(j).find('td').eq(index).text();
        if( compare( a, b ) ){
          let tmp = trs[i];
          trs[i] = trs[j];
          trs[j] = tmp;
        }
      }
    }
    trs.eq(1).parent().append(trs);
    function sortUp( a, b ){
      return a>b;
    }
    function sortDown( a, b ){
      return a<b;
    }
  });
  $('.chatApp_item[open="true"]').click(function(){
    let thisRel = $(this).attr('rel');
    if(thisRel === 'All'){
      $('.tablinks_area').find('b').show();
    }else if(thisRel === 'unread'){
      $('.tablinks_area').find('.unread_msg').each(function(index, el){
        // console.log($(this).text());
        if($(this).text() === '0'){
          $(this).parent().parent().hide();
        }else{
          $(this).parent().parent().show();
        }
      });
    }else if(thisRel === 'assigned'){
      $('.tablinks_area').find('b').hide();
      $('#指派負責人 #td-inner').each(function(index, el){
        if($(this).text() !== '尚未輸入'){
          let id = $(this).parent().parent().parent().parent().parent().parent().attr('id');
          let room = $(this).parent().parent().parent().parent().parent().parent().attr('rel');
          let newId = id.substr(0, id.indexOf('-'));
          let newRoom = room.substr(0, room.indexOf('-'));
          $('[name="'+newId+'"][rel="'+newRoom+'"]').parent().show();
        }
      });
    } else if(thisRel === 'unassigned'){
      $('.tablinks_area').find('b').hide();
      $('#指派負責人 #td-inner').each(function(index, el){
        // console.log(el);
        if($(this).text() === '尚未輸入'){
          let id = $(this).parent().parent().parent().parent().parent().parent().attr('id');
          let room = $(this).parent().parent().parent().parent().parent().parent().attr('rel');
          let newId = id.substr(0, id.indexOf('-'));
          let newRoom = room.substr(0, room.indexOf('-'));
          $('[name="'+newId+'"][rel="'+newRoom+'"]').parent().show();
        }
      });
    }else{
      $('.tablinks_area').find('b').hide();
      $('.tablinks_area').find('[rel="'+thisRel+'"]').parent().show();
    }
  });
  // ============Colman end======================
  $(document).on("mouseenter", ".message", function(){
    $(this).find('.sender').show();
  });
  $(document).on("mouseleave", ".message", function(){
    $(this).find('.sender').hide();
  });
  $(document).on('click', '.profile-confirm button', function(){
    let userId = $(this).parents('.card-group').attr('id');
    userId = userId.substr(0,userId.length-5);
    let method = $(this).attr('id');
    if( method == "confirm" ){
      if ( confirm("Are you sure to change profile?") ){
        let data = {userId: userId};
        let tds = $(this).parents('.card-group').find('.panelTable tbody td');
        console.log(tds);
        tds.each( function(){
          let prop = $(this).attr('id');
          let type = $(this).attr('type');
          let value;
          if(type=="text") value = $(this).find('#td-inner').text();
          else if( type=="time") value = $(this).find('#td-inner').val();
          else if( type=="single_select" ) value = $(this).find('#td-inner').val();
          else if( type=="multi_select" ) value = $(this).find('.multiselect-selected-text').text();
          if( !value ) value = "";
          data[prop] = value;
        });
        socket.emit('update profile', data);
      }else{

      }
    }else{
      console.log("cancelled");
    }
  });
  $('#searchBox').on('keypress', function (e){
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code != 13) return;
    let searchStr = $(this).val().toLowerCase();
    if( searchStr === "" ){
      displayAll();
    }else{
      $('.tablinks').each( function(){
        let id = $(this).attr('name');
        let room = $(this).attr('rel');
        let panel = $("div #"+id+"-content[rel='"+room+"']");
        let color = "";
        // 客戶名單搜尋
        $(this).find('.client_name').each(function(){
          let text = $(this).text();
          if(text.toLowerCase().indexOf(searchStr)!=-1){
            $(this).css({'color': COLOR.FIND, 'background-color': COLOR.FINDBACK});
          }
        });
        // 聊天室搜尋
        panel.find(".message").each(function(){
          let text = $(this).find('.content').text();
          if(text.toLowerCase().indexOf(searchStr)!=-1){
            // displayMessage match的字標黃
            $(this).find('.content').css({'color': COLOR.FIND, 'background-color': COLOR.FINDBACK});
            // displayClient顯示"找到訊息"並標紅
            $('[name="'+id+'"][rel="'+room+'"]').find('#msg').css('color', COLOR.FIND).text("找到訊息");
          }
        });
        $(this).css("color", color);
      });
    }
  }); //end searchBox change func
  $('#addTicketModal').on('show.bs.modal', function(){
    let getId = $('.card-group[style="display:block"]').attr('id');
    let realId = getId.substr(0, getId.indexOf('-'));
    $('#form-uid').val(realId);
  });
  if (window.location.pathname === '/chat'){
    socket.emit("get tags from chat");
    let timer_1 = setInterval( function(){
      if(!auth.currentUser){
        return;
      }
      else {
        clearInterval(timer_1);
        userId = auth.currentUser.uid;
        loadKeywordsReply(userId);
        database.ref('users/' + userId).once('value', snap => {
          let name1 = snap.val().name1;
          let name2 = snap.val().name2;
          let fbName = snap.val().fbName;
          let id1 = snap.val().chanId_1;
          let id2 = snap.val().chanId_2;
          let secret1 = snap.val().chanSecret_1;
          let secret2 = snap.val().chanSecret_2;
          let token1 = snap.val().chanAT_1;
          let token2 = snap.val().chanAT_2;
          let fbPageId = snap.val().fbPageId;
          let fbAppId = snap.val().fbAppId;
          let fbAppSecret = snap.val().fbAppSecret;
          let fbValidToken = snap.val().fbValidToken;
          let fbPageToken = snap.val().fbPageToken;
          if((name1 === undefined || name1 === null || name1 === '' ||
              id1 === undefined || id1 === null || id1 === '' ||
              secret1 === undefined || secret1 === null || secret1 === '' ||
              token1 === undefined || token1 === null || token1 === '' )&&
              (name2 === undefined || name2 === null || name2 === '' ||
              id2 === undefined || id2 === null || id2 === '' ||
              secret2 === undefined || secret2 === null || secret2 === '' ||
              token2 === undefined || token2 === null || token2 === '' )&&
              (fbName === undefined || fbName === null || fbName === '' ||
              fbPageId === undefined || fbPageId === null || fbPageId === '' ||
              fbAppId === undefined || fbAppId === null || fbAppId === '' ||
              fbAppSecret === undefined || fbAppSecret === null || fbAppSecret === '' ||
              fbValidToken === undefined || fbValidToken === null || fbValidToken === '' ||
              fbPageToken === undefined || fbPageToken === null || fbPageToken === '')
            )
          {
            $('.error').append('您還沒有做聊天設定，請至Settings做設定。');
            setTimeout(() => {
              $('.error').text('');
            }, 10000)
          } else if((name1 === undefined || name1 === null || name1 === '' ||
                      id1 === undefined || id1 === null || id1 === '' ||
                      secret1 === undefined || secret1 === null || secret1 === '' ||
                      token1 === undefined || token1 === null || token1 === '')||
                    (name2 === undefined || name2 === null || name2 === '' ||
                      id2 === undefined || id2 === null || id2 === '' ||
                      secret2 === undefined || secret2 === null || secret2 === '' ||
                      token2 === undefined || token2 === null || token2 === '')||
                      (fbName === undefined || fbName === null || fbName === '' ||
                      fbPageId === undefined || fbPageId === null || fbPageId === '' ||
                      fbAppId === undefined || fbAppId === null || fbAppId === '' ||
                      fbAppSecret === undefined || fbAppSecret === null || fbAppSecret === '' ||
                      fbValidToken === undefined || fbValidToken === null || fbValidToken === '' ||
                      fbPageToken === undefined || fbPageToken === null || fbPageToken === ''))
          {
            $('#line1 p').text(name1);
            $('#line2 p').text(name2);
            $('#fbname p').text(fbName);
            socket.emit('update bot', {
              line_1: {
                channelId: id1,
                channelSecret: secret1,
                channelAccessToken: token1
              },
              line_2: {
                channelId: id2,
                channelSecret: secret2,
                channelAccessToken: token2
              },
              fb: {
                pageID: fbPageId,
                appID: fbAppId,
                appSecret: fbAppSecret,
                validationToken: fbValidToken,
                pageToken: fbPageToken
              },
            });
            $('.error').append('您其中一個群組還沒有做聊天設定，如有需要請至Settings做設定。');
            setTimeout(() => {
              $('.error').text('');
            }, 10000);

          } else {
            $('#line1 p').text(name1);
            $('#line2 p').text(name2);
            $('#fbname p').text(fbName);
            socket.emit('update bot', {
              line_1: {
                channelId: id1,
                channelSecret: secret1,
                channelAccessToken: token1
              },
              line_2: {
                channelId: id2,
                channelSecret: secret2,
                channelAccessToken: token2
              },
              fb: {
                pageID: fbPageId,
                appID: fbAppId,
                appSecret: fbAppSecret,
                validationToken: fbValidToken,
                pageToken: fbPageToken
              },
            });
          }
        });
        agentName();
        socket.emit('request line channel', userId);
      }
    }, 10);
  }

  socket.on('response line channel', (data) => {
    // console.log(data.chanId_1, data.chanId_2);
    if(data.chanId_1 === '' && data.chanId_2 === ''){
      $('.error').text('群組名稱沒有設定，請於設定頁面更改。');
    } else {
      $('#Line_1').attr('rel', data.chanId_1);
      $('#Line_2').attr('rel', data.chanId_2);
      room_list.push(data.chanId_1);
      room_list.push(data.chanId_2);
      socket.emit('get json from back');
    }
  })

  socket.on('push json to front', (data) => {
    //www emit data of history msg
    for (i in data) pushMsg(data[i]); //one user do function one time
    setTimeout(function() {
      for (i in data) pushInfo(data[i]);
    }, 500);
    sortUsers("recentTime", sortRecentBool, function(a, b) {
      return a < b;
    }); //sort users by recent time
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
    let msgContent = $('#' + data.userId + '-content' + '[rel="'+data.roomId+'"]');
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
    userProfiles[data.userId] = data;
  });
  socket.on('reply keywords to front', function(data){
    socket.emit('send message', data);
    console.log('socket emit send message from js');
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

  // =====================Colman=========================== //
  // socket.on('push inside chat', (data) => {
  //   // console.log("YO");
  //   console.log(data);
  //   for( let i in data ) pushInsideMsg(data[i]);
  // });

  $(document).on('click', '.inside-tablinks', function() {
    let id = $(this).attr('id');
    $('.tabcontent#'+id).show();

    $("#inside-selected").removeAttr('id').css("background-color", "");   //selected tablinks change, clean prev's color
    $(this).attr('id','inside-selected').css("background-color",COLOR.CLICKED);    //clicked tablinks color

    let target = $(this).attr('id');         //find the message canvas
    let rel = $(this).attr('rel');
    $('#'+id).show().siblings().hide();   //show it, and close others
    $('#'+target+'-content' + "[rel='"+rel+"']").scrollTop($('#'+target+'-content' + "[rel='"+rel+"']")[0].scrollHeight);   //scroll to down

    // console.log('click tablink executed');
  });

  // inner functions
  function pushMsg(data) {
    // one user do function one time; data structure see file's end
    let historyMsg = data.Messages;
    let profile = data.Profile;

    let historyMsgStr = "";
    if (data.position != 0) {
      //if there's still history messages unloaded
      historyMsgStr += LOADING_MSG_AND_ICON; //history message string head
    }
    else {
      historyMsgStr += NO_HISTORY_MSG; //history message string head
    }

    historyMsgStr += historyMsg_to_Str(historyMsg);
    // end of history message

    $('#user-rooms').append('<option value="' + profile.userId + '">' + profile.nickname + '</option>'); //new a option in select bar
    let lastMsg = historyMsg[historyMsg.length - 1];
    // let font_weight = profile.unRead ? "bold" : "normal"; //if last msg is by user, then assume the msg is unread by agent
    let font_weight = "normal";
    let lastMsgStr;
    if (Array.isArray(lastMsg.message)) lastMsg.message.map(function(x){ lastMsg.message = x})
    if(lastMsg.message.startsWith('<a')){
      lastMsgStr = '<br><div id="msg" style="font-weight: ' + font_weight + '; font-size:8px; margin-left:12px;">' + '客戶傳送檔案' + "</div>";
    } else {
      lastMsgStr = '<br><div id="msg" style="font-weight: ' + font_weight + '; font-size:8px; margin-left:12px;">' + loadMessageInDisplayClient(lastMsg.message) + "</div>";
    }

    // console.log(lastMsg.message.length);

    let msgTime = '<div style="float:right;font-size:8px; font-weight:normal">' + toTimeStr_minusQuo(lastMsg.time) + '</div>';
    if(typeof(profile.VIP等級) === "string" && profile.VIP等級 !== "未選擇"){ // VIP優先放進 VIP欄位
      if( profile.channelId === undefined ){
        profile.channelId = "FB";
      }
      if(profile.unRead > 0){
        $('#vip_list').prepend(
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
          "<span class='client_name'>" + profile.nickname + "</span>" +
          lastMsgStr +
          "</div>" +
          // "<div class='agentImg_holder'>" +
          // "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
          // "</div>" +
          "<div class='unread_msg' style='display:block;'>" + profile.unRead + "</div>" +
          "</button></b>"
        ); //new a tablinks
      } else {
        $('#vip_list').prepend(
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
          "<span class='client_name'>" + profile.nickname + "</span>" +
          lastMsgStr +
          "</div>" +
          // "<div class='agentImg_holder'>" +
          // "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
          // "</div>" +
          "<div class='unread_msg' style='display:none;'>" + profile.unRead + "</div>" +
          "</button></b>"
        ); //new a tablinks
      }

    } else if(profile.channelId === undefined || profile.channelId === "FB"){
      if( profile.channelId === undefined ){
        profile.channelId = "FB";
        // fbCount += profile.unRead;
      }
      if(profile.unRead > 0){
        $('#clients').append(
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
          "<span class='client_name'>" + profile.nickname + "</span>" +
          lastMsgStr +
          "</div>" +
          // "<div class='agentImg_holder'>" +
          // "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
          // "</div>" +
          "<div class='unread_msg' style='display:block;'>" + profile.unRead + "</div>" +
          "</button></b>"
        ); //new a tablinks
      } else {
        $('#clients').append(
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
          "<span class='client_name'>" + profile.nickname + "</span>" +
          lastMsgStr +
          "</div>" +
          // "<div class='agentImg_holder'>" +
          // "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
          // "</div>" +
          "<div class='unread_msg' style='display:none;'>" + profile.unRead + "</div>" +
          "</button></b>"
        ); //new a tablinks
      }
    } else if(profile.channelId === room_list[0]){
      if(profile.unRead > 0){
        $('#clients').append(
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
          "<span class='client_name'>" + profile.nickname + "</span>" +
          lastMsgStr +
          "</div>" +
          // "<div class='agentImg_holder'>" +
          // "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
          // "</div>" +
          "<div class='unread_msg' style='display:block;'>" + profile.unRead + "</div>" +
          "</button></b>"
        ); //new a tablinks
      } else {
        $('#clients').append(
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
          "<span class='client_name'>" + profile.nickname + "</span>" +
          lastMsgStr +
          "</div>" +
          // "<div class='agentImg_holder'>" +
          // "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
          // "</div>" +
          "<div class='unread_msg' style='display:none;'>" + profile.unRead + "</div>" +
          "</button></b>"
        ); //new a tablinks
      }
    } else if(profile.channelId === room_list[1]){
      if(profile.unRead > 0){
        $('#clients').append(
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
          "<span class='client_name'>" + profile.nickname + "</span>" +
          lastMsgStr +
          "</div>" +
          // "<div class='agentImg_holder'>" +
          // "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
          // "</div>" +
          "<div class='unread_msg' style='display:block;'>" + profile.unRead + "</div>" +
          "</button></b>"
        ); //new a tablinks
      } else {
        $('#clients').append(
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
          "<span class='client_name'>" + profile.nickname + "</span>" +
          lastMsgStr +
          "</div>" +
          // "<div class='agentImg_holder'>" +
          // "<img src='http://www.boothcon.com.au/wp-content/uploads/2016/05/travel-agent-icon.png' alt='無法顯示相片'>" +
          // "</div>" +
          "<div class='unread_msg' style='display:none;'>" + profile.unRead + "</div>" +
          "</button></b>"
        ); //new a tablinks
      }
    }

    // 依照不同的channel ID做分類
    if(profile.channelId === undefined || profile.channelId === "FB"){
      canvas.append( //push string into canvas
        '<div id="' + profile.userId + '" rel="FB" class="tabcontent"style="display: none;">' +
        '<span class="topright">x&nbsp;&nbsp;&nbsp</span>' +
        "<div id='" + profile.userId + "-content' rel='FB' class='messagePanel' data-position='" + data.position + "'>" +
        historyMsgStr + "</div>" +
        "</div>"
      ); // close append
    } else if(profile.channelId === room_list[0]){
      canvas.append( //push string into canvas
        '<div id="' + profile.userId + '" rel="'+profile.channelId+'" class="tabcontent"style="display: none;">' +
        '<span class="topright">x&nbsp;&nbsp;&nbsp</span>' +
        "<div id='" + profile.userId + "-content' rel='"+profile.channelId+"' class='messagePanel' data-position='" + data.position + "'>" +
        historyMsgStr + "</div>" +
        "</div>"
      ); // close append
    } else if(profile.channelId === room_list[1]){
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
    }else{ //if its new user
      let historyMsgStr = NO_HISTORY_MSG;

      if (data.owner == "agent") historyMsgStr += toAgentStr(data.message, data.name, data.time);
      else historyMsgStr += toUserStr(data.message, data.name, data.time);

      canvas.append( //new a canvas
        '<div id="' + data.id + '" rel="'+channelId+'" class="tabcontent" style="display: none;">' +
        '<span class="topright">x&nbsp;</span>' +
        '<div id="' + data.id + '-content" rel="'+channelId+'" class="messagePanel">' +
        historyMsgStr +
        '</div></div>'
      ); // close append

      $('#user-rooms').append('<option value="' + data.id + '">' + data.name + '</option>'); //new a option in select bar
    }
  } // end of displayMessage
  function displayClient(data, channelId){
    let font_weight = data.owner == "user" ? "bold" : "normal"; //if msg is by user, mark it unread
    if (name_list.indexOf(channelId+data.id) > -1){
      let target = $('.tablinks_area').find(".tablinks[name='" + data.id + "'][rel='"+channelId+"']");
      if(data.message.startsWith('<a')){ // 判斷客戶傳送的是檔案，貼圖還是文字
        target.find("#msg").html(toTimeStr(data.time) + '檔案').css("font-weight", font_weight); // 未讀訊息字體變大
      }else if(data.message.startsWith('<img')){
        target.find("#msg").html(toTimeStr(data.time) + '貼圖').css("font-weight", font_weight); // 未讀訊息字體變大
      }else{
        target.find("#msg").html(toTimeStr(data.time) + "<span class='client_name'>" + loadMessageInDisplayClient(data.message) + "</span>").css("font-weight", font_weight); // 未讀訊息字體變大
      }
      target.find('.unread_msg').html(data.unRead).css("display", "block"); // 未讀訊息數顯示出來
      target.attr("data-recentTime", data.time);
      // update tablnks's last msg
      if (data.unRead == 0 || data.unRead == false || data.unRead == 'undefined') {
        target.find('.unread_msg').html(data.unRead).css("display", "none");
      }
      n++;

      let ele = target.parents('b'); //buttons to b
      ele.remove();
       $('.tablinks_area>#clients').prepend(ele);
    }else{ //new user, make a tablinks
      // pictureUrl
      console.log('new user');
      $('#clients').prepend(
        "<b><button style='text-align:left' name='" + data.id + "' rel='" + channelId + "' class='tablinks'>" +
        "<div class='img_holder'>" +
        "<img src='" + data.pictureUrl + "' alt='無法顯示相片'>" +
        "</div>" +
        "<div class='msg_holder'>" +
        "<span class='client_name'>" + data.name + "</span>" +
        "<br />"+
        "<div id='msg' style='font-weight: normal; font-size:8px; margin-left:12px;'>"+data.message+"</div>" +
        "</div>" +
        "<div class='unread_msg'>1</div>" +
        "</button></b>"
      );
      infoCanvas.append(
        '<div class="card-group" id="' + data.id + '-info" rel="'+channelId+'-info" style="display:none">' +
        '<div class="card-body" id="profile">' +
        "<div class='photoContainer'>" +
        '<img src="' + data.pictureUrl + '" alt="無法顯示相片" style="width:128px;height:128px;">' +
        "</div>" +
        "<table class='panelTable'>" +
        "<tbody>" +
        "<tr>" +
        "<th class='userInfo-th' id='姓名'>姓名</th>" +
        "<td class='userInfo-td' id='姓名' type='text' set='single' modify='true'>" +
        "<p id='td-inner'>" + data.name + "</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='電子郵件'>電子郵件</th>" +
        "<td class='userInfo-td' id='電子郵件' type='text' set='multi' modify='true'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='電話'>電話</th>" +
        "<td class='userInfo-td' id='電話' type='text' set='single' modify='true'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='年齡'>年齡</th>" +
        "<td class='userInfo-td' id='年齡' type='text' set='single' modify='true'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='性別'>性別</th>" +
        "<td class='userInfo-td' id='性別' type='single_select' set='男,女' modify='true'>" +
        "<select id='td-inner'>"+
        "<option> 未選擇 </option>"+
        "<option value='男'>男</option>"+
        "<option value='女'>女</option>"+
        "</select>"+
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='地區'>地區</th>" +
        "<td class='userInfo-td' id='地區' type='text' set='single' modify='true'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='住址'>住址</th>" +
        "<td class='userInfo-td' id='住址' type='text' set='single' modify='true'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='電話'>電話</th>" +
        "<td class='userInfo-td' id='電話' type='text' set='single' modify='true'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='備註'>備註</th>" +
        "<td class='userInfo-td' id='備註' type='text' set='multi' modify='true'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='標籤'>標籤</th>" +
        "<td class='userInfo-td' id='標籤' type='multi_select' set='奧客,未付費,廢話多,敢花錢,常客,老闆的好朋友,外國人,窮學生,花東團abc123,台南團abc456' modify='true'>" +
        "<div class='btn-group' id='td-inner'>"+
        "<button type='button' data-toggle='dropdown' aria-expanded='false'><span class='multiselect-selected-text'>奧客</span><b class='caret'></b></button>"+
        "<ul class='multiselect-container dropdown-menu'>"+
        "<li><input type='checkbox' value='奧客' checked=''>奧客</li>"+
        "<li><input type='checkbox' value='未付費'>未付費</li>"+
        "<li><input type='checkbox' value='廢話多'>廢話多</li>"+
        "<li><input type='checkbox' value='敢花錢'>敢花錢</li>"+
        "<li><input type='checkbox' value='常客'>常客</li>"+
        "<li><input type='checkbox' value='老闆的好朋友'>老闆的好朋友</li>"+
        "<li><input type='checkbox' value='外國人'>外國人</li>"+
        "<li><input type='checkbox' value='窮學生'>窮學生</li>"+
        "<li><input type='checkbox' value='花東團abc123'>花東團abc123</li>"+
        "<li><input type='checkbox' value='台南團abc456'>台南團abc456</li>"+
        "</ul>"+
        "</div>"+
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='VIP等級'>VIP等級</th>" +
        "<td class='userInfo-td' id='VIP等級' type='single_select' set='鑽石會員,白金會員,普通銅牌,超級普通會員' modify='true'>" +
        "<select id='td-inner'>"+
        "<option> 未選擇 </option>"+
        "<option value='鑽石會員'>鑽石會員</option>"+
        "<option value='白金會員'>白金會員</option>"+
        "<option value='普通銅牌'>普通銅牌</option>"+
        "<option value='超級普通會員'>超級普通會員</option>"+
        "</select>"+
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='下次聯絡客戶時間'>下次聯絡客戶時間</th>" +
        "<td class='userInfo-td' id='下次聯絡客戶時間' type='time' set='' modify='true'>" +
        "<input type='datetime-local' id='td-inner'>"+
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='首次聊天時間'>首次聊天時間</th>" +
        "<td class='userInfo-td' id='首次聊天時間' type='time' set='' modify='false'>" +
        "<input type='datetime-local' id='td-inner' readonly='' value=''>"+
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='上次聊天時間'>上次聊天時間</th>" +
        "<td class='userInfo-td' id='上次聊天時間' type='time' set='' modify='false'>" +
        "<input type='datetime-local' id='td-inner' readonly='' value=''>"+
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
        "<td class='userInfo-td' id='客人的抱怨' type='text' set='multi' modify='true'>" +
        "<p id='td-inner'>尚未輸入</p>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<th class='userInfo-th' id='付費階段'>付費階段</th>" +
        "<td class='userInfo-td' id='付費階段' type='single_select' set='等待報價,已完成報價，等待付費,已完成付費,要退錢' modify='true'>" +
        "<select id='td-inner'>"+
        "<option> 未選擇 </option>"+
        "<option value='等待報價'>等待報價</option>"+
        "<option value='已完成報價，等待付費'>已完成報價，等待付費</option>"+
        "<option value='已完成付費'>已完成付費</option>"+
        "<option value='要退錢'>要退錢</option>"+
        "</select>"+
        "</td>" +
        "</tr>" +
        "<tr>"+
        "<th class='userInfo-th' id='指派負責人'>指派負責人</th>"+
        "<td class='userInfo-td' id='指派負責人' type='text' set='single' modify='true'>"+
        "<p id='td-inner'>尚未輸入</p>"+
        "</td>"+
        "</tr>"+
        "</tbody>" +
        "</table>" +
        '<div class="profile-confirm">'+
        '<button type="button" class="btn btn-primary pull-right" id="confirm">Confirm</button>'+
        '</div>' +
        '</div>' +
        '<div class="card-body" id="ticket" style="display:none; "></div>' +
        '<div class="card-body" id="todo" style="display:none; ">'+
        '<div class="ticket">'+
        '<table>'+
        '<thead>'+
        '<tr>'+
        '<th onclick="sortCloseTable(0)"> ID </th>'+
        '<th onclick="sortCloseTable(1)"> 姓名 </th>'+
        '<th onclick="sortCloseTable(2)"hidden> 內容 </th>'+
        '<th onclick="sortCloseTable(3)"> 狀態 </th>'+
        '<th onclick="sortCloseTable(4)"> 優先 </th>'+
        '<th onclick="sortCloseTable(5)"> 到期 </th>'+
        '<th><input type="text" class="ticket_search_bar" id="exampleInputAmount" value="" placeholder="Search"></th>'+
        '<th><a id="'+data.id+'-modal" data-toggle="modal" data-target="#addTicketModal"><span class="fa fa-plus fa-fw"></span> 新增表單</a></th>'+
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
    let userId = $(this).attr('name'); // ID
    let roomId = $(this).attr('rel'); // channelId
    let selectedId = [];
    let outerInfo, outerId, innerInfo;
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

    $(this).find('.unread_msg').text('0');

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
    $("#" + targetId + "-info" + "[rel='"+targetRel+"-info']").attr("style", "display:block").siblings().hide();

    $("#" + targetId + "[rel='"+targetRel+"']").show().siblings().hide(); //show it, and close others
    $("#" + targetId + "[rel='"+targetRel+"']"+'>#' + targetId + '-content' + '[rel="'+targetRel+'"]').scrollTop($('#' + targetId + '-content' + '[rel="'+targetRel+'"]')[0].scrollHeight); //scroll to down

    let profile = userProfiles[targetId];
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
    let room = $(this).parent().hide().attr("rel");
    $(".tablinks[name='" + userId + "'][rel='"+room+"']").removeAttr('id').css("background-color", ""); //clean tablinks color
  } // end of clickSpan

  function loadPanelProfile(profile) {
    let html = "<table class='panelTable'>";
    for (let i in TagsData) {
      let name = TagsData[i].name;
      let type = TagsData[i].type;
      let set = TagsData[i].set;
      let modify = TagsData[i].modify;
      let data = profile[name];
      let tdHtml = "";
      if (name === '客戶編號') continue;
      if (name === '電子郵件') {
        for (let i in data) {
          tdHtml += '<p id="td-inner">' + data[i] + '</p>';
        }
      }
      else if (type == 'text') {
        if ( data ) {
          tdHtml = '<p id="td-inner">' + data + '</p>';
        }
        else {
          tdHtml = '<p id="td-inner">尚未輸入</p>';
        }
      }
      else if (type == "time") {
        if( modify ) tdHtml = '<input type="datetime-local" id="td-inner" ';
        else tdHtml = '<input type="datetime-local" id="td-inner" readOnly ';
        if( data ) {
          d = new Date(data);
          tdHtml += 'value="'
          + d.getFullYear() + '-' + addZero(d.getMonth() + 1) + '-' + addZero(d.getDate()) + 'T'
          + addZero(d.getHours()) + ':' + addZero(d.getMinutes())+ '"';
        }
        tdHtml += ' ></input>';
      }
      else if (type == 'single_select') {
        if( modify ) tdHtml = '<select id="td-inner">';
        else tdHtml = '<select id="td-inner" disabled>';
        if( !data ) tdHtml += '<option selected="selected" > 未選擇 </option>';
        else tdHtml += '<option> 未選擇 </option>';
        for (let j in set) {
          if( set[j]!=data ) tdHtml += '<option value="' + set[j] + '">' + set[j] + '</option>';
          else tdHtml += '<option value="' + set[j] + '" selected="selected">' + set[j] + '</option>';
        }
        tdHtml += '</select>';
      }
      else if (type == 'multi_select') {
        tdHtml = '<div class="btn-group" id="td-inner">';
        if (modify == true) tdHtml += '<button type="button" data-toggle="dropdown" aria-expanded="false">';
        else tdHtml += '<button type="button" data-toggle="dropdown" aria-expanded="false" disabled>';
        if( !data ) data = "";
        tdHtml += '<span class="multiselect-selected-text">'+data+'</span><b class="caret"></b></button>' +
        '<ul class="multiselect-container dropdown-menu">';
        let selected = data.split(',');
        for (let j in set) {
          if( selected.indexOf(set[j])!=-1 ) tdHtml += '<li><input type="checkbox" value="' + set[j] + '" checked>' + set[j] + '</li>';
          else tdHtml += '<li><input type="checkbox" value="' + set[j] + '">' + set[j] + '</li>';
        }
        tdHtml += '</ul></div>';
      }
      html += '<tr>' +
      '<th class="userInfo-th" id="' + name + '">' + name + '</th>' +
      '<td class="userInfo-td" id="' + name + '" type="' + type + '" set="' + set + '" modify="' + modify + '">' + tdHtml + '</td>';
    }
    html += "</table>";
    return html;
  } // end of loadPanelProfile
  function pushInfo(data) {
    let profile = data.Profile;
    for (let i in profile.email) {
      socket.emit('get ticket', {
        email: profile.email[i],
        id: profile.userId
      });
    }
    infoCanvas.append(
      '<div class="card-group" id="' + profile.userId + '-info" rel="'+profile.channelId+'-info" style="display:none">' +
      '<div class="card-body" id="profile">' +
      "<div class='photoContainer'>" +
      '<img src="' + profile.photo + '" alt="無法顯示相片" style="width:128px;height:128px;">' +
      "</div>" +
      loadPanelProfile(profile) +
      '<div class="profile-confirm">'+
      '<button type="button" class="btn btn-primary pull-right" id="confirm">Confirm</button>'+
      '</div>' +
      '</div>' +
      '<div class="card-body" id="ticket" style="display:none; "></div>' +
      '<div class="card-body" id="todo" style="display:none; ">'+
      '<div class="ticket">'+
      '<table>'+
      '<thead>'+
      '<tr>'+
      '<th onclick="sortCloseTable(0)"> ID </th>'+
      '<th onclick="sortCloseTable(1)"> 姓名 </th>'+
      '<th onclick="sortCloseTable(3)"> 狀態 </th>'+
      '<th onclick="sortCloseTable(4)"> 優先 </th>'+
      '<th onclick="sortCloseTable(5)"> 到期 </th>'+
      '<th><input type="text" class="ticket_search_bar" id="exampleInputAmount" value="" placeholder="搜尋"></th>'+
      '<th><a id="'+profile.userId+'-modal" data-toggle="modal" data-target="#addTicketModal"><span class="fa fa-plus fa-fw"></span> 新增表單</a></th>'+
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
        roomId: ele.parent().attr('rel'),
        head: head,
        tail: tail
      };
      if (head == 0) ele.off('scroll');
      ele.attr('data-position', head);
      socket.emit('upload history msg from front', request);
      // console.log('upload! head = ' + head + ', tail = ' + tail);
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
    var ticket_id = $(this).parent().parent().siblings().find('#infoCanvas').find('[style="display:block"]').find('.data_id').text(); //把memo存到該客戶的第一張ticket裡
    // console.log(ticket_id);
    $('.ticket_memo').prepend('<div class="memo_content"><p>'+$('#message_memo').val()+'</p></div>');
    var ticket_memo = '{ "body": "'+$('#message_memo').val()+'", "private" : false }';

    $.ajax(
      {
        // url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets/"+ticket_id[0]+ticket_id[1]+"/notes",
        url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets/"+ticket_id+"/notes",
        type: 'POST',
        contentType: "application/json",
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
          console.log(x_request_id);
        }
      }
    );
    $('#message_memo').val("");
  }

  function submitMsg(e){
    e.preventDefault();
    let email = auth.currentUser.email;
    // console.log($(this).parent().parent().siblings('#canvas').find('[style="display: block;"]').attr('rel')); // 測試
    // console.log($(this).parent().parent().parent().siblings('#user').find('.tablinks_area[style="display: block;"]').attr('id')); // 測試
    let room = $(this).parent().parent().parent().siblings('#user').find('.tablinks_area[style="display: block;"]').attr('id');
    let channelId = $(this).parent().parent().siblings('#canvas').find('[style="display: block;"]').attr('rel');
    let userId = $(this).parent().parent().siblings('#canvas').find('[style="display: block;"]').attr('id');
    if(room !== undefined || channelId !== undefined){
      let sendObj = {
        id: "",
        msg: messageInput.val(),
        msgtime: Date.now(),
        room: room,
        channelId: channelId
        // room: $(this).parent().parent().parent().siblings('#user').find('.tablinks_area[style="display: block;"]').attr('id'), // 聊天室
        // channelId: $(this).parent().parent().siblings('#canvas').find('[style="display: block;"]').attr('rel')
      };
      // 新增功能：把最後送出訊息的客服人員的編號放在客戶的Profile裡面
      database.ref('chats/Data').once('value', outsnap => {
        let outInfo = outsnap.val();
        let outId = Object.keys(outInfo);
        // console.log(outId);
        for(let i in outId){
          database.ref('chats/Data/' + outId[i] + '/Profile').once('value', innsnap => {
            let innInfo = innsnap.val();
            // console.log(innInfo.channelId);
            if(innInfo.channelId === undefined){
            } else if(innInfo.channelId === channelId && innInfo.userId === userId){
              database.ref('chats/Data/' + outId[i] + '/Profile').update({
                "最後聊天的客服人員": email
              });
            }
          });
        }
      });
      sendObj.id = $("#user-rooms option:selected").val(); // select tag選到的值
      socket.emit('send message', sendObj); //emit到server (www)
      messageInput.val('');
    } else {
      console.log('either room id or channel id is undefined');
      console.log('room: ' + room);
      console.log('channel id: ' + channelId);
    }

  } // end of submitMsg
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
  function upImg() {
    var imgAtt = '/image ' + $('#attImgFill').val();
    // $('#message').val('<img src="' + imgAtt);
    let sendObj = {
      id: "",
      msg: imgAtt,
      msgtime: Date.now(),
      room: $(this).parent().parent().parent().parent().siblings('#user').find('#selected').attr('rel'),
      channelId: $(this).parent().parent().parent().siblings('#canvas').find('[style="display: block;"]').attr('rel')
    };
    sendObj.id = $("#user-rooms option:selected").val();
    if(sendObj.room !== undefined && sendObj.room !== '' && sendObj.channelId !== undefined && sendObj.channelId !== ''){
      socket.emit('send message', sendObj); //socket.emit
    } else {
      console.log('room ID or channel ID is undefined, please select a room');
    }
    // console.log(sendObj.room);
    $('#attImgFill').val('');
  } // end of upImg
  function upVid() {
    var vidAtt = '/video ' + $('#attVidFill').val();
    let sendObj = {
      id: "",
      msg: vidAtt,
      msgtime: Date.now(),
      room: $(this).parent().parent().parent().parent().siblings('#user').find('#selected').attr('rel'),
      channelId: $(this).parent().parent().parent().siblings('#canvas').find('[style="display: block;"]').attr('rel')
    };
    sendObj.id = $("#user-rooms option:selected").val();
    if(sendObj.room !== undefined && sendObj.room !== '' && sendObj.channelId !== undefined && sendObj.channelId !== ''){
      socket.emit('send message', sendObj); //socket.emit
    } else {
      console.log('room ID or channel ID is undefined, please select a room');
    }
    $('#attVidFill').val('');
  } // end of upVid
  function upAud() {
    var audAtt = '/audio ' + $('#attAudFill').val();
    let sendObj = {
      id: "",
      msg: audAtt,
      msgtime: Date.now(),
      room: $(this).parent().parent().parent().parent().siblings('#user').find('#selected').attr('rel'),
      channelId: $(this).parent().parent().parent().siblings('#canvas').find('[style="display: block;"]').attr('rel')
    };
    sendObj.id = $("#user-rooms option:selected").val();
    if(sendObj.room !== undefined && sendObj.room !== '' && sendObj.channelId !== undefined && sendObj.channelId !== ''){
      socket.emit('send message', sendObj); //socket.emit
    } else {
      console.log('room ID or channel ID is undefined, please select a room');
    }
    $('#attAudFill').val('');
  } // upAud
}); //document ready close tag

function cancelSubmit(){
  $(this).hide();
  $(this).siblings('#save-group-btn').hide();
  $(this).siblings('[type="text"]').hide();
  $(this).siblings('.myText').show();
} // end of cancelSubmit

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
    let id = $(this).attr('name');
    let rel = $(this).attr('rel');
    $(this).find('#msg').text($("div #" + id + "-content" + "[rel='"+rel+"']" + " .message:last").find('.content').text().trim()).css('color', 'black');
    $("div #" + id + "-content" + "[rel='"+rel+"']" + " .message").find('.content').css({"color": "black", "background-color": "lightgrey"});
    $(this).find('.client_name').css({"color": "black", "background-color": ""});
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
  min = gmt8.getMinutes();

  return yy + "/" + mm + "/" + dd + " " + hr + ":" + min;
} // end of displayDate

function sortRecentChatTime() {
  sortUsers("recentTime", sortRecentBool, function(a, b) {
    return a < b;
  });
  sortRecentBool = !sortRecentBool;
} // end of sortRecentChatTime
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
// function pushInsideMsg(data) {
//   let messages = data.Messages;
//   let profile = data.Profile;
//
//   let historyMsgStr = NO_HISTORY_MSG;
//   historyMsgStr += historyMsg_to_Str(messages);
//   historyMsgStr += "<p class='message-day' style='text-align: center'><strong><italic>"
//   + "-即時訊息-"
//   +" </italic></strong></p>";   //history message string tail
//
//   $('#inside-group-canvas').append(    //push string into canvas
//     '<div id="' + profile.roomId + '" class="tabcontent" style="display: none;">'
//     + '<span class="topright">x&nbsp;&nbsp;&nbsp</span>'
//     + "<div id='" + profile.roomId + "-content' rel='"+profile.channelId+"' class='messagePanel' >"
//     + historyMsgStr + "</div>"
//     + "</div>"
//   );// close append
//
//   $('#inside-group-container').append('<div class="inside-tablinks-container"><button class="inside-tablinks" rel="'+profile.roomId+'">'+profile.roomName+'</button></div>');
//
//   // $('#inside-group-container').append('<button class="inside-tablinks" rel="'+profile.roomId+'">'+profile.roomName+'</button>');
//   // $('#inside-group-container').append('<button class="inside-tablinks" rel="'+profile.roomId+'">'+profile.roomName+'</button>');
// }

// =====================Colman=========================== //
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

function toAgentStr(msg, name, time) {
  if (Array.isArray(msg)) msg.map(function(x){ msg = x});
  if (msg.startsWith("<a")||msg.startsWith("<img")) {
    return '<p class="message" rel="' + time + '" style="text-align: right;line-height:250%" title="' + toDateStr(time) + '"><span  class="sendTime">' + toTimeStr(time) + '</span><span class="content">  ' + msg + '</span><strong><span class="sender">: ' + name + '</span></strong><br/></p>';
  } else {
    return '<p class="message" rel="' + time + '" style="text-align: right;line-height:250%" title="' + toDateStr(time) + '"><span  class="sendTime">' + toTimeStr(time) + '</span><span class="content" style="border:1px solid #b5e7a0; padding:8px; border-radius:10px; background-color:#b5e7a0">  ' + msg + '</span><strong><span class="sender">: ' + name + '</span></strong><br/></p>';
  }
} // end of toAgentStr

function toUserStr(msg, name, time) {
  if (msg.startsWith("<a")||msg.startsWith("<img")){
    return '<p style="line-height:250%" class="message" rel="' + time + '" title="' + toDateStr(time) + '"><strong><span class="sender">' + name + ': </span></strong><span class="content">  ' + msg + '</span><span class="sendTime">' + toTimeStr(time) + '</span><br/></p>';
  }else{
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
          if (data[i].subject == userId){
            ticketInfo = data;
            $('.ticket-content').prepend(
              '<tr id="'+i+'" class="ticket_content" data-toggle="modal" data-target="#ticketInfoModal">'+
              '<td class="data_id" style="border-left: 5px solid '+priorityColor(data[i].priority)+'">' + data[i].id + '</td>' +
              '<td>' + data[i].requester.name + '</td>' +
              '<td hidden>' + data[i].description + '</td>' +
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
            // console.log(data);
            for(let i=0;i < data.length;i++){
              $('.ticket_memo').prepend('<div class="memo_content">'+data[i].body+'</div>');
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
  }, 500);
} // end of loadTable
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
} // end of statusNumberToText
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
} // end of priorityNumberToText
function dueDate(day) {
  let html = '' ;
  let nowTime = new Date().getTime() ;
  // console.log('this is nowTime');
  // console.log(nowTime);
  let dueday = Date.parse(displayDate(day)) ;
  let hr = dueday - nowTime ;
  hr /= 1000*60*60 ;
  if(hr<0){
    html = '<span class="overdue">過期</span>';
  } else {
    html = '<span class="non overdue">即期</span>';
  }
  return html ;
} // end of dueDate
function responderName(id) {
  for(let i in agentInfo){
    if(agentInfo[i].id == id) return agentInfo[i].contact.name ;
  }
  return "unassigned" ;
} // end of responderName
function searchBar(){
  let content = $('.ticket-content tr');
  let val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

  content.show().filter(function() {
    var text1 = $(this).text().replace(/\s+/g, ' ').toLowerCase();
    return !~text1.indexOf(val);
  }).hide();
} // end of searchBar
function showSelect(prop,n) {
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
} // end of showSelect
function moreInfo() {
  let display ;
  let i = $(this).attr('id');
  let Tinfo = ticketInfo[i];
  let Cinfo ;
  let Ainfo ;
  $("#ID_num").text(Tinfo.id) ;
  $("#ID_num").css("background-color",priorityColor(Tinfo.priority)) ;
  display =
  '<tr>'+
  '<th>客戶ID</th>'+
  '<td class="edit">'+Tinfo.subject+'</td>'+
  '</tr><tr>'+
  '<th>負責人</th>'+
  '<td>'+showSelect('responder',Tinfo.responder_id)+'</td>'+
  '</tr><tr>'+
  '<th>優先</th>'+
  '<td>'+showSelect('priority',Tinfo.priority)+'</td>'+
  '</tr><tr>'+
  '<th>狀態</th>'+
  '<td>'+showSelect('status',Tinfo.status)+'</td>'+
  '</tr><tr>'+
  '<th>描述</th>'+
  '<td class="edit">'+Tinfo.description_text+'</td>'+
  '</tr><tr>'+
  '<th class="edit">到期時間'+dueDate(Tinfo.due_by)+'</th>'+
  '<td>'+displayDate(Tinfo.due_by)+'</td>'+
  '</tr><tr>'+
  '<th>建立日</th>'+
  '<td>'+displayDate(Tinfo.created_at)+'</td>'+
  '</tr><tr>'+
  '<th>最後更新</th>'+
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
  $(".ticket_info_content").html('');
  $(".modal-header").css("border-bottom","3px solid "+priorityColor(Tinfo.priority));
  $(".modal-title").text(Tinfo.requester.name);
  $("#ticketInfo-submit").attr("val",Tinfo.id);
  $(".ticket_info_content").append(display);
} // end of moreInfo
function loadMessageInDisplayClient(msg){
  if(msg.length > 6){
    return msg = msg.substr(0, 6) + '...';
  } else {
    return msg;
  }
} // end of loadMessageInDisplayClient
function cancelSubmit(){
  $(this).hide();
  $(this).siblings('#save-group-btn').hide();
  $(this).siblings('[type="text"]').hide();
  $(this).siblings('.myText').show();
} // end of cancelSubmit
function loadKeywordsReply(userId){
  database.ref('message-keywordsreply/' + userId).once('value', snap => {
    let dataArray = snap.val();
    setTimeout(function() {
      for (var i in dataArray) {
        socket.emit('update keywords', {
          message: dataArray[i].taskMainK,
          reply: dataArray[i].taskText
        });
        for (var n = 0; n < dataArray[i].taskSubK.length; n++) {
          socket.emit('update subKeywords', {
            message: dataArray[i].taskSubK[n],
            reply: dataArray[i].taskText
          });
        }
      }
    }, 1000);
  });
} // end of loadKeywordsReply
function submitAdd(){
  let name = $('#form-name').val();
  let uid = $('#form-uid').val();//因為沒有相關可用的string，暫時先儲存在to_emails這個功能下面
  let email = $('#form-email').val();
  let phone = $('#form-phone').val();
  let status = $('#form-status option:selected').text();
  let priority = $('#form-priority option:selected').text();
  let description = $('#form-description').val();
  ticket_data = '{ "description": "'+description+'", "name" : "'+name+'",  "subject": "'+uid+'", "email": "'+email+'", "phone": "'+phone+'", "priority": '+priorityTextToMark(priority)+', "status": '+statusTextToMark(status)+'}';
  console.log(ticket_data);
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
  } else if($('#form-uid').val().trim() === '') {
    $('#error').append('請輸入客戶ID');
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
  } else if($('#form-name').val().trim() === '') {
    $('#error').append('請輸入客戶姓名');
    $('#form-name').css('border', '1px solid red');
    setTimeout(() => {
      $('#error').empty();
      $('#form-description').css('border', '1px solid #ccc');
    }, 3000);
  } else {

    let nowTime = new Date().getTime();
    let dueDate = nowTime+ 86400000*3;

    let start = ISODateTimeString(nowTime);
    let end = ISODateTimeString(dueDate)
    let userId = auth.currentUser.uid;

//把事件儲存到calendar database，到期時間和ticket一樣設定三天
    database.ref('cal-events/' + userId).push({
        title: name+": "+description.substring(0,10)+"...",
        start: start,
        end: end,
        description: description,
        allDay: false
      });

    setTimeout(function(){
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
          console.log('ticket created');
        },
        error: function(jqXHR, tranStatus) {
          x_request_id = jqXHR.getResponseHeader('X-Request-Id');
          response_text = jqXHR.responseText;
          console.log(response_text)
        }
      }
    );
    }, 2000);

    $('#form-name').val('');
    $('#form-uid').val('');
    $('#form-subject').val('');
    $('#form-email').val('');
    $('#form-phone').val('');
    $('#form-description').val('');

    setTimeout(() => {
      location.href = '/chat';
    }, 5000)
  }

} // end of submitAdd
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
} // end of priorityTextToMark

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
} // end of statusTextToMark
function ISODateTimeString(d) {
  d = new Date(d);
  function pad(n) {return n<10 ? '0'+n : n}
  return d.getFullYear()+'-'
       + pad(d.getMonth()+1)+'-'
       + pad(d.getDate())+'T'
       + pad(d.getHours())+':'
       + pad(d.getMinutes());
} // end of ISODateTimeString
function sortCloseTable(n) {
  console.log('sorting exe');
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = $(".ticket-content");
  console.log(table.value);
  console.log(table.innerHTML);
  switching = true;
  //Set the sorting direction to ascending:
  dir = "asc";
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.find('tr');
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 0; i < (rows.length-1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].childNodes[n];
      y = rows[i + 1].childNodes[n];
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++;
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
} // end of sortCloseTable
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
} // end of showInput
function hideInput() {
  let change = $(this).val();
  if($(this).attr('type')== 'datetime-local'){
    $(this).parent().html(displayDate(change)) ;
  }
  $(this).parent().html(change) ;
} // end of hideInput
function updateStatus() {
  let select = $(".select"),
      editable = $(".edit"),
      input = $("input");
  let name, value, json = '{' ;
  let obj = {} ;
  let id = $(this).attr("val") ;
  let 客戶名, 客戶ID, 回覆人員, 優先, 狀態, 描述, 到期時間;
  input.each(function () {$(this).blur();});
  for(let i=0;i<editable.length;i++){
    name = editable.eq(i).parent().children("th").text().split(" ") ;
    value = editable.eq(i).text() ;
    json += '"'+name[0]+'":"'+value+'",';
  }
  for(let i=0;i<select.length;i++){
    name = select.eq(i).parent().parent().children("th").text() ;
    value = select.eq(i).val() ;
    json += '"'+name+'":'+value+','
  }
  json += '"id":"'+id+'"}';
  obj = JSON.parse(json);
  客戶名 = obj.subject;
  客戶ID = obj.客戶ID;
  回覆人員 = obj.回覆人員;
  優先 = parseInt(obj.優先);
  狀態 = parseInt(obj.狀態);
  描述 = obj.描述;
  obj = '{"name": "'+客戶名+'", "subject": "'+客戶ID+'", "status": '+狀態+', "priority": '+優先+', "description": "'+描述+'"}';
  if(confirm("確定變更表單？")) {
    var ticket_id = $(this).parent().siblings().children().find('#ID_num').text();
    $.ajax({
      url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets/"+ticket_id,
      type: 'PUT',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
          "Authorization": "Basic " + btoa(api_key + ":x")
      },
      data: obj,
      success:  function(data, textStatus, jqXHR) {
        alert("表單已更新");
        setTimeout(() => {
        location.reload();
       }, 500)
      },
      error:  function(jqXHR, tranStatus) {
        alert("表單更新失敗，請重試");
        console.log(jqXHR.responseText)
      }
    });
  }
} // end of updateStatus
