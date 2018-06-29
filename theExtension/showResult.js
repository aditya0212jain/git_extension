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
