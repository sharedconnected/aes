async function getJSON() {
  let response = await fetch('https://gist.githubusercontent.com/sharedconnected/18799a006a228d90abd1f5609827c29b/raw/');
  const json = await response.json();
  console.log(json);
  for (var prop in json) {
  
    document.getElementById('filme').innerHTML += '<li>' + prop + '</li>';
  
  }
}
console.log(getJSON())
