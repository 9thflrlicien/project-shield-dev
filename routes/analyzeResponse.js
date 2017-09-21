var express = require('express');
var router = express.Router();

var con = require('./mysql');   //取得mysql config

router.get('/', function(req, res, next) {
  res.render('analyzeResponse', {
    title: 'Analyze Response'
  });
});

router.post('/getChart', function(req, res, next) {
  //前端傳送POST請求，取得問卷分析圖表
  let chart = req.body.chart;
  console.log("get post! chart = "+chart);
  if( chart=="某團對各工人評價" ) {
    let group_id = req.body.option;
    //取得所有該團的worker的ID及NAME
    let sql = "SELECT questionnaire.group_worker.worker_id, questionnaire.worker.worker_name"
      + " FROM questionnaire.group_worker, questionnaire.worker"
      + " WHERE questionnaire.group_worker.group_id = ? and questionnaire.group_worker.worker_id = questionnaire.worker.ID"
      + " ORDER BY questionnaire.group_worker.worker_id";
    con.query(sql, group_id, function(err, result, fields) {
      let length = result.length;
      let names = [];
      let scores = [];
      for( let i in result ) {
        names.push(result[i].worker_name);    //將worker名字push進names
        let sql = "SELECT vote_score FROM questionnaire.vote WHERE group_id = ? and worker_id = ?";
        con.query( sql, [ group_id, result[i].worker_id ], function(err, result, fields) {
          //從DB取得所有該團旅客投給該worker的分數
          let sum = 0;
          for( let i in result ) sum += result[i].vote_score;
          scores.push( sum/result.length );   //平均過後push進scores
        });
      }

      let timer = setInterval( function() {
        //因con.query是異步處理，需等待for迴圈真的跑完，再將respone送回前端
        if( scores.length == length ) clearInterval(timer); //確認for跑完後，停止此timer
        else return;    //若還沒跑完，則先不送資料回前端
        console.log(names);
        console.log(scores);
        res.send({
          names: names,
          scores: scores
        });
      }, 10 );
    });
  }

  else if( chart=="某項目各工人評價" ) {
    let category_id = req.body.option;
    //取得該項目的所有工人
    let sql = 'SELECT worker_name, score FROM questionnaire.worker WHERE category_id = ?';
    con.query( sql, category_id, function(err, result, fields) {
      console.log(result);
      let worker_name = [];
      let score = [];
      for( let i in result ) {
        //將所有工人的name及score，push進兩陣列裡
        worker_name.push( result[i].worker_name );
        score.push( result[i].score );
      }
      res.send({
        worker_name: worker_name,
        score: score
      });
      console.log("sent");
    });

  }
  else if( chart=="某團對各項目評價" ) {
    let group_id = req.body.option;
    //取得所有項目
    con.query( "SELECT * FROM questionnaire.category", function(err, result, fields) {
      let length = result.length;
      let category_names = [];
      let scores = [];
      for( let i in result ) {
        category_names.push( result[i].category_name );
        //取得所有投給該項目的分數
        let sql = "SELECT vote_score FROM questionnaire.vote WHERE group_id = ? and category_id = ?";
        con.query( sql, [ group_id, result[i].ID ], function(err, result, fields) {
          let sum = 0;
          for( let i in result ) sum += result[i].vote_score;
          scores.push( sum/result.length ); //計算完後，push進scores裡
        });
      }

      let timer = setInterval( function() {        //因con.query是異步處理，需等待for迴圈真的跑完，再將respone送回前端
        if( scores.length == length ) clearInterval(timer); //確認for跑完後，停止此timer
        else return;    //若還沒跑完，則先不送資料回前端
        console.log(category_names);
        console.log(scores);
        res.send({
          category_names: category_names,
          scores: scores
        });
      }, 10 );
    });
  }
  else {
    console.log("chart = "+chart+", not found!");
  }
});

