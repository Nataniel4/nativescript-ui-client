/*jshint esversion: 6 */
var NSElectron = require('electron').remote;
var NSApplication = NSElectron.app;
var NSFileSystem = require('fs');
var NSDialogs = NSElectron.dialog;
var NSExec = require('child_process').exec;

if(NSFileSystem.existsSync(NSApplication.getPath('userData') + '/settings.json') === false){
  NSFileSystem.writeFileSync(NSApplication.getPath('userData') + '/settings.json','{"showTerminalDialog":true,"forceClose":false,"closeTerminal":false}');
}
NSApplication.settings = NSFileSystem.readFileSync(NSApplication.getPath('userData') + '/settings.json');
NSApplication.settings = JSON.parse(NSApplication.settings);
NSApplication.saveSettings = function(){
  var settingsToSave = JSON.stringify(NSApplication.settings);
  NSFileSystem.writeFileSync(NSApplication.getPath('userData') + '/settings.json', settingsToSave);
};

NSApplication.ui = {};
NSApplication.ui.loading = {};
NSApplication.ui.loading.show = function(){
  document.getElementsByClassName('ui-loading')[0].style.display = 'block';
  setTimeout(function(){
    document.getElementsByClassName('ui-window')[0].style.filter = 'blur(10px)';
    document.getElementsByClassName('ui-loading')[0].style.opacity = '1';
    NSApplication.settings.forceClose = true;
    NSApplication.saveSettings();
    NSApplication.focus();
  },250);
};
NSApplication.ui.loading.hide = function(){
  document.getElementsByClassName('ui-loading')[0].style.opacity = '0';
  setTimeout(function(){
    document.getElementsByClassName('ui-window')[0].style.filter = 'none';
    document.getElementsByClassName('ui-loading')[0].style.display = 'none';
    NSApplication.settings.forceClose = false;
    NSApplication.saveSettings();
    NSApplication.focus();
  },250);
};
NSApplication.ui.load = function(object,html){
  if(object && html){
    if(NSFileSystem.existsSync(html) === true){
      if(object){
        object.innerHTML = NSFileSystem.readFileSync(html);
      }else{
        console.log('[NSApplication.ui.loadView] Target object "'+object+'" is undefined.');
      }
    }else{
      console.log('[NSApplication.ui.loadView] Unable to load "'+html+'".');
    }
  }
};
NSApplication.ui.loadRaw = function(html){
  if(html){
    if(NSFileSystem.existsSync(html) === true){
      return NSFileSystem.readFileSync(html);
    }else{
      console.log('[NSApplication.ui.loadView] Unable to load "'+html+'".');
    }
  }
};
NSApplication.ui.loadFrame = function(object,html){
  if(object && html){
    if(NSFileSystem.existsSync(html) === true){
      if(object){
        object.innerHTML = '<iframe src="'+html+'" style="border:none;width:100%;height:100%;"></iframe>';
      }else{
        console.log('[NSApplication.ui.loadView] Target object "'+object+'" is undefined.');
      }
    }else{
      console.log('[NSApplication.ui.loadView] Unable to load "'+html+'".');
    }
  }
};
NSApplication.ui.bannerColor = function(color){
  if(color){
    document.getElementsByClassName('ui-banner')[0].style.backgroundColor = color;
  }
};

NSApplication.ui.backToMenu = function(){
  NSApplication.ui.bannerColor('#1600f8');
  NSApplication.ui.load(document.getElementsByClassName('ui-content')[0],NSApplication.getAppPath()+'/Resources/ViewController.nib/view-mainMenu.html');
};

var NativeScript = {};
NativeScript.run = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7){
  var closeTerminal = '';
  if(NSApplication.settings.closeTerminal === true){
    closeTerminal = ';killall Terminal';
  }
  if(!arg1){
    arg1 = '';
  }
  if(!arg2){
    arg2 = '';
  }
  if(!arg3){
    arg3 = '';
  }
  if(!arg4){
    arg4 = '';
  }
  if(!arg5){
    arg5 = '';
  }
  if(!arg6){
    arg6 = '';
  }
  if(!arg7){
    arg7 = '';
  }
  NSExec('echo "'+NSApplication.getAppPath()+'/MacOS/NativeScript '+arg1+' '+arg2+' '+arg3+' '+arg4+' '+arg5+' '+arg6+' '+arg7+'' + closeTerminal + '" > '+NSApplication.getAppPath()+'/MacOS/tmp.sh ; chmod +x '+NSApplication.getAppPath()+'/MacOS/tmp.sh ; open -a Terminal '+NSApplication.getAppPath()+'/MacOS/tmp.sh');
};

