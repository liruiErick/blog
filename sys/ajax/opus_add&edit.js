/**
 * @author bh-lay
 * 
 */
/*
demo
	$.post('/ajax/addArticle',{
		'title':'我是剧中人4',
		'content':'12457898765',
	});
 * 
 */

var querystring=require('querystring');
var mongo = require('../conf/mongo_connect');
var session= require('../lib/session');
var response = require('../lib/response');

function add(parm,res){
	var parm = parm;
	mongo.start(function(method){
		
		method.open({'collection_name':'opus'},function(err,collection){
			collection.find({}, {}).toArray(function(err, docs) {
				parm.id=Date.parse(new Date()).toString(16);
	
				collection.insert(parm,function(err,result){
					if(err) throw err;
					response.json(res,{
						'code' : 1,
						'id' : parm.id ,
						'msg' : 'sucess'
					});
					
					method.close();
				});
			});
		});
	});
}
function edit(parm,res){
	var parm = parm;
	mongo.start(function(method){
		
		method.open({'collection_name':'opus'},function(error,collection){
			collection.update({'id':parm.id}, {$set:parm}, function(err,docs) {
				if(err) {
					response.json(res,{
						'code' : 2,
						'msg' : 'fail'
					});        
				}else {
					response.json(res,{
						'code' : 1,
						'msg' : 'sucess'
					});
	//		        res.end(docs[0]['title']);
				}
				method.close();
			});
		});
	});
}

exports.render = function (req,res){
	if (req.method != 'POST'){
		response.json(res,{
			'code' : 2,
			'msg' : 'please use [post] instead [get] to submit'
		});

		return ;
	}
	
	var info='';
	req.addListener('data', function(chunk){
		info += chunk; 
	}).addListener('end', function(){
		var data = querystring.parse(info);
		var parm={
			'id' : data['id']||'',
			'title':decodeURI(data['title']),
			'cover':data['cover']||'',
			'opus_pic':data['opus_pic']||'',
			'opus_time_create':data['opus_time_create']||Date.parse(new Date()),
			'tags':data['tags']||'',
			'content':data['content'],
			'intro':data['intro']||data['content'].slice(0,200),
		};
		if(parm['title']&&parm['content']){
			var session_this = session.start(req,res);
			
			if(parm['id']&&parm['id'].length>2){
				if(session_this.power(9)){
					edit(parm,res)
				}else{
					response.json(res,{
						'code':2,
						'msg':'no power to edit opus !'
					});
				}
			}else{
				if(session_this.power(8)){
					add(parm,res);
				}else{
					response.json(res,{
						'code':2,
						'msg':'no power to add opus !'
					});
				}
			}
		}else{
			response.json(res,{
				'code':2,
				'msg':'please insert complete code !'
			});
		}
	});
}