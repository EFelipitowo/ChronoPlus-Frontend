// src/pages/Main/GraphPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import "../styles/style.css";
import TopBar_l from "../../components/layout/TopBar_logged";
import type { Asset } from "../../services/assetService";
import { getAllAssets } from "../../services/assetService";
import AssetDetailView from "../../components/ui/AssetDetailView";
import HierarchyEditor from "../../components/layout/HierarchyEditor";

// Tipos
interface GraphNode {
    id: string;
    label: string;
    level: number;
    children?: GraphNode[];
    assets?: Asset[];
}

const HIERARCHY_FIELDS = [
    { key: "nivel3_funcionamiento", label: "Funcionamiento" },
    { key: "tag_marca", label: "Marca" },
    { key: "nivel2_equipo", label: "Tipo de equipo" },
    { key: "empresa", label: "Empresa" },
    { key: "nombre_subestacion", label: "Subestación" },
    { key: "tag_tipo_cod", label: "Familia de equipo" },
    { key: "tag_estado", label: "Estado Menor" },
    { key: "tag_estado_mayor", label: "Estado Mayor" },
    { key: "tag", label: "TAG (Equipo)" }
];

const GraphPage: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hierarchyOrder, setHierarchyOrder] = useState<string[]>([
        "nivel2_equipo",
        "nivel3_funcionamiento",
        "tag_marca"
    ]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
    const [selectedAssetTag, setSelectedAssetTag] = useState<string | null>(null);

    const [showHierarchyEditor, setShowHierarchyEditor] = useState(false);

    const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
        const savedWidth = localStorage.getItem("sidebarWidth");
        return savedWidth ? parseInt(savedWidth, 10) : 320; // 320px = w-80 por defecto
    });

    const [isResizing, setIsResizing] = useState(false);


    useEffect(() => {
        document.title = "Vista Jerárquica";
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = Math.min(Math.max(e.clientX, 200), 600);
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false);
                localStorage.setItem("sidebarWidth", sidebarWidth.toString());
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing, sidebarWidth]);

    // Manejo del arrastre del ancho
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.min(Math.max(e.clientX, 200), 600); // límite entre 200 y 600px
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            localStorage.setItem("sidebarWidth", sidebarWidth.toString());
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        const handleMouseDown = (e: MouseEvent) => {
            if ((e.target as HTMLElement).classList.contains("sidebar-resizer")) {
                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
            }
        };

        document.addEventListener("mousedown", handleMouseDown);
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
        };
    }, [sidebarWidth]);

    // Cargar activos
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setLoading(true);
                const { items } = await getAllAssets([
                    "tag",
                    "tag_brand",
                    "company",
                    "substation_name",
                    "family",
                    "status",
                    "level2_equipment",
                    "level3_functioning",
                    "status_top"
                ]);
                setAssets(items || []);
            } catch (err) {
                console.error("Error al cargar activos:", err);
                setError("Error al cargar los activos");
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    // Construir jerarquía
    const buildHierarchy = (assets: Asset[], levels: string[]): GraphNode[] => {
        const root: GraphNode = { id: "root", label: "Todos los Equipos", level: 0, children: [] };

        for (const asset of assets) {
            let current = root;
            let path = "root";

            for (let i = 0; i < levels.length; i++) {
                const levelKey = levels[i];
                let value = asset[levelKey as keyof Asset];

                // normalizar valor
                if (value === null || value === undefined || value === "") {
                    value = "Sin dato";
                }

                const valueStr = String(value);
                const nodeId = `${path}/${levelKey}:${valueStr}`;

                // buscar hijo por ID
                let child = current.children?.find(c => c.id === nodeId);
                if (!child) {
                    child = {
                        id: nodeId,
                        label: valueStr,
                        level: i + 1,
                        children: []
                    };
                    if (!current.children) current.children = [];
                    current.children.push(child);
                }

                current = child;
                path = nodeId;
            }

            // asociar activo al último nivel
            if (!current.assets) current.assets = [];
            current.assets.push(asset);
        }

        // Función recursiva para ordenar todos los niveles de la jerarquía
        const sortHierarchy = (nodes: GraphNode[]) => {
            nodes.sort((a, b) => a.label.localeCompare(b.label)); // descendente
            for (const node of nodes) {
                if (node.children && node.children.length > 0) {
                    sortHierarchy(node.children);
                }
            }
        };

        if (root.children) {
            sortHierarchy(root.children);
        }

        return root.children ?? [];
    };


    const hierarchyTree = useMemo(() => {
        return buildHierarchy(assets, hierarchyOrder);
    }, [assets, hierarchyOrder]);

    const toggleNode = (id: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const renderNode = (node: GraphNode, depth: number = 0) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const hasAssets = node.assets && node.assets.length > 0;

        return (
            <div key={node.id} className="select-none">
                <div
                    className={`flex items-center gap-2 py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer ${depth === 0 ? "font-semibold" : "font-medium"
                        }`}
                    style={{ paddingLeft: `${depth * 20 + 12}px` }}
                    onClick={() => {
                        if (hasChildren || hasAssets) toggleNode(node.id);
                        if (!hasChildren && node.label !== "Sin dato" && node.label.startsWith("TAG")) {
                            setSelectedAssetTag(node.label); // o node.assets?.[0]?.tag
                        }
                    }}
                >
                    {(hasChildren || hasAssets) && (
                        <span className="text-gray-500 text-sm">
                            {isExpanded ? "▼" : "▶"}
                        </span>
                    )}
                    <span className="flex-1 truncate">{node.label}</span>
                    {(hasChildren || hasAssets) && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                            {hasAssets ? node.assets!.length : node.children!.length}
                        </span>
                    )}
                </div>

                {isExpanded && (
                    <>
                        {hasChildren && node.children!.map(child => renderNode(child, depth + 1))}
                        {hasAssets && node.assets!.map(asset => (
                            <div
                                key={asset.tag}
                                className={`py-1.5 px-2 hover:bg-blue-50 rounded cursor-pointer text-sm ml-${depth + 1}`}
                                style={{ paddingLeft: `${(depth + 1) * 20 + 12}px` }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAssetTag(asset.tag && String(asset.tag).trim() ? String(asset.tag) : null);
                                }}
                            >
                                <span className="truncate">{asset.tag}</span>
                                <span className="text-xs text-gray-500 ml-2">({asset.tag_estado})</span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen ">
                <TopBar_l />
                <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 w-full max-w-sm mx-auto mt-30 shadow">
                    <p className="text-center text-gray-700 font-medium">Cargando activos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopBar_l />
                <div className="pt-16 text-center text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            <>
                <TopBar_l />
            </>
            {/* Sidebar izquierda */}
            <div
                className="bg-white border-r border-gray-200 flex flex-col overflow-hidden relative select-none"
                style={{
                    top: "72px",
                    width: `${sidebarWidth}px`,
                    height: 'calc(100vh - 72px)', // 4rem = altura de TopBar_l (ajusta si es distinto)
                    transition: isResizing ? "none" : "width 0.1s ease-out"
                }}
            >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Jerarquía de Equipos</h2>
                    <button
                        onClick={() => setShowHierarchyEditor(true)}
                        className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md"
                    >
                        Editar
                    </button>
                </div>

                <div className="text-xs text-gray-600 space-y-1 p-4 pt-2 border-b border-gray-200 ">

                    {hierarchyOrder.map((key, idx) => {
                        const field = HIERARCHY_FIELDS.find(f => f.key === key);
                        return (
                            <div key={key}>
                                <span className="font-medium">{idx + 1}.</span> {field?.label}
                            </div>
                        );
                    })}
                </div>

                <div className="flex-1 overflow-y-auto p-2 scroll-bar-map">
                    {hierarchyTree.map(node => renderNode(node))}
                </div>

                <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
                    Total: {assets.length} equipos
                </div>

                <div
                    className="absolute top-0 right-0 w-[3px] h-full cursor-col-resize bg-gradient-to-r from-gray-300 to-gray-400 hover:from-blue-400 hover:to-blue-500 transition-colors"

                    onMouseDown={() => setIsResizing(true)}
                    style={{ opacity: isResizing ? 0.6 : 0.3 }}
                />
            </div>

            {/* Área principal */}
            <div
                className="flex-1 overflow-y-auto relative z-0 "
                style={{
                    height: "calc(100vh)",
                }}
            >
                {selectedAssetTag ? (
                    <AssetDetailView tag={selectedAssetTag} onClose={() => setSelectedAssetTag(null)} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center bg-gray-100 border border-gray-300 rounded-2xl p-4 w-full max-w-sm mx-auto mt-30 shadow">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Vista Jerárquica de Equipos
                            </h2>
                            <p className="text-gray-600">
                                Selecciona un equipo de la barra lateral para ver sus detalles.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {showHierarchyEditor && (
                <HierarchyEditor
                    fields={HIERARCHY_FIELDS}
                    currentOrder={hierarchyOrder}
                    onClose={() => setShowHierarchyEditor(false)}
                    onSave={(newOrder) => setHierarchyOrder(newOrder)}
                />
            )}

        </div>
    );
};

export default GraphPage;