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
      var children = outSpan[j].childNodes;
      for (var i = 0; i < children.length; i++) {
          if(children[i].tagName==undefined){
            var span1 = document.createElement('span');
            span1.innerHTML = children[i].textContent;
            //span1.addEventListener('click',getLine(this));
            outSpan[j].replaceChild(span1,children[i]);
          }
          children[i].addEventListener("mouseover", function( event ) {event.target.style.color = "orange";}, false);
          children[i].addEventListener('mouseout', function(event){event.target.style.color=""},false);
          children[i].addEventListener("click",function(){
            //console.log(this);
            var linet = getLine(this.parentElement);
            var chart = getChar(this);
            console.log("sending to server");
            var pReq = new XMLHttpRequest();
            pReq.addEventListener("load", reqListener);
            pReq.open("POST", "http://localhost:8080");
            pReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            pReq.send(JSON.stringify({ line : linet,character: chart }));
          },false);
      }
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
    co += children[i].textContent.length;
  }
  console.log(co);
  return co;
}
