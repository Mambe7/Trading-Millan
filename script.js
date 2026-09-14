const SUPABASE_URL = "https://pemasiezuewkboeuudys.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_DveagRUAISleOisJ0B9TjA_fXXSyWJs";

const CAPITAL_INICIAL = 540;

const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
};


// ===============================
// CONEXIÓN CON SUPABASE
// ===============================

async function obtenerHistorial() {

    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/operaciones?select=*&order=fecha.desc,id.desc`,
            {
                method: "GET",
                headers: headers
            }
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el historial");
        }

        return await respuesta.json();

    } catch (error) {

        console.error(error);

        alert("No se pudo conectar con la base de datos.");

        return [];

    }

}


// ===============================
// CAPITAL
// ===============================

function calcularCapital(historial) {

    const resultadoTotal = historial.reduce(
        (total, registro) =>
            total + Number(registro.resultado),
        0
    );

    return CAPITAL_INICIAL + resultadoTotal;

}


// ===============================
// FORMATO DINERO
// ===============================

function formatoDinero(numero) {

    numero = Number(numero);

    if (numero >= 0) {
        return "+$" + numero.toFixed(2);
    }

    return "-$" + Math.abs(numero).toFixed(2);

}


// ===============================
// REGISTRAR RESULTADO
// ===============================

async function registrarResultado() {

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


    const usuario =
        prompt(
            "¿Quién está registrando el resultado?\n\n1 = Juan Millan Grisales\n2 = Edilberto Millan"
        );


    let nombreUsuario;


    if (usuario === "1") {

        nombreUsuario = "Juan Millan Grisales";

    } else if (usuario === "2") {

        nombreUsuario = "Edilberto Millan";

    } else {

        alert("Usuario no válido.");

        return;

    }


    const hoy =
        new Date()
            .toISOString()
            .split("T")[0];


    const nuevoRegistro = {

        fecha: hoy,

        resultado: resultado,

        operaciones: operaciones,

        usuario: nombreUsuario

    };


    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/operaciones`,
            {
                method: "POST",

                headers: {
                    ...headers,
                    "Prefer": "return=representation"
                },

                body: JSON.stringify(nuevoRegistro)

            }
        );


        if (!respuesta.ok) {

            const error =
                await respuesta.text();

            console.error(error);

            alert(
                "No se pudo guardar el resultado."
            );

            return;

        }


        resultadoInput.value = "";

        operacionesInput.value = "";


        alert("Resultado registrado correctamente.");

        actualizarPantalla();


    } catch (error) {

        console.error(error);

        alert(
            "Error de conexión con Supabase."
        );

    }

}


// ===============================
// ACTUALIZAR PANTALLA
// ===============================

async function actualizarPantalla() {

    const historial =
        await obtenerHistorial();


    const capitalActual =
        calcularCapital(historial);


    const resultadoTotal =
        historial.reduce(
            (total, registro) =>
                total + Number(registro.resultado),
            0
        );


    const operacionesTotales =
        historial.reduce(
            (total, registro) =>
                total + Number(registro.operaciones),
            0
        );


    const rentabilidad =
        (
            (capitalActual - CAPITAL_INICIAL)
            / CAPITAL_INICIAL
        ) * 100;


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


    mostrarResultadoHoy(historial);

    mostrarHistorial(historial);

}


// ===============================
// RESULTADO DE HOY
// ===============================

function mostrarResultadoHoy(historial) {

    const hoy =
        new Date()
            .toISOString()
            .split("T")[0];


    const registrosHoy =
        historial.filter(
            registro =>
                registro.fecha === hoy
        );


    const resultadoHoy =
        registrosHoy.reduce(
            (total, registro) =>
                total + Number(registro.resultado),
            0
        );


    const operacionesHoy =
        registrosHoy.reduce(
            (total, registro) =>
                total + Number(registro.operaciones),
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

        texto.className = "";

    }

}


// ===============================
// MOSTRAR HISTORIAL
// ===============================

function mostrarHistorial(historial) {

    const tabla =
        document.getElementById("historial");


    tabla.innerHTML = "";


    let capital = CAPITAL_INICIAL;


    const registros =
        [...historial].reverse();


    registros.forEach(registro => {

        capital += Number(registro.resultado);


        const fila =
            document.createElement("tr");


        const clase =
            Number(registro.resultado) >= 0
                ? "profit"
                : "loss";


        const fecha =
            new Date(
                registro.fecha + "T00:00:00"
            ).toLocaleDateString("es-CO");


        fila.innerHTML = `

            <td>
                ${fecha}
            </td>

            <td class="${clase}">
                ${formatoDinero(registro.resultado)}
            </td>

            <td>
                ${registro.operaciones}
            </td>

            <td>
                $${capital.toFixed(2)}
            </td>

        `;


        tabla.appendChild(fila);

    });

}


// ===============================
// BORRAR HISTORIAL
// ===============================

async function borrarHistorial() {

    const confirmar =
        confirm(
            "¿Seguro que quieres borrar TODO el historial?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/operaciones?id=not.is.null`,
            {
                method: "DELETE",

                headers: headers
            }
        );


        if (!respuesta.ok) {

            alert(
                "No se pudo borrar el historial."
            );

            return;

        }


        actualizarPantalla();


    } catch (error) {

        console.error(error);

        alert(
            "Error de conexión."
        );

    }

}


// ===============================
// FECHA
// ===============================

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
        )
        .toUpperCase();

}


// ===============================
// ACTUALIZACIÓN AUTOMÁTICA
// ===============================

mostrarFecha();

actualizarPantalla();


// Actualiza los datos cada 5 segundos
// mientras terminamos de configurar
// la sincronización en tiempo real.

setInterval(
    actualizarPantalla,
    5000
);
