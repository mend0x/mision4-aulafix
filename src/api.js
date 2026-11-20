
import { z } from "zod";
import { esquemaRegistro } from "./schemas.js";

const API = "http://localhost:3001/incidencias";

// GET: Obtener las incidencias registradas
export async function obtenerIncidencias() {
    const respuesta = await fetch(API);

    if (!respuesta.ok) {
        throw new Error("Error al obtener incidencias");
    }

    const datos = await respuesta.json();

    // BONUS: Validar la respuesta de la API con Zod
    const resultado = z.array(esquemaRegistro).safeParse(datos);

    if (!resultado.success) {
        console.error(resultado.error);
        throw new Error("La API ha devuelto incidencias con datos corruptos");
    }

    return datos;
}

// POST: Registrar una nueva incidencia
export async function crearIncidencia(datos) {
    const respuesta = await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
        throw new Error("Error al registrar la incidencia");
    }

    return respuesta.json();
}
