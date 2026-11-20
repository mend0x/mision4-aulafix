import Formulario from "./components/Formulario.jsx";
import ListaIncidencias from "./components/ListaIncidencias.jsx";

export default function App() {
    return (
        <main>
            <h1>AulaFix</h1>
            <p>Gestión de incidencias de U-tad</p>

            <Formulario />

            <hr />

            <ListaIncidencias />
        </main>
    );
}