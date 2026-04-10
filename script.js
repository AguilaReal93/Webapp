function mostrarSeccio(id) {

    let seccions = document.querySelectorAll(".seccio");

    seccions.forEach(seccio => {
        seccio.style.display = "none";
    });

    document.getElementById(id).style.display = "block";
}