router.post('/getData', function(req, res, next) {
  //前端傳送POST request，取得資料庫的DATA
  let type = req.body.type;
  console.log("get data! type = "+type);
  if( type=="details" ) {
    sql = "SELECT questionnaire.vote.*, questionnaire.category.category_name"
      + ", questionnaire.worker.worker_name, questionnaire.group.group_name "
      + " FROM questionnaire.category, questionnaire.worker, questionnaire.group, questionnaire.vote "
      + " WHERE questionnaire.vote.category_id = questionnaire.category.ID "
      + " and questionnaire.vote.worker_id = questionnaire.worker.ID "
      + " and questionnaire.vote.group_id = questionnaire.group.ID";
    //取得所有vote資料，並搜尋其他table以將id轉為string
    con.query(sql, function(err, result, fields) {
      if( err ) {
        console.log("ERROR when SELECT * FROM questionnaire.vote");
        console.log(err);
      }
      else {
        for( let i in result ) {
          //這裡選擇抓到名稱後就不顯示id
          delete result[i].category_id;
          delete result[i].worker_id;
          delete result[i].group_id;
        }
        res.send(result);   //將所有vote資料送至前端
      }
    });
  }
  else if( type=="category" ) {
    con.query("SELECT * FROM questionnaire.category", function(err, result, fields) {
      if( err ) console.log(err);
      else res.send(result);
    });
  }
  else if( type=="group" ) {
    con.query("SELECT worker_name FROM questionnaire.worker", function(err, result, fields ){
      //前端要可幫GROUP加入新工人，因此需取得所有工人的名字
      let data = {
        worker: result.map( function(ele) { return ele.worker_name; } )
      };
      con.query("SELECT * FROM questionnaire.group", function(err, result, fields) {
        //取得所有旅行團的資料
        if( err ) console.log(err);
        data.group = [];
        let length = result.length;
        let count = 0;
        result.map( function(ele) {
          //對每個旅行團，都去group_worker尋找有參加該團的工人
          let sql = "SELECT questionnaire.worker.worker_name FROM questionnaire.worker, questionnaire.group_worker"
            + " where questionnaire.group_worker.group_id = ? and questionnaire.group_worker.worker_id = questionnaire.worker.ID"
            + " ORDER BY questionnaire.group_worker.worker_id";
          con.query(sql, ele.ID, function(err, result, fields) {
            if( err ) console.log(err);
            else {
              data.group.push({
                ID: ele.ID,     //group.ID
                group_name: ele.group_name,   //group.group_name
                workers: result     //group_worker.worker_name
              });
              count++;
            }
          });
        });
        let timer = setInterval( function() {
          //異步問題，需確認每個旅行團的資料都push進去了，才送出資料至前端
          if( count==length ) clearInterval(timer);
          else return;
          res.send(data);
        }, 10 );
      });
    });
  }
  else if( type=="worker" ) {
    let sql = "SELECT questionnaire.worker.ID, questionnaire.worker.worker_name, questionnaire.worker.category_id"
      + ", questionnaire.worker.vote_count, questionnaire.worker.score FROM questionnaire.worker";
    con.query(sql, function(err, result, fields) {
      if( err ) console.log(err);
      else {
        let workerData = result;
        con.query("SELECT * from questionnaire.category", function(err, result, fields) {
          res.send({
            worker: workerData,
            category: result
          });
        });
      }
    });
  }
  else {
    console.log("type = "+type+", not found!");
  }
});

