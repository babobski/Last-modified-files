if (typeof(extensions) === 'undefined') extensions = {};
if (typeof(extensions.lastModifiedFiles) === 'undefined') extensions.lastModifiedFiles = {
	version: '1.0'
};

(function() {
	var self = this,
		prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService).getBranch("extensions.lastModifiedFiles."),
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
		var currentdate = new Date(),
			minutes = currentdate.getMinutes().toString().length === 1 ? '0' + currentdate.getMinutes() : currentdate.getMinutes(),
			hours = currentdate.getHours().toString().length === 1 ? '0' + currentdate.getHours() : currentdate.getHours(),
			day = currentdate.getDate().toString().length === 1 ? '0' + currentdate.getDate() : currentdate.getDate(),
			month = (currentdate.getMonth()+1).toString().length === 1 ? '0' + (currentdate.getMonth()+1) : (currentdate.getMonth()+1),
			dateFormat = prefs.getCharPref('date_format'),
			date = dateFormat === "d/m/Y" ? day + "/" + month  + "/" + currentdate.getFullYear() : month + "/" + day  + "/" + currentdate.getFullYear(),
			datetime = "Saved at: " + hours + ":" + minutes + " - " + date; 
		
		if (!file || !path) {
			return;  
		}
		
		var fileName = file.baseName; 
		
		if (lastModifiedFiles === undefined) {
			lastModifiedFiles = {}; 
		}
		 
		var maxPath = path.length > 100 ? path.substr(0, 100) + '...' : path,
			projectName = '';
		var currentProject = ko.projects.manager.currentProject;
		if (currentProject !== null) {
			var projectPref = currentProject.prefset,
			projectFileDir = 
			ko.interpolate.activeProjectPath().replace(/[\/\\][^\/\\]+$/, ''),
			liveImportDir = projectPref.hasStringPref('import_dirname') ? projectPref.getStringPref('import_dirname') : '',
			projectDir = liveImportDir ? (liveImportDir.match(/(\/\/|[a-zA-Z])/) ? liveImportDir : (projectFileDir + '/' + liveImportDir)) : projectFileDir;
			
			if (ko.uriparse.displayPath(path).indexOf(ko.uriparse.displayPath(projectDir)) !== -1) {  
				projectName = currentProject === null ? '' : currentProject.name.replace('.komodoproject', '');
			}
		}
		
			
		
		lastModifiedFiles[path] = ({date: datetime, file: fileName, project: projectName, path: maxPath, fullPath: path});
		
		lastModifiedFilesData.files = lastModifiedFiles;
	}
	
	this._getLink = function(e){
		var linkItem = e.target,
			link = linkItem.getAttribute('content');
		if (link.length > 0) {
			ko.open.URI(link); 
		}
	}
	
	this.openSettings = function(){
		var features = "chrome,titlebar,toolbar,centerscreen"; 
		window.openDialog('chrome://lastModifiedFiles/content/pref-overlay.xul', "modifiedFiles", features);
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
