import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar_l from "../../components/layout/TopBar_logged";
import { getAssetData } from "../../services/assetService";
import {jwtDecode} from "jwt-decode";

interface TokenPayload {
    id: string;
    email: string;
    exp: number;
    iat: number;
}

interface AssetData {
    id: string;
    tag: string;
    estadoMayor: string;
    estadoMenor: string;
    empresa: string;
    subestacion: string;
    encargado: string;
    observaciones: string;
}

interface Empresa {
    //id: number;
    //nombre: string;
    empresa : string
}

interface Subestacion {
    nombre_subestacion : string;
}

interface Encargado {
    user_id: string;
    nombre_usuario: string;

}

// Definir los estados menores por cada estado mayor
const estadosMenoresPorMayor: Record<string, Array<{ value: string, label: string }>> = {

    "100": [ // En Proyecto
        { value: "102", label: "102 - En Cotización" },
        { value: "103", label: "103 - En Diseño" },
        { value: "104", label: "104 - En Fábrica" },
        { value: "105", label: "105 - En Acopio, Reserva Proyecto" },
        { value: "106", label: "106 - En Montaje" },
        { value: "107", label: "107 - P.E.S." },
        { value: "108", label: "108 - Declarado C.E.N." },
        { value: "109", label: "109 - De Alta Contable" },
        { value: "110", label: "110 - Tag Anulado" }
    ],
    "200": [ // En Servicio
        { value: "201", label: "201 - Activo Heredado" },
        { value: "202", label: "202 - Normal" },
        { value: "203", label: "203 - Monitoreo" },
        { value: "204", label: "204 - Reserva en Frío" },
        { value: "205", label: "205 - Equipo Nuevo de Reemplazo" },
        { value: "206", label: "206 - Nueva Incorporación" },
        { value: "207", label: "207 - Rotación de Equipo" },
        { value: "208", label: "208 - Equipo Repotenciado" },
        { value: "209", label: "209 - Componente Dependiente" },
        { value: "210", label: "210 - Reserva en Caliente" }
    ],
    "300": [ // Fuera de Servicio
        { value: "301", label: "301 - En Falla" },
        { value: "302", label: "302 - En Fábrica (xMant)" },
        { value: "303", label: "303 - En Acopio Subestación (Pool)" },
        { value: "304", label: "304 - Sin Repuestos" }
    ],
    "400": [ // Fin Vida Útil
        { value: "401", label: "401 - Por Obsolecencia Tecnológica" },
        { value: "402", label: "402 - Por Riesgo Ambiental" },
        { value: "403", label: "403 - Chatarra" },
        { value: "404", label: "404 - Reutilización de Componente" },
        { value: "405", label: "405 - Dado de Baja Contable" }
    ],
    "500": [ // Tag Modificado
        { value: "501", label: "501 - Tag Corregido" },
        { value: "502", label: "502 - Tag Eliminado por Equipos Fin de Vida Útil" },
        { value: "503", label: "503 - Tag Eliminado por Error de Creación" },
        { value: "504", label: "504 - Tag Eliminado por Equipo Repotenciado" }
    ]
};

