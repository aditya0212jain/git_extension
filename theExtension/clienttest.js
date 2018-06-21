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
            //span1.addEventListener('click',getLineAndCharacter(this));
            outSpan[j].replaceChild(span1,children[i]);
          }
          children[i].addEventListener("mouseover", function( event ) {event.target.style.color = "orange";}, false);
          children[i].addEventListener('mouseout', function(event){event.target.style.color=""},false);
          children[i].addEventListener("click",function(){console.log(this);getLineAndCharacter(this.parentElement);},false);
      }
  }
}

function getLineAndCharacter(element){
  console.log("clicked");
  console.log(element);
  //console.log(element);
  if(element.parentElement!=undefined || element.parentElement!=null){
    //console.log("p1");
  var tdabove = element.parentElement.previousSibling;
  if(tdabove!=null){
    //console.log("p2");
    var td = tdabove.previousSibling;
    //console.log("p3");
    //console.log(td.tagName);
    if(td.tagName=="TD"){
    console.log(td);
    console.log(td.getAttribute('data-line-number'));
  }else if (td.tagName=="TR"){
    console.log(td);
    var td1 = td.getElementsByClassName("js-line-number")[0];
    console.log(td1.getAttribute('data-line-number'));
  }
  }
}
}
