$(document).ready(function() {
  var socket = io.connect();
  var tagTable = $('#tagTable');
  var tagTableBody = $('#tagTable-body');
  var addTagBtn = $('#add-tag');
  var allConfirmBtn = $('#all-confirm');
  var allCancelBtn = $('#all-cancel');
  var rowsCount = 0;  //dynamic load count in db ref

  tagTableBody.sortable();

  socket.emit("get tags from tags");
  socket.on("push tags to tags", data=> {
    for( let i in data ) {
      append_new_tag();
      let name = data[i].name;
      let type = data[i].type;
      let modify = data[i].modify;
      let tag_name = tagTableBody.find(".tag-name:last");
      let tag_option = tagTableBody.find(".tag-option:last");
      let tag_set = tagTableBody.find('.tag-set-td:last');
      let tag_modify = tagTableBody.find(".tag-modify:last");
      let tag_delete = tagTableBody.find(".tag-delete:last");
      tag_name.text(name);
      tag_option.val(type);
      tag_modify.text(modify);

      type = toTypeValue(type);
      let set = data[i].set;
      if( type==3 ) set = set.join('\n');   //if type is single_select || multi_select
      tag_set.find('#set'+type).val(set).show().siblings().hide();

      if( modify ) {
        console.log("modify true");
        tag_name.attr("modify","true");
        tag_delete.html('<button class="tag-delete-btn">delete</button>');
      }
      else {
        console.log("modify false");
        tag_name.attr("modify","false");
        tag_option.prop("disabled","disabled");
        tag_set.find('.tag-set').prop("disabled","disabled");
        tag_delete.html('cant delete');
      }
    }
  });

  addTagBtn.on('click', function() {
    append_new_tag();
    tagTableBody.find(".tag-name:last").click();
  });

  $(document).on('click', '.tag-name[modify="true"]', function() {
    if( $(this).find('input').length==0 ) {
      //如果現在是非編輯狀態
      console.log(".tag-name click");
      let val = $(this).text();        //抓目前的DATA
      $(this).html('<input type="text" value="' +val + '"></input>'); //把element改成input，放目前的DATA進去
      $(this).find('input').select();   //自動FOCUS該INPUT
    }
  });

  $(document).on('keypress', '.tag-name input', function(e) {
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) {
      //如果按了ENTER
      console.log(".tag-name-input keypress");
      $(this).blur(); //就離開此INPUT，觸發on blur事件
    }
  });
  $(document).on('blur', '.tag-name input', function() {
    //當USER離開此INPUT
    console.log(".tag-name-input blur");
    let val = $(this).val();  //抓INPUT裡的資料
    if( !val ) val="new tag";
    $(this).parent().html(val);   //將INPUT元素刪掉，把資料直接放上去
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
  })


  function toTypeValue(type) {
    if( type=="text" ) return 0;
    // else if( type=="date" ) return 1;
    else if( type=="time" ) return 2;
    else if( type=="single_select" ) return 3;
    else if( type=="multi_select" ) return 3;
    else console.log("ERROR 1");
  }

  function append_new_tag(from) {
    tagTableBody.append(
      '<tr class="tag-content" id="tag-index-'+(rowsCount++)+'">'
        + '<td class="tag-name" modify="true">new tag</td>'
        + '<td>'
          + '<select class="tag-option">'
            + '<option value="text">文字數字</option>'
            // + '<option value="date">日期</option>'
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
          // +'<select class= "tag-set" id="set1" style="display: none;">'
          //   +'<option value="mm/dd/yy">Default - mm/dd/yy</option>'
          //   +'<option value="yy-mm-dd">ISO 8601 - yy-mm-dd</option>'
          //   +'<option value="d M, y">Short - d M, y</option>'
          //   +'<option value="d MM, y">Medium - d MM, y</option>'
          //   +'<option value="DD, d MM, yy">Full - DD, d MM, yy</option>'
          //   +'<option value="\'day\' d \'of\' MM \'in the year\' yy">With text - \'day\' d \'of\' MM \'in the year\' yy</option>'
          // + '</select>'
          + '<p class="tag-set" id="set2" style="display: none;"> no set </p>'
          // + '<select class= "tag-set" id="set2" style="display: none;">'
          //   + '<option value="12">12 hr</option>'
          //   + '<option value="24">24 hr</option>'
          // + '</select>'
          + '<textarea class= "tag-set" id="set3" rows="3" columns = "10" style="resize: vertical; display: none;">'
          + '</textarea>'
        + '</td>'
        + '<td class="tag-move"><p id="moveup">UP</p><p id="movedown">DOWN</p></td>'
        + '<td class="tag-delete"></td>'
        + '<td class="tag-modify">true</td>'
      + '</tr>'
    );
  }

});
