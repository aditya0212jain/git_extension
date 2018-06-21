// if ($ == null || $ == undefined) {
//   document.addEventListener("pjax:success", function(){
//     window.postMessage({type:"codecov"},"*");
//   });
// } else
//{
  $(document).ready(function(){
    $(document).on('pjax:success', function(){
      window.postMessage({type:"codecov"},"*");
    });
  });
//}
