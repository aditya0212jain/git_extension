function sort(){
var div0 = document.getElementById("diff-0");
var div1 = document.getElementById("diff-1");
var div2 = document.getElementById("diff-2");
var div3 = document.getElementById("diff-3");

var tab_counter = document.getElementById("files_tab_counter");
var fileinfo = document.getElementsByClassName("file-info");
//var filePath = []
var fileName = [];
var prodFile = [];
var testFile = [];

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
  var pf = fileName[index].substring(0,fileName[index].lastIndexOf('.'));
  var myRegex2 = (pf)("test")|("test")(pf);
  console.log(myRegex2);
}

var aditya = document.getElementById("aditya");
var p2 = document.getElementById("tab_c");
aditya.innerHTML = fileName;
p2.innerHTML = prodFile;

}

function haveTest(){




}
/*var temp;
temp = div0.innerHTML;
div0.innerHTML = div1.innerHTML;
div1.innerHTML = temp;
*/
