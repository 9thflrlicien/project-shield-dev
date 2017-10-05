var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Chatshier' });
});

router.get('/calendar', function(req, res, next) {
  res.render('calendar', { title: 'Chatshier行事曆' });
});

router.get('/chat', function(req, res, next) {
  res.render('chat', { title: 'Chatshier聊天室' });
});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'Chatshier分析表' });
});

router.get('/ticket', function(req, res, next) {
  res.render('ticket', { title: 'Chatshier待辦事項' });
});

router.get('/tform', function(req, res, next) {
  res.render('ticketForm', { title: 'Chatshier表單' });
});

router.get('/setting', function(req, res, next) {
  res.render('setting', { title: '設定' });
});

// 訊息
router.get('/message_autoreply', function(req, res, next) {
  res.render('message_autoreply', { title: 'keywords_reply' });
});

router.get('/message_overview', function(req, res, next) {
  res.render('message_overview', { title: 'message_overview' });
});

router.get('/message_keywordsreply', function(req, res, next) {
  res.render('message_keywordsreply', { title: 'message_keywordsreplya' });
});

router.get('/message_addFriendReply', function(req, res, next) {
  res.render('message_addFriendReply', { title: 'Chatshier訊息後台' });
});

//authentication
router.get('/login', function(req, res, next) {
  res.render('login', { title: '登入' });
});
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: '註冊' });
});


router.get('/analyzeQuestionnaire', function(req, res, next) {
  let con = require('./mysql');

  con.query("SELECT * FROM questionnaire.group", function(err, result, fields) {
    let group = result;
    con.query("SELECT * FROM questionnaire.category", function(err, result, fields) {
      let category = result;
      res.render('analyzeQuestionnaire', {
        title: 'SHIELD Analyze Questionnaire',
        group: group,
        category: category
      });
    })
  });

});

