var fs = require('fs'),
    xml2js = require('xml2js');
	

// Types
var Dictionary = function(name, engname, key, reverseTitle, directTitle, items) {

	this.name = name; 
	this.engname = engname;
	this.key = key; 
	this.reverseTitle = reverseTitle; 
	this.directTitle = directTitle;
	
	this.items = items; 
};

var Item = function(type, leftCol, rightCol) {
	this.type = type;
	this.leftCol = leftCol;
	this.rightCol = rightCol;
};



var dictionaries = [];

// def, run, random, run_all, random_all
var MODE = "def";

// if varible == undefined then empty string
function iss(v, r) {
    
   if(typeof r === 'undefined') r = '';
   
   return (typeof v === 'undefined')?r:v; 
}

function input(callback) {

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', function (c) {
        process.stdin.pause();

        callback(c.toString().trim());            
    });
} // end fun

// Functions
function getHelpText() {
	var text = "============== Команды =============\n\r \n\r";
	text += "help - справка\n\r";
	text += "run %номер_словаря% - запустить тест по конкретному словарю (пример - run 3) \n\r";
    text += "get %номер_словаря% %номер слова(фразы)% - прочитать конкретное слова(фразу) по номеру словаря \n    и номеру слова(фразы) в словаре (пример - get 3 5) \n\r";
	text += "dict - показать список словарей\n\r";
	text += "exit - выход из программы\n\r \n\r";
	text += "====================================\n\r";
	
	return text;
} // end fun

function getDict() {
    
    var text = "\n--- Список словарей ---\n";
    
    for(var i in dictionaries) {
        text += i+" \t "+dictionaries[i].name + ' (' + dictionaries[i].engname + ')\n';
    } // end for
	
	return text;
    
} // end fun

function get_item(ndict, nw) {
    
    var text = "";
	
	if(typeof dictionaries[ndict] !== 'undefined' && 
	   typeof dictionaries[ndict]['items'] !== 'undefined' && 
	   typeof dictionaries[ndict]['items'][nw] !== 'undefined' ) {
           var item = dictionaries[ndict]['items'][nw];
           
           var dlen = dictionaries[ndict]['items'].length;
          
               var question = "", bot_answer ="";
           
           
           		console.log('\n\rВопрос №'+(parseInt(nw)+1));
                
                var typeArr = item.type.split(' '), itemType = item.type;
                
                // random type selection
                if(!!typeArr[0] && !!typeArr[1] && ((typeArr[0].trim() === 'reverse' && typeArr[1].trim() === 'direct') || (typeArr[1].trim() === 'reverse' && typeArr[0].trim() === 'direct') )) {
                    itemType = typeArr[Math.floor(Math.random()*(typeArr.length))].trim();
                } // end if
                
                if(itemType == "reverse") {
                    question = '"'+item.rightCol[0] + '"';
                    bot_answer =  item.leftCol[0];
                    
                    console.log(dictionaries[ndict].directTitle);
                } else {
                    question = '"'+ item.leftCol[0].trim() + '"';
                    bot_answer = item.rightCol[0].trim();
                    
                    console.log(dictionaries[ndict].reverseTitle);
                } // end if
                
                console.log(question);
                
                input(function(answer) {
                    
                    if(answer  === bot_answer) {
                        
                        if(MODE === "def") {
                            console.log("Ответ верен.");
                            
                        } else if(MODE === "run") {
                            nw++;
                            if(nw < dlen) {
                                get_item(ndict, nw);
                            } else {
                                console.log("Словарь пройден!");
                                MODE = "def";
                                app();
                            } // end if
                            
                        } // end if
                        
                    } else {
                        
                        if(MODE === "def") {
                            console.log("Ответ не верен!");
                        } else if(MODE === "run") {

                             var inp_err = function(ans) {
                                 
                                if(ans == bot_answer) {
                                        nw++;
                                        if(nw < dlen) {
                                            get_item(ndict, nw);
                                        } else {
                                            console.log("Словарь пройден!");
                                            MODE = "def";
                                            app();
                                        } // end if
                                } else {
                                    console.log("Ответ  не верен! Ответьте на вопрос повторно.");
                                    get_item(ndict, nw);
                                }
                            };
                            
                            console.log("Ответ  не верен!");
                            console.log("Правильный ответ: "+ bot_answer);
                            console.log("Введите правильный ответ для продолжения.");                       
                             
                            input(inp_err);
                            
                        } // end if
                        
                    } //end  
                    
                });
          
	} // end if 


    
} // end fun

function execComand(comand) {
	
	var comandArr = comand.split(' '); 

	switch (comandArr[0]) {
    
      case "help":
        console.log(getHelpText());
        app();
        break;
        
      case "dict":
        console.log(getDict());
        app();
        break;
        
      case "get":
	    if(!!comandArr[1] && !!comandArr[1]){
           get_item(comandArr[1].trim(), 0);
		} else {
		   console.log("Ошибка: введите номер словаря и номер слова!");
		} // end if
        break;
		
      case "run":
	    if(!!comandArr[1]){
           MODE = "run";
           get_item(comandArr[1].trim(), 0);
		} else {
		   console.log("Ошибка: введите номер словаря!");
		} // end if
        break;

      default:
        console.log('Неизвестная команда: ' + comand)
    }
	
	
} // end fun


// Application
function app() {
		
		console.log ('\n\rВведите команду:');
        
        input(function(comand) {
            
			if(comand !== 'exit') {
				execComand(comand + "");
			} else {
				process.exit(1);
			} // end if
            
        });

} // end fun


// Parser
var parser = new xml2js.Parser();
fs.readFile(__dirname + '/data/words.xml', function(err, data) {
	
    parser.parseString(data, function (err, result) {
		if(!!result.database && !!result.database.dictionary) {
			var dict = result.database.dictionary;
			for(var i in dict) {
				
				var items = [];
                
               
				
				if(!!dict[i].item) {
                    
						var dictItems = dict[i].item;
					
						for(var n in dictItems) {
							
	                        var itype = 'direct';
							
							if(!!dictItems[n]["$"] && !!dictItems[n]["$"]["type"]) itype = dictItems[n]["$"]["type"];
							
							items.push(new Item(itype, dictItems[n]["leftcol"], dictItems[n]["rightcol"]));
						} // end for
				
				} // end if
				
				if(!!dict[i] && !!dict[i]["$"]) {
					dictionaries.push(new Dictionary(
						iss(dict[i]["$"].name, "[без названия]"), 
						iss(dict[i]["$"].engname, "[untitled]"), 
						iss(dict[i]["$"].key), 
						iss(dict[i]["$"]["reverse-title"]), 
						iss(dict[i]["$"]["direct-title"]),
						items
					));
				} // end if
                
                console.log("253:");
                 console.log(dictionaries);

			} // end for
			
			console.log("*** EngW - Программа для запоминания английских слов и фраз ***");
				
		    console.log(getHelpText());
				
		    // start app
		    app();
			
		} //end if
    });
});