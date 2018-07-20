/**
 * @file Manages the result received by the local server
 * @author Aditya Jain
 */

 /** @module showResult */


/**
*For highlighting the result line when in same page
*@function
*@param {number} line the line number which needs to be highlighted
*/
function highlightLineInSamePage(line){

  //the current url
  var old = location.href;
  var removehash = old.indexOf("#");
  //if no # is present just add the below content
  if(removehash==-1){
    location.href = old + "#L" + line;
  }else{
    //if # present then replace the line
    var h = old.substring(0,removehash);
    location.href = h + "#L"+line;
  }
}

/**
*Called when the result received is for blob page
*@function
*@param {Object} result contains the result received from local server
*/
function showBlobResult(result){

  var query = result.query;
  var definition = result.definition;
  var same = result.same;
  if(same==true){
    //execute if in same files
    showSameBlobResult(result);
  }else{
    //if result is in different file
    showDiffBlobResult(result);
  }
}

/**
*Called when the result received is for pull page
*@function
*@param {Object} result contains the result received from local server
*/
function showPullResult(result){

  if(result.same==true){
    //if in same file
    showSamePullResult(result);
  }else{
    //if not in same file
    showDiffPullResult(result);
  }
}

/**
*Called when the result received is in the same file for blob
*@function
*@param {Object} result contains the result received from local server
*/
function showSameBlobResult(result){

  var obj = result.definition;
  var line = obj.range.start.line +1;
  highlightLineInSamePage(line);
}

/**
*Called when the result received is in the different file for blob
*@function
*@param {Object} result contains the result received from local server
*/
function showDiffBlobResult(result){

  console.log(result);
  var resultPath = result.definition.uri;
  var resultArray = resultPath.split('/');
  var index = resultArray.indexOf(result.author+"@"+result.repo+"_"+result.branch);
  //getting the name of the result file in an array below
  var resultFile = resultArray.slice(index+1,resultArray.length);
  var olduri = location.href;
  var oldarray = olduri.split('/');
  var index2 = oldarray.indexOf(result.branch);
  //as the answer will be in same branch
  oldarray = oldarray.slice(0,index2+1);
  //for new uri adding the result file path after the branch
  var newLocationArray = oldarray.concat(resultFile);
  var newurl = newLocationArray.join('/');
  var line = result.definition.range.start.line+1;
  newurl+= "#L" + line;
  //sending the message to create new tab to background script with the new url
  chrome.runtime.sendMessage({method:"openNewTab",newLocation: newurl}, function(response) {
  });
}

/**
*Called when the result received is in the same file for pull
*@function
*@param {Object} result contains the result received from local server
*/
function showSamePullResult(result){

  var srcPath = result.query.textDocument;
  var pathArray = srcPath.split('/');
  pathArray = pathArray.slice(1,pathArray.length);
  var finalPath = pathArray.join('/');
  var element = "a[title$=\'"+finalPath+"\']";
  //getting the diff for the file
  var diff = $(element).attr('href');
  var line = result.definition.range.start.line+1;
  var old = location.href;
  var removehash = old.indexOf("#");
  //getting the new url using the diff obtained above
  if(removehash==-1){
    if(result.branchType=="base"){
      location.href = old +diff+ "L" + line;
    }else{
      location.href = old +diff+ "R" + line;
    }
  }else{
    var h = old.substring(0,removehash);
    if(result.branchType=="base"){
      location.href = h +diff+ "L" + line;
    }else{
      location.href = h +diff+ "R" + line;
    }
  }
  var objData = getPullObject();
  //using setTimeout to wait for the content to load if the result has the line which is hidden
  setTimeout(function(){addSpans(objData.method,objData.repo,[objData.branchBase,objData.branchHead],objData.author,objData.author2);myCode();},2000);

}

/**
*Called when the result received is in the different file for pull
*@function
*@param {Object} result contains the result received from local server
*/
function showDiffPullResult(result){

  //stores the branch name
  var branch;
  if(result.branchType=="base"){
    branch = document.getElementsByClassName('base-ref')[0].textContent;
  }else{
    branch = document.getElementsByClassName('head-ref')[0].textContent;
  }
  //if branch contains / in it
  var r = branch.indexOf('/');
  var resultPath = result.definition.uri;
  var resultArray = resultPath.split('/');

  if(r==-1){
    //if no '/' is present in the branch name
    var index = resultArray.indexOf(result.author+"@"+result.repo+"_"+branch);
    var resultFile = resultArray.slice(index+1,resultArray.length);
    var olduri = location.href;
    var oldarray = olduri.split('/');
    var index2 = oldarray.indexOf("pull");
    oldarray[index2] ="blob";
    oldarray = oldarray.slice(0,index2+1);
    oldarray.push(branch);
    oldarray = oldarray.concat(resultFile);
    var newurl = oldarray.join('/');
    var line = result.definition.range.start.line+1;
    newurl+= "#L" + line;
    location.href = newurl;
    //or chrome.tabs.create from background
    // chrome.runtime.sendMessage({newLocation: newurl}, function(response) {
    //     console.log(response.farewell);
    // });
  }else {
    var branchArray = branch.split('/');
    var index = resultArray.indexOf(result.author+"@"+result.repo+"_"+branchArray[0]);
    var tocontinue = true;
    for(i=1;i<branchArray.length;i++){
      if(resultArray[index+i+1]!=branchArray[i+1]){
        tocontinue=false;
        break;
      }
    }
    if(tocontinue){
      var resultFile = resultArray.slice(index+1,resultArray.length);
      var olduri = location.href;
      var oldarray = olduri.split('/');
      var index2 = oldarray.indexOf("pull");
      oldarray[index2] ="blob";
      oldarray = oldarray.slice(0,index2+1);
      oldarray.push(branchArray[0]);
      oldarray = oldarray.concat(resultFile);
      var newurl = oldarray.join('/');
      var line = result.definition.range.start.line+1;
      newurl+= "#L" + line;
      location.href = newurl;
      //or chrome.tabs.create from background
      // chrome.runtime.sendMessage({newLocation: newurl}, function(response) {
      //     console.log(response.farewell);
      // });

    }
  }
}
