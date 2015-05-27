var pictureSource;   // picture source
var destinationType; // sets the format of returned value

// Wait for device API libraries to load
//
document.addEventListener("deviceready",onDeviceReady,false);

// device APIs are available
//
function onDeviceReady() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
    // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);

}

function capturePhoto() {
    console.log("Camera");
    alert("got");
    // window.location.href = "data_1.html";
  // Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
    //destinationType: destinationType.DATA_URL
}

function onPhotoDataSuccess(imageData) {
  alert("onPhotoDataSuccess");
  window.resolveLocalFileSystemURI(imageData, resolveOnSuccess, resOnError);
}

function resolveOnSuccess(entry){
    alert("resolveOnSuccess");
    var d = new Date();
    var n = d.getTime();
    //new file name
    var newFileName = n + ".jpg";
    var myFolderApp = "Hoverxlabs";

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) { 
        fileSystem.root.getDirectory( myFolderApp,{create:true, exclusive: false},
                    function(directory) {
                        entry.moveTo(directory, newFileName,  successMove, resOnError);
                    },
                    resOnError);
                    },
    resOnError);
}

function successMove(entry) {
    alert("successmove");
    // like to store it in database
    // sessionStorage.setItem('imagepath', entry.fullPath);
}

function resOnError(error) {
    alert(error.code);
}

function onFail(message) {
    alert(message);
}

function onFileSystemSuccess(fileSystem) {
    var directoryEntry = fileSystem.root;
    // Retrieve an existing directory, or create it if it does not already exist
    directoryEntry.getDirectory("Hoverxlabs", {create: true, exclusive: false}, success, fail);

}

function success(dirEntry) {
    alert("Directory Name: " + dirEntry.name);
}

function fail(error) {
    alert("Unable to create new directory: " + error.code);
}

// Initialize collapse button
 $('.button-collapse').sideNav({
    menuWidth: 260, // Default is 240
    edge: 'left', // Choose the horizontal origin
    closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
  }
);


// location service
var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
};

function initCoords() {
      if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                    currentLat = position.coords.latitude;
                    currentLong = position.coords.longitude;
                    currentAccu = position.coords.accuracy;
            }, error, options);
            
      } else {
        showError("Your browser does not support Geolocation!");
      }
}


