//console.log("this is client test");
function reqListener () {
  var result = JSON.parse(this.responseText);
  console.log("the result is:");
  console.log(result);
  if(result.method=="blob"){
    showBlobResult(result);
  }else if(result.method=="pull"){
    showPullResult(result);
  }
}

function addSpans(type,repo,branchList){
  //console.log("in addSpans");
  var outSpan = document.getElementsByClassName("blob-code-inner");
  for(j=0;j<outSpan.length;j++){
    var tag = outSpan[j];
    var children = tag.childNodes;
    var n = children.length;
    for(i=0;i<n;i++){
      var te = children[i].textContent;
      var tn = children[i].tagName;
      //var re = te.replace(/( )+|([a-zA-Z$_]+)|(\()/g,"<span>$1$2$3<\/span>");
      var re = te.replace(/([a-zA-Z$_][a-zA-Z$_0-9]*)|(\()|(<|>)/g,"<span>$1$2$3<\/span>");
      re = re.replace(/(\t)/g,"<span>$1</span>");
      re = re.replace(/( )/g,"<span>&nbsp;</span>");
      if(children[i].tagName==undefined){
        var y = document.createElement("span");
        y.innerHTML = re;
        tag.replaceChild(y,children[i]);
      }else{
        children[i].innerHTML = re;
      }
      var childOfChild = children[i].childNodes;
      for(o=0;o<childOfChild.length;o++){
        childOfChild[o].addEventListener("mouseover", function(event){event.target.style.color = "orange";},false);
        childOfChild[o].addEventListener("mouseout", function(event){ event.target.style.color=""},false);
        childOfChild[o].addEventListener("click", function(){
          //var queryObject = getQueryObject(this,type,repo,branchList);
          var objRequest ;
          if(type=="blob"){
            var queryObject = getQueryObject(this,type,repo,branchList);
            objRequest = {method:"query",query:queryObject,type:type};
          }else {
            //var queryObject = getQueryObject(this,type,repo,branchList);
            var td = this.closest("td");
            var i = $(td).index();
            if(i==1){
              var queryObject = getQueryObject(this,type,repo,branchList);
              objRequest = {method:"query",query:queryObject,type:type,branchType:"base"};
            }else if(i==3){
              var queryObject = getQueryObject(this,type,repo,branchList);
              objRequest = {method:"query",query:queryObject,type:type,branchType:"head"};
            }else if(i==2){
              var argumentForUnified = getBranchUnified(td);
              console.log(argumentForUnified);
              var queryObject = getQueryObject(this,type,repo,branchList,argumentForUnified);
              objRequest = {method:"query",query:queryObject,type:type,branchType:argumentForUnified.branch};//for unified view
              //getBranchUnified(td);

            }
          }
          console.log("objRequest is :");
          console.log(objRequest);
            sendToServer(objRequest);
          // chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
          //     console.log(response.farewell);
          // });
        },false)
      }
    }
  }
}

function getLine(element){
  //console.log("clicked");
  //console.log(element);
  if(element.parentElement!=undefined || element.parentElement!=null){
    if(element.parentElement.tagName=="TR"){
      var td2 = element.parentElement.getElementsByClassName("js-line-number")[0];
      //console.log(td2.getAttribute("data-line-number"));
      if(td2!=undefined){
        return td2.getAttribute('data-line-number')-1;
      }else{
        var prev = element.previousSibling.previousSibling;
        return prev.getAttribute('data-line-number')-1;               //for expandable line
      }
    }
    else{
      //console.log("p1");
      var tdabove = element.parentElement.previousSibling;
      if(tdabove!=null){
        //console.log("p2");
        var td = tdabove.previousSibling;
        //console.log("p3");
        //console.log(td.tagName);
        if(td.tagName=="TD"){
          //console.log(td);
          //console.log(td.getAttribute('data-line-number'));
          return td.getAttribute('data-line-number')-1;
        }else if (td.tagName=="TR"){
          //console.log(td);
          var td1 = td.getElementsByClassName("js-line-number")[0];
          //console.log(td1.getAttribute('data-line-number'));
          return td1.getAttribute('data-line-number')-1;
        }
      }
    }
  }
}

function getCharacter(element){
  var count1 = getCharacterTill(element);
  var parent = element.parentElement;
  var count2 = 0;
  if(parent!=undefined || parent!= null){
  count2 = getCharacterTill(parent);
  }
  return count1+count2;//+element.textContent.replace(/\t/g,"    ").length
}

function getCharacterTill(element){
  var index = $(element).index();
  var count=0;
  var parent = element.parentElement;
  if(parent!=undefined||parent!=null){
    var children = parent.childNodes;
    for(i=0;i<index;i++){
      count += children[i].textContent.replace(/\t/g," ").length;
    }
  }
  return count;
}

function getFilePath(element){
  var href = window.location.href;
  var myRegexPull = /(.)*(github)(.)*(pull)(.)*(files)(.)*/g;
  var myRegexBlob = /(.)*(github)(.)*(blob)(.)*/g;
  if(myRegexBlob.test(href)==true){
    var blobpath = document.getElementById('blob-path');
    var path = blobpath.textContent.split('/');
    path.splice(0,1);
    var final = path.join('/');
    final = final.replace(/\r?\n|\r|\s/g,"");
    return final;
  }else if (myRegexPull.test(href)==true){
    //console.log("Pull working");
    var jsfile = element.closest(".js-file");
    var fileinfo = jsfile.getElementsByClassName('file-info')[0];
    var a2 = fileinfo.getElementsByTagName('a')[0];
    var pathdir = a2.textContent;
    var href = window.location.href;
    var repository = href.split('/');
    var pullindex = repository.indexOf('pull');
    //console.log(repository[pullindex-1] +'/' + pathdir);
    return pathdir;
  }
}

function getQueryObject(element,type,repo,branchList,ifViewIsUnified){
  var linet;
  if(ifViewIsUnified){
    linet = ifViewIsUnified.line-1;
  }else{
    linet = getLine(element.parentElement.parentElement);
  }
  console.log("the line is: "+ linet);
  var chart = getCharacter(element);
  console.log("the character no. is: " + chart);
  var path = getFilePath(element);
  path = path.replace(/\r?\n|\r|\s/g,"");
  var positiont = { line : linet,character : chart};
  var argpass;
  if(type=="blob"){
    console.log("branch is "+branchList[0]);
    argpass = {textDocument : repo+"_"+branchList[0]+"/"+path , position : positiont };
  }
  else if (type=="pull"){
    console.log("pull type request in getting query object");
    var td = element.closest("td");
    var i = $(td).index();
  //  console.log("i: "+i);
  if(ifViewIsUnified){
    if(i==1||ifViewIsUnified.branch=="base"){
      console.log("branch is "+branchList[0]);
      argpass = {textDocument : repo+"_"+branchList[0]+"/"+path , position : positiont };
    }
    else if(i==3||ifViewIsUnified.branch=="head"){
      console.log("branch is "+branchList[1]);
      argpass = {textDocument : repo+"_"+branchList[1]+"/"+path , position : positiont };
    }
  }else{
    if(i==1){
      console.log("branch is "+branchList[0]);
      argpass = {textDocument : repo+"_"+branchList[0]+"/"+path , position : positiont };
    }
    else if(i==3){
      console.log("branch is "+branchList[1]);
      argpass = {textDocument : repo+"_"+branchList[1]+"/"+path , position : positiont };
    }

  }

  }
  console.log(argpass);
  return argpass;
}

function getBranchUnified(element){
  //element is jquery use as $(element)
  var parent = $(element).parent();
  var children = $(parent).find("td");
//  console.log(parent);
//  console.log(children);
  var firstline = $(children[0]).attr('data-line-number');
  var secondline = $(children[1]).attr('data-line-number');
  if(secondline==undefined){
    return {branch:"base",line:firstline};
  }else{
    return {branch:"head",line:secondline};
  }
}
