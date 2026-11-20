import {useQuery} from "@tanstack/react-query";
import {obtenerIncidencias} from "../api.js";

export default function ListaIncidencias(){
    const{data, isPending, isError, error} = useQuery({
        queryKey: ["incidencias"],
        queryFn: obtenerIncidencias,
        retry: false
    })

    //si está pendiente
    if(isPending){
        return <p>Cargando incidencias...</p>
    }
    //Si da error
    if(isError){
        return <p role="alert">Error: {error.message}</p>;
    }
    //Comprobacion de NO incidencias registradas
    if(data.length === 0){
        return <p>Todavía no hay incidencias</p>;
    }

    return(
        <section>
            <h2>Incidencias registradas: </h2>
            <ul>
                {data.map((incidencia) => (
                    <li key={incidencia.id}>
                        <p>{incidencia.aula}</p>
                        <p>{incidencia.categorias}</p>
                        <p>{incidencia.descripcion}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}