$(document).ready(function(){

    // $("#cameraOpen").click(function(){
    //     capturePhoto();
    // });
    
    // var currentuserid = readCookie("userid");
    // var currentprojectid = readCookie("projectid");

    //-----------------------------------------------
    //-------------------- HOME ---------------------
    //-----------------------------------------------
    if(pageType == "home") {

        var projectlists = '';
        // get projects lists when home loads
        $.post("http://hoverxlabs.com/lands/collectorv2_bk/project_lists.php", {userid:currentuserid}, function(data){
            if(data != 0) {
                projectlists = JSON.parse(data);
                // console.log(projectlists);
                var i;
                for (i = 0; i < projectlists.length; ++i) {
                    $("#projectlists").append("<li><a href='#' data-projectid='" + projectlists[i]["id"] + "' class='projectids'> " + projectlists[i]["title"] +"</a></li>");
                }
            } else {
                $("#projectlists").html("Error loading project lists.");
            }
        });
        
        // if no project id selected
        if(!readCookie("projectid")) {

            $('.button-collapse').sideNav('show');
            $("#home-container").html("<h4>Please select a project from the menu.</h4>");
            $(".fixed-action-btn").hide();
        
        // if projectid selected
        } else {

            $.post("http://hoverxlabs.com/lands/collectorv2_bk/collection_lists.php", {projectid:currentprojectid}, function(data){
                if(data != 0) {
                    var collectionlists = JSON.parse(data);
                    var i;
                    // get project title
                    var projTitle;
                    $.each( projectlists, function( key, value ) {
                      if(projectlists[key].id == currentprojectid){
                            projTitle = projectlists[key].title;            
                        }
                    });

                    $("#currentprojectname").html("<h4>" + projTitle + "</h4>");
                    for (i = 0; i < collectionlists.length; ++i) {
                        $("#collectionlists").append("<li class='collection-item'>" + collectionlists[i]["title"] + "</li>");
                    }

                } else {
                    $("#projectlists").html("Error loading collection data.");
                }

            });
        }

        // set project cookie
        $('body').on('click', '.projectids', function (){
            var selectedprojectid = $(this).data("projectid");
            createCookie("projectid",selectedprojectid,30);
            window.location="home.html";
        });

    }

    //-----------------------------------------------
    //-------------------- data1 ---------------------
    //-----------------------------------------------
    if(pageType == "data1") {

        if (navigator.geolocation) {

            var currentLat, currentLong, currentAccu;

            navigator.geolocation.getCurrentPosition(function(position) {
                currentLat = position.coords.latitude;
                currentLong = position.coords.longitude;
                currentAccu = position.coords.accuracy;

                // do what ever you want with the current location
                $("#lat").html(currentLat);
                $("#long").html(currentLong);
                $("#accuracy-m").html(currentAccu);
                if(currentAccu > 15) { $("#warning").html("Low GPS Accuracy"); }

                $("#addnewsubmit").click(function(e){
                    e.preventDefault();
                    // sending location and form data to local storage, validation needs to be done // robo anil, please do this
                    values = {};
                    $.each($('#addnewform').serializeArray(), function(i, field) {
                        values[field.name] = field.value;
                    });
                    data = [];
                    data.push(values);
                    localStorage.setItem("hoverxlabs", JSON.stringify(data));

                    window.location.href = "data_2.html";
                });
                
            }, error, options);

        } else {
            showError("Your browser does not support Geolocation!");
        }
    }

    //-----------------------------------------------
    //-------------------- data2 (TRAIL)---------------------
    //-----------------------------------------------
    if(pageType == "data2") {

        var nopoints = 0;
        var moveLocLat = 0.0, moveLocLong = 0.0, moveLocAccu = 0;
        var trailArray = [];
        var recordLiveLoc;

        var localUserStore = localStorage['hoverxlabs'];
        localUserStore = JSON.parse(localUserStore);

        $("#start-recording").click(function() {
        $("#startRecordingWrapper").slideUp();
        $("#recodingProgress").slideDown();

        recordLiveLoc = window.setInterval(function(){
            // Try HTML5 geolocation
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {

                    moveLocLat = position.coords.latitude;
                    moveLocLong = position.coords.longitude;
                    moveLocAccu = position.coords.accuracy;

                }, function() {
                    handleNoGeolocation(true);
                });
            } else {
            // Browser doesn't support Geolocation
            handleNoGeolocation(false);
            }
            // update UI
            $("#latRecord").html(moveLocLat);
            $("#longRecord").html(moveLocLong);
            $("#accuracyRecord").html(moveLocAccu);
            $("#noofpointsRecord").html(nopoints);

            var trailArrayPoint =  moveLocLat + ',' + moveLocLong + ',' + moveLocAccu + ',' + Date.now();
            trailArray[nopoints] = trailArrayPoint;
            localUserStore[localUserStore.length-1].trial = trailArray;
            localStorage.setItem("hoverxlabs", JSON.stringify(localUserStore));
            nopoints++;
            }, 2500);
        });

        $("#finish-recording").click(function(){
            clearInterval(recordLiveLoc);            
            $(this).html("Please wait...").addClass("disabled");
            // add trail data to local storage Mr Robo Anil
            window.location.href = "data_3.html";
        });
    }

     //-----------------------------------------------
    //-------------------- data3 ---------------------
    //-----------------------------------------------
    if(pageType == "data3") {
        $('select').material_select();

        jQuery.validator.setDefaults({
            debug: true,
            success: "valid"
        });

        $('#userClientForm').validate({
            rules: {
                road: {
                    required: true
                }
            }
        });

        $("#finalsubmit").submit(function(){
            console.log("form");
        });

    }

});

