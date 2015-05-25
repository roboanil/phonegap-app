var pictureSource;   // picture source
var destinationType; // sets the format of returned value 

// Wait for PhoneGap to connect with the device
//
document.addEventListener("deviceready",onDeviceReady,false);

// PhoneGap is ready to be used!
//
function onDeviceReady() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {
  // Get image handle
  //
  var smallImage = document.getElementById('smallImage');

  // Unhide image elements
  //
  smallImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  smallImage.src = "data:image/jpeg;base64," + imageData;
}

// Called when a photo is successfully retrieved
//
function onPhotoFileSuccess(imageData) {
  // // Get image handle
  // console.log(JSON.stringify(imageData));
  
  // // Get image handle
  // //
  // var smallImage = document.getElementById('smallImage');

  // // Unhide image elements
  // //
  // smallImage.style.display = 'block';

  // // Show the captured photo
  // // The inline CSS rules are used to resize the image
  // //
  // smallImage.src = imageData;

  var URL = imageData;
  var Folder_Name = "hoverxlabs";
  var File_Name = "test.jpg";
  DownloadFile(URL, Folder_Name, File_Name)

 //  if(sessionStorage.isprofileimage==1){
	//     getLocation();
	// }
 //  movePic(imageData);


}

// Called when a photo is successfully retrieved
//
function onPhotoURISuccess(imageURI) {
  // Uncomment to view the image file URI 
  // console.log(imageURI);

  // Get image handle
  //
  var largeImage = document.getElementById('largeImage');

  // Unhide image elements
  //
  largeImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  largeImage.src = imageURI;
}

// A button will call this function
//
function capturePhotoWithData() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50 });
}

function capturePhotoWithFile() {
	sessionStorage.removeItem('imagepath');
    navigator.camera.getPicture(onPhotoFileSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
}

// A button will call this function
//
function getPhoto(source) {
  // Retrieve image file location from specified source
  navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50, 
    destinationType: destinationType.FILE_URI,
    sourceType: source });
}

// Called if something bad happens.
// 
function onFail(message) {
  alert('Failed because: ' + message);
}

//First step check parameters mismatch and checking network connection if available call    download function
function DownloadFile(URL, Folder_Name, File_Name) {
	//Parameters mismatch check
	if (URL == null && Folder_Name == null && File_Name == null) {
	    return;
	}
	else {
	    //checking Internet connection availablity
	    var networkState = navigator.connection.type;
	    if (networkState == Connection.NONE) {
	        return;
	    } else {
	        download(URL, Folder_Name, File_Name); //If available download function call
	    }
  	}
}

function download(URL, Folder_Name, File_Name) {
//step to request a file system 
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);

	function fileSystemSuccess(fileSystem) {
	    var download_link = encodeURI(URL);
	    ext = download_link.substr(download_link.lastIndexOf('.') + 1); //Get extension of URL

	    var directoryEntry = fileSystem.root; // to get root path of directory
	    directoryEntry.getDirectory(Folder_Name, { create: true, exclusive: false }, onDirectorySuccess, onDirectoryFail); // creating folder in sdcard
	    var rootdir = fileSystem.root;
	    var fp = rootdir.fullPath; // Returns Fulpath of local directory

	    fp = fp + "/" + Folder_Name + "/" + File_Name + "." + ext; // fullpath and name of the file which we want to give
	    // download function call
	    filetransfer(download_link, fp);
	}

	function onDirectorySuccess(parent) {
	    // Directory created successfuly
	}

	function onDirectoryFail(error) {
	    //Error while creating directory
	    alert("Unable to create new directory: " + error.code);
	}

	function fileSystemFail(evt) {
		//Unable to access file system
		alert(evt.target.error.code);
	}

}

function filetransfer(download_link, fp) {
	var fileTransfer = new FileTransfer();
	// File download function with URL and local path
	fileTransfer.download(download_link, fp, function (entry) {
        alert("download complete: " + entry.fullPath);
    }, function (error) {
			//Download abort errors or download failed errors
			alert("download error source " + error.source);
			//alert("download error target " + error.target);
			//alert("upload error code" + error.code);
		}
	);
}

function onFail(message) {
    alert('Failed because: ' + message);
}

function movePic(file){ 
    window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError); 
} 

//Callback function when the file system uri has been resolved
function resolveOnSuccess(entry){ 
    var d = new Date();
    var n = d.getTime();
    //new file name
    var newFileName = n + ".jpg";
    var myFolderApp = "MyAppFolder";

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
    //The folder is created if doesn't exist
    fileSys.root.getDirectory( myFolderApp,
                    {create:true, exclusive: false},
                    function(directory) {
                        entry.moveTo(directory, newFileName,  successMove, resOnError);
                    },
                    resOnError);
                    },
    resOnError);
}

//Callback function when the file has been moved successfully - inserting the complete path
function successMove(entry) {
    //Store imagepath in session for future use
    // like to store it in database
    sessionStorage.setItem('imagepath', entry.fullPath);
}

function resOnError(error) {
    alert(error.code);
}