/**
 * @file Manages the local server Listener and the spans for the queries
 * @author Aditya Jain
 */

/** @module navigation */


/**
*The Listener function for the local server requests
*@function
*/
function reqListener () {
  console.log("in");
  var result = JSON.parse(this.responseText);
  if(result.method=="blob"){
    showBlobResult(result);
  }else if(result.method=="pull"){
    showPullResult(result);
  }else if(result.method=="serverStarted"){
    chrome.runtime.sendMessage({method: "showServerNotification"}, function(response) {
    });
  }else if(result.method=="gitCloneResponse"){
    chrome.runtime.sendMessage(result,function(response){});
  }else if(result.method=="repoNotInServerWorking"||result.method=="repoNotInServerWorkingQuery"){
    var tyu= $('h1.public').find('span.author').find('a.url').html();
    var repo = $('strong[itemprop="name"]').find('a').html();
    var urlForCloning;
    if(tyu==undefined||repo==undefined){
      urlForCloning = "undefined";
    }else{
      urlForCloning = "https://github.com/"+tyu+"/"+repo;
    }
    chrome.runtime.sendMessage({method:result.method,url:urlForCloning}, function(response) {});
  }
  else if(result.method=="reloadToStart"){
    chrome.runtime.sendMessage({method:"reloadToStart"},function(response){});
  }
}

/**
*This function is used to add the span tag around the code for query handling and
*it adds the listener to the spans which send the query objects to the local server
*
*@function
*@param {string} type blob/pull
*@param {string} repo name of the repo
*@param {string[]} branchList names of the branches
*/
function addSpans(type,repo,branchList,author,author2){
  console.log("in");
  var outSpan = document.getElementsByClassName("blob-code-inner");
  for(j=0;j<outSpan.length;j++){
    var tag = outSpan[j];
    var children = tag.childNodes;
    var n = children.length;
    for(i=0;i<n;i++){
      var te = children[i].textContent;
      var tn = children[i].tagName;
      //var re = te.replace(/( )+|([a-zA-Z$_]+)|(\()/g,"<span>$1$2$3<\/span>");
      //console.log(te);
      var re = te.replace(/([a-zA-Z$_][a-zA-Z$_0-9]*)|(\()|(<|>)/g,"<span>$1$2$3<\/span>");
      re = re.replace(/(\t)/g,"<span>$1</span>");
      //re = re.replace(//g)
      re = re.replace(/( )/g,"<span> </span>");
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
          var objRequest ;
          if(type=="blob"){
            var queryObject = getQueryObject(this,type,repo,branchList,author);
            objRequest = {method:"query",query:queryObject,type:type,repo:repo,branch:branchList[0],author:author};
          }else {
            //var queryObject = getQueryObject(this,type,repo,branchList);
            var td = this.closest("td");
            var i = $(td).index();
            if(i==1){
              var queryObject = getQueryObject(this,type,repo,branchList,author);
              objRequest = {method:"query",query:queryObject,type:type,branchType:"base",repo:repo,branch:branchList[0],author:author};
            }else if(i==3){
              var queryObject = getQueryObject(this,type,repo,branchList,author);
              objRequest = {method:"query",query:queryObject,type:type,branchType:"head",repo:repo,branch:branchList[1],author:author2};
            }else if(i==2){
              var argumentForUnified = getBranchUnified(td);
              //console.log(argumentForUnified);
              var queryObject = getQueryObject(this,type,repo,branchList,author,argumentForUnified);
              var tempBranch;
              var tempAuthor;
              argumentForUnified.branch=='base' ? tempBranch=branchList[0] : tempBranch = branchList[1];
              argumentForUnified.branch=='base' ? tempAuthor=author : tempAuthor = author2;
              objRequest = {method:"query",query:queryObject,type:type,branchType:argumentForUnified.branch,repo:repo,branch:tempBranch,author:tempAuthor};//for unified view
            }
          }
            sendToServer(objRequest);
        },false)
      }
    }
  }
}

