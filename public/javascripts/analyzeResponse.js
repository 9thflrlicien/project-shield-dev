$(document).on('ready', function(){
  console.log("response ready");
});

function getChart( chart, option ) {
  $.ajax({
    url: "/analyzeResponse/getChart",
    type: "POST",
    dateType: 'html',
    data: {
       chart: chart,
       option: option
     },
    success: function(data) {
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

  // console.log(input);
  $('#content').append('<canvas id="myChart"></canvas>');
  let ctx = $('#myChart').get(0).getContext('2d');
  let color = getRandomColor();
  var myChart = new Chart(ctx,
    {
      type: 'bar',
      data: {
        labels: input.names,
        //group_worker order by worker_id
        datasets: [{
          label: "score",
          data: input.scores,
          backgroundColor: color
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
         showDatapoints: {
           fontColor: color
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
      else if( type=="worker" ) showData_worker(data);
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

  $('#group').append('<tr><th>序號</th><th>旅行團團名</th></tr>');
  data.map(function(ele) {
    // console.log(ele);
    $('#group').append('<tr><td>'+ele.ID+'</td>'
      + '<td class="modify-td">'+ele.group_name+'</td></tr>'
    );
  });

  $('#content').css('width', '95%').show();
}

function showData_worker(data) {
  $('#content').append('<table id="worker"></table>'
    + '<button class="btn btn-primary btn-update-db">Confirm</button>'
    + '<button class="btn btn-default btn-new-row">Add</button>'
  );

  $('#worker').append('<tr><th>序號</th><th>項目名稱</th></tr>');
  data.map(function(ele) {
    // console.log(ele);
    $('#worker').append('<tr><td>'+ele.ID+'</td>'
      + '<td class="modify-td">'+ele.worker_name+'</td></tr>'
    );
  });

  $('#content').css('width', '95%').show();
}

$(document).on('click', '.modify-td', function() {
  if( $(this).find('input').length==0 ) {
    console.log(".modify-td click");
    let val = $(this).text();
    $(this).html('<input type="text" value="' +val + '"></input>');
    $(this).find('input').select();
  }
});

$(document).on('keypress', '.modify-td input', function(e) {
  let code = (e.keyCode ? e.keyCode : e.which);
  if (code == 13) {
    console.log(".modify-td-input ENTER keypress");
    $(this).blur();
  }
});
$(document).on('blur', '.modify-td input', function() {
  console.log(".modify-td-input blur");
  let val = $(this).val();
  if( !val ) val = "";
  $(this).parent().html(val);
});

$(document).on('click', '.btn-update-db', function() {
  let DBtable = $(this).siblings('table').attr('id');
  let trs = $(this).siblings('table').find('tr');
  let updateData = [];
  let url = "/analyzeResponse/";
  if( DBtable=="category" ) {
    url += "setCategory";
    for( let i=1; i<trs.length; i++ ) {
      let tds = trs.eq(i).find('td');
      updateData.push({
        ID: tds.eq(0).text(),
        category_name: tds.eq(1).text()
      });
    }
  }
  else if( DBtable=="group" ) {
    url += "setGroup";
    for( let i=1; i<trs.length; i++ ) {
      let tds = trs.eq(i).find('td');
      updateData.push({
        ID: tds.eq(0).text(),
        group_name: tds.eq(1).text()
      });
    }
  }
  console.log(updateData);

  $.ajax({
    url: url,
    type: "POST",
    dateType: 'html',
    data: {
      data: JSON.stringify(updateData)
    },

    success: function(data) {
      console.log("POST "+url+" SUCCESS");
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
  afterDraw: function(chartInstance) {
    if (chartInstance.config.options.showDatapoints) {
      var helpers = Chart.helpers;
      var ctx = chartInstance.chart.ctx;
      var fontColor = helpers.getValueOrDefault(chartInstance.config.options.showDatapoints.fontColor, chartInstance.config.options.defaultFontColor);

      // render the value of the chart above the bar
      ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily);
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
