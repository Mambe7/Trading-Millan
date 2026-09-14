// ==========================================
// MILLAN TRADING
// Sistema de control de operaciones
// ==========================================

// CONFIGURACIÓN SUPABASE

const SUPABASE_URL = "https://pemasiezuewkboeuudys.supabase.co";
const SUPABASE_KEY = "sb_publishable_DveagRUAISleOisJ0B9TjA_fXXSyWJs";

const CAPITAL_INICIAL = 540;

let registros = [];
let capitalChart = null;


// ==========================================
// INICIAR SISTEMA
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    mostrarFecha();

    cargarDatos();

});


// ==========================================
// FECHA ACTUAL
// ==========================================

function mostrarFecha() {

    const elementoFecha = document.getElementById("fecha");

    if (!elementoFecha) return;

    const ahora = new Date();

    elementoFecha.textContent = ahora.toLocaleDateString(
        "es-CO",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


// ==========================================
// CARGAR DATOS DE SUPABASE
// ==========================================

async function cargarDatos() {

    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/operaciones?select=*&order=Fecha.asc`,
            {
                method: "GET",

                headers: {

                    "apikey": SUPABASE_KEY,

                    "Authorization": `Bearer ${SUPABASE_KEY}`,

                    "Content-Type": "application/json"

                }
            }
        );


        if (!respuesta.ok) {

            const error = await respuesta.text();

            console.error("ERROR SUPABASE:", error);

            return;

        }


        registros = await respuesta.json();

        console.log("REGISTROS CARGADOS:", registros);


        actualizarPanel();

        actualizarHistorial();

        actualizarGrafica();


    } catch (error) {

        console.error(
            "ERROR AL CARGAR DATOS:",
            error
        );

    }

}


// ==========================================
// REGISTRAR RESULTADO
// ==========================================

async function registrarResultado() {

    const campoGanancia =
        document.getElementById("ganancia");

    const campoOperaciones =
        document.getElementById("numeroOperaciones");


    const resultado =
        parseFloat(campoGanancia.value);

    const operaciones =
        parseInt(campoOperaciones.value);


    if (isNaN(resultado)) {

        alert(
            "Ingresa el resultado del día."
        );

        return;

    }


    if (isNaN(operaciones)) {

        alert(
            "Ingresa el número de operaciones."
        );

        return;

    }


    let nombreUsuario =
        prompt(
            "¿Quién está registrando el resultado?\n\n1 = Juan Millan Grisales\n2 = Edilberto Millan"
        );


    if (nombreUsuario === "1") {

        nombreUsuario =
            "JUAN MILLAN GRISALES";

    } else if (nombreUsuario === "2") {

        nombreUsuario =
            "EDILBERTO MILLAN";

    } else {

        alert(
            "Usuario no válido."
        );

        return;

    }


    const ahora = new Date();


    const hoy =
        ahora.toISOString().split("T")[0];


    const nuevoRegistro = {

        Fecha: hoy,

        Resultado: resultado,

        Operaciones: operaciones,

        Usuario: nombreUsuario

    };


    console.log(
        "REGISTRO QUE SE ENVIARÁ:",
        nuevoRegistro
    );


    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/operaciones`,
            {

                method: "POST",

                headers: {

                    "apikey": SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`,

                    "Content-Type":
                        "application/json",

                    "Prefer":
                        "return=representation"

                },

                body:
                    JSON.stringify(
                        nuevoRegistro
                    )

            }
        );


        if (!respuesta.ok) {

            const error =
                await respuesta.text();

            console.error(
                "ERROR AL GUARDAR:",
                error
            );

            alert(
                "No se pudo guardar el resultado."
            );

            return;

        }


        const datosGuardados =
            await respuesta.json();


        console.log(
            "REGISTRO GUARDADO:",
            datosGuardados
        );


        alert(
            "Resultado registrado correctamente."
        );


        campoGanancia.value = "";

        campoOperaciones.value = "";


        await cargarDatos();


    } catch (error) {

        console.error(
            "ERROR:",
            error
        );

        alert(
            "Ocurrió un error al registrar."
        );

    }

}


// ==========================================
// ACTUALIZAR PANEL
// ==========================================

function actualizarPanel() {

    let gananciaTotal = 0;

    let operacionesTotales = 0;


    registros.forEach(
        registro => {

            gananciaTotal +=
                Number(
                    registro.Resultado
                ) || 0;


            operacionesTotales +=
                Number(
                    registro.Operaciones
                ) || 0;

        }
    );


    const capitalActual =
        CAPITAL_INICIAL +
        gananciaTotal;


    const rentabilidad =
        (
            gananciaTotal /
            CAPITAL_INICIAL
        ) * 100;


    const hoy =
        new Date()
            .toISOString()
            .split("T")[0];


    let resultadoHoy = 0;

    let operacionesHoy = 0;


    registros.forEach(
        registro => {

            if (
                registro.Fecha === hoy
            ) {

                resultadoHoy +=
                    Number(
                        registro.Resultado
                    ) || 0;


                operacionesHoy +=
                    Number(
                        registro.Operaciones
                    ) || 0;

            }

        }
    );


    document.getElementById(
        "capital"
    ).textContent =
        formatearDinero(
            capitalActual
        );


    document.getElementById(
        "resultado"
    ).textContent =
        formatearDinero(
            resultadoHoy
        );


    document.getElementById(
        "operaciones"
    ).textContent =
        operacionesHoy;


    document.getElementById(
        "rentabilidad"
    ).textContent =
        rentabilidad.toFixed(2) + "%";


    document.getElementById(
        "gananciaTotal"
    ).textContent =
        formatearDinero(
            gananciaTotal
        );


    document.getElementById(
        "totalOperaciones"
    ).textContent =
        operacionesTotales;


    const diasUnicos =
        new Set(
            registros.map(
                registro =>
                    registro.Fecha
            )
        );


    document.getElementById(
        "diasRegistrados"
    ).textContent =
        diasUnicos.size;


    const resultadoTexto =
        document.getElementById(
            "resultadoTexto"
        );


    if (resultadoHoy > 0) {

        resultadoTexto.textContent =
            "Día positivo 📈";

    } else if (resultadoHoy < 0) {

        resultadoTexto.textContent =
            "Día negativo 📉";

    } else {

        resultadoTexto.textContent =
            "Sin operaciones";

    }

}


// ==========================================
// HISTORIAL
// ==========================================

function actualizarHistorial() {

    const historial =
        document.getElementById(
            "historial"
        );


    historial.innerHTML = "";


    let capital =
        CAPITAL_INICIAL;


    registros.forEach(
        registro => {

            capital +=
                Number(
                    registro.Resultado
                ) || 0;


            const fila =
                document.createElement(
                    "tr"
                );


            const resultado =
                Number(
                    registro.Resultado
                ) || 0;


            fila.innerHTML = `

                <td>
                    ${formatearFecha(
                        registro.Fecha
                    )}
                </td>

                <td class="${
                    resultado >= 0
                        ? "positivo"
                        : "negativo"
                }">

                    ${formatearDinero(
                        resultado
                    )}

                </td>

                <td>
                    ${registro.Operaciones}
                </td>

                <td>
                    ${formatearDinero(
                        capital
                    )}
                </td>

            `;


            historial.prepend(fila);

        }
    );

}


// ==========================================
// GRÁFICA
// ==========================================

function actualizarGrafica() {

    const canvas =
        document.getElementById(
            "capitalChart"
        );


    if (!canvas) return;


    const fechas = [];

    const capitales = [];


    let capital =
        CAPITAL_INICIAL;


    // Capital inicial

    fechas.push(
        "Inicio"
    );

    capitales.push(
        capital
    );


    registros.forEach(
        registro => {

            capital +=
                Number(
                    registro.Resultado
                ) || 0;


            fechas.push(
                formatearFecha(
                    registro.Fecha
                )
            );


            capitales.push(
                capital
            );

        }
    );


    if (capitalChart) {

        capitalChart.destroy();

    }


    capitalChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: fechas,

                    datasets: [

                        {

                            label:
                                "Capital USD",

                            data:
                                capitales,

                            tension:
                                0.35,

                            fill:
                                true,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                7

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            display:
                                true

                        }

                    },


                    scales: {

                        y: {

                            beginAtZero:
                                false,

                            ticks: {

                                callback:
                                    function(value) {

                                        return "$" +
                                            value;

                                    }

                            }

                        }

                    }

                }

            }
        );

}


// ==========================================
// BORRAR HISTORIAL
// ==========================================

async function borrarHistorial() {

    const confirmar =
        confirm(
            "¿Seguro que quieres borrar TODO el historial?"
        );


    if (!confirmar) return;


    try {

        const respuesta =
            await fetch(
                `${SUPABASE_URL}/rest/v1/operaciones?id=not.is.null`,
                {

                    method: "DELETE",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`

                    }

                }
            );


        if (!respuesta.ok) {

            const error =
                await respuesta.text();

            console.error(
                "ERROR AL BORRAR:",
                error
            );

            alert(
                "No se pudo borrar el historial."
            );

            return;

        }


        alert(
            "Historial eliminado."
        );


        await cargarDatos();


    } catch (error) {

        console.error(
            "ERROR:",
            error
        );

    }

}


// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function formatearDinero(valor) {

    const numero =
        Number(valor) || 0;


    if (numero >= 0) {

        return (
            "+$" +
            numero.toFixed(2)
        );

    }


    return (
        "-$" +
        Math.abs(numero).toFixed(2)
    );

}


function formatearFecha(fecha) {

    if (!fecha) return "";


    const partes =
        fecha.split("-");


    if (partes.length !== 3) {

        return fecha;

    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


// ==========================================
// ACTUALIZACIÓN AUTOMÁTICA
// ==========================================

setInterval(
    cargarDatos,
    5000
);

