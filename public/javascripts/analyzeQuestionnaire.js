console.log(group);
console.log(category);
$(document).ready( function() {
  loadBtns();


  $(document).on('click', '.get-chart', function() {
    let chart = $(this).parents('.rowBtn-container').attr('id');
    let option = $(this).attr('rel');
    window.frames["analyzeFrame"].getChart( chart, parseInt(option) );
  });
  $(document).on('click', '.get-data', function() {
    let type = $(this).attr('id');
    window.frames["analyzeFrame"].getData( type );
  });

  function loadBtns() {
    group.map( function(ele) {
      $('#某團對各工人評價 .colBtn-group').append('<button class="btn btn-default colBtn get-chart" rel="'
        + ele.ID + '">' + ele.group_name + '</button>'
      );
      $('#某團對各項目評價 .colBtn-group').append('<button class="btn btn-default colBtn get-chart" rel="'
        + ele.ID + '">' + ele.group_name + '</button>'
      );
    });
    category.map( function(ele) {
      $('#某項目各工人評價 .colBtn-group').append('<button class="btn btn-default colBtn get-chart" rel="'
        + ele.ID + '">' + ele.category_name + '</button>'
      );
    });
  }
});
