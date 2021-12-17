let inputCourriel = document.getElementById('input-courriel');
let inputMotDePasse = document.getElementById('input-mot-de-passe');
let formConnexion = document.getElementById('form-connexion');

formConnexion.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = {
        email: inputCourriel.value,
        password: inputMotDePasse.value
    };
    let response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        window.location.replace('/');
    }
    else if(response.status === 401) {
        console.log("dans login.js 401");
        let data = await response.json();
    }
});