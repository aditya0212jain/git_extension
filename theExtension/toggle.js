function toggleSide(currentFile){

  var tab_counter = document.getElementById("files_tab_counter");
  var fileinfo = document.getElementsByClassName("file-info");

  var fileName = [];
  var prodFile = [];
  var testFile = [];

  getNames(tab_counter,fileName,prodFile,testFile,fileinfo);

  for(i=0;i<prodFile.length;i++){
    var index = prodFile[i];
    addButton(index,fileName);
  }

}

function showTest(btn){
  console.log("in");
  console.log(btn.id);
  if(btn.parentElement.parentElement.parentElement.hasAttribute("style")==true){
    var div = btn.parentElement.parentElement.parentElement;
    div.removeAttribute("style");
    var id = div.id;
    //console.log(id);
    var id2 = id[id.length-1];
    id2 = parseInt(id2) +1;
    //console.log(id2);
    var div2 = document.getElementById("diff-"+id2);
    div2.removeAttribute("style");
  }
  else{
  document.body.classList.add("full-width");
  //console.log(btn.innerHTML);
  //console.log(btn.value);
  var btnValue = btn.value;
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

  var hasTest=false;
  var testIndex;
  var testInner;
  var pf = btnValue.substring(0,btnValue.lastIndexOf('.'));
  var myRegex3 = new RegExp((pf)+'(_)*(t|T)(e|E)(s|S)(t|T)|(t|T)(e|E)(s|S)(t|T)(_)*'+pf);

  for(j=0;j<testFile.length;j++){
    var index2 = testFile[j];
    var testTemp = fileName[index2];
    if(myRegex3.test(testTemp)==true){
      testIndex = index2;
      hasTest = true;
      var div = document.getElementById("diff-"+testIndex);
      testInner = div.innerHTML;
      testFile.splice(j,1);
      break;
    }
  }

  var mainIndex;
  for(i=0;i<fileName.length;i++){
    if(i!=testIndex){
      if(btnValue==fileName[i]){
        pushDiv(i,divContainer);
        pushDiv(testIndex,divContainer);
        mainIndex = i;
      }else{
        pushDiv(i,divContainer);
      }
    }
  }


  for(i=0;i<parseInt(tab_counter.innerHTML);i++){
    var div = document.getElementById("diff-"+i);
    if((i==mainIndex&&mainIndex<testIndex)||(i==(mainIndex-1)&&mainIndex>testIndex)){
      div.style.display ="inline-block";
      div.style.width = "49.5%";
      div.style.verticalAlign = "top";
      div.innerHTML = divContainer[i];
      var div2 = document.getElementById("diff-"+(i+1));
      div2.style.display ="inline-block";
      div2.style.width = "49.5%";
      div2.style.verticalAlign = "top";
      div2.innerHTML = divContainer[i+1];
      i++;
      continue;
    }else{
    div.innerHTML = divContainer[i];
    }
  }

  }
  console.log(btn.id);

  var tu = document.getElementById(btn.id);
  //tu.addEventListener('click',function() {showTest(this)});
  addClick();
}

function addButton(index,fileName){
  var div0 = document.getElementById("diff-"+index);
  //console.log(div0.id);
  var fileAction = div0.getElementsByClassName("file-actions")[0];
  //console.log(fileAction.className);
  var btnGroup = fileAction.getElementsByClassName("BtnGroup")[0];
  //console.log(btnGroup.className);
  var btn = document.createElement("BUTTON");;
  var t = document.createTextNode("Test");
  btn.appendChild(t);
  btn.classList.add("btn");
  btn.classList.add("btn-sm");
  btn.classList.add("BtnGroup-item");
  //btn.setAttribute("onclick","showTest(this)");
  var t = fileName[index];
  btn.setAttribute("value",t);
  var text = "test"+index;
  btn.setAttribute("id",text);
  fileAction.insertBefore(btn,fileAction.childNodes[4])
  //btnGroup.appendChild(btn);
  //document.getElementById("test"+index).addEventListener('click',function() { showTest(document.getElementById("test"+index)); },false);
}

function placeBtn(){
  var d1 = document.getElementsByClassName("diffbar")[0];
  var btn1 = document.createElement("BUTTON");
  var btn2 = document.createElement("BUTTON");
  var text1 = document.createTextNode("Production First");
  btn1.appendChild(text1);
  var text2 = document.createTextNode("Test First");
  btn2.appendChild(text2);
  btn1.setAttribute("class","btn btn-sm");
  btn1.setAttribute("type","submit");
  btn2.setAttribute("class","btn btn-sm");
  //btn1.setAttribute("onclick","sort(0);this.parentElement.parentElement.parentElement.removeAttribute('open');");
  btn1.addEventListener("click",productionFirst,false);
  btn1.setAttribute("id","productionFirstButton");
  btn2.setAttribute("id","testFirstButton");
  //btn2.setAttribute("onclick","sort(1);this.parentElement.parentElement.parentElement.removeAttribute('open');");
  btn2.addEventListener("click",testFirst,false);
  var div3 = document.createElement("div");
  div3.setAttribute("style","left:-83px");
  div3.setAttribute("class","Popover-message text-left p-3 mx-auto Box box-shadow-large");
  div3.appendChild(btn2);
  div3.appendChild(btn1);
  var div2 = document.createElement("div");
  div2.setAttribute("class","Popover");
  div2.appendChild(div3);
  var sum = document.createElement("summary");
  sum.setAttribute("class","btn-link muted-link select-menu-button js-menu-target");
  var text3 = document.createTextNode("Sort");
  var strong = document.createElement("strong");
  strong.appendChild(text3);
  sum.appendChild(strong);
  var detail = document.createElement("details");
  detail.setAttribute("class","details-reset");
  detail.appendChild(div2);
  detail.appendChild(sum);
  var div1 = document.createElement("div");
  div1.setAttribute("class","diffbar-item");
  div1.appendChild(detail);
  d1.insertBefore(div1,d1.childNodes[3]);
}

function onloadFunc () {
  var linkurl = document.URL;
  var myRegex4 = /(.)*(github)(.)*(pull)(.)*(files)(.)*/g;
  if(myRegex4.test(linkurl)==true){
    toggleSide();
    placeBtn();
    addClick();
  }
}

function addClick() {
  var n = document.getElementById("files_tab_counter");
  for(i=0;i<parseInt(n.innerHTML);i++){
    var t = document.getElementById("test"+i);
    if(t!=null){
      t.addEventListener('click',function() {showTest(this)});
    }
  }

}

function productionFirst(){
  sort(0);
  var idtemp = document.getElementById("productionFirstButton");
  idtemp.parentElement.parentElement.parentElement.removeAttribute('open');
  addClick();
}

function testFirst(){
  sort(1);
  var idtemp = document.getElementById("testFirstButton");
  idtemp.parentElement.parentElement.parentElement.removeAttribute('open');
  addClick();
}
