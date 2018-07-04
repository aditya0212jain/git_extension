function highlightLineInSamePage(line){
  // var ct = document.getElementById("L"+line);
  // var removeClass = document.getElementsByClassName("definitionHighlight");
  // for(i=0;i<removeClass.length;i++){
  //   $(removeClass[i]).removeClass("definitionHighlight");
  // }
  // ct.parentElement.classList.add("definitionHighlight");
  var old = location.href;
  //console.log(old);
  var removehash = old.indexOf("#");
  if(removehash==-1){
    location.href = old + "#L" + line;
    //console.log(location.href);
  }else{
    var h = old.substring(0,removehash);
    location.href = h + "#L"+line;
    //location.href="http://www.google.com";
  }
}

function showBlobResult(result){
  var query = result.query;
  var definition = result.definition;
  var same = result.same;
  if(same==true){
    showSameBlobResult(result);
  }else{
    showDiffBlobResult(result);
  }
}


function showPullResult(result){
  if(result.same==true){
    showSamePullResult(result);
  }else{
    showDiffPullResult(result);
  }
}



function showSameBlobResult(result){
  var obj = result.definition;
  var line = obj.range.start.line +1;
  highlightLineInSamePage(line);
}

function showDiffBlobResult(result){
  var resultPath = result.definition.uri;
  var resultArray = resultPath.split('/');
  var index = resultArray.indexOf(result.repo+"_"+result.branch);
  var resultFile = resultArray.slice(index+1,resultArray.length);
  console.log(resultFile);
  console.log("THE AbOVE is the new file path");
  var olduri = location.href;
  var oldarray = olduri.split('/');
  var index2 = oldarray.indexOf(result.branch);
  oldarray = oldarray.slice(0,index2+1);
  var newLocationArray = oldarray.concat(resultFile);
  var newurl = newLocationArray.join('/');
  var line = result.definition.range.start.line+1;
  newurl+= "#L" + line;
  chrome.runtime.sendMessage({newLocation: newurl}, function(response) {
      console.log(response.farewell);
  });
  //var regex = new RegExp((result.repo+"_")((.)*));
  // var newBranch;
  // for(i=0;i<resultArray.length;i++){
  //   if(regex.test(resultArray[i])){
  //     var match = regex.exec(resultArray[i]);
  //     newBranch = match[2];
  //     console.log(newBranch);
  //   }
  // }
}

function showSamePullResult(result){
  var srcPath = result.query.textDocument;
  var pathArray = srcPath.split('/');
  pathArray = pathArray.slice(1,pathArray.length);
  var finalPath = pathArray.join('/');
  var element = "a[title$=\'"+finalPath+"\']";
  var diff = $(element).attr('href');
  var line = result.definition.range.start.line+1;
  var old = location.href;
  var removehash = old.indexOf("#");
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
  setTimeout(function(){addSpans(objData.method,objData.repo,[objData.branchBase,objData.branchHead]);console.log("now spans added")},1000);

}

function showDiffPullResult(result){
  console.log("in diff pull result");
  var branch;
  if(result.branchType=="base"){
    branch = document.getElementsByClassName('base-ref')[0].textContent;
  }else{
    branch = document.getElementsByClassName('head-ref')[0].textContent;
  }
  var r = branch.indexOf('/');
  var resultPath = result.definition.uri;
  var resultArray = resultPath.split('/');
  if(r==-1){
    console.log("result path: "+resultPath);
    var index = resultArray.indexOf(result.repo+"_"+branch);
    console.log(index);
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
    location.href = newurl;//or chrome.tabs.create from background
    // chrome.runtime.sendMessage({newLocation: newurl}, function(response) {
    //     console.log(response.farewell);
    // });
  }else {
    var branchArray = branch.split('/');
    var index = resultArray.indexOf(result.repo+"_"+branchArray[0]);
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
      location.href = newurl;//or chrome.tabs.create from background
      // chrome.runtime.sendMessage({newLocation: newurl}, function(response) {
      //     console.log(response.farewell);
      // });

    }
  }
}
