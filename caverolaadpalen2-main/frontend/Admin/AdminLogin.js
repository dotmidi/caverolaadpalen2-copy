let username = document.getElementById('username');
let password = document.getElementById('password');

async function login() {
    const admin = await axios.get('http://localhost:3000/admin')
    const databaseUsername = admin.data[0].username
    const databasePassword = admin.data[0].password

    if (username.value == databaseUsername && password.value == databasePassword) {
        window.location.href = "Admin.html"
    }
    else {
        alert("Username or password is incorrect")
        window.location.reload();
    }
}