// // router.get('/nozbelist', function(req, res, next) {
// //   var querystring = require('querystring');
// //   var http = require('http');
// //
// //   var apikey = "b74bf7bcc84597a8053c1d4cdb5d1f7a";
// //   var option = {
// //     host: 'api.nozbe.com',
// //     port: 3000,
// //     method: 'POST',
// //     path: '/oauth/secret/data?email=9thflr.chukuangkai@gmail.com&password=shield123&redirect_uri=www.google.com'
// //   };
// //
// //   var proxyRequest = http.request( option, function(proxyResponse) {
// //     let body = "";
// //     proxyResponse.setEncoding('utf8');
// //     proxyResponse.on('data', function (chunk) {
// //       console.log('chunk: ', chunk);
// //       body += chunk;
// //     });
// //     proxyResponse.on('end', function() {
// //       console.log("end");
// //       console.log("body:");
// //     // console.log(proxyResponse.headers);
// //     // console.log(proxyResponse.rawHeaders);
// //     console.log(proxyResponse.statusCode);
// //     // console.log(proxyResponse.client);
// //     // console.log(proxyResponse.req);
// //
// //       // console.log(proxyResponse);
// //       // console.log("body: ", body);
// //     });
// //   });
// //
// //   let obj = {
// //     apikey : apikey
// //     // username: "shield9thflr",
// //     // password: "shield123"
// //   };
// //   proxyRequest.write("", 'utf8', function() {
// //     console.log("callback!, arguments.length = "+arguments.length);
// //   });
// //   proxyRequest.end();
// //
// //   res.render('tag', {
// //     title:"YOYO"
// //   });
// // });
//
// router.get('/milklist', function(req, res, next ) {
//   var qs = require('querystring');
//   var http = require('http');
//   var md5 = require('md5');
//
//   var apisecret = "407f205047a930c5";
//   var token_read = "72295c4a751278737c59daf845b9a24c4b6e8361";
//
//   function getPathQuery(apisecret, paramObj) {
//     let keys = Object.keys(paramObj);
//     keys.sort();
//
//     let api_sig = ""+apisecret;
//     let path = "";
//     for ( let i=0; i < keys.length; i++) {
//       let prop = keys[i];
//       let val = paramObj[prop];
//       api_sig += prop+val;
//       path += prop+"="+val+"&";
//     }
//     path += "api_sig="+md5(api_sig);
//
//     console.log("api_sig = "+api_sig );
//     console.log("path = "+path);
//     return path;
//   }
//
//   function getPath( apisecret, paramObj, pathHead ) {
//     if( !pathHead ) pathHead = '/services/rest/?';
//     let pathQuery = getPathQuery(apisecret, paramObj).replace(/ /g,"%20");
//     return pathHead+pathQuery;
//   }
//   // var option = getTokenRead();
//   function getTokenRead() {
//     let param = {
//       method: "rtm.auth.getToken",
//       api_key: "9d0435311894306161bf1234a4b6e17e",
//       frob: "1b2941b9969273d5f8c172c01b7c044823cb4702",
//       format: "json"
//     }
//     return {
//       host: 'api.rememberthemilk.com',
//       method: 'GET',
//       path: getPath(apisecret, param)
//     };
//   }
//
//   var option = getList();
//   function getList() {
//     let param = {
//       method: "rtm.tasks.getList",
//       api_key: "9d0435311894306161bf1234a4b6e17e",
//       auth_token: token_read,
//       format: "json",
//       filter: "status:incomplete AND due:never OR due:today"
//     }
//
//     return {
//       host: 'api.rememberthemilk.com',
//       method: 'GET',
//       path: getPath(apisecret, param)
//     };
//   }
//
//   var proxyRequest = http.request( option, function(proxyResponse) {
//     let body = "";
//     proxyResponse.setEncoding('utf8');
//     proxyResponse.on('data', function (chunk) {
//       body += chunk;
//     });
//     proxyResponse.on('end', function() {
//       console.log("end, statusCode="+proxyResponse.statusCode);
//       body = JSON.parse(body);
//       console.log("body:");
//       console.log(body.rsp.tasks);
//     });
//   });
//
//   proxyRequest.write("", 'utf8', function() {
//     console.log("callback!, arguments.length = "+arguments.length);
//   });
//   proxyRequest.end();
//
//   res.render('tag', {
//     title:"YOYO"
//   });
// });
//
// // router.get('/dorislist', function(req, res, next) {
// //   var querystring = require('querystring');
// //   var http = require('http');
// //
// //   var apikey = "b74bf7bcc84597a8053c1d4cdb5d1f7a";
// //   var option = {
// //     host: 'beta.dorisapp.com',
// //     method: 'GET',
// //     path: '/api/1_0/tasks/view_all.xml?apikey=b74bf7bcc84597a8053c1d4cdb5d1f7a'
// //   };
// //
// //   var proxyRequest = http.request( option, function(proxyResponse) {
// //     let body = "";
// //     proxyResponse.setEncoding('utf8');
// //     proxyResponse.on('data', function (chunk) {
// //       console.log('chunk: ', chunk);
// //       body += chunk;
// //     });
// //     proxyResponse.on('end', function() {
// //       console.log("end");
// //       console.log("body:");
// //     // console.log(proxyResponse.headers);
// //     // console.log(proxyResponse.rawHeaders);
// //     console.log(proxyResponse.statusCode);
// //     // console.log(proxyResponse.client);
// //     // console.log(proxyResponse.req);
// //
// //       // console.log(proxyResponse);
// //       // console.log("body: ", body);
// //     });
// //   });
// //
// //   let obj = {
// //     apikey : apikey
// //     // username: "shield9thflr",
// //     // password: "shield123"
// //   };
// //   proxyRequest.write("", 'utf8', function() {
// //     console.log("callback!, arguments.length = "+arguments.length);
// //   });
// //   proxyRequest.end();
// //
// //   res.render('tag', {
// //     title:"YOYO"
// //   });
// // });
//
// // router.get('/wunderlist', function(req, res, next) {
// //   // console.log("req.body");
// //   console.log(req.query);
// //   let returnCode = req.query.code;
// //   if( !returnCode ) returnCode = "-1";
// //   // // console.log(res);
// //   // console.log(next);
// //   res.render('wunderlist', {
// //     title: "wunderlist",
// //     returnCode: returnCode
// //   });
// // });
// //
// // router.get('/callback', function(req, res, next) {
// //   console.log("get callback");
// //   console.log("query:");
// //   console.log(req.query);
// //
// //   let code = req.query.code;
// //   console.log("code: ", code);
// //   // let request = require('request');
// //   // let obj = {
// //   //   url: "https://todoist.com/oauth/access_token",
// //   //   method: 'POST',
// //   //   client_id: 'c029cb4cee934cc9b2334354a90e6572',
// //   //   client_secret: '009acc8e6fe049c1bc6a67f8046c3ddf',
// //   //   code: code
// //   // };
// //   // request(obj, function (error, response, body) {
// //   //   console.log('error:', error); // Print the error if one occurred
// //   //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
// //   //   console.log('body:', body); // Print the HTML for the Google homepage.
// //   // });
// //
// //
// //   var http = require('http');
// //   var body = '';
// //   var proxyRequest = http.request(
// //     {
// //       host: 'todoist.com',
// //       port: 80,
// //       method: 'POST',
// //       path: '/oauth/access_token',
// //       headers: {
// //         'Content-Type': 'application/x-www-form-urlencoded',
// //         'Content-Length': 9999999
// //       }
// //     },
// //     function (proxyResponse) {
// //       console.log('res: ',proxyResponse);
// //       console.log('STATUS: ',proxyResponse.statusCode);
// //       console.log('ERROR: ',proxyResponse.error);
// //       console.log('HEADERS: ', JSON.stringify(proxyResponse.headers));
// //       proxyResponse.setEncoding('utf8');
// //       proxyResponse.on('data', function (chunk) {
// //         console.log('chunk: ', chunk);
// //         body += chunk;
// //       });
// //       proxyResponse.on('end', function() {
// //         console.log("end");
// //         console.log("body: ", body);
// //       });
// //     }
// //   );
// //   let obj = {
// //     client_id: 'c029cb4cee934cc9b2334354a90e6572',
// //     client_secret: '009acc8e6fe049c1bc6a67f8046c3ddf',
// //     code: code,
// //     redirect_uri: 'https://de0750ff.ngrok.io/callback'
// //   };
// //   // proxyRequest.write(JSON.stringify(obj));
// //
// //
// //
// //   // proxyRequest.end();
// //
// //   // var request = require('request');
// //   //
// //   // var remote = request('https://todoist.com/oauth/access_token');
// //   // let obj = {
// //   //   client_id: 'c029cb4cee934cc9b2334354a90e6572',
// //   //   client_secret: '009acc8e6fe049c1bc6a67f8046c3ddf',
// //   //   code: code
// //   // };
// //   // remote.pipe(obj);
// //
// //   res.render('wunderlist', {
// //     title: "wunderlist",
// //     returnCode: code
// //   })
// // })
// //
// // router.post('/callback', function(req, res, next ) {
// //   console.log("post callback");
// //   console.log("req:");
// //   console.log(req.query);
// //   console.log("res:");
// //   console.log(res.sessions);
// //   console.log("post callback");
// //
// // });
// //
// // router.get('/todolist', function(req, res, next) {
// //   res.render('wunderlist', {
// //     title: "wunderlist",
// //     returnCode: "fuck"
// //   });
// // });
module.exports = router;
