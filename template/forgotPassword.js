export default (message) => `
<!doctype html>
<html lang="en">
   <head>
      <meta charset="utf-8">
   </head>   
<body>
<nav>
<ul style="list-style-type: none;">
<li style ="display:inline"><a style ="color:green"href="/project/authenticationdemo/login">Login</a></li>
</ul>
</nav>

<h2>HTML Forms</h2>

<form action="/project/authenticationdemo/forgetpassword" method="post">
  <label for="fname">Enter your email :</label><br>
  <input type="email" id="fname" name="email"><br>
  <input type="submit" value="Submit">
</form> 
<h3 style="color:tomato">${message}</h3>
</body>
</html>
`

