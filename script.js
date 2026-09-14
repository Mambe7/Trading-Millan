// ==========================================
// MILLAN TRADING
// Sistema de control de operaciones
// ==========================================


// ==========================================
// CONFIGURACIÓN SUPABASE
// ==========================================

const SUPABASE_URL = "https://pemasiezuewkboeuudys.supabase.co";

const SUPABASE_KEY = "sb_publishable_DveagRUAISleOisJ0B9TjA_fXXSyWJs";

const CAPITAL_INICIAL = 540;

let registros = [];
let capitalChart = null;
let fechaCalendario = new Date();
let usuarioActual = null;


// ==========================================
// INICIAR APLICACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    mostrarFecha();

    await comprobarSesion();

});


// ==========================================
// MOSTRAR FECHA
// ==========================================

function mostrarFecha() {

    const elementoFecha = document.getElementById("fecha");

    if (!elementoFecha) {
        return;
    }

    const ahora = new Date();

    const opciones = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    elementoFecha.textContent =
        ahora.toLocaleDateString("es-CO", opciones).toUpperCase();

}


// ==========================================
// COMPROBAR SESIÓN
// ==========================================

async function comprobarSesion() {

    const accessToken =
        localStorage.getItem("millan_access_token");

    if (!accessToken) {

        mostrarLogin();

        return;
    }

    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/auth/v1/user`,
            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );

        if (!respuesta.ok) {

            localStorage.removeItem("millan_access_token");
            localStorage.removeItem("millan_refresh_token");

            mostrarLogin();

            return;
        }

        usuarioActual = await respuesta.json();

        mostrarAplicacion();

    } catch (error) {

        console.error("Error comprobando sesión:", error);

        mostrarLogin();

    }

}


// ==========================================
// MOSTRAR LOGIN
// ==========================================

function mostrarLogin() {

    const loginScreen =
        document.getElementById("loginScreen");

    const app =
        document.getElementById("app");

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }

    if (app) {
        app.style.display = "none";
    }

}


// ==========================================
// MOSTRAR APLICACIÓN
// ==========================================

async function mostrarAplicacion() {

    const loginScreen =
        document.getElementById("loginScreen");

    const app =
        document.getElementById("app");

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (app) {
        app.style.display = "block";
    }

    await cargarDatos();

}


// ==========================================
// INICIAR SESIÓN
// ==========================================

async function iniciarSesion() {

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const mensaje =
        document.getElementById("loginMessage");

    if (!email || !password) {

        mensaje.textContent =
            "Ingresa tu correo y contraseña.";

        return;
    }

    mensaje.textContent =
        "Iniciando sesión...";

    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            console.error(
                "Error de inicio de sesión:",
                datos
            );

            mensaje.textContent =
                "Correo o contraseña incorrectos.";

            return;
        }

        localStorage.setItem(
            "millan_access_token",
            datos.access_token
        );

        localStorage.setItem(
            "millan_refresh_token",
            datos.refresh_token
        );

        usuarioActual = datos.user;

        mensaje.textContent =
            "Acceso correcto.";

        await mostrarAplicacion();

    } catch (error) {

        console.error("Error:", error);

        mensaje.textContent =
            "No se pudo conectar con el servidor.";

    }

}


// ==========================================
// CERRAR SESIÓN
// ==========================================

async function cerrarSesion() {

    const accessToken =
        localStorage.getItem("millan_access_token");

    if (accessToken) {

        try {

            await fetch(
                `${SUPABASE_URL}/auth/v1/logout`,
                {
                    method: "POST",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${accessToken}`
                    }
                }
            );

        } catch (error) {

            console.error(
                "Error cerrando sesión:",
                error
            );

        }

    }

    localStorage.removeItem("millan_access_token");
    localStorage.removeItem("millan_refresh_token");

    usuarioActual = null;

    mostrarLogin();

}


// ==========================================
// CARGAR DATOS
// ==========================================

