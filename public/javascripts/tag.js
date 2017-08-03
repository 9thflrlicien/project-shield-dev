$(document).ready(function() {
  var socket = io.connect();
  var tagTable = $('#tagTable');
  var tagTableBody = $('#tagTable-body');
  var addTagBtn = $('#add-tag');
  var allConfirmBtn = $('#all-confirm');
  var allCancelBtn = $('#all-cancel');
  var rowsCount = 0;  //dynamic load count in db ref

  socket.emit("get tags from tags");
  socket.on("push tags to tags", data=> {
    console.log("data:");
    console.log(data);
    for( let i in data ) {
      append_new_tag();
      let name = data[i].name;
      let type = data[i].type;
      tagTableBody.find(".tag-name:last").text(name);
      tagTableBody.find(".tag-name:last").attr('modify', data[i].modify);
      tagTableBody.find(".tag-option:last").val(type);
      type = toTypeValue(type);
      let set = data[i].set;
      if( type==3 ) set = set.join('\n');
      tagTableBody.find('.tag-set-td:last').find('#set'+type).val(set)
        .show().siblings().hide();
    }
  });
  addTagBtn.on('click', function() {
    // addTagBtn.attr('disabled', 'true');
    append_new_tag("new");
    tagTableBody.find(".tag-name:last input").select();
  });

  $(document).on('change', '.tag-option', function() {
    let setDOM = $(this).parents('tr').find('.tag-set-td');
    let typeValue = toTypeValue($(this).val());
    setDOM.find('.tag-set').hide();
    setDOM.find('#set'+typeValue).show();
  });

  $(document).on('click', '.tag-name', function() {
    if( $(this).find('input').length==0 ) {
      console.log(".tag-name click");
      let val = $(this).text();
      $(this).html('<input type="text" value="'  +val + '"></input>');
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
    $(this).parent().text(val);
  });

  $(document).on('click', '.tag-delete', function() {
    $(this).parent().remove();
  })

  allConfirmBtn.on('click', function() {
    let sendObj = [];
    tagTableBody.find('tr').each(function() {
      let name = $(this).find('.tag-name').text();
      let type = $(this).find('.tag-option').val();
      let set = $(this).find('.tag-set-td').find('#set'+toTypeValue(type)).val();
      let modify = $(this).find('.tag-name').attr('modify');
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
    // location.reload();
  });
  allCancelBtn.on('click', function() {
    location.reload();
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
    let str="";
    if(from=="new") str = '<input type="text" value="new tag"></input>';
    tagTableBody.append(
      '<tr class="tag-content" id="tag-index-'+(rowsCount++)+'">'
        + '<td class="tag-name" modify="true">' + str + '</td>'
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
        + '<td class="tag-delete"> delete </td>'
      + '</tr>'
    );
  }

});
