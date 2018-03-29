
var app = {
  initialize: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    document.addEventListener('DOMContentLoaded', this.onDeviceReady);
  },

  onDeviceReady: function() {
    onBodyLoad();
  },
};

var db;
var shortName = 'RentzDB';
var version = '1.0';
var displayName = 'RentalzDB';
var maxSize = 3*1024*1024;

function errorHandler(transaction, error) {
  alert('Error: ' + error.message + ' code: ' + error.code);
}

function successCallBack() {
  alert("DEBUGGING: success");
}

function nullHandler() {}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function reloadPage() {
    window.onload = function() {
    if(!window.location.hash) {
        window.location = window.location + '#';
        window.location.reload();
    }
}
return;
}

function onBodyLoad() {
  if (!window.openDatabase) {
    alert('Databases are not supported in this browser.');
    return;
  }

  db = openDatabase(shortName, version, displayName,maxSize);

  db.transaction(function(tx){

  tx.executeSql('CREATE TABLE IF NOT EXISTS `rProperties`(`pID` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `property_type` TEXT NOT NULL, `number_rooms` INTEGER NOT NULL, `time_added` INTEGER NOT NULL, `rental_price` INTEGER NOT NULL, `furniture_type` TEXT, `property_notes`	TEXT, `post_author`	TEXT NOT NULL)',
    [], nullHandler, errorHandler);
    }, errorHandler, successCallBack);

}

function listProperties() {
if (!window.openDatabase) {
alert('Databases are not supported in this browser.');
return;
}
reloadPage();
$('#lbListProp #myTable').append('');
    
db.transaction(function(transaction) {
transaction.executeSql('SELECT * FROM `rProperties`;', [],
function(transaction, result) {
  if (result !== null && result.rows !== null) {
   
    for (var i = 0; i < result.rows.length; i++) {
      var row = result.rows.item(i);
      $('#lbListProp #myTable').append('<tr><tbody><td>' + row.property_type + '</td>' + '<td>' + row.number_rooms + '</td> ' + '<td>' + row.furniture_type + '</td> ' + '<td>' + row.rental_price + '</td>' + '<td>' + row.time_added + '</td>' + '<td>' + row.property_notes + '</td>' + '<td>' + row.post_author + '</td>'+ '<td>' + '<a href="#" onclick="deleteProperty(' + row.pID + ')">Delete</a></td></tbody></tr></table>');
    }
      
  }
}, errorHandler);
}, errorHandler, nullHandler);
return;
}

function addProperty() {
  if (!window.openDatabase) {
    alert('Databases are not supported in this browser.');
    return;
  }
    
  if (!ValidateInput()) {
      return false;
  } 

  db.transaction(function(transaction) {
    transaction.executeSql('INSERT INTO `rProperties`(`property_type`, `number_rooms`, `furniture_type`, `rental_price`, `time_added`, `property_notes`, `post_author`) VALUES (?,?,?,?,?,?,?)',[$('#selType').val(), $('#selRoom').val(), $('#selFurnish').val(), $('#intPrice').val(), $('#date').val(), $('#txtNotes').val(), $('#txtName').val()],
    nullHandler, errorHandler);
  });
  alert("Success, property has been added!");
  
  return true;
}

function ShowResults() {
    if (!window.openDatabase) {
        alert('Databases are not supported in this browser.');
        return;
    }
    
    $('#searchResults myTable2').remove('');
    
    var pType = $('#selType').val();
    var nRoom = $('#selRoom').val();
    var fType = $('#selFurnish').val();
    var rPrice = $('#selPrice').val();
    
    db.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM `rProperties` WHERE `property_type`=? AND `number_rooms`=? AND `furniture_type`=? AND `rental_price`<=?;", [pType, nRoom, fType, rPrice],
        function(transaction, result){;
          if (result !== null && result.rows !== null) {

            for (var i = 0; i < result.rows.length; i++) {
              var row = result.rows.item(i);
              $('#searchResults #myTable2').append('<tr><tbody><td>' + row.property_type + '</td>' + '<td>' + row.number_rooms + '</td> ' + '<td>' + row.furniture_type + '</td> ' + '<td>£' + row.rental_price + '</td>' + '<td>' + row.time_added + '</td>' + '<td>' + row.property_notes + '</td>' + '<td>' + row.post_author + '</td>'+ '<td>' + '<a href="viewProperty.html?pID=' + row.pID + '">View</a></td></tbody></tr></table>');
            }
          }
}, errorHandler);
}, errorHandler, nullHandler);
return;
}

function refreshPage() {
    jQuery.mobile.changePage(window.location.href, {
        allowSamePageTransition: true,
        transition: 'none',
        reloadPage: true
    });
}


function deleteProperty(id) {
    var c = window.confirm("Are you sure you want to delete this property?");
    if (c == true) {
        db.transaction(function (tx) {
            tx.executeSql('DELETE FROM `rProperties` WHERE `pID`=?;', [id], nullHandler, errorHandler);
        });
        
        window.location.reload();
    } else {
        return false;
    }
     
return;
}

function ValidateInput() {
    var strName = $('#txtName').val();
    var intRentPM = $('#intPrice').val();
    var dateValue = $('#date').val();
    
    if (!dateValue) {
        alert('Please enter a date');
        return false;
    }
    
    if (strName == "") {
        alert ('Please enter your name.');
        return false;
    }
    
    if (intRentPM == ""){
        alert ('Please enter your rent.');
        return false;
    }
    
    var rent = parseInt($('#intPrice').val(), 10);
    
    return true;
}



function getPropertyDetails() {    
    if (!window.openDatabase) {
        alert('Databases are not supported in this browser.');
        return;
    }
    var x = getUrlVars()["pID"];

    db.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM `rProperties` WHERE `pID`=?;", [x],
        function(transaction, result){;
            if (result !== null && result.rows !== null) {
            for (var i = 0; i < result.rows.length; i++) {
              var row = result.rows.item(i);
                $('#pDetails').append('<br />' + row.property_type + '<br />' + row.number_rooms + '<br />' + row.furniture_type + '<br /> £' + row.rental_price  + '<br />' + row.time_added + '<br />' + row.property_notes + '<br />' + row.post_author);
                }
            }
        }, errorHandler);
}, errorHandler, nullHandler);
return;
}

function savePropertyNote() {
    var pID = getUrlVars()["pID"];
    var pNote = $('#pNote').val();
    db.transaction(function(transaction) {
    transaction.executeSql('UPDATE `rProperties` SET `property_notes`= ? WHERE `pID` = ?',[pNote, pID],
    nullHandler, errorHandler);
  });
    $(location).attr('href', 'viewProperty.html?pID=' + pID);
    return;
}