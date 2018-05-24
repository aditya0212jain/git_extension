function toggleSide(currentFile){
  var tab_counter = document.getElementById("files_tab_counter");
  var fileinfo = document.getElementsByClassName("file-info");
  //var filePath = []function sort(pattern){

  var tab_counter = document.getElementById("files_tab_counter");
  var fileinfo = document.getElementsByClassName("file-info");
  //var filePath = []
  var fileName = [];
  var prodFile = [];
  var testFile = [];
  var divContainer = [];

  getNames(tab_counter,fileName,prodFile,testFile,fileinfo);

  for(i=0;i<prodFile.length;i++){
    var index = prodFile[i];
    addButton(index);
  }
  
}

function getNames(tab_counter,fileName,prodFile,testFile,fileinfo){
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
}

function addButton(index){
  var div0 = document.getElementById("diff-"+index);
  var fileAction = div0.getElementsByClassName("file-actions")[0];
  var btnGroup = fileAction.getElementsByClassName("BtnGroup")[0];
  var btn = document.createElement("BUTTON");
  var t = document.createTextNode("Show Test");
  btn.appendChild(t);
  btn.classList.add("btn");
  btn.classList.add("btn-sm");
  btn.classList.add("BtnGroup-item");
  btnGroup.appendChild(btn);
}
