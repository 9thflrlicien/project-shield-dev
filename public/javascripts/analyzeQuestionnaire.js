$(document).ready( function() {
  $(document).on('click', '.get-chart', function() {
    window.frames["analyzeFrame"].getChart( $(this).attr('id') );
  });
});