const FormAsset: React.FC = () => {
    const { id } = useParams< string >();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(true);
    const [assetData, setAssetData] = useState<AssetData | null>(null);
    const [estadosMenores, setEstadosMenores] = useState<Array<{ value: string, label: string }>>([]);

    const token = localStorage.getItem('token');

    // Estados para datos desde API
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [subestaciones, setSubestaciones] = useState<Subestacion[]>([]);
    const [encargados, setEncargados] = useState<Encargado[]>([]);

    // Estados para autocompletado de encargado
    const [showEncargadoSuggestions, setShowEncargadoSuggestions] = useState(false);
    const [filteredEncargados, setFilteredEncargados] = useState<Encargado[]>([]);
    const [selectedEncargadoId, setSelectedEncargadoId] = useState<string>("");


    const [formData, setFormData] = useState({
        estadoMayor: "",
        estadoMenor: "",
        empresa: "",
        subestacion: "",
        encargado: "",
        observaciones: ""
    });


    // Función para obtener datos de la API
    const fetchDataFromAPI = async () => {
        try {
            setLoadingData(true);

            // Obtener encargados
            const encargadosResponse = await fetch('http://localhost:3000/api/users', {
                headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                        }
            });
            const encargadosData = await encargadosResponse.json();
            setEncargados(encargadosData);

            // Obtener empresas
            const empresasResponse = await fetch('http://localhost:3000/api/companies', {
                headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                        }
            });
            const empresasData = await empresasResponse.json();
            setEmpresas(empresasData);

            // Obtener subestaciones
            const subestacionesResponse = await fetch('http://localhost:3000/api/substations', {
                headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                        }
            });
            const subestacionesData = await subestacionesResponse.json();
            setSubestaciones(subestacionesData);



        } catch (error) {
            console.error("Error fetching data from API:", error);
        } finally {
            setLoadingData(false);
        }
    };

    // Filtrar encargados según el texto ingresado
    const filterEncargados = (searchText: string) => {
        if (!searchText) {
            setFilteredEncargados([]);
            setShowEncargadoSuggestions(false);
            return;
        }

        const filtered = encargados.filter(encargado =>
            encargado.nombre_usuario.toLowerCase().includes(searchText.toLowerCase())
        );

        setFilteredEncargados(filtered);
        setShowEncargadoSuggestions(filtered.length > 0);
    };

    // Seleccionar un encargado de la lista de sugerencias
    const selectEncargado = (encargado: Encargado) => {
        setFormData(prev => ({
            ...prev,
            encargado: encargado.nombre_usuario
        }));
        //setSelectedEncargadoId(encargado.user_id.toString());
        setSelectedEncargadoId(encargado.nombre_usuario);
        setShowEncargadoSuggestions(false);
    };

    // Token check y redirección si no está autenticado
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
        try {
            const decoded = jwtDecode<TokenPayload>(token);
            if (decoded.email) {
                setFormData((prev) => ({
                    ...prev,
                    encargado: decoded.email.split('@')[0] // encargado inicial
                }));
            }
        } catch (err) {
            console.error("Invalid token:", err);
            navigate("/login");
        }        
    }, [token, navigate]);


    // Actualizar estados menores cuando cambia el estado mayor
    useEffect(() => {

        if (formData.estadoMayor) {
            const nuevosEstadosMenores = estadosMenoresPorMayor[formData.estadoMayor] || [];
            setEstadosMenores(nuevosEstadosMenores);

            if (nuevosEstadosMenores.length > 0 && !nuevosEstadosMenores.find(e => e.value === formData.estadoMenor)) {
                setFormData(prev => ({
                    ...prev,
                    estadoMenor: nuevosEstadosMenores[0].value
                }));
            }
        }
    }, [formData.estadoMayor]);

    // Simular carga de datos del activo
    useEffect(() => {
        const fetchAssetData = async () => {
            try {
                // Primero obtener los datos de referencia
                await fetchDataFromAPI();


                const {items, metadata} = await getAssetData(id);
                // Simulación de datos del activo - reemplazar con llamada API real
                //const mockData: AssetData = {
                //    id: id || "1",
                //    tag: id || "52A3150A0001",
                //    estadoMayor: "300",
                //    estadoMenor: "301",
                //    empresa: "1",
                //    subestacion: "49 Verbas Buenas",
                //    encargado: "Juan Pérez", // Ahora usamos el nombre directamente
                //    observaciones: "- Fallo Parte N123\n- Se requiere componentes... para reparar"
                //};

                setAssetData(items);
                setFormData(prev => ({
                    ...prev,
                    estadoMayor: String(items.tag_estado_mayor ?? prev.estadoMayor),
                    estadoMenor: String(items.tag_estado ?? prev.estadoMenor),
                    empresa: String(items.empresa ?? prev.empresa),
                    subestacion: String(items.nombre_subestacion ?? prev.subestacion),
                    encargado: String(items.encargado ?? prev.encargado),
                }));

                // Buscar el ID del encargado por su nombre
                //const encargadoEncontrado = encargados.find(e => e.nombre === mockData.encargado);
                //if (encargadoEncontrado) {
                //    setSelectedEncargadoId(encargadoEncontrado.id.toString());
                //}

                // Inicializar estados menores
                //const estadosIniciales = estadosMenoresPorMayor[mockData.estadoMayor] || [];
                //setEstadosMenores(estadosIniciales);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching asset data:", error);
                setLoading(false);
            }
        };

        fetchAssetData();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Si es el campo encargado, filtrar sugerencias
        if (name === "encargado") {
            filterEncargados(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Validar que se haya seleccionado un encargado válido
            if (!selectEncargado) {
                alert("Por favor, seleccione un encargado válido de la lista de sugerencias");
                return;
            }

            // Preparar datos para enviar
            const dataToSend = {
                tag: id,
                status_top: formData.estadoMayor,
                status_bot: formData.estadoMenor,
                company: formData.empresa,
                substation: formData.subestacion,
                inCharge: selectedEncargadoId,
                observation: formData.observaciones
            };

            console.log("Datos a actualizar:", dataToSend);

            // Enviar a la API
            const response = await fetch(`http://localhost:3000/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    ,"Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                alert("Datos actualizados con éxito!");
                navigate(-1);
            } else {
                throw new Error('Error en la actualización');
            }

        } catch (error) {
            console.error("Error updating asset:", error);
            alert("Error al actualizar los datos");
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (loading || loadingData) {
        return (
            <div className="min-h-screen">
                <div className="top-0 left-0 justify-center shadow-md z-50 ">
                    <TopBar_l />
                </div>
                <div className="pt-16 container mx-auto px-4 py-8 mt-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <p className="text-lg">Cargando datos...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="top-0 left-0 justify-center shadow-md z-50 ">
                <TopBar_l />
            </div>

            <div className="pt-16 container mx-auto px-4 py-8 mt-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                            Actualizar Activo
                        </h1>
                        <p className="text-center text-gray-600">
                            Registre un del activo eléctrico
                        </p>
                        <div className="text-center mt-4">
                            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                                TAG: {assetData?.tag || id}
                            </span>
                        </div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Estado Mayor */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Estado Mayor
                                </label>
                                <select
                                    name="estadoMayor"
                                    value={formData.estadoMayor}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                                    required
                                >
                                    <option value="">Seleccione estado mayor</option>
                                    <option value="100">100 - En Proyecto</option>
                                    <option value="200">200 - En Servicio</option>
                                    <option value="300">300 - Fuera de Servicio</option>
                                    <option value="400">400 - Fin Vida Útil</option>
                                    <option value="500">500 - Tag Modificado</option>
                                </select>
                            </div>

                            {/* Estado Menor (dinámico) */}
                            {/* Estado Menor (dinámico) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Estado Menor
                                </label>
                                <select
                                    name="estadoMenor"
                                    value={formData.estadoMenor}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                                    required
                                >
                                    {!formData.estadoMayor ? (
                                        // Si NO hay Estado Mayor seleccionado
                                        <option value="" disabled className="italic">
                                            Seleccione un Estado Mayor primero
                                        </option>
                                    ) : (
                                        <>
                                            {estadosMenores.map((estado) => (
                                                <option key={estado.value} value={estado.value}>
                                                    {estado.label}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>


                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Empresa */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Empresa
                                </label>
                                <select
                                    name="empresa"
                                    value={formData.empresa}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                                    required
                                >
                                    <option value="">Seleccione una empresa</option>
                                    {empresas.map(empresa => (
                                        <option key={empresa.empresa} value={empresa.empresa}>
                                            {empresa.empresa}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subestación (dinámica según empresa) */}
                            <div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subestación
                                    </label>
                                    <select
                                        name="subestacion"
                                        value={formData.subestacion}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                                        required
                                    >
                                        <option value="">Seleccione una subestación</option>
                                        {subestaciones.map(subestacion => (
                                            <option key={subestacion.nombre_subestacion} value={subestacion.nombre_subestacion}>
                                                {subestacion.nombre_subestacion}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {!formData.empresa && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Seleccione una empresa primero
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Encargado con autocompletado */}
                        <div className="mb-6 relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Encargado
                            </label>
                            <input
                                type="text"
                                name="encargado"
                                value={formData.encargado}
                                onChange={handleInputChange}
                                placeholder="Escriba el nombre del encargado..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C]"
                                required
                            />

                            {/* Sugerencias de encargados */}
                            {showEncargadoSuggestions && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredEncargados.map(encargado => (
                                        <div
                                            key={encargado.nombre_usuario}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => selectEncargado(encargado)}
                                        >
                                            {encargado.nombre_usuario}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Observaciones */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Observaciones
                            </label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleInputChange}
                                placeholder="Ingrese las observaciones relevantes..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B322C] resize-none"
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex justify-center space-x-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-[#8B322C] text-white rounded-lg hover:bg-[#6B2925] transition font-semibold"
                            >
                                Actualizar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormAsset;