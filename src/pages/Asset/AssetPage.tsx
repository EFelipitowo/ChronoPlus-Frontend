import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../../pages/styles/style.css"
import TopBar_l from '../../components/layout/TopBar_logged';
import Table from '../../components/ui/Table';
import type { DataItem, ColumnConfig } from "../../components/ui/Table";
import { getAssetData, getAssetEvents, getAssetFiles, downloadAssetFile, uploadAssetFile } from '../../services/assetService';
import type { ApiSingleResponse, Asset, AssetEvent, AssetFile } from '../../services/assetService'
import UploadFilePopup from '../../components/layout/UploadFilePopup';

// Definimos los tipos TypeScript para nuestros datos
export interface EquipmentData {
    tag: string;
    codigoCEN: string;
    codigoSAP: string;
    codigoNEMA: string;
    estado: string;
    marca: string;
    modelo: string;
    serie: string;
    anoAntiguedad: number;
    familia: string;
    empresa: string;
    subestacion: string;
    latitud: number;
    longitud: number;
    observaciones: string;
    tensionCod: string;
    frecuencia?: string;
    peso?: string;
    corriente: string;
    anoFabricacion: number;
    bil: string;
    tipo: string;
    jsonData: Record<string, any> | string;
}



const formatTimestamp = (timestamp: string | number | Date | undefined | null) => {
    if (!timestamp) return "-";
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString("es-CL", {
        timeZone: "America/Santiago",  // Adjust to your time zone
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
};


const AssetPage: React.FC = () => {
    const { id } = useParams<string>();

    const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null);
    const [metadata, setMetaData] = useState<ApiSingleResponse<Asset>["metadata"] | null>(null);
    const [events, setEvents] = useState<AssetEvent[]>([]);
    const [eventsMetadata, setEventsMetadata] = useState<ApiSingleResponse<Asset>["metadata"] | null>(null);

    const [activeTab, setActiveTab] = useState<number>(1);
    const [filteredData, setFilteredData] = useState<DataItem[]>([]);
    const [sortField, setSortField] = useState<string | number>('modificado_en');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const [files, setFiles] = useState<AssetFile[]>([]);

    // Estados para el modal de subida
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadDescription, setUploadDescription] = useState("");
    const [uploadCategory, setUploadCategory] = useState("");
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false); 

    const handleFileUpload = async () => {
        if (!uploadFile || !equipmentData?.tag) {
            alert("Por favor selecciona un archivo.");
            return;
        }

        try {
            setUploading(true);
            await uploadAssetFile(
                equipmentData.tag,
                uploadFile,
                uploadDescription,
                uploadCategory
            );

            // Cerrar modal y recargar archivos
            setShowUploadModal(false);
            setUploadFile(null);
            setUploadDescription("");
            setUploadCategory("");

            // Recargar la lista de archivos
            const { items } = await getAssetFiles(equipmentData.tag);
            setFiles(items || []);

            alert("Archivo subido exitosamente");
        } catch (err) {
            console.error("Error al subir archivo:", err);
            alert("Error al subir el archivo. Por favor, inténtelo nuevamente.");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        async function fetchAssetFiles() {
            if (!id) return;
            try {
                const { items, metadata } = await getAssetFiles(id);
                setFiles(items || []);
            } catch (err) {
                console.error("Error fetching asset files", err);
            }
        }
        fetchAssetFiles();
    }, [id]);


    const fileColumns: ColumnConfig<AssetFile>[] = [
        {
            key: 'nombre',
            label: 'Nombre de archivo',
            sortable: true,
            customRender: (value, row) => (
                <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    {value}
                </a>
            )
        },
        {
            key: 'tipo_archivo',
            label: 'Tipo de archivo',
            sortable: true,
        },
        {
            key: 'categoria',
            label: 'Categoria',
            sortable: true,
        },
        {
            key: 'subido_en',
            label: 'Fecha de subida',
            sortable: true,
            customRender: (value) => formatTimestamp(value)
        },
        {
            key: 'download',
            label: 'Acciones',
            customRender: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            try {
                                const { blob, filename } = await downloadAssetFile(row.id); // or row.file_id

                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                            } catch (err) {
                                console.error('Error al descargar el archivo:', err);
                                alert('Hubo un error al descargar el archivo.');
                            }
                        }}
                        className="px-3 py-1 text-white text-sm rounded blue-button"
                    >
                        Descargar
                    </button>
                    <button className='clean-button text-white'>
                        &times;
                    </button>
                </div>
            )
        }

    ];
    useEffect(() => {
        if (equipmentData?.tag) {
            document.title = `${equipmentData.tag} - Detalle del Activo`;
        } else {
            document.title = "Cargando activo...";
        }
    }, [equipmentData]);

    useEffect(() => {
        async function fetchAssetEvents() {
            if (!id) return;
            try {
                const { items, metadata } = await getAssetEvents(id);
                console.log(items);
                setEvents(items);
                setEventsMetadata(metadata);
            } catch (err) {
                console.error("Error fetching asset events", err);
            }
        }
        async function fetchEquipmentData() {
            try {
                if (!id) return;

                setLoading(true);

                const { items, metadata } = await getAssetData(id);
                // Map APIAsset to EquipmentData
                const asset: EquipmentData = {
                    tag: items.tag?.toString() || "N/A",
                    codigoCEN: items.codigo_cen?.toString() || "N/A",
                    codigoSAP: items.codigo_sap?.toString() || "N/A",
                    codigoNEMA: items.codigo_nema?.toString() || "N/A",
                    estado: items.tag_estado || "N/A",
                    marca: items.tag_marca || "N/A",
                    modelo: items.tag_modelo?.toString() || "N/A",
                    serie: items.tag_no_serie?.toString() || "N/A",
                    anoAntiguedad: Number(items.tag_antiguedad) || 0,
                    familia: items.tag_tipo_cod?.toString() || "N/A",
                    empresa: items.empresa || "N/A",
                    subestacion: items.nombre_subestacion || "N/A",
                    observaciones: items.observaciones?.toString() || "N/A",
                    tensionCod: items.tag_t_alta?.toString() || "N/A",
                    corriente: items.tag_corriente?.toString() || "N/A",
                    anoFabricacion: Number(items.tag_annofab) || 0,
                    bil: items.tag_bil?.toString() || "N/A",
                    tipo: items.tag_tipo?.toString() || "N/A",
                    latitud: items.latitud, //Arreglar este
                    longitud: items.longitud,//Arreglar este
                    frecuencia: items.frecuencia?.toString(),
                    peso: items.tag_peso?.toString(),
                    jsonData: items.json_datos // Agregar campos restantes, y arreglar datos adicionales 
                    // Agregar campos restantes, y arreglar datos adicionales
                };
                setEquipmentData(asset);
            } catch (err) {
                setError("Error al cargar activo")
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        if (id) {
            fetchEquipmentData();
            fetchAssetEvents();
        }
    }, [id]
    );

    useEffect(() => {
        setFilteredData(events);
    }, [events]);


    const tableColumns: ColumnConfig<AssetEvent>[] = [
        { key: 'empresa', label: 'Empresa', sortable: true },
        { key: 'subestacion', label: 'Subestación', sortable: true },
        { key: 'estado_menor', label: 'Estado', sortable: true },
        { key: 'observacion', label: 'Observaciones', sortable: true },
        { key: 'encargado', label: 'Encargado', sortable: true },
        {
            key: 'ocurrencia_evento',
            label: 'Modificado en',
            sortable: true,
            customRender: (value) => formatTimestamp(value)
        }
    ];

    // Función para manejar el ordenamiento
    const handleSort = (field: string | number, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);

        const sortedData = [...filteredData].sort((a, b) => {
            if (a[field]! < b[field]!) {
                return direction === 'asc' ? -1 : 1;
            }
            if (a[field]! > b[field]!) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setFilteredData(sortedData);
    };
    // Early returns for loading/error/null
    if (loading) {
        return (
            <div className="">
                <div className="top-0 left-0 justify-center shadow-md z-50 ">
                    <TopBar_l />
                </div>
                <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 w-full max-w-sm mx-auto mt-20 shadow">
                    <p className=" text-center">Cargando activo...</p>
                </div>

            </div>
        )
    }
    if (error) return <p className="mt-20 text-center text-red-600">{error}</p>;
    if (!equipmentData) return <p className="mt-20 text-center">Activo no encontrado</p>;

    return (
        <>
            <div className="top-0 left-0 justify-center shadow-md z-50 ">
                <TopBar_l></TopBar_l>
            </div>
            <div className="max-w-4xl mt-26 mx-auto p-6 bg-white rounded-lg shadow-md border-1 border-black">

                {/* Encabezado con TAG */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">TAG: {equipmentData.tag}</h1>
                    <p className="text-gray-600 mt-1">Familia: {equipmentData.familia}</p>
                </div>

                {/* Pestañas */}
                <div className="mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`py-2 px-4 text-sm tab-button ${activeTab === 1 ? 'active' : ''}`}
                            onClick={() => setActiveTab(1)}
                        >
                            Información General
                        </button>
                        <button
                            className={`py-2 px-4 text-sm tab-button ${activeTab === 2 ? 'active' : ''}`}
                            onClick={() => setActiveTab(2)}
                        >
                            Especificaciones Técnicas
                        </button>
                        <button
                            className={`py-2 px-4 text-sm tab-button ${activeTab === 3 ? 'active' : ''}`}
                            onClick={() => setActiveTab(3)}
                        >
                            Datos Adicionales
                        </button>
                        <button
                            className={`py-2 px-4 text-sm tab-button ${activeTab === 4 ? 'active' : ''}`}
                            onClick={() => setActiveTab(4)}
                        >
                            Archivos
                        </button>
                    </div>
                </div>

                {/* Contenido de las pestañas */}
                <div className="tab-content">
                    {activeTab === 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Código CEN</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.codigoCEN}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Código SAP</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.codigoSAP}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Código NEMA</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.codigoNEMA}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Estado</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.estado}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Marca</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.marca}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Modelo</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.modelo}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Latitud</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.latitud}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Serie</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.serie}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Años de antigüedad</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.anoAntiguedad} años</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Familia</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.familia}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Empresa</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.empresa}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Subestación</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.subestacion}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Observaciones</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.observaciones}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Longitud</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.longitud}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 2 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Tensión (cod)</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.tensionCod}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Frecuencia</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.frecuencia || "50Hz"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Peso</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.peso || "N/A"}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Corriente</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.corriente} A</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Año de fabricación</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.anoFabricacion}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">BIL</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.bil}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Tipo</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipmentData.tipo}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 3 && (
                        <div className="space-y-4">
                            {(() => {
                                // Si jsonData viene como string, intenta parsearlo
                                let data: Record<string, any> = {};
                                try {
                                    data = typeof equipmentData.jsonData === "string"
                                        ? JSON.parse(equipmentData.jsonData)
                                        : equipmentData.jsonData || {};
                                } catch (err) {
                                    console.error("Error al parsear jsonData:", err);
                                }

                                const entries = Object.entries(data);
                                if (entries.length === 0) {
                                    return <p className="text-gray-600">No hay datos por familia para este activo.</p>;
                                }

                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {entries.map(([key, value]) => {
                                            // Normaliza el valor a string para comparación
                                            const stringValue = value?.toString?.().trim?.() || "";

                                            // Verifica si el valor indica "dato no ingresado"
                                            const isMissing = stringValue === "str" || stringValue === "" || value == null;

                                            return (
                                                <div key={key} className="pb-2">
                                                    <label className="block text-sm font-medium text-gray-500">
                                                        {key}
                                                    </label>
                                                    <p
                                                        className={`mt-1 text-sm break-words ${isMissing
                                                            ? "italic text-gray-400"
                                                            : "text-gray-900"
                                                            }`}
                                                    >
                                                        {isMissing
                                                            ? "Dato no ingresado"
                                                            : typeof value === "object"
                                                                ? JSON.stringify(value, null, 2)
                                                                : stringValue}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {activeTab === 4 && (
                        <div className="mt-4">
                            {files.length === 0 ? (
                                <p className="text-gray-600 text-center">No hay archivos asociados a este activo.</p>
                            ) : (
                                <Table<AssetFile>
                                    data={files}
                                    columns={fileColumns}
                                    onSort={(field, direction) => {
                                        const sorted = [...files].sort((a, b) => {
                                            if (a[field]! < b[field]!) return direction === 'asc' ? -1 : 1;
                                            if (a[field]! > b[field]!) return direction === 'asc' ? 1 : -1;
                                            return 0;
                                        });
                                        setFiles(sorted);
                                    }}
                                    sortField={sortField}
                                    sortDirection={sortDirection}
                                />
                            )}

                            {/* Botón para abrir modal */}
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition black-button"
                                >
                                    + Subir Archivo
                                </button>
                            </div>
                            {/* Modal de subida de archivo */}
                            <UploadFilePopup
                                isOpen={showUploadModal}
                                onClose={() => setShowUploadModal(false)}
                                onUploadSuccess={(newFiles) => setFiles(newFiles)}
                                assetTag={equipmentData.tag}
                            />
                        </div>
                    )}
                </div>

            </div>
            <div className="flex items-center mb-8 mt-6 gap-8">
                <div className="flex-grow border-t border-gray-600"></div>
                <div className="bg-white px-4 rounded-2xl border-gray-800">
                    <span className="text-lg font-semibold text-black">Registros Historicos</span>

                </div>
                <button
                    onClick={() => navigate(`/asset/${id}/register-event`)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                >
                    + Registrar Evento
                </button>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
            <div className="relative container mx-auto px-4 py-8 mt-6">
                <Table<AssetEvent>
                    data={filteredData}
                    columns={tableColumns}
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                />
            </div>
        </>
    );
};

export default AssetPage;