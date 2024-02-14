export default (message)=> `
<!doctype html>
<html lang="en">
   <head>
      <meta charset="utf-8">
   </head>   
<body>
<nav>
<ul style="list-style-type: none;">
<li style ="display:inline"><a style ="color:green"href="/project/authenticationdemo/register">Registration</a></li>
<li style ="display:inline"><a href="/project/authenticationdemo/login">Login</a></li>
</ul>
</nav>

<h2>HTML Forms</h2>

<form action="/project/authenticationdemo/register" method="post">
  <label for="fname">Email:</label><br>
  <input type="email" id="fname" name="email" ><br>
  <label for="lname">password:</label><br>
  <input type="password" id="lname" name="password" ><br><br>
  <input type="submit" value="register">
</form> 
<h3 style="color:tomato">${message}</h3>
</body>
</html>
`


