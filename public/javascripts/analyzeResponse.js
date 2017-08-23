$(document).on('ready', function(){
  console.log("response ready");
});

function getChart( str ) {
  $.ajax({
    url: "/analyzeResponse",
    type: "POST",
    dateType: 'html',
    data: {
       chart: str
     },
    success: function(data) {
      console.log(data);
      // $(document).html(data);
      $("#content").empty();
      if( str=="詳細資料" ) drawChart_4(data);
      else console.log("success error 2");
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

function drawChart_4(data) {
  $('#content').append('<table id="table"></table>');
  $('#table').append('<tr><th>序號</th>><th>評分者UID</th><th>評分時間</th><th>滿意度</th><th>評分項目</th><th>被評分人員</th><th>團名</th></tr>');
  data.map(function(ele) {
    console.log(ele);
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

// function
