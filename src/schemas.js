import {z} from "zod";

export const esquemaRegistro = z.object({
    //uso refine para ejecutar una función personalizada para la comprobación de errores en el campo del aula
    aula: z.string().refine(
        (valor) =>{
            const texto = valor.replace("Aula: ", "").trim(); //trim para eliminar los espacios en blanco
            //Para no aceptar aula vacía
            const numero = Number(texto);
            //Comprobar que el numero está entre 0 y 500
            return texto !== "" && Number.isInteger(numero) && numero >= 0 && numero <= 500;
        },
        {
            error: "Aulas del centro de la 0 a la 500"
        }
    ),
    //Utilizo un enumerado para las categorías de las posibles incidencias
    categorias: z.enum([
        "Pizarra digital",
        "Ordenador",
        "Mobiliario",
        "Monitores",
        "Tabletas gráficas",
        "Otro"
    ]),
    
    //Campo para especificar el problema
    campoOtro: z.string(),

    //Descripcion para la incidencia
    descripcion: z.string().min(
        10,
        "La descriprión debe tener al menos 10 caracteres"
    ),

    //Validacion para el campo del email del estudiante
    //Uso una función perosnalizada para detectar que el mail sea si o si de la u-tad
    email: z.email("Introduce un correo válido").refine(
        (correo) => {
            //Defino las partes del correo y divido cuando llegue el arroba
            const partesCorreo = correo.split("@"); //Se divide en 2 partes
            const nombreApellido = partesCorreo[0].split("."); //Se divide el nombre y apellido ej: (sergio "." mendo)

            return partesCorreo[1] === "live.u-tad.com" && //la cadena introducida [1] sea exactamente igual que la correcta
                nombreApellido.length === 2 && //que haya nombre y apellido
                nombreApellido[0].length > 0 && //Que exista nombre
                nombreApellido[1].length > 0 //Que exista apellido
        },
        {
            error: "Debes utilizar tu correo de la U-TAD"
        }
    )
    
}).refine(
    (datos) => {
        if(datos.categorias === "Otro"){
            return datos.campoOtro.trim().length > 0;
        }
        return true;
    },
    //Comprobación de errores para el campOtro
    {
        error: "Debes de especificar el problema",
        path: ["campoOtro"]
    }

);