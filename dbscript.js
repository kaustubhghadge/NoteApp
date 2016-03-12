
(function($){

	//console.log('js loaded....');
	
	window_height = $(window).height();
	window_width=$(window).width();
	$('#addlist').css('height',window_height);
	$(document).ready(function(){

  $(function() {
	  	$(function() {
    $( "#about" ).dialog({
      autoOpen: false,	
      modal: true,
      buttons : {
        OK: function() {
          $( this ).dialog( "close" );
        }
      }
    	});
  	});
    
 
    $( "#aboutMe" ).click(function() {
      $( "#about" ).dialog( "open" );
    });
  });

	 $("#addNoteButton").click(function(){
	 	$('#detailOutput').css("visibility","hidden");
		$("#noteform").slideToggle("slow")
		
	});	
	 $('input').bind('keypress', function (event) {
    var regex = new RegExp("^[a-zA-Z0-9\b\\s]+$");
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
       event.preventDefault();
       return false;
    }
    });


	});
	

	var db;


	var openRequest = indexedDB.open("wordlist",1);
	openRequest.onupgradeneeded = function(e) {
		console.log("Upgrading DB...");
		var thisDB = e.target.result;
		if(!thisDB.objectStoreNames.contains("wordliststore")) {
			thisDB.createObjectStore("wordliststore", { autoIncrement : true });
		}
	}
	openRequest.onsuccess = function(e) {
		console.log("Open Success!");
		db = e.target.result;
		document.getElementById('add-btn').addEventListener('click', function(){
			

			var text = document.getElementById('name-in').value;
			var text1 = document.getElementById('subject-in').value;
			var text2 = document.getElementById('message-in').value;
			if (!text.trim()||!text1.trim()||!text2.trim()) {
        		//alert("Enter all fields");

        	} else {
        		addWord(text,text1,text2);
        		$("#noteform").slideToggle("slow")
        	}
        });

        document.getElementById('cncl-btn').addEventListener('click',function(){
        		$("#noteform").slideToggle("slow")

        })

        document.getElementById('reset-btn').addEventListener('click',function(){
        	document.getElementById('name-in').value="";
        	document.getElementById('name-in').focus();
        	document.getElementById('subject-in').value="";
        	document.getElementById('message-in').value="";


        })
        renderList();
	}
	openRequest.onerror = function(e) {
		console.log("Open Error!");
		console.dir(e);
	}

	




	function addWord(t,t1,t2) {
		console.log('adding ' + t+t1+t2);
		var transaction = db.transaction(["wordliststore"],"readwrite");
		var store = transaction.objectStore("wordliststore");
		var request = store.add({text: t,text1:t1,text2:t2,text3:Date.now()

		});
		
		request.onerror = function(e) {
			console.log("Error",e.target.error.name);
	        //some type of error handler
	    }
	    request.onsuccess = function(e) {
	    	console.log("added " + t+t1+t2);
	    	renderList();
	    	document.getElementById('name-in').value = '';
	    	document.getElementById('subject-in').value = '';
	    	document.getElementById('message-in').value = '';
	    }
	}

	function renderList(){
		$('.list-wrapper').empty();

		

		//Count Objects
		var transaction = db.transaction(['wordliststore'], 'readonly');
		var store = transaction.objectStore('wordliststore');
		var countRequest = store.count();

		countRequest.onsuccess = function(){ 
			//alert(countRequest.result);
			$('.list-wrapper').html('<h2 class="divHeaders">List View</h2><h2>No of notes:&nbsp' + countRequest.result + '</h2><table class="table table-striped"><tr><th><h4>Timestamp</h4></th><th><h4>Subject</h4></th><th><h4>Char Count</h4></th></tr></table>');

		};
		
		


		

		// Get all Objects
		var objectStore = db.transaction("wordliststore").objectStore("wordliststore");
		objectStore.openCursor().onsuccess = function(event) {

			var cursor = event.target.result;
			if (cursor) {
				var $link = $('<a href="#" data-key="' + cursor.key + '">' + cursor.value.text1 + '</a>');
				$link.click(function(){
					
					 if ($("#noteform").is(":hidden")) {
					     // do this
					     $('#detailOutput').css("visibility","visble");
					  } else {
					     // do that
					     $("#noteform").slideToggle("fast")
					}
					//alert('Clicked ' + $(this).attr('data-key'));
					
					loadTextByKey(parseInt($(this).attr('data-key')));
					$('#detailOutput').css("visibility","visble");
						


				});

				var $char = cursor.value.text2.replace(/\s+/g, '');
                var $charCount = $char.length;
				var date=new Date(cursor.value.text3);
				var month=date.getMonth()+1;
				var $row = $('<tr>');
				var $keyCell = $('<td>' +month+"/"+date.getDate()+"/"+date.getFullYear()+' '+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+ '</td>');
				var $textCell = $('<td><span></span></td>').append($link);
				var $textcount=$('<td><span></span></td>').append($charCount);
				
			
				$row.append($keyCell);
				$row.append($textCell);
				$row.append($textcount);

				$('.list-wrapper table').append($row);
				$("th").css("padding", "5px").css("word-wrap","break-word");
				$("td").css("padding", "6px").css("word-wrap","break-word");


				//document.getElementById("list-wrapper").innerHTML = "no. of nodes ";
				cursor.continue();
			}
			else {
			    //no more entries
			}
		};
	}

	function loadTextByKey(key){
		$('#detailOutput').css("visibility","visible");
		var transaction = db.transaction(['wordliststore'], 'readonly');
		var store = transaction.objectStore('wordliststore');
		var request = store.get(key);
		
		request.onerror = function(event) {
		  // Handle errors!
		};
		request.onsuccess = function(event) {
		  // Do something with the request.result!
		  $('.detail').html('<h2 class="divHeaders">Detail View</h2><h3>' + "Name:&nbsp; "+request.result.text + '</h3>').append('<h3>' +"Subject:&nbsp; "+ request.result.text1 + '</h3>').append('<h3>' +"Message:&nbsp"+ request.result.text2 + '</h3><br>');
		  
		  var $delBtn = $('<button class="buttonStyles buttonPos">Delete</button>');


		  var $cloBtn=$('<button class="buttonStyles buttonPos">Close</button>');
		  $delBtn.click(function(){
		  	console.log('Delete ' + key);
		  	$('.detail').slideUp(600,function(){

		  		deleteWord(key);

		  	} )
		  	
		  });
		   $cloBtn.click(function(){


		   	$('.detail').slideUp(600);

		  })

		  if($('.detail').css('display','none')){

		  $('.detail').append($delBtn).append($cloBtn).slideToggle('slow');
          //document.getElementById("detail").className = "result-container";
          }
          else{
          		$('.detail').append($cloBtn);
          	$('.detail').append($delBtn);
          
          }
		  
		 
		  
		  
		};
	}

	function deleteWord(key) {
		var transaction = db.transaction(['wordliststore'], 'readwrite');
		var store = transaction.objectStore('wordliststore');
		var request = store.delete(key);
		request.onsuccess = function(evt){
			renderList();
			$('#detail').empty();
		};
	}






})(jQuery);