function logout() {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    sessionStorage.setItem('warning', "Logged Out Succesfully")
    window.location.href = '/'; 
}