/**
*Gets the line number for the clicked element
*@function
*@param {Object} element element with class 'blob-code-innner'
*@return {number} the line number
*/
function getLine(element){
  console.log("in");
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

/**
*Gets the character number for the clicked element
*@function
*@param {Object} element the clicked span element
@return {number} the character number starting from 0
*/
function getCharacter(element){
  console.log("in");
  var count1 = getCharacterTill(element);
  var parent = element.parentElement;
  var count2 = 0;
  if(parent!=undefined || parent!= null){
  count2 = getCharacterTill(parent);
  }
  return count1+count2;//+element.textContent.replace(/\t/g,"    ").length
}

/**
*Gets the character number from the beginning of the parent tag till the argument. Used for getCharacter() function
*@function
*@param {Object} element element till which count is needed
*@return {number} count of the characters
*/
function getCharacterTill(element){
  console.log("in");
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

/**
*Gets the path directory for the clicked element for the query .Called by the getQueryObject.
*
*@function
*@param {Object} element the element clicked
*@return {string} pathDir for the requested element
*/
function getFilePath(element){
  console.log("in");
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
    var jsfile = element.closest(".js-file");
    var fileinfo = jsfile.getElementsByClassName('file-info')[0];
    var a2 = fileinfo.getElementsByTagName('a')[0];
    var pathdir = a2.textContent;
    var href = window.location.href;
    var repository = href.split('/');
    var pullindex = repository.indexOf('pull');
    return pathdir;
  }
}

/**
*Called in the addSpans functions for and attached in the listener for click for the span elements
*@function
*@param {Object} element the clicked elements
*@param {string} type blob/pull
*@param {string} repo name of the repo
*@param {string[]} branchList names of the branches
*@param {Object} ifViewIsUnified object in case of unified view
*@return {Object} the query object
*/
function getQueryObject(element,type,repo,branchList,author,ifViewIsUnified,){
  console.log("in");
  var linet;
  if(ifViewIsUnified){
    linet = ifViewIsUnified.line-1;
  }else{
    linet = getLine(element.parentElement.parentElement);
  }
  //console.log("the line is: "+ linet);
  var chart = getCharacter(element);
  //console.log("the character no. is: " + chart);
  var path = getFilePath(element);
  path = path.replace(/\r?\n|\r|\s/g,"");
  var positiont = { line : linet,character : chart};
  var argpass;
  if(type=="blob"){
    //console.log("branch is "+branchList[0]);
    argpass = {textDocument : author+"@"+repo+"_"+branchList[0]+"/"+path , position : positiont };
  }
  else if (type=="pull"){
    //console.log("pull type request in getting query object");
    var td = element.closest("td");
    var i = $(td).index();
  //  console.log("i: "+i);
  if(ifViewIsUnified){
    if(i==1||ifViewIsUnified.branch=="base"){
      //console.log("branch is "+branchList[0]);
      argpass = {textDocument : author+"@"+repo+"_"+branchList[0]+"/"+path , position : positiont };
    }
    else if(i==3||ifViewIsUnified.branch=="head"){
    //  console.log("branch is "+branchList[1]);
      argpass = {textDocument : author+"@"+repo+"_"+branchList[1]+"/"+path , position : positiont };
    }
  }else{
    if(i==1){
      //console.log("branch is "+branchList[0]);
      argpass = {textDocument : author+"@"+repo+"_"+branchList[0]+"/"+path , position : positiont };
    }
    else if(i==3){
      //console.log("branch is "+branchList[1]);
      argpass = {textDocument : author+"@"+repo+"_"+branchList[1]+"/"+path , position : positiont };
    }

  }

  }
  //console.log(argpass);
  return argpass;
}

/**
*Used for unified view to get argument
*@function
*@param {Object} element td element closest to the clicked element
*@return {Object} {branch,line}
*/
function getBranchUnified(element){
  console.log("in");
  //element is jquery use as $(element)
  var parent = $(element).parent();
  var children = $(parent).find("td");

  var firstline = $(children[0]).attr('data-line-number');
  var secondline = $(children[1]).attr('data-line-number');
  if(secondline==undefined){
    return {branch:"base",line:firstline};
  }else{
    return {branch:"head",line:secondline};
  }
}