async function cargarDatos() {

    const accessToken =
        localStorage.getItem("millan_access_token");

    if (!accessToken) {

        mostrarLogin();

        return;
    }

    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/operaciones?select=*&order=Fecha.asc`,
            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );

        if (!respuesta.ok) {

            const error =
                await respuesta.text();

            console.error(
                "Error cargando datos:",
                error
            );

            return;
        }

        registros = await respuesta.json();

        actualizarInterfaz();

    } catch (error) {

        console.error("Error:", error);

    }

}


// ==========================================
// ACTUALIZAR INTERFAZ
// ==========================================

function actualizarInterfaz() {

    let totalResultado = 0;
    let totalOperaciones = 0;

    registros.forEach(function (registro) {

        totalResultado +=
            Number(registro.Resultado) || 0;

        totalOperaciones +=
            Number(registro.Operaciones) || 0;

    });

    const capitalActual =
        CAPITAL_INICIAL + totalResultado;

    const hoy =
        new Date().toISOString().split("T")[0];

    let resultadoHoy = 0;

    registros.forEach(function (registro) {

        if (registro.Fecha === hoy) {

            resultadoHoy +=
                Number(registro.Resultado) || 0;

        }

    });

    const rentabilidad =
        CAPITAL_INICIAL !== 0
            ? (totalResultado / CAPITAL_INICIAL) * 100
            : 0;

    const capitalElemento =
        document.getElementById("capital");

    const resultadoElemento =
        document.getElementById("resultado");

    const operacionesElemento =
        document.getElementById("operaciones");

    const rentabilidadElemento =
        document.getElementById("rentabilidad");

    if (capitalElemento) {

        capitalElemento.textContent =
            `$${capitalActual.toFixed(2)}`;

    }

    if (resultadoElemento) {

        resultadoElemento.textContent =
            formatearResultado(resultadoHoy);

    }

    if (operacionesElemento) {

        operacionesElemento.textContent =
            totalOperaciones;

    }

    if (rentabilidadElemento) {

        rentabilidadElemento.textContent =
            `${rentabilidad.toFixed(2)}%`;

    }

    mostrarHistorial();

    actualizarEstadisticas();

    actualizarGrafico();

    actualizarCalendario();

}


// ==========================================
// FORMATEAR RESULTADO
// ==========================================

function formatearResultado(valor) {

    const numero =
        Number(valor) || 0;

    if (numero > 0) {

        return `+$${numero.toFixed(2)}`;

    }

    if (numero < 0) {

        return `-$${Math.abs(numero).toFixed(2)}`;

    }

    return "$0.00";

}


// ==========================================
// REGISTRAR RESULTADO
// ==========================================

async function registrarResultado() {

    const accessToken =
        localStorage.getItem("millan_access_token");

    if (!accessToken) {

        mostrarLogin();

        return;
    }

    const gananciaInput =
        document.getElementById("ganancia");

    const operacionesInput =
        document.getElementById("numeroOperaciones");

    const resultado =
        Number(gananciaInput.value);

    const operaciones =
        Number(operacionesInput.value);

    if (isNaN(resultado)) {

        alert("Ingresa un resultado válido.");

        return;
    }

    if (isNaN(operaciones) || operaciones < 1) {

        alert(
            "Ingresa un número de operaciones válido."
        );

        return;
    }

    const hoy =
        new Date().toISOString().split("T")[0];

    let nombreUsuario = "Usuario";

    if (
        usuarioActual &&
        usuarioActual.email
    ) {

        const email =
            usuarioActual.email.toLowerCase();

        if (email.includes("juan")) {

            nombreUsuario =
                "JUAN MILLAN GRISALES";

        } else if (
            email.includes("edilberto")
        ) {

            nombreUsuario =
                "EDILBERTO MILLAN";

        } else {

            nombreUsuario =
                usuarioActual.email;

        }

    }

    const nuevoRegistro = {

        Fecha: hoy,
        Resultado: resultado,
        Operaciones: operaciones,
        Usuario: nombreUsuario

    };

    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/operaciones`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${accessToken}`,
                    "Prefer": "return=representation"
                },

                body: JSON.stringify(nuevoRegistro)
            }
        );

        const datos =
            await respuesta.text();

        if (!respuesta.ok) {

            console.error(
                "Error registrando:",
                datos
            );

            alert(
                "No se pudo registrar el resultado.\n\n" +
                datos
            );

            return;
        }

        gananciaInput.value = "";
        operacionesInput.value = "";

        alert(
            "Resultado registrado correctamente."
        );

        await cargarDatos();

    } catch (error) {

        console.error("Error:", error);

        alert(
            "Error de conexión con Supabase."
        );

    }

}


// ==========================================
// MOSTRAR HISTORIAL
// ==========================================

function mostrarHistorial() {

    const historial =
        document.getElementById("historial");

    if (!historial) {
        return;
    }

    historial.innerHTML = "";

    const registrosOrdenados =
        [...registros].reverse();

    registrosOrdenados.forEach(function (registro) {

        const fila =
            document.createElement("tr");

        const clase =
            Number(registro.Resultado) >= 0
                ? "positive"
                : "negative";

        fila.innerHTML = `

            <td>${registro.Fecha}</td>

            <td>${registro.Usuario || "Usuario"}</td>

            <td class="${clase}">
                ${formatearResultado(registro.Resultado)}
            </td>

            <td>${registro.Operaciones}</td>

        `;

        historial.appendChild(fila);

    });

}


// ==========================================
// ESTADÍSTICAS
// ==========================================

function actualizarEstadisticas() {

    let totalGanancia = 0;
    let totalOperaciones = 0;

    const dias = new Set();

    registros.forEach(function (registro) {

        totalGanancia +=
            Number(registro.Resultado) || 0;

        totalOperaciones +=
            Number(registro.Operaciones) || 0;

        if (registro.Fecha) {

            dias.add(registro.Fecha);

        }

    });

    const gananciaElemento =
        document.getElementById("gananciaTotal");

    const operacionesElemento =
        document.getElementById("totalOperaciones");

    const diasElemento =
        document.getElementById("diasRegistrados");

    if (gananciaElemento) {

        gananciaElemento.textContent =
            formatearResultado(totalGanancia);

    }

    if (operacionesElemento) {

        operacionesElemento.textContent =
            totalOperaciones;

    }

    if (diasElemento) {

        diasElemento.textContent =
            dias.size;

    }

}


// ==========================================
// GRÁFICO
// ==========================================

function actualizarGrafico() {

    const canvas =
        document.getElementById("capitalChart");

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {

        console.warn(
            "Chart.js no está cargado."
        );

        return;
    }

    const acumuladoPorFecha = {};

    let acumulado =
        CAPITAL_INICIAL;

    registros.forEach(function (registro) {

        const fecha =
            registro.Fecha;

        const resultado =
            Number(registro.Resultado) || 0;

        acumulado += resultado;

        acumuladoPorFecha[fecha] =
            acumulado;

    });

    const fechas =
        Object.keys(acumuladoPorFecha);

    const capitales =
        fechas.map(function (fecha) {

            return acumuladoPorFecha[fecha];

        });

    if (capitalChart) {

        capitalChart.destroy();

    }

    capitalChart = new Chart(
        canvas,
        {
            type: "line",

            data: {

                labels: fechas,

                datasets: [
                    {
                        label: "Capital",

                        data: capitales,

                        tension: 0.3,

                        fill: false
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }
    );

}


// ==========================================
// CALENDARIO
// ==========================================

function actualizarCalendario() {

    const calendario =
        document.getElementById("calendarioDias");

    const titulo =
        document.getElementById("mesActual");

    if (!calendario || !titulo) {
        return;
    }

    const año =
        fechaCalendario.getFullYear();

    const mes =
        fechaCalendario.getMonth();

    const nombresMeses = [

        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE"

    ];

    titulo.textContent =
        `${nombresMeses[mes]} ${año}`;

    calendario.innerHTML = "";

    const primerDia =
        new Date(año, mes, 1);

    let diaSemana =
        primerDia.getDay();

    if (diaSemana === 0) {
        diaSemana = 7;
    }

    const ultimoDia =
        new Date(año, mes + 1, 0).getDate();

    for (
        let i = 1;
        i < diaSemana;
        i++
    ) {

        const espacio =
            document.createElement("div");

        espacio.className =
            "calendar-day empty";

        calendario.appendChild(
            espacio
        );

    }

    for (
        let dia = 1;
        dia <= ultimoDia;
        dia++
    ) {

        const elemento =
            document.createElement("div");

        elemento.className =
            "calendar-day";

        const numeroDia =
            document.createElement("span");

        numeroDia.className =
            "day-number";

        numeroDia.textContent =
            dia;

        elemento.appendChild(
            numeroDia
        );

        const mesTexto =
            String(mes + 1).padStart(2, "0");

        const diaTexto =
            String(dia).padStart(2, "0");

        const fecha =
            `${año}-${mesTexto}-${diaTexto}`;

        let resultadoDia = 0;
        let operacionesDia = 0;

        registros.forEach(function (registro) {

            if (registro.Fecha === fecha) {

                resultadoDia +=
                    Number(registro.Resultado) || 0;

                operacionesDia +=
                    Number(registro.Operaciones) || 0;

            }

        });

        if (resultadoDia > 0) {

            elemento.classList.add(
                "positive"
            );

        } else if (resultadoDia < 0) {

            elemento.classList.add(
                "negative"
            );

        } else {

            elemento.classList.add(
                "neutral"
            );

        }

        if (resultadoDia !== 0) {

            const resultado =
                document.createElement("small");

            resultado.textContent =
                formatearResultado(resultadoDia);

            elemento.appendChild(
                resultado
            );

            const operaciones =
                document.createElement("small");

            operaciones.textContent =
                `${operacionesDia} ops`;

            elemento.appendChild(
                operaciones
            );

        }

        calendario.appendChild(
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
            "¿Seguro que quieres borrar todo el historial?"
        );

    if (!confirmar) {
        return;
    }

    const accessToken =
        localStorage.getItem("millan_access_token");

    if (!accessToken) {

        mostrarLogin();

        return;
    }

    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/operaciones?id=not.is.null`,
            {
                method: "DELETE",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );

        if (!respuesta.ok) {

            const error =
                await respuesta.text();

            console.error(
                "Error borrando historial:",
                error
            );

            alert(
                "No se pudo borrar el historial.\n\n" +
                error
            );

            return;
        }

        alert(
            "Historial borrado correctamente."
        );

        await cargarDatos();

    } catch (error) {

        console.error("Error:", error);

        alert(
            "Error de conexión."
        );

    }

}


// ==========================================
// FUNCIONES GLOBALES
// ==========================================

window.iniciarSesion =
    iniciarSesion;

window.cerrarSesion =
    cerrarSesion;

window.registrarResultado =
    registrarResultado;

window.borrarHistorial =
    borrarHistorial;

window.actualizarCalendario =
    actualizarCalendario;

window.mesAnterior =
    mesAnterior;

window.mesSiguiente =
    mesSiguiente;


// ==========================================
// ACTUALIZACIÓN AUTOMÁTICA
// ==========================================

setInterval(
    async function () {

        const token =
            localStorage.getItem(
                "millan_access_token"
            );

        if (token) {

            await cargarDatos();

        }

    },
    5000
);

