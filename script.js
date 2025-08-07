document.getElementById('sendToDatabase').addEventListener('click', () => {
    const texto = document.getElementById('inputBox').value
    const texto2 = document.getElementById('inputBox2').value
    const texto3 = document.getElementById('inputBox3').value
    
    fetch('/.netlify/functions/enviar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ texto, texto2, texto3 }),
            })
            .then(response => response.text())
            .then(data => {
                alert('Mensagem enviada!');
                document.getElementById('inputBox').value = '';
                document.getElementById('inputBox2').value = '';
                document.getElementById('inputBox3').value = '';
            })
            .catch(error => {
                console.error('Erro:', error);
            });
})

