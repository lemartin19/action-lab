function downloadAll() {
  data = document.getElementsByClassName("data");
  for (var i = 0; i < data.length; i++) {
    console.log(data.bodycontent);
    data[i].click();
  }
}