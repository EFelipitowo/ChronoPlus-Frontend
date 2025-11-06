import React, { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import ReactDOM from "react-dom";

const DraggablePortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const portal = document.getElementById("dnd-portal") || (() => {
        const el = document.createElement("div");
        el.id = "dnd-portal";
        document.body.appendChild(el);
        return el;
    })();

    return ReactDOM.createPortal(children, portal);
};


interface Field {
    key: string;
    label: string;
}

interface HierarchyEditorProps {
    fields: Field[];
    currentOrder: string[];
    onClose: () => void;
    onSave: (newOrder: string[]) => void;
}

const HierarchyEditor: React.FC<HierarchyEditorProps> = ({
    fields,
    currentOrder,
    onClose,
    onSave,
}) => {
    const [activeFields, setActiveFields] = useState<string[]>(currentOrder);
    const [closing, setClosing] = useState(false); // 👈 estado para animar el cierre
    // Los que no están en la jerarquía actual
    const inactiveFields = useMemo(
        () => fields.map((f) => f.key).filter((key) => !activeFields.includes(key)),
        [fields, activeFields]
    );

    const getFieldLabel = (key: string) =>
        fields.find((f) => f.key === key)?.label || key;

    // 🔁 Función que maneja arrastres entre listas
    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        // Si arrastró dentro de la misma lista
        if (source.droppableId === destination.droppableId) {
            if (source.droppableId === "active") {
                const reordered = Array.from(activeFields);
                const [removed] = reordered.splice(source.index, 1);
                reordered.splice(destination.index, 0, removed);
                setActiveFields(reordered);
            }
            return;
        }

        // Si movió entre listas (activo <-> inactivo)
        if (source.droppableId === "inactive" && destination.droppableId === "active") {
            const newActive = Array.from(activeFields);
            const fieldKey = inactiveFields[source.index];
            newActive.splice(destination.index, 0, fieldKey);
            setActiveFields(newActive);
        }

        if (source.droppableId === "active" && destination.droppableId === "inactive") {
            const newActive = Array.from(activeFields);
            newActive.splice(source.index, 1);
            setActiveFields(newActive);
        }
    };

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            onClose();
        }, 150); // duración igual al tiempo de la animación
    };

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${closing ? "opacity-0" : "opacity-100"
                }`}
            style={{
                backgroundColor: "rgba(0,0,0,0.3)", // igual al UploadFilePopup
            }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div
                className={`bg-white rounded-xl shadow-xl w-[520px] p-5 relative max-h-[80vh] overflow-y-auto scroll-bar-map transform transition-all duration-300 ${closing ? "animate-fadeOutScale" : "animate-fadeInScale"
                    }`}
            >
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Configurar jerarquía de campos
                </h2>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex flex-col gap-5">

                        {/* 🟦 Campos activos */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Campos activos (jerarquía)
                            </h3>
                            <Droppable droppableId="active">
                                {(provided) => (
                                    <ul
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="min-h-[100px] bg-blue-50 border border-blue-200 rounded-lg p-2 space-y-2"
                                    >
                                        {activeFields.map((key, index) => (
                                            <Draggable key={key} draggableId={key} index={index}>
                                                {(provided, snapshot) => {
                                                    const item = (
                                                        <li
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white border rounded-md px-3 py-2 flex justify-between items-center cursor-move transition-transform duration-150 ${snapshot.isDragging
                                                                ? "scale-[1.03] shadow-lg border-blue-400 z-50"
                                                                : "shadow-sm border-blue-300"
                                                                }`}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <span className="text-gray-800 text-sm font-medium">
                                                                {index + 1}. {getFieldLabel(key)}
                                                            </span>
                                                            <span className="text-xs text-gray-400">arrastra ↕</span>
                                                        </li>
                                                    );

                                                    // mientras se arrastra → lo renderiza en el portal (fuera del contenedor con overflow)
                                                    return snapshot.isDragging ? <DraggablePortal>{item}</DraggablePortal> : item;
                                                }}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {activeFields.length === 0 && (
                                            <p className="text-sm text-gray-500 italic text-center py-2">
                                                Arrastra campos aquí
                                            </p>
                                        )}
                                    </ul>
                                )}
                            </Droppable>
                        </div>

                        {/* ⬜ Campos inactivos */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Campos inactivos
                            </h3>
                            <Droppable droppableId="inactive">
                                {(provided) => (
                                    <ul
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="min-h-[100px] bg-gray-50 border border-gray-300 rounded-lg p-2 space-y-2"
                                    >
                                        {inactiveFields.map((key, index) => (
                                            <Draggable key={key} draggableId={key} index={index}>
                                                {(provided, snapshot) => {
                                                    const item = (
                                                        <li
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white border rounded-md px-3 py-2 flex justify-between items-center cursor-move transition-transform duration-150 ${snapshot.isDragging
                                                                    ? "scale-[1.03] shadow-lg border-gray-400 z-50"
                                                                    : "shadow-sm border-gray-300"
                                                                }`}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <span className="text-gray-800 text-sm">{getFieldLabel(key)}</span>
                                                            <span className="text-xs text-gray-400">arrastra ↕</span>
                                                        </li>
                                                    );

                                                    return snapshot.isDragging ? <DraggablePortal>{item}</DraggablePortal> : item;
                                                }}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {inactiveFields.length === 0 && (
                                            <p className="text-sm text-gray-500 italic text-center py-2">
                                                No quedan campos inactivos
                                            </p>
                                        )}
                                    </ul>
                                )}
                            </Droppable>
                        </div>
                    </div>
                </DragDropContext>

                {/* 🔘 Botones */}
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={handleClose}
                        className="px-3 py-1.5 rounded-md text-white hover:text-red-500 focus:text-red-500 text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            onSave(activeFields);
                            handleClose();
                        }}
                        className="px-3 py-1.5 rounded-md bg-blue-600 hover:text-blue-500 text-white text-sm"
                    >
                        Guardar
                    </button>
                </div>
            </div>
            {/* 🔹 Animaciones globales (idénticas al UploadFilePopup) */}
            <style>
                {`
                @keyframes fadeInScale {
                    0% { opacity: 0; transform: scale(0.95) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes fadeOutScale {
                    0% { opacity: 1; transform: scale(1) translateY(0); }
                    100% { opacity: 0; transform: scale(0.95) translateY(10px); }
                }
                .animate-fadeInScale {
                    animation: fadeInScale 0.25s ease-out forwards;
                }
                .animate-fadeOutScale {
                    animation: fadeOutScale 0.25s ease-in forwards;
                }
                `}
            </style>
        </div>
    );
};

export default HierarchyEditor;