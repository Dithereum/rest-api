#!/usr/bin/env nodejs
const http = require('http');
const querystring = require('querystring');
const mysql = require('mysql');
const util = require('util');



var DB_CONFIG = {
		host: "localhost",
		user: "root",
		password: "",
		database: "dithereum",
		connectTimeout: 100000,
		port: 3306
};



/*===========================================================
//=================  REQUEST AND RESPONSE  ==================
//===========================================================

API Endpoint URL:  http://localhost:8080?user=userWallet





Response JSON Structure:

Success:  {"result":"success", "data":"{JSON_FOR_DATA}"}

Error:    {"result":"error", "data":"Error occured"}


*/



http.createServer(function (req, res) {


async function execute(){

	if (req.url != '/favicon.ico') {
        // Just in case we needed to call this from browser and browser calls this script twice due to favicon
        res.writeHead(200, {'Content-Type': 'text/html'});


		var qs = req.url.split('?');
		qs = querystring.parse(qs[1]);
		var myAccountAddress = qs.user;
		
		console.log(myAccountAddress);
			
		//input validations
		myAccountAddress = myAccountAddress.replace(/[^a-zA-Z0-9]/g, '');
		

		if(typeof qs.user !== 'undefined' && myAccountAddress.length == 42 ){
			
			
			console.log(myAccountAddress);
			
			var con5 = mysql.createConnection(DB_CONFIG);
			const query5 = util.promisify(con5.query).bind(con5);	
			try{
					var _mywherecondition = "  deployer_addr='"+myAccountAddress+"' ORDER BY id DESC  limit 25";
					var select_wallet_query = "SELECT * FROM transactions_data WHERE "+_mywherecondition;	
					var walletTxnData = await query5(select_wallet_query).catch(console.log);
						
					if(walletTxnData[0]){
						
						let array = {result:"success", data:walletTxnData};
						res.write(JSON.stringify(array));
						res.end();

					}else{							
						let array = {"result":"error", "data":"No records found"};
						res.write(JSON.stringify(array));
						res.end();													
					}		
			}catch(e){
					console.log("ERROR SQL>>Catch",e);
					let array = {"result":"error", "data":"Database error"};
					res.write(JSON.stringify(array));
					res.end();
						
			}finally{
					con5.end();		
					res.end();
			}
			
						
		}
		
		else{
			let array = {"result":"error", "data":"Invalid wallet"};
			res.write(JSON.stringify(array));
			res.end();		
		}
	}
}

execute();

}).listen(8080);