window.onload = function(){
  if(NSFileSystem.existsSync(NSApplication.getAppPath()+'/MacOS/tmp.sh') === true){
    NSExec('rm ' + NSApplication.getAppPath()+'/MacOS/tmp.sh');
  }
  if(NSApplication.settings.forceClose === true){
    NSDialogs.showMessageBox({
      type: 'warning',
      message: 'The application was closed unexpectedly.\n\n If you have problems with the app, please contact developer.'
    });
    NSApplication.settings.forceClose = false;
    NSApplication.saveSettings();
  }
  if(NSApplication.settings.showTerminalDialog === true){
    var checkbox = null;
    NSDialogs.showMessageBox({
      type: 'info',
      message: 'The terminal is your friend!\n\nWhile this app adds an UI for {N}...\nThe terminal is necessary to use TNS CLI.\n\nThis is because Electron doesn\'t support advanced shell command execution.',
      checkboxLabel: 'I don\'t want to see this boring message again'
    }, function(response, checkboxChecked){
      checkbox = checkboxChecked;
    });
    var checkOut = setInterval(function(){
      if(checkbox === true){
        NSApplication.settings.showTerminalDialog = false;
        NSApplication.saveSettings();
        clearInterval(checkOut);
      }else if(checkbox === false){
        NSApplication.settings.showTerminalDialog = true;
        NSApplication.saveSettings();
        clearInterval(checkOut);
      }
    },1000);
  }
  NSApplication.ui.load(document.getElementsByClassName('ui-content')[0],NSApplication.getAppPath()+'/Resources/ViewController.nib/view-mainMenu.html');
};

