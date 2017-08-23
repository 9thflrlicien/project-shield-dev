var express = require('express');
var router = express.Router();

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "192.168.0.135",
  path: "%",
  user: "newuser",
  password: "shield123"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Shield in MySQL Connected!");
});

//insert();
function insert() {
  let obj = {
    category_name : "餐廳"
  };
  con.query("INSERT INTO shield.category SET ?", obj, function(err, rows) {
    //放入新的category資料，其中ID欄位MYSQL會自己指定
    //有點像是C語言，有幾個"?"，後面就要多幾個參數，參數就是"?"代表的東西
    //但還是有點不同，若有很多個?，後面的參數要包成array，下面會再解釋

    console.log("INSERT OBJ = ");
    console.log(obj);
    if(err) {
      console.log("ERROR when INSERT INTO shield.category");
      throw err;
    }
    else console.log("SUCCESS when INSERT INTO shield.category");
  });
}

router.get('/', function(req, res, next) {
  res.render('analyzeResponse', {
    title: 'Analyze Response'
  });
});
router.post('/', function(req, res, next) {
  console.log("get post! chart = "+req.body.chart);
  let chart = req.body.chart;
  let sql = req.body.sql;
  if( chart=="某團各客戶對各工人評價" ) {


  }
  else if( chart=="所有旅行團對該職業工人評價" ) {


  }
  else if( chart=="旅行團對各項目評價" ) {


  }
  else if( chart=="詳細資料" ) {
    sql = "SELECT shield.vote.*, shield.category.category_name, shield.worker.worker_name, shield.group.group_name "
     +" FROM shield.category, shield.worker, shield.group, shield.vote "
     + " WHERE shield.vote.category_id = shield.category.ID "
     + " and shield.vote.worker_id = shield.worker.ID "
     + " and shield.vote.group_id = shield.group.ID";

    con.query(sql, function(err, result, fields) {
      if( err ) {
        console.log("ERROR when SELECT * FROM shield.vote");
        console.log(err);
      }
      else {
        for( let i in result ) {
          delete result[i].category_id;
          delete result[i].worker_id;
          delete result[i].group_id;
        }
        res.send(result);
      }
    });


  }
  else {
    console.log("chart = "+chart+", not found!");
  }
});


module.exports = router;
