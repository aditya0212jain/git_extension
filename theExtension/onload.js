chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if(request.method=="gitClone"){
      console.log("request of GitClone Received");
      gitCloneFunction();
    }
  });
var tyu= $('h1.public').find('span.author').find('a.url').html();
var repo = $('strong[itemprop="name"]').find('a').html();
var urlForCloning = "https://github.com/"+tyu+"/"+repo;

function gitCloneFunction(){
  var httpsUrl = document.getElementsByClassName('https-clone-options')[0];
  if(httpsUrl!=undefined||httpsUrl!=null){
    var inputGroup = httpsUrl.getElementsByClassName('input-group');
    var pol = $(inputGroup).children();
    console.log($(pol[0]).attr('value'));
    var url = $(pol[0]).attr('value');
    var repo = $('strong[itemprop="name"]').find('a').html();
    sendToServer({method:"gitClone",url:url,repo:repo});
    chrome.runtime.sendMessage({method:"sentForCloning",repo:repo},function(response){});
  }else{
    var tyu= $('h1.public').find('span.author').find('a.url').html();
    var repo = $('strong[itemprop="name"]').find('a').html();
    var urlForCloning;
    if(tyu==undefined||repo==undefined){
      urlForCloning = "undefined";
    }else{
      urlForCloning = "https://github.com/"+tyu+"/"+repo;
    }
    chrome.runtime.sendMessage({method:"notValidClonePage",url:urlForCloning}, function(response) {});
  }
}


window.onload = function () {onloadFunc();};
function onloadFunc () {
  var type = getPageType();
  var typeObject;
  if(type=="blob"){
    typeObject = getBlobObject();
    //console.log(typeObject);
    sendToServer(typeObject);
    preparePage(typeObject);
  }
  else if (type=="pull"){
    typeObject = getPullObject();
    var viewType = getPullViewType();
    //console.log(typeObject);
    if(viewType=='split'){
      sendToServer(typeObject);
      preparePage(typeObject);
      prepareExpanders(typeObject);
    }else{
      sendToServer(typeObject);
      preparePage(typeObject);
      prepareExpanders(typeObject);
    }
  }
}

function prepareExpanders(obj){
  var expanders = document.getElementsByClassName('diff-expander');
  for(i=0;i<expanders.length;i++){
    expanders[i].addEventListener("click",function(){
      //console.log("expander clicked");
      setTimeout(function(){addSpans(obj.method,obj.repo,[obj.branchBase,obj.branchHead]);console.log("Spans added now");prepareExpanders(obj);},600);
    });
  }
}

function getPageType(){
  var url = document.URL;
  var RegexPull = /(.)*(github)(.)*(pull)(.)*(files)(.)*/g;
  var RegexBlob = /(.)*(github)(.)*(blob)(.)*/g;
  if(RegexPull.test(url)==true){
    return "pull";
  }
  else if (RegexBlob.test(url)==true){
      return "blob";
  }
  else{
    return "notValid";
  }
}

function getBlobObject(){
  var blobpath = document.getElementById('blob-path');
  var path = blobpath.textContent.split('/');
  var repoName = path[0].replace(/\r?\n|\r|\s/g,"");
  path.splice(0,1);
  var final = path.join('/');
  final = final.replace(/\r?\n|\r|\s/g,"");
  var regex = new RegExp('(blob\/)((.)*)\/'+final);
  var match = regex.exec(document.URL);
  var branch = match[2];
  var obj = {method : "blob" ,
  repo : repoName,
  branch : branch }
  return obj;
}

function getPullObject(){
  var url = document.URL;
  url = url.split('/');
  var i = url.indexOf('pull');
  var repoName = url[i-1];
  var branchBase = document.getElementsByClassName('base-ref')[0];
  var branchHead = document.getElementsByClassName('head-ref')[0];
  var obj = { method : "pull" , repo : repoName , branchBase : branchBase.textContent , branchHead : branchHead.textContent};
  return obj;
}

function sendToServer(obj){
  var pReq = new XMLHttpRequest();
  pReq.addEventListener("load", reqListener);
  pReq.open("POST", "http://localhost:8080");
  pReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  console.log(obj);
  pReq.onerror = function() {
    if(obj.method=="query"||obj.method=="gitClone"){
      chrome.runtime.sendMessage({method:"serverNotRunning"},function(response){});
    }
  }
  pReq.send(JSON.stringify(obj));
  //console.log("sent to server");
}

function preparePage(obj){
  if(obj.method=="blob"){
    addSpans(obj.method,obj.repo,[obj.branch]);
  }else if (obj.method=="pull"){
    toggleSide();
    placeBtn(obj);
    addClick(obj);
    //addSpans(obj.method,obj.repo,[obj.branchBase,obj.branchHead]);
  }
}

function getPullViewType(){
  var diffbar = document.getElementsByClassName('diffbar')[0];
  var uview = $(diffbar).find( "input[value='unified']" );
  //console.log(uview);
  var sview = $(diffbar).find("input[value='split']");
  //console.log(sview);
  //console.log($(sview).attr('checked'));
  //console.log($(uview).attr('checked'));
  if($(sview).attr('checked')=='checked'){
    return 'split';
  }else{
    return 'unified';
  }
}
