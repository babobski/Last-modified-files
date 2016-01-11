/**
 * Namespaces
 */
if (typeof(extensions) === 'undefined') extensions = {};
if (typeof(extensions.lastModifiedFiles) === 'undefined') extensions.lastModifiedFiles = {
	version: '1.0'
};

(function() {
	var self = this,
		prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService).getBranch("extensions.lastModifiedFiles."),
		notify = require("notify/notify"),
		$ = require("ko/dom"); 
		
	if (!('lastModifiedFiles' in ko)) ko.extensions = {}; 
	var myExt = "lastModifiedFiles@babobski.com" ; 
	if (!(myExt in ko.extensions)) ko.extensions[myExt] = {};
	if (!('myapp' in ko.extensions[myExt])) ko.extensions[myExt].myapp = {};
	var lastModifiedFilesData = ko.extensions[myExt].myapp; 
	
	window.removeEventListener('file_saved', self._StoreModified, false); 
	
	this._StoreModified = function(){
		var d = ko.views.manager.currentView.document || ko.views.manager.currentView.koDoc,
		file = d.file,
		path = (file) ? file.URI : null,  
		lastModifiedFiles = lastModifiedFilesData.files;
		var currentdate = new Date();
		var minutes = currentdate.getMinutes().toString().length === 1 ? '0' + currentdate.getMinutes() : currentdate.getMinutes();
		var hours = currentdate.getHours().toString().length === 1 ? '0' + currentdate.getHours() : currentdate.getHours();
		var datetime = "Saved at: " + hours + ":"  
		                + minutes + " - " + currentdate.getDate() + "/"
		                + (currentdate.getMonth()+1)  + "/" 
		                + currentdate.getFullYear(); 
		
		if (!file || !path) {
			return;   
		}
		
		var fileName = file.baseName;
		
		if (lastModifiedFiles === undefined) {
			lastModifiedFiles = {}; 
		}
		 
		var maxPath = path.length > 110 ? path.substr(0, 110) + '...' : path;
		
		var currentProject = ko.projects.manager.currentProject;
		var projectName = currentProject === null ? '' : currentProject.name.replace('.komodoproject', '');
		
		lastModifiedFiles[path] = ({date: datetime, file: fileName, project: projectName, path: maxPath});
		
		lastModifiedFilesData.files = lastModifiedFiles; 
	}
	
	this._clearModifiedFilesList = function(){
		lastModifiedFilesData.files = false;
	}
	
	this.showModifiedFiles = function(){ 
		var features = "chrome,titlebar,toolbar,centerscreen"; 
		window.openDialog('chrome://lastModifiedFiles/content/lastModifiedFiles.xul', "modifiedFiles", features, self);
	}
	
	this.clearModifiedFiles = function(){
		lastModifiedFilesData.files = {};
	}
	
	this.getModifiedFiles = function(){
		return lastModifiedFilesData.files !== undefined ? lastModifiedFilesData.files : false;
	}
	
	this._in_array = function (search, array) { 
		for (i = 0; i < array.length; i++) {
			if(array[i] ==search ) { 
				return true;
			}
		} 
		return false;
	}

	window.addEventListener('file_saved', self._StoreModified, false);
	
	
}).apply(extensions.lastModifiedFiles);