var NSNewProject = {};
NSNewProject.toogleCustomTemplate = function(){
  if(document.getElementById('template-mode').innerHTML != NSApplication.ui.loadRaw(NSApplication.getAppPath()+'/Resources/ViewController.nib/view-newProject-template-custom.html')){
    document.getElementById('template-mode').innerHTML = NSApplication.ui.loadRaw(NSApplication.getAppPath()+'/Resources/ViewController.nib/view-newProject-template-custom.html');
  }else{
    document.getElementById('template-mode').innerHTML = NSApplication.ui.loadRaw(NSApplication.getAppPath()+'/Resources/ViewController.nib/view-newProject-template-default.html');
  }
};
NSNewProject.validateProjName = function(){
  document.getElementById('projname').value = document.getElementById('projname').value.replace(/[\W_]/g, "");
};
NSNewProject.selectTemplate = function(){
  var template = NSDialogs.showOpenDialog({properties:['openDirectory']});
  if(template){
    if(NSFileSystem.existsSync(template + '/package.json') === false){
      alert('Your selected template not seems to be a tns template, please check your template folder.');
    }else{
      document.getElementById('template').value = template;
    }
  }
};
NSNewProject.createProject = function(){
  var projname = document.getElementById('projname').value;
  var template = document.getElementById('template').value;
  if(template && projname){
    var targetFolder = NSDialogs.showOpenDialog({
      properties: [
        'openDirectory'
      ],
      filters: [
        { name: 'NativeScript project', extensions: [''] }
      ]
    });
    if(targetFolder){
      NSApplication.ui.loading.show();
      NativeScript.run('create', '--path',targetFolder, projname,'--template',template);
      var checkOut = setInterval(function(){
        if(NSFileSystem.existsSync(NSApplication.getAppPath()+'/MacOS/tmp.sh') === true){
          //do nothing
        }else{
          if(NSFileSystem.existsSync(targetFolder + '/' + projname + '/package.json') === true){
            //NSExec('mv ' + targetFolder + '/' +projname + ' ' + targetFolder + '/' +projname + '.tnsproj');
            NSApplication.ui.loading.hide();
            //alert('The project "' + projname + '" was created successfully.');
            NSApplication.ui.backToMenu();
            clearInterval(checkOut);
          }else{
            NSApplication.ui.loading.hide();
            alert('An error occurred while creating project.');
            clearInterval(checkOut);
          }
        }
      },1000);
    }
  }else{
    alert('Please enter a name and select a template for new project.');
  }
};
var NSSettings = {};
NSSettings.refresh = function(){
  if(NSApplication.settings.closeTerminal === true){
    document.getElementById('closeTerminal').checked = true;
  }
};
var NSRunProject = {};
NSRunProject.selectProject = function() {
  var project = NSDialogs.showOpenDialog({properties:['openDirectory']});
  if(project){
    if(NSFileSystem.existsSync(project + '/package.json') === false){
      alert('Your selected project seems invalid, please check the project files.');
    }else{
      document.getElementById('project').value = project;
    }
  }
};
NSRunProject.runProject = function (){
  var runMode = '--justlaunch';
  var project = document.getElementById('project').value;
  if(project){
    if(document.getElementById('runMode').checked === true){
      runMode = '';
    }
    if(document.getElementById('runAsAndroid').checked === false && document.getElementById('runAsIos').checked === false){
      alert('Please select a platform where run your project.');
    }else{
      if(document.getElementById('runAsAndroid').checked === true){
        NativeScript.run('run','android','--path',project,runMode);
      }else if(document.getElementById('runAsIos').checked === true){
        NativeScript.run('run','ios','--path',project,runMode);
      }
      if(runMode !== ''){
        NSApplication.ui.loading.show();
        var checkOut = setInterval(function(){
          if(NSFileSystem.existsSync(NSApplication.getAppPath()+'/MacOS/tmp.sh') === true){
            //do nothing
          }else{
            NSApplication.ui.loading.hide();
            NSApplication.ui.backToMenu();
            clearInterval(checkOut);
          }
        },1000);
      }else{
        document.getElementsByClassName('ui-loading')[0].getElementsByTagName('div')[0].style.width = '100%';
        document.getElementsByClassName('ui-loading')[0].getElementsByTagName('div')[0].style.background = 'none';
        document.getElementsByClassName('ui-loading')[0].getElementsByTagName('div')[0].style.left = '0px';
        document.getElementsByClassName('ui-loading')[0].getElementsByTagName('div')[0].style.margin = '0px';
        document.getElementsByClassName('ui-loading')[0].getElementsByTagName('div')[0].style.padding = '0px';
        document.getElementsByClassName('ui-loading')[0].getElementsByTagName('div')[0].innerHTML = 'LiveSync Enabled<br><span style="font-size:16px;">When you finish using LiveSync mode, close device emulator and the terminal window, then restart this application.</span>';
        document.getElementsByClassName('ui-loading')[0].style.display = 'block';
        setTimeout(function(){
          document.getElementsByClassName('ui-window')[0].style.filter = 'blur(10px)';
          document.getElementsByClassName('ui-loading')[0].style.opacity = '1';
        },250);
      }
    }
  }else{
    alert('Please select a project to run.');
  }
};
var NSBuildProject = {};
NSBuildProject.selectProject = function() {
  var project = NSDialogs.showOpenDialog({properties:['openDirectory']});
  if(project){
    if(NSFileSystem.existsSync(project + '/package.json') === false){
      alert('Your selected project seems invalid, please check the project files.');
    }else{
      document.getElementById('project').value = project;
    }
  }
};
NSBuildProject.selectFolder = function() {
  var outputFolder = NSDialogs.showOpenDialog({properties:['openDirectory']});
  if(outputFolder){
    if(NSFileSystem.existsSync(outputFolder + '/package.json') === true){
      alert('Your selected folder seems to project folder, please select other folder.');
    }else{
      document.getElementById('outputFolder').value = outputFolder;
    }
  }
};
NSBuildProject.buildProject = function (){
  var project = document.getElementById('project').value;
  var outputFolder = document.getElementById('outputFolder').value;
  if(project && outputFolder){
    if(document.getElementById('buildForAndroid').checked === false && document.getElementById('buildForIos').checked === false){
      alert('Please select a platform for build your project.');
    }else{
      if(document.getElementById('buildForAndroid').checked === true){
        NativeScript.run('build','android','--path',project,'--copy-to',outputFolder);
      }else if(document.getElementById('buildForIos').checked === true){
        NativeScript.run('build','ios','--path',project,'--copy-to',outputFolder);
      }
      NSApplication.ui.loading.show();
      var checkOut = setInterval(function(){
        if(NSFileSystem.existsSync(NSApplication.getAppPath()+'/MacOS/tmp.sh') === true){
          //do nothing
        }else{
          NSApplication.ui.loading.hide();
          NSApplication.ui.backToMenu();
          clearInterval(checkOut);
        }
      },1000);
    }
  }else{
    if(project){
      alert('Please select an output folder to build the project.');
    }else{
      alert('Please select a project to build.');
    }
  }
};
