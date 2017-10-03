$(document).ready(function() {
  var name = $('#prof-name').text();
  var id = $('#prof-id').text();
  var dob = $('#prof-dob').text();
  var email = $('#prof-email').text();
  var gender = $('#prof-gender').text();
  var phone = $('#prof-phone').text();
  var name1 = $('#prof-name1').text();
  var chanId_1 = $('#prof-channelId_1').text();
  var chanSecret_1 = $('#prof-channelSecret_1').text();
  var chanAT_1 = $('#prof-channelAccessToken_1').text();
  var name2 = $('#prof-name2').text();
  var chanId_2 = $('#prof-channelId_2').text();
  var chanSecret_2 = $('#prof-channelSecret_2').text();
  var chanAT_2 = $('#prof-channelAccessToken_2').text();
  $('#prof-name').text('');
  $('#prof-dob').text('');
  $('#prof-email').text('');
  $('#prof-gender').text('');
  $('#prof-phone').text('');
  $('#prof-nick').text('');
  $('#prof-name1').text('');
  $('#prof-channelId_1').text('');
  $('#prof-channelSecret_1').text('');
  $('#prof-channelAccessToken_1').text('');
  $('#prof-name2').text('');
  $('#prof-channelId_2').text('');
  $('#prof-channelSecret_2').text('');
  $('#prof-channelAccessToken_2').text('');
  setTimeout(loadProf, 1000);
  $(document).on('click', '#prof-edit', profEdit); //打開modal
  $(document).on('click', '#prof-submit-action', profSubmitAction); //完成編輯-action
  $(document).on('click', '#prof-submit-profile', profSubmitProfile); //完成編輯-profile
  $(document).on('click', '#prof-submit-basic', profSubmitBasic); //完成編輯-basic
  $('#profModal').on('hidden.bs.modal', profClear); //viewModal 收起來
  $(document).on('click', '#signout-btn', logout); //登出
  //----------------TAG---------------
  var socket = io.connect();
  var tagTable = $('#tagTable');
  var tagTableBody = $('#tagTable-body');
  var addTagBtn = $('.add-tag');
  var allConfirmBtn = $('.all-confirm');
  var allCancelBtn = $('.all-cancel');
  var rowsCount = 0;  //dynamic load count in db ref
  tagTableBody.sortable();
  socket.emit("get tags from tags");
  socket.on("push tags to tags", data=> {
    for( let i in data ) {
      append_new_tag();
      let name = data[i].name;
      let type = data[i].type;
      let modify = data[i].modify;
      tagTableBody.find(".tag-name:last").text(name);
      tagTableBody.find(".tag-option:last").val(type);
      tagTableBody.find(".tag-modify:last").text(modify);
      type = toTypeValue(type);
      let set = data[i].set;
      if( type==3 ) set = set.join('\n');   //if type is single_select || multi_select
      tagTableBody.find('.tag-set-td:last').find('#set'+type).val(set)
      .show().siblings().hide();
      if( modify ) tagTableBody.find(".tag-delete:last").html('<button class="tag-delete-btn">刪除</button>');
      else tagTableBody.find(".tag-delete:last").html('無法刪除');
    }
  });
  addTagBtn.on('click', function() {
    append_new_tag();
    tagTableBody.find(".tag-name:last").click();
  });
  $(document).on('click', '.tag-name', function() {
    if( $(this).find('input').length==0 && $(this).parent().find('.tag-modify').text()=="true" ) {
      console.log(".tag-name click");
      let val = $(this).text();
      $(this).html('<input type="text" value="' +val + '"></input>');
      $(this).find('input').select();
    }
  });
  $(document).on('keypress', '.tag-name input', function(e) {
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) {
      console.log(".tag-name-input keypress");
      $(this).blur();
    }
  });
  $(document).on('blur', '.tag-name input', function() {
    console.log(".tag-name-input blur");
    let val = $(this).val();
    $(this).parent().html(val);
  });
  $(document).on('change', '.tag-option', function() {
    let setDOM = $(this).parents('tr').find('.tag-set-td');
    let typeValue = toTypeValue($(this).val());
    setDOM.find('#set'+typeValue).show().siblings().hide();
  });
  $(document).on('click', '.tag-move #moveup', function() {
    let tomove = $(this).parent().parent();
    tomove.prev().before(tomove);
  });
  $(document).on('click', '.tag-move #movedown', function() {
    let tomove = $(this).parent().parent();
    tomove.next().after(tomove);
  });
  $(document).on('click', '.tag-delete-btn', function() {
    $(this).parent().parent().remove();
  });
  allConfirmBtn.on('click', function() {
    if( !confirm("Confirm???") ) return;
    let sendObj = [];
    tagTableBody.find('tr').each(function() {
      let name = $(this).find('.tag-name').text();
      let type = $(this).find('.tag-option').val();
      let modify = $(this).find('.tag-modify').text()=="true";
      let set = $(this).find('.tag-set-td').find('#set'+toTypeValue(type)).val();
      if( type.indexOf('select')!=-1  ) { //seperate options
        set = set.split('\n');
      }
      let nowObj = {
        name: name,
        type: type,
        set: set,
        modify: modify
      };
      sendObj.push(nowObj);
    });
    console.log(sendObj);
    socket.emit('update tags', sendObj);
    alert('change saved!');
  });
  allCancelBtn.on('click', function() {
    if( confirm("Cancel change??") ) location.reload();
  });
  function toTypeValue(type) {
    if( type=="text" ) return 0;
    else if( type=="time" ) return 2;
    else if( type=="single_select" ) return 3;
    else if( type=="multi_select" ) return 3;
    else console.log("ERROR 1");
  }
  function append_new_tag(from) {
    tagTableBody.append(
      '<tr class="tag-content" id="tag-index-'+(rowsCount++)+'">'
      + '<td class="tag-name"></td>'
      + '<td>'
      + '<select class="tag-option">'
      + '<option value="text">文字數字</option>'
      + '<option value="time">時間</option>'
      + '<option value="single_select">單選</option>'
      + '<option value="multi_select">多選</option>'
      + '</select>'
      + '</td>'
      + '<td class="tag-set-td">'
      + '<select class="tag-set" id="set0">'
      + '<option value="single">單行文字數字</option>'
      + '<option value="multi">段落</option>'
      + '</select>'
      + '<p class="tag-set" id="set2" style="display: none;">無設定</p>'
      + '<textarea class= "tag-set" id="set3" rows="3" columns = "10" style="resize: vertical; display: none;">'
      + '</textarea>'
      + '</td>'
      + '<td class="tag-move"><p id="moveup">上</p><p id="movedown">下</p></td>'
      + '<td class="tag-delete"><button class="tag-delete-btn">刪除</button></td>'
      + '<td class="tag-modify">true</td>'
      + '</tr>'
    );
  }
  //-------------end TAG--------------------

  function loadProf() {
    let userId = auth.currentUser.uid;
    database.ref('users/' + userId).on('value', snap => {
      let profInfo = snap.val();
      if(profInfo === null) {
        $('#error-message').show();
      }
      else {
        let profInfo = snap.val();
        let profId = Object.keys(profInfo);
        $('#prof-id').text(profId);
        $('#prof-name').text(profInfo.name);
        $('#prof-dob').text(profInfo.dob);
        $('#prof-email').text(profInfo.email);
        $('#prof-gender').text(profInfo.gender);
        $('#prof-phone').text(profInfo.phone);
        $('#prof-nick').text(profInfo.nickname);
        $('#prof-name1').text(profInfo.name1);
        $('#prof-channelId_1').text(profInfo.chanId_1);
        $('#prof-channelSecret_1').text(profInfo.chanSecret_1);
        $('#prof-channelAccessToken_1').text(profInfo.chanAT_1);
        $('#prof-name2').text(profInfo.name2);
        $('#prof-channelId_2').text(profInfo.chanId_2);
        $('#prof-channelSecret_2').text(profInfo.chanSecret_2);
        $('#prof-channelAccessToken_2').text(profInfo.chanAT_2);
        $('#prof-fbPageName').text(profInfo.fbName);
        $('#prof-fbPageId').text(profInfo.fbPageId);
        $('#prof-fbAppId').text(profInfo.fbAppId);
        $('#prof-fbAppSecret').text(profInfo.fbAppSecret);
        $('#prof-fbValidToken').text(profInfo.fbValidToken);
        $('#prof-fbPageToken').text(profInfo.fbPageToken);
        $('#prof-company').text(profInfo.company);
        $('#prof-logo').text(profInfo.logo);
      }
    });
  }
  function profEdit() {
    //移到最上面了
    let id = $('#prof-id').text();
    let name = $('#prof-name').text();
    let nick = $('#prof-nick').text();
    let dob = $('#prof-dob').text();
    let email = $('#prof-email').text();
    let gender = $('#prof-gender').text();
    let phone = $('#prof-phone').text();
    let name1 = $('#prof-name1').text();
    let chanId_1 = $('#prof-channelId_1').text();
    let chanSecret_1 = $('#prof-channelSecret_1').text();
    let chanAT_1 = $('#prof-channelAccessToken_1').text();
    let name2 = $('#prof-name2').text();
    let chanId_2 = $('#prof-channelId_2').text();
    let chanSecret_2 = $('#prof-channelSecret_2').text();
    let chanAT_2 = $('#prof-channelAccessToken_2').text();
    let fbName = $('#prof-fbPageName').text();
    let fbPageId = $('#prof-fbPageId').text();
    let fbAppId = $('#prof-fbAppId').text();
    let fbAppSecret = $('#prof-fbAppSecret').text();
    let fbValidToken = $('#prof-fbValidToken').text();
    let fbPageToken = $('#prof-fbPageToken').text();
    let company = $('#prof-company').text();
    let logo = $('#prof-logo').text();
    $('#prof-edit-id').val(id);
    $('#prof-edit-name').val(name);
    $('#prof-edit-dob').val(dob);
    $('#prof-edit-email').val(email);
    $('#prof-edit-gender').val(gender);
    $('#prof-edit-phone').val(phone);
    $('#prof-edit-nick').val(nick);
    $('#prof-edit-name1').val(name1);
    $('#prof-edit-channelId_1').val(chanId_1);
    $('#prof-edit-channelSecret_1').val(chanSecret_1);
    $('#prof-edit-channelAccessToken_1').val(chanAT_1);
    $('#prof-edit-name2').val(name2);
    $('#prof-edit-channelId_2').val(chanId_2);
    $('#prof-edit-channelSecret_2').val(chanSecret_2);
    $('#prof-edit-channelAccessToken_2').val(chanAT_2);
    $('#prof-edit-fbPageName').val(fbName);
    $('#prof-edit-fbPageId').val(fbPageId);
    $('#prof-edit-fbAppId').val(fbAppId);
    $('#prof-edit-fbAppSecret').val(fbAppSecret);
    $('#prof-edit-fbValidToken').val(fbValidToken);
    $('#prof-edit-fbPageToken').val(fbPageToken);
    $('#prof-edit-company').val(company);
    $('#prof-edit-logo').val(logo);
  }
  function profSubmitBasic() {
    let userId = auth.currentUser.uid;
    let company = $('#prof-edit-company').val();
    let logo = $('#prof-edit-logo').val();
    database.ref('users/' + userId).update({
      company: company,
      logo: logo
    });
    $('#error-message').hide();
    profClear();
    loadProf();
    $('#basicModal').modal('hide');
  }
  function profSubmitAction() {
    let userId = auth.currentUser.uid;
    let dob = $('#prof-edit-dob').val();
    let email = $('#prof-edit-email').val();
    let gender = $('#prof-edit-gender').val();
    let phone = $('#prof-edit-phone').val();
    database.ref('users/' + userId).update({
      dob: dob,
      email: email,
      gender: gender,
      phone: phone,
    });
    $('#error-message').hide();
    profClear();
    loadProf();
    $('#accountModal').modal('hide');
  }
  function profSubmitProfile() {
    let userId = auth.currentUser.uid;
    let name1 = $('#prof-edit-name1').val();
    let chanId_1 = $('#prof-edit-channelId_1').val();
    let chanSecret_1 = $('#prof-edit-channelSecret_1').val();
    let chanAT_1 = $('#prof-edit-channelAccessToken_1').val();
    let name2 = $('#prof-edit-name2').val();
    let chanId_2 = $('#prof-edit-channelId_2').val();
    let chanSecret_2 = $('#prof-edit-channelSecret_2').val();
    let chanAT_2 = $('#prof-edit-channelAccessToken_2').val();
    let fbName = $('#prof-edit-fbPageName').val();
    let fbPageId = $('#prof-edit-fbPageId').val();
    let fbAppId = $('#prof-edit-fbAppId').val();
    let fbAppSecret = $('#prof-edit-fbAppSecret').val();
    let fbValidToken = $('#prof-edit-fbValidToken').val();
    let fbPageToken = $('#prof-edit-fbPageToken').val();
    database.ref('users/' + userId).update({
      name1: name1,
      chanId_1: chanId_1,
      chanSecret_1: chanSecret_1,
      chanAT_1: chanAT_1,
      name2: name2,
      chanId_2: chanId_2,
      chanSecret_2: chanSecret_2,
      chanAT_2: chanAT_2,
      fbName: fbName,
      fbPageId: fbPageId,
      fbAppId: fbAppId,
      fbAppSecret: fbAppSecret,
      fbValidToken: fbValidToken,
      fbPageToken: fbPageToken
    });
    io.connect().emit('update bot', [
      {
        channelId: chanId_1,
        channelSecret: chanSecret_1,
        channelAccessToken: chanAT_1
      },
      {
        channelId: chanId_2,
        channelSecret: chanSecret_2,
        channelAccessToken: chanAT_2
      },
      {
        channelId: chanId_2,
        channelSecret: chanSecret_2,
        channelAccessToken: chanAT_2
      },
    ]);
    $('#error-message').hide();
    profClear();
    loadProf();
    $('#profModal').modal('hide');
  }
  function profClear() {
    $('#prof-edit-id').val('');
    $('#prof-edit-name').val('');
    $('#prof-edit-dob').val('');
    $('#prof-edit-email').val('');
    $('#prof-edit-gender').val('Male');
    $('#prof-edit-phone').val('');
    $('#prof-edit-nick').val('');
    $('#prof-edit-name1').val('');
    $('#prof-edit-channelId_1').val('');
    $('#prof-edit-channelSecret_1').val('');
    $('#prof-edit-channelAccessToken_1').val('');
    $('#prof-edit-name2').val('');
    $('#prof-edit-channelId_2').val('');
    $('#prof-edit-channelSecret_2').val('');
    $('#prof-edit-channelAccessToken_2').val('');
    $('#prof-edit-company').val('');
    $('#prof-edit-logo').val('');
  }
});
