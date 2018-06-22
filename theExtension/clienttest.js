console.log("this is client test");
function reqListener () {
  console.log(this.responseText);
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("POST", "http://localhost:8080");
oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
oReq.send(JSON.stringify({ line :11,character: 24 }));

function addSpans(){
  var outSpan = document.getElementsByClassName("blob-code-inner");
  for(j=0;j<outSpan.length;j++){
    var tag = outSpan[j];
    //var t = document.getElementById('output');
    var children = tag.childNodes;
    var n = children.length;
    for(i=0;i<n;i++){
      //console.log(children);
      var te = children[i].textContent;
      //console.log(children[i].tagName);
      var tn = children[i].tagName;
      //te = te.replace(/\t/g,"    ");
      var re = te.replace(/( )+|([a-zA-Z$_]+)|(((\()*(\))*(;)*)+)|(\t)+/g,"<span>$1$2$3$4<\/span>");
      //children[i].textContent = re;
      if(children[i].tagName==undefined){
        var y = document.createElement("span");
        y.innerHTML = re;
        tag.replaceChild(y,children[i]);
      }else{
        children[i].innerHTML = re;
      }
      var childOfChild = children[i].childNodes;
      // console.log(childOfChild);
      for(o=0;o<childOfChild.length;o++){
        childOfChild[o].addEventListener("mouseover", function(event){event.target.style.color = "orange";},false);
        childOfChild[o].addEventListener("mouseout", function(event){ event.target.style.color=""},false);
        //childOfChild[o]
      }
    }

      // var children = outSpan[j].childNodes;
      // for (var i = 0; i < children.length; i++) {
      //   if(children.textContent!=undefined ||children.textContent != null){
      //   children[i].textContent = children.textContent.replace(/\t/g,'    ');
      // }
      //     if(children[i].tagName==undefined){
      //       var span1 = document.createElement('span');
      //       span1.innerHTML = children[i].textContent;
      //       //span1.addEventListener('click',getLine(this));
      //       outSpan[j].replaceChild(span1,children[i]);
      //     }
      //     children[i].addEventListener("mouseover", function( event ) {event.target.style.color = "orange";}, false);
      //     children[i].addEventListener('mouseout', function(event){event.target.style.color=""},false);
      //     children[i].addEventListener("click",function(){
      //       //console.log(this);
      //       var linet = getLine(this.parentElement);
      //       var chart = getChar(this);
      //       console.log("sending to server");
      //       var pReq = new XMLHttpRequest();
      //       pReq.addEventListener("load", reqListener);
      //       pReq.open("POST", "http://localhost:8080");
      //       pReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      //       pReq.send(JSON.stringify({ line : linet,character: chart }));
      //     },false);
      // }
  }
}

function getLine(element){
  //console.log("clicked");
  //console.log(element);
  //console.log(element);
  if(element.parentElement!=undefined || element.parentElement!=null){
    if(element.parentElement.tagName=="TR"){
      var td2 = element.parentElement.getElementsByClassName("js-line-number")[0];
      console.log(td2.getAttribute("data-line-number"));
      return td2.getAttribute('data-line-number')-1;
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
          console.log(td.getAttribute('data-line-number'));
          return td.getAttribute('data-line-number')-1;
        }else if (td.tagName=="TR"){
          //console.log(td);
          var td1 = td.getElementsByClassName("js-line-number")[0];
          console.log(td1.getAttribute('data-line-number'));
          return td1.getAttribute('data-line-number')-1;
        }
      }
    }
  }
}

function getChar(element){
  var index = $(element).index();
  //console.log(index);
  var children = element.parentElement.childNodes;
  var co=0;
  for(var i=0;i<index;i++){
    co += children[i].textContent.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').length;
  }
  console.log(co);
  return co;
}
