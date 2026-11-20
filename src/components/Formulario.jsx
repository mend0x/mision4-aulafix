
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { esquemaRegistro } from "../schemas.js";
import { crearIncidencia } from "../api.js";

export default function Formulario() {

    // Controla si aparece el campo "Otro"
    const [mostrarOtro, setMostrarOtro] = useState(false);

    // Acceso a la caché de TanStack Query
    const queryClient = useQueryClient();

    // Configuración del formulario
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(esquemaRegistro),
        defaultValues: {
            aula: "",
            categorias: "",
            campoOtro: "",
            descripcion: "",
            email: ""
        }
    });

    // Petición POST para crear una incidencia
    const mutacion = useMutation({
        mutationFn: crearIncidencia,

        onSuccess: () => {
            // Actualizar la lista de incidencias
            queryClient.invalidateQueries({
                queryKey: ["incidencias"]
            });

            // Limpiar el formulario
            reset();
            setMostrarOtro(false);
        }
    });

    // Se ejecuta cuando el formulario es válido
    function onSubmit(datos) {
        mutacion.mutate(datos);
    }

    return (
        <section>
            <h2>Registrar nueva incidencia</h2>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* NÚMERO DE AULA */}
                <div>
                    <label htmlFor="aula">Número de aula</label>

                    <input
                        id="aula"
                        type="text"
                        placeholder="Ej: 203"
                        aria-invalid={!!errors.aula}
                        aria-describedby={errors.aula ? "error-aula" : undefined}
                        {...register("aula")}
                    />

                    {errors.aula && (
                        <p id="error-aula" role="alert">
                            {errors.aula.message}
                        </p>
                    )}
                </div>

                {/* CATEGORÍAS */}
                <div>
                    <label htmlFor="categorias">Categoría</label>

                    <select
                        id="categorias"
                        aria-invalid={!!errors.categorias}
                        {...register("categorias", {
                            onChange: (e) => {
                                setMostrarOtro(e.target.value === "Otro");
                            }
                        })}
                    >
                        <option value="">Selecciona una categoría</option>
                        <option value="Pizarra digital">Pizarra digital</option>
                        <option value="Ordenador">Ordenador</option>
                        <option value="Mobiliario">Mobiliario</option>
                        <option value="Monitores">Monitores</option>
                        <option value="Tabletas gráficas">Tabletas gráficas</option>
                        <option value="Otro">Otro</option>
                    </select>

                    {errors.categorias && (
                        <p role="alert">{errors.categorias.message}</p>
                    )}
                </div>

                {/* CAMPO CONDICIONAL */}
                {mostrarOtro && (
                    <div>
                        <label htmlFor="campoOtro">
                            Especifica el problema
                        </label>

                        <input
                            id="campoOtro"
                            type="text"
                            placeholder="Especifica el tipo de incidencia"
                            aria-invalid={!!errors.campoOtro}
                            {...register("campoOtro")}
                        />

                        {errors.campoOtro && (
                            <p role="alert">
                                {errors.campoOtro.message}
                            </p>
                        )}
                    </div>
                )}

                {/* DESCRIPCIÓN */}
                <div>
                    <label htmlFor="descripcion">
                        Descripción de la incidencia
                    </label>

                    <textarea
                        id="descripcion"
                        placeholder="Describe el problema..."
                        rows="4"
                        aria-invalid={!!errors.descripcion}
                        {...register("descripcion")}
                    />

                    {errors.descripcion && (
                        <p role="alert">
                            {errors.descripcion.message}
                        </p>
                    )}
                </div>

                {/* CORREO UNIVERSITARIO */}
                <div>
                    <label htmlFor="email">Correo universitario</label>

                    <input
                        id="email"
                        type="email"
                        placeholder="nombre.apellido@live.u-tad.com"
                        aria-invalid={!!errors.email}
                        {...register("email")}
                    />

                    {errors.email && (
                        <p role="alert">{errors.email.message}</p>
                    )}
                </div>

                {/* BOTÓN DE ENVÍO */}
                <button
                    type="submit"
                    disabled={isSubmitting || mutacion.isPending}
                >
                    {mutacion.isPending
                        ? "Registrando..."
                        : "Registrar incidencia"}
                </button>

                {/* MENSAJE DE ÉXITO */}
                {mutacion.isSuccess && (
                    <p role="status">
                        Incidencia registrada correctamente.
                    </p>
                )}

                {/* ERROR DEL SERVIDOR */}
                {mutacion.isError && (
                    <p role="alert">
                        Error: {mutacion.error.message}
                    </p>
                )}

            </form>
        </section>
    );
}
