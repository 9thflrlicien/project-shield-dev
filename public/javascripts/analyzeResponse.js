$(document).on('ready', function(){
  console.log("response ready");
});

function getChart( str, option ) {
  $.ajax({
    url: "/analyzeResponse",
    type: "POST",
    dateType: 'html',
    data: {
       chart: str,
       option: 4
     },
    success: function(data) {
      // console.log(data);
      // $(document).html(data);
      $("#content").empty();
      if( str=="某團各客戶對各工人評價" ) drawChart_1(data);
      else if( str=="所有旅行團對該職業工人評價" ) drawChart_2(data);
      else if( str=="詳細資料" ) drawChart_4(data);
      else if( str=="設定" ) drawChart_5(data);
      else {
        console.log("success error 2");
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log("ERRR");
      console.log("xhr:");
      console.log(xhr);
      console.log("ajaxOptions:");
      console.log(ajaxOptions);
      console.log("thrownError:");
      console.log(thrownError);
    }
  });
}

function drawChart_1(input) {
  console.log(input);
  let labels = input.group_with_workers.map(function(ele) {
    return ele.worker_name;
  });
  let users_votes = [];
  input.users_votes.map( function(ele) {
    let obj = {
      label: ele.vote_voter,
      data: ele.data.map( function(e) {
        return e.vote_score;
      }),
      backgroundColor: getRandomColor()
    };
    users_votes.push(obj);
  });

  // $('#content').css('width', 'auto').show().siblings().hide();
  $('#content').append('<canvas id="myChart"></canvas>');
  let ctx = $('#myChart').get(0).getContext('2d');
  var myChart = new Chart(ctx,
    {
      type: 'bar',
      data: {
          labels: labels,
          //group_worker order by worker_id
          datasets: users_votes
      },
      options: {
        scales: {
           yAxes: [{
             scaleLabel: {
               display: true,
               labelString: '評價分數'
             },
             ticks: {
               beginAtZero: true,
               stepSize: 1,
               min: 0,
               max: 5
             }
           }]
         }
      }
    }
  );

  $('#content').css('width', '').show().siblings().hide();
}

function drawChart_2(input) {
  console.log(input);

  $('#content').append('<canvas id="myChart"></canvas>');
  let ctx = $('#myChart').get(0).getContext('2d');
  var myChart = new Chart(ctx,
    {
      type: 'bar',
      data: {
          labels: input.worker_name,
          //group_worker order by worker_id
          datasets: [{
            label: "score~~~",
            data: input.score,
            backgroundColor: getRandomColor()
          }]
      },
      options: {
        scales: {
           yAxes: [{
             scaleLabel: {
               display: true,
               labelString: '評價分數'
             },
             ticks: {
               beginAtZero: true,
               stepSize: 1,
               min: 0,
               max: 5
             }
           }]
         },
      }
    }
  );

  $('#content').css('width', '').show().siblings().hide();
}

function drawChart_4(data) {
  $('#content').append('<table id="table"></table>');
  $('#table').append('<tr><th>序號</th>><th>評分者UID</th><th>評分時間</th><th>滿意度</th><th>評分項目</th><th>被評分人員</th><th>團名</th></tr>');
  data.map(function(ele) {
    // console.log(ele);
    $('#table').append('<tr><td>'+ele.ID+'</td>'
      + '<td>'+ele.vote_voter+'</td>'
      + '<td>'+ele.vote_time+'</td>'
      + '<td>'+ele.vote_score+'</td>'
      + '<td>'+ele.category_name+'</td>'
      + '<td>'+ele.worker_name+'</td>'
      + '<td>'+ele.group_name+'</td></tr>');
  });
  $('#content').css('width', 'auto').show().siblings().hide();
}

function drawChart_5(data) {
  $('#content').append('<table id="category"></table>');
  $('#category').append('<tr><th>序號</th>><th>項目名稱</th></tr>');
  data.category.map(function(ele) {
    // console.log(ele);
    $('#category').append('<tr><td>'+ele.ID+'</td>'
      + '<td>'+ele.category_name+'</td></tr>');
  });

  $('#content').append('<table id="worker"></table>');
  $('#worker').append('<tr><th>序號</th>><th>名稱</th><th>項目</th><th>評價次數</th></tr>');
  data.worker.map(function(ele) {
    let category_name = data.category.filter( function(cate) {
      return cate.ID ==  ele.category_id;
    })[0].category_name;

    $('#worker').append('<tr><td>'+ele.ID+'</td>'
      + '<td>'+ele.worker_name+'</td>'
      + '<td>'+category_name+'</td>'
      + '<td>'+ele.vote_count+'</td></tr>');
  });

  $('#content').append('<table id="group"></table>');
  $('#group').append('<tr><th>序號</th>><th>團體名稱</th><th>服務職稱</th></tr>');
  data.group.map(function(ele) {
    let group_worker = data.group_worker.filter( function(e) {
      return e.group_id == ele.ID;
    });
    group_worker = group_worker.map( function(e) {
      return data.worker.filter( function(worker) {
        return worker.ID == e.worker_id;
      })[0].worker_name;
    });
    let str = group_worker.join(',');

    $('#group').append('<tr><td>'+ele.ID+'</td>'
      + '<td>'+ele.group_name+'</td>'
      + '<td>'+str+'</td></tr>');
  });

  $('#content').css('width', 'auto').show().siblings().hide();
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
