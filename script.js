const CAPITAL_INICIAL = 540;

let historial = JSON.parse(
    localStorage.getItem("millanTradingHistorial")
) || [];


function guardarDatos() {

    localStorage.setItem(
        "millanTradingHistorial",
        JSON.stringify(historial)
    );

}


function obtenerCapitalActual() {

    let resultadoTotal = historial.reduce(
        (total, registro) => total + registro.resultado,
        0
    );

    return CAPITAL_INICIAL + resultadoTotal;

}


function registrarResultado() {

    const resultadoInput =
        document.getElementById("ganancia");

    const operacionesInput =
        document.getElementById("numeroOperaciones");


    const resultado =
        parseFloat(resultadoInput.value);

    const operaciones =
        parseInt(operacionesInput.value);


    if (isNaN(resultado)) {

        alert("Ingresa el resultado del día.");

        return;

    }


    if (isNaN(operaciones) || operaciones < 0) {

        alert("Ingresa un número válido de operaciones.");

        return;

    }


    const fecha = new Date();

    const fechaTexto =
        fecha.toLocaleDateString("es-CO");


    const registro = {

        fecha: fechaTexto,

        resultado: resultado,

        operaciones: operaciones

    };


    historial.push(registro);

    guardarDatos();

    resultadoInput.value = "";

    operacionesInput.value = "";

    actualizarPantalla();

}


function actualizarPantalla() {

    const capitalActual =
        obtenerCapitalActual();


    const resultadoTotal =
        historial.reduce(
            (total, registro) =>
                total + registro.resultado,
            0
        );


    const operacionesTotales =
        historial.reduce(
            (total, registro) =>
                total + registro.operaciones,
            0
        );


    const rentabilidad =
        ((capitalActual - CAPITAL_INICIAL)
        / CAPITAL_INICIAL) * 100;


    document.getElementById("capital")
        .textContent =
        "$" + capitalActual.toFixed(2);


    document.getElementById("gananciaTotal")
        .textContent =
        formatoDinero(resultadoTotal);


    document.getElementById("totalOperaciones")
        .textContent =
        operacionesTotales;


    document.getElementById("diasRegistrados")
        .textContent =
        historial.length;


    document.getElementById("rentabilidad")
        .textContent =
        rentabilidad.toFixed(2) + "%";


    mostrarResultadoHoy();

    mostrarHistorial();

}


function mostrarResultadoHoy() {

    const hoy =
        new Date().toLocaleDateString("es-CO");


    const registrosHoy =
        historial.filter(
            registro => registro.fecha === hoy
        );


    const resultadoHoy =
        registrosHoy.reduce(
            (total, registro) =>
                total + registro.resultado,
            0
        );


    const operacionesHoy =
        registrosHoy.reduce(
            (total, registro) =>
                total + registro.operaciones,
            0
        );


    const elemento =
        document.getElementById("resultado");


    elemento.textContent =
        formatoDinero(resultadoHoy);


    document.getElementById("operaciones")
        .textContent =
        operacionesHoy;


    const texto =
        document.getElementById("resultadoTexto");


    if (resultadoHoy > 0) {

        elemento.className = "profit";

        texto.textContent =
            "Ganancia del día";

        texto.className = "profit";

    }

    else if (resultadoHoy < 0) {

        elemento.className = "loss";

        texto.textContent =
            "Pérdida del día";

        texto.className = "loss";

    }

    else {

        elemento.className = "";

        texto.textContent =
            "Sin resultado";

    }

}


function mostrarHistorial() {

    const tabla =
        document.getElementById("historial");


    tabla.innerHTML = "";


    [...historial]
        .reverse()
        .forEach((registro, index) => {

            const fila =
                document.createElement("tr");


            const clase =
                registro.resultado >= 0
                    ? "profit"
                    : "loss";


            const capitalHastaEseMomento =
                historial
                    .slice(
                        0,
                        historial.indexOf(registro) + 1
                    )
                    .reduce(
                        (capital, item) =>
                            capital + item.resultado,
                        CAPITAL_INICIAL
                    );


            fila.innerHTML = `

                <td>${registro.fecha}</td>

                <td class="${clase}">
                    ${formatoDinero(registro.resultado)}
                </td>

                <td>
                    ${registro.operaciones}
                </td>

                <td>
                    $${capitalHastaEseMomento.toFixed(2)}
                </td>

            `;


            tabla.appendChild(fila);

        });

}


function formatoDinero(numero) {

    if (numero >= 0) {

        return "+$" + numero.toFixed(2);

    }

    return "-$" + Math.abs(numero).toFixed(2);

}


function borrarHistorial() {

    if (
        historial.length > 0 &&
        confirm("¿Quieres borrar todo el historial?")
    ) {

        historial = [];

        guardarDatos();

        actualizarPantalla();

    }

}


function mostrarFecha() {

    const fecha =
        new Date();

    document.getElementById("fecha")
        .textContent =
        fecha.toLocaleDateString(
            "es-CO",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        ).toUpperCase();

}


mostrarFecha();

actualizarPantalla();
