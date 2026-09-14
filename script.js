// ==========================================
// MILLAN TRADING
// Sistema de control de operaciones
// ==========================================


// ==========================================
// CONFIGURACIÓN SUPABASE
// ==========================================

const SUPABASE_URL = "https://pemasiezuewkboeuudys.supabase.co";

const SUPABASE_KEY = "sb_publishable_DveagRUAISleOisJ0B9TjA_fXXSyWJs";

// CAPITAL INICIAL
const CAPITAL_INICIAL = 540;

// VARIABLES GLOBALES
let registros = [];
let capitalChart = null;
let fechaCalendario = new Date();


// ==========================================
// INICIO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        mostrarFecha();

        cargarDatos();

    }
);


// ==========================================
// MOSTRAR FECHA
// ==========================================

function mostrarFecha() {

    const elemento =
        document.getElementById("fechaActual");

    if (!elemento) return;

    const ahora = new Date();

    elemento.textContent =
        ahora.toLocaleDateString(
            "es-CO",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        ).toUpperCase();

}


// ==========================================
// CARGAR DATOS DESDE SUPABASE
// ==========================================

async function cargarDatos() {

    try {

        const respuesta =
            await fetch(
                `${SUPABASE_URL}/rest/v1/operaciones?select=*&order=Fecha.asc`,
                {
                    method: "GET",

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
                "ERROR SUPABASE:",
                error
            );

            return;

        }


        registros =
            await respuesta.json();


        console.log(
            "Registros cargados:",
            registros
        );


        actualizarPanel();

        actualizarHistorial();

        actualizarGrafica();

        actualizarCalendario();


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

    const resultadoInput =
        document.getElementById(
            "resultadoInput"
        );

    const operacionesInput =
        document.getElementById(
            "operacionesInput"
        );


    if (
        !resultadoInput ||
        !operacionesInput
    ) {

        alert(
            "No se encontraron los campos de registro."
        );

        return;

    }


    const resultado =
        Number(
            resultadoInput.value
        );


    const operaciones =
        Number(
            operacionesInput.value
        );


    if (
        isNaN(resultado) ||
        isNaN(operaciones)
    ) {

        alert(
            "Ingresa datos válidos."
        );

        return;

    }


    if (
        operaciones <= 0
    ) {

        alert(
            "La cantidad de operaciones debe ser mayor que 0."
        );

        return;

    }


    const usuario =
        prompt(
            "¿Quién está registrando?\n\n1 = Juan Millan Grisales\n2 = Edilberto Millan"
        );


    let nombreUsuario = "";


    if (
        usuario === "1"
    ) {

        nombreUsuario =
            "JUAN MILLAN GRISALES";

    } else if (
        usuario === "2"
    ) {

        nombreUsuario =
            "EDILBERTO MILLAN";

    } else {

        alert(
            "Usuario no válido."
        );

        return;

    }


    const ahora =
        new Date();


    const año =
        ahora.getFullYear();


    const mes =
        String(
            ahora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            ahora.getDate()
        ).padStart(
            2,
            "0"
        );


    const hoy =
        `${año}-${mes}-${dia}`;


    const nuevoRegistro = {

        Fecha:
            hoy,

        Resultado:
            resultado,

        Operaciones:
            operaciones,

        Usuario:
            nombreUsuario

    };


    try {

        const respuesta =
            await fetch(
                `${SUPABASE_URL}/rest/v1/operaciones`,
                {

                    method:
                        "POST",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "return=minimal"

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
                "ERROR AL REGISTRAR:",
                error
            );

            alert(
                "No se pudo registrar el resultado."
            );

            return;

        }


        alert(
            "Resultado registrado correctamente."
        );


        resultadoInput.value =
            "";

        operacionesInput.value =
            "";


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


    const ahora =
        new Date();


    const hoy =
        `${ahora.getFullYear()}-${String(
            ahora.getMonth() + 1
        ).padStart(
            2,
            "0"
        )}-${String(
            ahora.getDate()
        ).padStart(
            2,
            "0"
        )}`;


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


    const capital =
        document.getElementById(
            "capital"
        );


    if (capital) {

        capital.textContent =
            formatearDinero(
                capitalActual
            );

    }


    const resultado =
        document.getElementById(
            "resultado"
        );


    if (resultado) {

        resultado.textContent =
            formatearDinero(
                resultadoHoy
            );

    }


    const operaciones =
        document.getElementById(
            "operaciones"
        );


    if (operaciones) {

        operaciones.textContent =
            operacionesHoy;

    }


    const rentabilidadElemento =
        document.getElementById(
            "rentabilidad"
        );


    if (rentabilidadElemento) {

        rentabilidadElemento.textContent =
            rentabilidad.toFixed(2) +
            "%";

    }


    const gananciaTotalElemento =
        document.getElementById(
            "gananciaTotal"
        );


    if (gananciaTotalElemento) {

        gananciaTotalElemento.textContent =
            formatearDinero(
                gananciaTotal
            );

    }


    const totalOperaciones =
        document.getElementById(
            "totalOperaciones"
        );


    if (totalOperaciones) {

        totalOperaciones.textContent =
            operacionesTotales;

    }


    const diasUnicos =
        new Set(
            registros.map(
                registro =>
                    registro.Fecha
            )
        );


    const diasRegistrados =
        document.getElementById(
            "diasRegistrados"
        );


    if (diasRegistrados) {

        diasRegistrados.textContent =
            diasUnicos.size;

    }


    const resultadoTexto =
        document.getElementById(
            "resultadoTexto"
        );


    if (!resultadoTexto) return;


    if (
        resultadoHoy > 0
    ) {

        resultadoTexto.textContent =
            "Día positivo 📈";

    } else if (
        resultadoHoy < 0
    ) {

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


    if (!historial) return;


    historial.innerHTML =
        "";


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
                        ? "profit"
                        : "loss"
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


            historial.prepend(
                fila
            );

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


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js no está cargado."
        );

        return;

    }


    capitalChart =
        new Chart(
            canvas,
            {

                type:
                    "line",

                data: {

                    labels:
                        fechas,

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
                                    function (
                                        value
                                    ) {

                                        return (
                                            "$" +
                                            value
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


// ==========================================
// CALENDARIO
// ==========================================

function actualizarCalendario() {

    const contenedor =
        document.getElementById(
            "calendarioDias"
        );


    const titulo =
        document.getElementById(
            "mesActual"
        );


    if (
        !contenedor ||
        !titulo
    ) {

        console.warn(
            "No se encontraron los elementos del calendario."
        );

        return;

    }


    contenedor.innerHTML =
        "";


    const año =
        fechaCalendario.getFullYear();


    const mes =
        fechaCalendario.getMonth();


    const nombreMes =
        fechaCalendario.toLocaleDateString(
            "es-CO",
            {
                month:
                    "long",

                year:
                    "numeric"

            }
        );


    titulo.textContent =
        nombreMes.toUpperCase();


    // ======================================
    // PRIMER DÍA
    // ======================================

    let primerDia =
        new Date(
            año,
            mes,
            1
        ).getDay();


    // Domingo = 0
    // Lunes = 1

    if (
        primerDia === 0
    ) {

        primerDia =
            6;

    } else {

        primerDia =
            primerDia - 1;

    }


    // ======================================
    // CANTIDAD DE DÍAS
    // ======================================

    const cantidadDias =
        new Date(
            año,
            mes + 1,
            0
        ).getDate();


    // ======================================
    // ESPACIOS ANTES DEL DÍA 1
    // ======================================

    for (
        let i = 0;
        i < primerDia;
        i++
    ) {

        const espacio =
            document.createElement(
                "div"
            );


        espacio.className =
            "calendar-day empty";


        contenedor.appendChild(
            espacio
        );

    }


    // ======================================
    // CREAR DÍAS
    // ======================================

    for (
        let dia = 1;
        dia <= cantidadDias;
        dia++
    ) {

        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "calendar-day";


        // NÚMERO DEL DÍA

        const numero =
            document.createElement(
                "div"
            );


        numero.className =
            "calendar-number";


        numero.textContent =
            dia;


        elemento.appendChild(
            numero
        );


        // FECHA

        const fecha =
            `${año}-${String(
                mes + 1
            ).padStart(
                2,
                "0"
            )}-${String(
                dia
            ).padStart(
                2,
                "0"
            )}`;


        // BUSCAR REGISTROS

        const registrosDia =
            registros.filter(
                registro =>
                    registro.Fecha ===
                    fecha
            );


        if (
            registrosDia.length >
            0
        ) {

            let resultado =
                0;


            let cantidadOperaciones =
                0;


            registrosDia.forEach(
                registro => {

                    resultado +=
                        Number(
                            registro.Resultado
                        ) || 0;


                    cantidadOperaciones +=
                        Number(
                            registro.Operaciones
                        ) || 0;

                }
            );


            // RESULTADO

            const resultadoElemento =
                document.createElement(
                    "div"
                );


            resultadoElemento.className =
                "calendar-result";


            resultadoElemento.textContent =
                formatearDinero(
                    resultado
                );


            elemento.appendChild(
                resultadoElemento
            );


            // OPERACIONES

            elemento.title =
                `${cantidadOperaciones} operaciones`;


            // GANANCIA / PÉRDIDA

            if (
                resultado > 0
            ) {

                elemento.classList.add(
                    "positive"
                );

            } else if (
                resultado < 0
            ) {

                elemento.classList.add(
                    "negative"
                );

            }

        }


        // ==================================
        // MARCAR HOY
        // ==================================

        const ahora =
            new Date();


        const hoy =
            `${ahora.getFullYear()}-${String(
                ahora.getMonth() + 1
            ).padStart(
                2,
                "0"
            )}-${String(
                ahora.getDate()
            ).padStart(
                2,
                "0"
            )}`;


        if (
            fecha === hoy
        ) {

            elemento.classList.add(
                "today"
            );

        }


        contenedor.appendChild(
            elemento
        );

    }

}


// ==========================================
// MES ANTERIOR
// ==========================================

function mesAnterior() {

    fechaCalendario.setMonth(
        fechaCalendario.getMonth() - 1
    );


    actualizarCalendario();

}


// ==========================================
// MES SIGUIENTE
// ==========================================

function mesSiguiente() {

    fechaCalendario.setMonth(
        fechaCalendario.getMonth() + 1
    );


    actualizarCalendario();

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

                    method:
                        "DELETE",

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
// FORMATEAR DINERO
// ==========================================

function formatearDinero(valor) {

    const numero =
        Number(valor) || 0;


    if (
        numero >= 0
    ) {

        return (
            "+$" +
            numero.toFixed(2)
        );

    }


    return (
        "-$" +
        Math.abs(
            numero
        ).toFixed(2)
    );

}


// ==========================================
// FORMATEAR FECHA
// ==========================================

function formatearFecha(fecha) {

    if (!fecha) return "";


    const partes =
        fecha.split("-");


    if (
        partes.length !== 3
    ) {

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


// ==========================================
// HACER FUNCIONES DISPONIBLES
// PARA LOS BOTONES DEL HTML
// ==========================================

window.actualizarCalendario =
    actualizarCalendario;

window.mesAnterior =
    mesAnterior;

window.mesSiguiente =
    mesSiguiente;

window.registrarResultado =
    registrarResultado;

window.borrarHistorial =
    borrarHistorial;

