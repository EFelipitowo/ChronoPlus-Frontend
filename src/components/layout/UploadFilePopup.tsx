// src/components/modals/FileUploadModal.tsx
import React, { useState } from 'react';
import { uploadAssetFile, getAssetFiles } from '../../services/assetService';
import type { AssetFile } from '../../services/assetService';

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: (files: AssetFile[]) => void;
    assetTag: string;
}

const UploadFilePopup: React.FC<FileUploadModalProps> = ({
    isOpen,
    onClose,
    onUploadSuccess,
    assetTag
}) => {
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadDescription, setUploadDescription] = useState("");
    const [uploadCategory, setUploadCategory] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async () => {
        if (!uploadFile) {
            alert("Por favor selecciona un archivo.");
            return;
        }
        try {
            setUploading(true);
            await uploadAssetFile(
                assetTag,
                uploadFile,
                uploadDescription,
                uploadCategory
            );
            // Recargar archivos y notificar al padre
            const { items } = await getAssetFiles(assetTag);
            onUploadSuccess(items || []);

            alert("Archivo subido exitosamente");
            onClose(); // cerrar modal
        } catch (err) {
            console.error("Error al subir archivo:", err);
            alert("Error al subir el archivo. Por favor, inténtelo nuevamente.");
        } finally {
            setUploading(false);
            // Resetear campos (opcional, ya que se cierra)
            setUploadFile(null);
            setUploadDescription("");
            setUploadCategory("");
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all duration-300"
                style={{
                    animation: "fadeInScale 0.25s ease-out forwards",
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Subir Archivo</h2>
                    <button
                        onClick={onClose}
                        className="text-red-500 hover:text-white text-xl"
                        aria-label="Cerrar"
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Archivo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Archivo
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        {uploadFile && (
                            <p className="mt-1 text-sm text-gray-600">
                                Seleccionado: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Categoría
                        </label>
                        <input
                            type="text"
                            value={uploadCategory}
                            onChange={(e) => setUploadCategory(e.target.value)}
                            placeholder="Ej: Manual, Certificado, Foto..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            placeholder="Describe brevemente el archivo..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-white rounded hover:text-red-500 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleFileUpload}
                            disabled={!uploadFile || uploading}
                            className={`px-4 py-2 text-white rounded hover:text-green-500 ${!uploadFile || uploading ? "cursor-not-allowed" : ""}`}
                        >
                            {uploading ? "Subiendo..." : "Subir Archivo"}
                        </button>
                    </div>
                </div>

                {/* Animación inline */}
                <style>
                    {`
            @keyframes fadeInScale {
              0% { opacity: 0; transform: scale(0.95) translateY(10px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}
                </style>
            </div>
        </div>
    );
};

export default UploadFilePopup;