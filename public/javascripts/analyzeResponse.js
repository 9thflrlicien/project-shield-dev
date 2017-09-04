$(document).on('ready', function(){
  console.log("response ready");
});

function getChart( chart, option ) {
  //當analyzeQuestionnaire呼叫getChart
  //並傳入chart種類跟option
  $.ajax({
    //傳送POST請求
    url: "/analyzeResponse/getChart",
    type: "POST",
    dateType: 'html',
    data: {
       chart: chart,
       option: option
     },
    success: function(data) {
      //後端傳送response
      $("#content").empty();
      if( chart=="某團對各工人評價" ) drawChart_1(data);
      else if( chart=="某項目各工人評價" ) drawChart_2(data);
      else if( chart=="某團對各項目評價" ) drawChart_3(data);
      else if( chart=="詳細資料" ) drawChart_4(data);
      else if( chart=="設定" ) drawChart_5(data);
      else {
        console.log("success error 2");
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log("ERRR when POST getChart");
    }
  });
}

function drawChart_1(input) {
  //某團對各工人評價
  // console.log(input);
  $('#content').append('<canvas id="myChart"></canvas>');   //創造chart canvas
  let ctx = $('#myChart').get(0).getContext('2d');    //取得DOM 2d的資訊
  let color = getRandomColor();   //隨機指定長條圖的顏色
  var myChart = new Chart(ctx,    //使用Chart.min.js裡的功能
    {
      type: 'bar',          //種類是長條圖
      data: {
        labels: input.names,    //X軸節點名稱，陣列形式
        //group_worker order by worker_id
        datasets: [{        //陣列形式，陣列裡一個物件代表一組長條，這裡只有一組長條
          label: "score",
          data: input.scores,       //對應X軸各節點的分數
          backgroundColor: color
        }]
      },
      options: {
        scales: {
           yAxes: [{
             scaleLabel: { display: true, labelString: '評價分數' },   //Y軸標籤
             ticks: { beginAtZero: true, stepSize: 1, min: 0, max: 5 }  //從0~5分，每次間隔1分
           }],
           xAxes: [{
               barPercentage: 0.6     //長條圖的寬度
           }]
         },
         showDatapoints: {    //Chart擴充，CODE在最下方，可顯示各長條的數值
           fontColor: color   //數字顏色
         }
      }
    }
  );
  $('#content').show();
}

function drawChart_2(input) {
  // console.log(input);
  $('#content').append('<canvas id="myChart"></canvas>');
  let ctx = $('#myChart').get(0).getContext('2d');
  var myChart = new Chart(ctx,
    {
      type: 'bar',
      data: {
        labels: input.worker_name,
        //group_worker order by worker_id
        datasets: [{
          label: "score",
          data: input.score,
          backgroundColor: getRandomColor()
        }]
      },
      options: {
        scales: {
           yAxes: [{
             scaleLabel: { display: true, labelString: '評價分數' },
             ticks: { beginAtZero: true, stepSize: 1, min: 0, max: 5 }
           }],
           xAxes: [{
               barPercentage: 0.6
           }]
         },
         showDatapoints: true
      }
    }
  );
  $('#content').show();
}

function drawChart_3(input) {
  console.log(input);
  $('#content').append('<canvas id="myChart"></canvas>');
  let ctx = $('#myChart').get(0).getContext('2d');
  var myChart = new Chart(ctx,
    {
      type: 'bar',
      data: {
        labels: input.category_names,
        //group_worker order by worker_id
        datasets: [{
          label: "score",
          data: input.scores,
          backgroundColor: getRandomColor()
        }]
      },
      options: {
        scales: {
           yAxes: [{
             scaleLabel: { display: true, labelString: '評價分數' },
             ticks: { beginAtZero: true, stepSize: 1, min: 0, max: 5 }
           }],
           xAxes: [{
               barPercentage: 0.6
           }]
         },
         showDatapoints: true
      }
    }
  );
  $('#content').show();
}

function getData( type ) {
  //從analyzeQuestionnaire呼叫getData，取得問卷詳細資料，或是設定
  $.ajax({
    url: "/analyzeResponse/getData",
    type: "POST",
    dateType: 'html',
    data: {
       type: type
     },
    success: function(data) {
      console.log(data);
      $("#content").empty();
      if( type=="details" ) showData_details(data);
      else if( type=="category" ) showData_category(data);
      else if( type=="group" ) showData_group(data);
      else if( type=="worker" ) {
        showData_worker(data);
      }
      else {
        console.log("success error 3");
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log("ERRR when POST getData");
    }
  });
}

function showData_details(data) {
  $('#content').append('<table id="details"></table>');
  $('#details').append('<tr><th>序號</th>><th>評分者UID</th><th>評分時間</th>'
    + '<th>滿意度</th><th>評分項目</th><th>被評分人員</th><th>團名</th></tr>' );
  data.map(function(ele) {
    // console.log(ele);
    $('#details').append('<tr><td>'+ele.ID+'</td>'
      + '<td>'+ele.vote_voter+'</td>'
      + '<td>'+ele.vote_time+'</td>'
      + '<td>'+ele.vote_score+'</td>'
      + '<td>'+ele.category_name+'</td>'
      + '<td>'+ele.worker_name+'</td>'
      + '<td>'+ele.group_name+'</td></tr>');
  });
  $('#content').show();
}

function showData_category(data) {
  $('#content').append('<table id="category"></table>'
    + '<button class="btn btn-primary btn-update-db">Confirm</button>'
    + '<button class="btn btn-default btn-new-row">Add</button>'
  );

  $('#category').append('<tr><th>序號</th><th>項目名稱</th></tr>');
  data.map(function(ele) {
    // console.log(ele);
    $('#category').append('<tr><td>'+ele.ID+'</td>'
      + '<td class="modify-td">'+ele.category_name+'</td></tr>'
    );
  });

  $('#content').css('width', '95%').show();
}

function showData_group(data) {
  $('#content').append('<table id="group"></table>'
    + '<button class="btn btn-primary btn-update-db">Confirm</button>'
    + '<button class="btn btn-default btn-new-row">Add</button>'
  );

  $('#group').append('<tr><th>序號</th><th>旅行團團名</th><th>工作人員</th></tr>');
  data.group.map(function(ele) {
    // console.log(ele);
    $('#group').append('<tr><td>'+ele.ID+'</td>'
      + '<td class="modify-td">'+ele.group_name+'</td>'
      + '<td class="workers"><input type="text" class="worker-autocomplete" /></td></tr>' //該團的工人們，及輸入新工人的欄位
    );
    ele.workers.map(function(worker) {
      //將該團的工人們加進剛剛的td裡
      $('.workers:last').prepend('<span class="worker-in-group"><p class="name">'+worker.worker_name+'</p>'
        + '<p class="delete">&times;</p></span>'
      );
    });
  });

  $('.worker-autocomplete').autocomplete(autocomplete);     //將輸入工人的欄位，增加autocomplete事件
  let autocomplete = {
    //輸入新工人的欄位，能偵測INPUT並顯示相關名單
    source: data.worker   //取得全部WORKER的worker_name
    select: function(event, ui) {
      //當點選一個worker後
      console.log("selected!");
      let name = ui.item.label;   //取得worker名字
      $(event.target).parent().append('<span class="worker-in-group"><p class="name">'+name+'</p>'  //將worker加進名單裡
        + '<p class="delete">×</p></span>'
        + '<input type="text" class="worker-autocomplete" />'   //並重新做一個輸入欄位
      ).find('.worker-autocomplete').autocomplete(autocomplete).select();   //需重新幫輸入欄位增加autocomplete事件
      $(event.target).remove();     //將現有的輸入欄位remove
    },
    delay: 100
  };

  $('#content').css('width', '95%').show();
}


var select_html = "";   //選擇項目的下拉式選單
function showData_worker(data) {

  select_html = '<select class="select-category">';
  data.category.map(function(ele) {
    select_html += '<option value="'+ele.ID+'">'+ele.category_name+'</option>';
  });
  select_html += '</select>';

  $('#content').append('<table id="worker"></table>'
    + '<button class="btn btn-primary btn-update-db">Confirm</button>'
    + '<button class="btn btn-default btn-new-row">Add</button>'
  );

  $('#worker').append('<tr><th>序號</th><th>名稱</th><th>服務項目</th><th>被評價次數</th><th>被評價分數</th></tr>');
  data.worker.map(function(ele) {
    $('#worker').append('<tr><td>'+ele.ID+'</td>'
      + '<td class="modify-td">'+ele.worker_name+'</td>'
      + '<td class="select-td">'+select_html+'</td>'
      + '<td>'+ele.vote_count+'</td>'
      + '<td>'+ele.score+'</td></tr>'
    );
    $('.select-category:last').val(ele.category_id);    //指定下拉式選單的VALUE至此工人目前的項目
  });

  $('#content').css('width', '95%').show();
}

$(document).on('click', '.modify-td', function() {
  //滑鼠點擊可更改的標籤時，將文字改為input
  if( $(this).find('input').length==0 ) {
    console.log(".modify-td click");
    let val = $(this).text();   //取得原本的文字
    $(this).html('<input type="text" value="' +val + '"></input>'); //指定input的初始value為原本文字
    $(this).find('input').select();   //自動選取該input讓USER可直接打字
  }
});

$(document).on('keypress', '.modify-td input', function(e) {
  let code = (e.keyCode ? e.keyCode : e.which);
  if (code == 13) {     //如果使用者按了ENTER
    console.log(".modify-td-input ENTER keypress");
    $(this).blur();     //就跳脫此input，並觸發跳脫event
  }
});
$(document).on('blur', '.modify-td input', function() {
  console.log(".modify-td-input blur"); //跳脫event
  let val = $(this).val();      //取得input的新value
  if( !val ) val = "";
  $(this).parent().html(val);     //將input轉回文字
});

$(document).on('click', '.worker-in-group .delete', function() {
  //當點選了group_worker旁的X時
  console.log('clicked delete');
  $(this).parent().remove();  //就刪除此worker
});

$(document).on('click', '.btn-new-row', function() {
  //設定新的一筆資料
  let table = $(this).siblings('table');
  if( table.attr('id')=="category" ) table.find('tbody').append('<tr><td></td><td class="modify-td"></td></tr>');
  else if( table.attr('id')=="group" ) table.find('tbody').append('<tr><td></td><td class="modify-td"></td></tr>');
  else if( table.attr('id')=="worker" ) table.find('tbody').append('<tr><td></td>'
    + '<td class="modify-td"></td>'
    + '<td class="select-td">'+select_html+'</td>'
    + '<td>0</td><td>0</td></tr>'
  );
  else console.log("table id = "+table.attr('id')+", not found!");
  $('.modify-td:last').click();   //自動選取new row，USER可直接輸入
  table.scrollTop(table[0].scrollHeight);   //自動下拉至最下方
});

$(document).on('click', '.btn-update-db', function() {
  if( ! confirm('confirm to update?') ) return;
  //點選confirm按鈕後，更新DB
  let DBtable = $(this).siblings('table').attr('id');   //取得目前是在哪個頁面
  let trs = $(this).siblings('table').find('tr');   //取得每一列的資料
  let updateData;
  let url = "/analyzeResponse/";        //POST至後端的URL

  if( DBtable=="category" ) {
    updateData = [];
    url += "setCategory";
    for( let i=1; i<trs.length; i++ ) {
      let tds = trs.eq(i).find('td');   //取得一筆資料中的各個欄位
      updateData.push({
        ID: tds.eq(0).text(),
        category_name: tds.eq(1).text()
      });
    }
  }
  else if( DBtable=="group" ) {
    updateData = {};    //不只要更新group，也要更新group_worker
    url += "setGroup";
    updateData.group = [];
    updateData.group_worker = [];
    for( let i=1; i<trs.length; i++ ) {
      let tds = trs.eq(i).find('td');  //取得一筆資料中的各個欄位
      updateData.group.push({
        ID: tds.eq(0).text(),
        group_name: tds.eq(1).text()
      });

      let seen = {};      //避免USER輸入重複的worker
      tds.eq(2).find('.worker-in-group .name').each( function()  {
        //取得每個在該group裡的worker name
        let name = $(this).text();
        if( ! seen.hasOwnProperty(name) ) {
          //如果該group還沒出現過此worker
          seen[name] = true;  //就丟進名單內，下次若出現重複worker，就不會進此if
          updateData.group_worker.push({
            group_id: tds.eq(0).text(),
            worker_name: name
          });
        }
      });
    }
  }
  else if( DBtable=="worker" ) {
    updateData = [];
    url += "setWorker";
    for( let i=1; i<trs.length; i++ ) {
      let tds = trs.eq(i).find('td');  //取得一筆資料中的各個欄位
      updateData.push({
        ID: tds.eq(0).text(),
        worker_name: tds.eq(1).text(),
        category_id: tds.eq(2).find('select').val()  //取得<td>裡的下拉式選單的value
      });
    }
  }
  console.log(updateData);

  $.ajax({
    url: url,       //前面已指定好url
    type: "POST",   //POST request
    dateType: 'html',
    data: {
      data: JSON.stringify(updateData)    //要先將JSON轉換為String處理
    },

    success: function(data) {
      console.log("POST "+url+" SUCCESS");
      getData( DBtable );
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log("ERRR when POST "+url);
    }
  });
});

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

Chart.plugins.register({
  //Chart擴充，可在長條圖上顯示數值
  afterDraw: function(chartInstance) {
    if (chartInstance.config.options.showDatapoints) {
      var helpers = Chart.helpers;
      var ctx = chartInstance.chart.ctx;
      var fontColor = helpers.getValueOrDefault(chartInstance.config.options.showDatapoints.fontColor
        , chartInstance.config.options.defaultFontColor
      );

      // render the value of the chart above the bar
      ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal'
        , Chart.defaults.global.defaultFontFamily
      );
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = fontColor;

      chartInstance.data.datasets.forEach(function (dataset) {
        for (var i = 0; i < dataset.data.length; i++) {
          var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
          var scaleMax = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
          var yPos = (scaleMax - model.y) / scaleMax >= 0.93 ? model.y + 20 : model.y - 5;
          var num = dataset.data[i] ? dataset.data[i].toFixed(2) : "" ;
          ctx.fillText(num, model.x, yPos);
        }
      });
    }
  }
});
