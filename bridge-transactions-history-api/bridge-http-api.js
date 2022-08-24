#!/usr/bin/env nodejs
const http = require('http');
const querystring = require('querystring');
const mysql = require('mysql');
const util = require('util');
var Web3 = require('web3');

var DB_CONFIG = {
		host: "localhost",
		user: "root",
		password: "",
		database: "test",
		connectTimeout: 100000,
		port: 3306
};

/*===========================================================
//=================  REQUEST AND RESPONSE  ==================
//===========================================================

API Endpoint URL:  http://localhost:8081?user=userWallet

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
			
		var infuraURL = 'https://2Dnc0OuWUcXJVzXZe0R1c2oSlq4:0a89c54da715834ac477205c9b18f218@eth2-beacon-mainnet.infura.io';
		//web3.utils.isAddress('0xc1912fee45d61c87cc5ea59dae31190fffff232d'); returns true or false
		var web3 = new Web3(new Web3.providers.HttpProvider(infuraURL));

		if((typeof qs.user !== 'undefined') && (myAccountAddress.length == 42) && (myAccountAddress !== undefined) && (web3.utils.isAddress(myAccountAddress))){
			
			//sanitize input value by removing all the special characters.
			myAccountAddress = myAccountAddress.replace(/[^a-zA-Z0-9]/g, '');
			
			
			console.log(myAccountAddress);
			
			var con5 = mysql.createConnection(DB_CONFIG);
			const query5 = util.promisify(con5.query).bind(con5);	
			try{
					var _mywherecondition = "  userWallet='"+myAccountAddress+"' ORDER BY id DESC  limit 25";
					var select_wallet_query = "SELECT * FROM bridge_transactions WHERE "+_mywherecondition;	
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

}).listen(8081);
