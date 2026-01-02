var Scratch = Scratch || {};

Scratch.Project = Scratch.Project || {};

Scratch.Project.FlashEmbed = function() {
};

Scratch.Project.FlashEmbed.prototype.init = function(model) {
  this.ASobj = swfobject.getObjectById('scratch');
  this.model = model;
  this.params = getUrlParams();
};

Scratch.Project.FlashEmbed.prototype.loadSwf = function() {
  this.ASobj.ASsetEmbedMode(true);
  if (parseInt(this.params.auto_start)) {
    this.ASobj.ASloadProject(this.model.creator, this.model.id, this.model.title, false, true);
  } else {
    this.ASobj.ASloadProject(this.model.creator, this.model.id, this.model.title, false, false);
  }
};

Scratch.init = function() {
  Scratch.FlashApp = new Scratch.Project.FlashEmbed();
  Scratch.FlashApp.init(Scratch.INIT_DATA.PROJECT.model);
}

function JSeditorReady() {
  Scratch.FlashApp.loadSwf();
}

var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    Scratch.init();
    clearInterval(readyStateCheckInterval);
  }
}, 10);

function getUrlParams() {
  var params = {};
   window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
     params[key] = value;
   });
  return params;
}

function JSsetClassInParent(id, className) {
  window.parent.postMessage({id: id, className: className}, "http://poof.hksr.us/");
}
