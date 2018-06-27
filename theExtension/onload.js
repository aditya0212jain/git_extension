window.onload = function () {console.log("HAHAHAHA ONLOaD");onloadFunc();};

function onloadFunc () {
  var type = getPageType();
  var typeObject;
  if(type=="blob"){
    typeObject = getBlobObject();
    console.log(typeObject);
    sendToServer(typeObject);
    preparePage(typeObject);
  }
  else if (type=="pull"){
    typeObject = getPullObject();
    console.log(typeObject);
    sendToServer(typeObject);
    preparePage(typeObject);
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
  pReq.send(JSON.stringify(obj));
}

function preparePage(obj){
  if(obj.method=="blob"){
    addSpans(obj.method,obj.repo,[obj.branch]);
  }else if (obj.method=="pull"){
    toggleSide();
    placeBtn();
    addClick();
    addSpans(obj.method,obj.repo,[obj.branchBase,obj.branchHead]);
  }
}