router.post('/setCategory', function(req, res, next) {
  let updateData = JSON.parse(req.body.data); //需先parse成JSON才可使用
  console.log(updateData);
  updateData.map( function(data) {
    let ID = data.ID;
    let category_name = data.category_name;
    console.log(ID+", "+category_name);
    if( ID && category_name ) {
      console.log("UPDATE");
      let sql = "UPDATE questionnaire.category SET category_name = ? WHERE ID = ? ";
      con.query( sql, [ category_name, ID ], function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( ID && !category_name ) {
      console.log("DELETE");
      let sql = "DELETE FROM questionnaire.category WHERE ID = ? ";
      con.query( sql, ID, function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( !ID && category_name ) {
      console.log("INSERT");
      let sql = "INSERT INTO questionnaire.category SET ? ";
      con.query( sql, { category_name: category_name }, function(err, rows) {
        if(err) console.log(err);
      });
    }
  });
  res.send("SUCCESS");
});

router.post('/setGroup', function(req, res, next) {
  let updateData = JSON.parse(req.body.data);
  updateData.group.map( function(data) {
    let ID = data.ID;
    let group_name = data.group_name;
    console.log(ID+", "+group_name);
    if( ID && group_name ) {
      console.log("UPDATE");
      let sql = "UPDATE questionnaire.group SET group_name = ? WHERE ID = ? ";
      con.query( sql, [ group_name, ID ], function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( ID && !group_name ) {
      console.log("DELETE");
      let sql = "DELETE FROM questionnaire.group WHERE ID = ? ";
      con.query( sql, ID, function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( !ID && group_name ) {
      console.log("INSERT");
      let sql = "INSERT INTO questionnaire.group SET ? ";
      con.query( sql, { group_name: group_name }, function(err, rows) {
        if(err) console.log(err);
      });
    }
  });

  con.query("TRUNCATE questionnaire.group_worker", function(err, rows) {
    if(err) console.log(err);
  });
  updateData.group_worker.map( function(ele) {
    con.query("SELECT ID FROM questionnaire.worker WHERE worker_name = ?", ele.worker_name, function(err, result, fields) {
      let id = result[0].ID;
      let data = {
        group_id: ele.group_id,
        worker_id: id
      };
      con.query("INSERT INTO questionnaire.group_worker SET ? ", data , function(err, rows) {
        if(err) console.log(err);
      });
    });
  });
  res.send("SUCCESS");
});

router.post('/setWorker', function(req, res, next) {
  let updateData = JSON.parse(req.body.data);
  console.log(updateData);
  updateData.map( function(data) {
    console.log("now data: ");
    console.log(data);
    let ID = data.ID;
    let worker_name = data.worker_name;
    let category_id = data.category_id;
    if( ID && worker_name ) {
      console.log("UPDATE");
      let sql = "UPDATE questionnaire.worker SET worker_name = ?, category_id = ? WHERE ID = ? ";
      con.query( sql, [ worker_name, category_id, ID ], function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( ID && !worker_name ) {
      console.log("DELETE");
      let sql = "DELETE FROM questionnaire.worker WHERE ID = ? ";
      con.query( sql, ID, function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( !ID && worker_name ) {
      console.log("INSERT");
      let sql = "INSERT INTO questionnaire.worker SET ? ";
      con.query( sql, { worker_name: worker_name, category_id: category_id }, function(err, rows) {
        if(err) console.log(err);
      });
    }
  });
  res.send("SUCCESS");
});

//更新WORKER的評價資料



function package(arr, prop) {
  console.log("prop = "+prop);
  let return_data = [];
  while( arr.length>0 ) {
    let now_prop = arr[0][prop];
    let data = [];
    while( arr.length>0 ) {
      if( arr[0][prop] == now_prop ) {
        if( arguments.length==2 ) data.push( arr[0] );
        else {
          let obj = {};
          for( let i=2; i<arguments.length; i++ ) {
            let to_get = arguments[i];
            obj[to_get] = arr[0][to_get];
          }
          data.push( obj );
        }
        arr.splice(0,1);                       //並把此VOTE移出待處理的陣列
      }
      else break;                     //如果不在同個WORKER_ID，就先跳出迴圈
    }
    let obj = {};
    obj[prop] = now_prop;
    obj["data"] = data;
    return_data.push(obj);
  }
  // console.log(return_data);
  return return_data;
}

module.exports = router;
