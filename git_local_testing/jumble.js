function sort(pattern){

var tab_counter = document.getElementById("files_tab_counter");
var fileinfo = document.getElementsByClassName("file-info");
//var filePath = []
var fileName = [];
var prodFile = [];
var testFile = [];
var divContainer = [];

for(i=0;i<parseInt(tab_counter.innerHTML);i++){
  var myRegex = /(.*)(<a)(.*)(>)(.*)(<\/a>)(.*)/g;
  let str = fileinfo[i].innerHTML;
  let path = myRegex.exec(str);
  fileName.push(path[5].split('\\').pop().split('/').pop())
  var testornot = fileName[i].toLowerCase();
  if(testornot.search("test")===-1){
    prodFile.push(i);
  }else{
    testFile.push(i);
  }
  //filePath.push(path[5]);
}

for(i=0;i<prodFile.length;i++){
  var index = prodFile[i];
  var hasTest=false;
  var testIndex;
  var pf = fileName[index].substring(0,fileName[index].lastIndexOf('.'));
  var myRegex3 = new RegExp((pf)+'(_)*(t|T)(e|E)(s|S)(t|T)|(t|T)(e|E)(s|S)(t|T)(_)*'+pf);
  //var repo = "repodriller-1.5.0-HEADTest";
  //var s = myRegex3.test(repo);
  //console.log(s);
  if(pattern==0){             ///pattern == 0 meaning production code before then test
  pushDiv(index,divContainer);
  }
  for(j=0;j<testFile.length;j++){
    var index2 = testFile[j];
    var testTemp = fileName[index2];
    if(myRegex3.test(testTemp)==true){
      testIndex = index2;
      hasTest = true;
      pushDiv(index2,divContainer);
      break;
    }
  }
  if(pattern==1){
    pushDiv(index,divContainer);
  }
}

var aditya = document.getElementById("aditya");
var p2 = document.getElementById("tab_c");
aditya.innerHTML = fileName;
//p2.innerHTML = divContainer[1];
show(parseInt(tab_counter.innerHTML),divContainer);

}

function pushDiv(index,divContainer){
  var div = document.getElementById("diff-"+index);
  divContainer.push(div.innerHTML);
}

function show(n,divContainer){
  for(i=0;i<n;i++){
      var div = document.getElementById("diff-"+i);
      div.innerHTML = divContainer[i];
  }
}

// function swap(index1,index2){
//   var div_1 = document.getElementById("diff-"+index1);
//   var div_2 = document.getElementById("diff-"+index2);
//   var temp;
//   temp = div_1.innerHTML;
//   div_1.innerHTML = div_2.innerHTML;
//   div_2.innerHTML = temp;
// }
