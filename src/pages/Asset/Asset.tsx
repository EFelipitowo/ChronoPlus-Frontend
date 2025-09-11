import React, { useState } from 'react';
import "../../pages/styles/style.css"
import TopBar_l from '../../components/layout/TopBar_logged';

// Definimos los tipos TypeScript para nuestros datos
interface EquipmentData {
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
  coordenadas?: string;
  observaciones: string;
  tensionCod: string;
  frecuencia?: string;
  peso?: string;
  corriente: string;
  anoFabricacion: number;
  bil: string;
  tipo: string;
  datosExtra?: Record<string, string>;
}

// Datos de ejemplo basados en la imagen
const equipmentData: EquipmentData = {
  tag: "52A3150A0001",
  codigoCEN: "N/A",
  codigoSAP: "10017M0",
  codigoNEMA: "SDAI",
  estado: "En Servicio, Normal (202)",
  marca: "ALSTOM",
  modelo: "TYPE.GL.313 F1/4031",
  serie: "9523-10-2040394/1",
  anoAntiguedad: 12, // 2024 - 2012
  familia: "INT ALSTOM TIPO GL 313 F1/4031 P",
  empresa: "Chilquinta",
  subestacion: "San Antonio",
  observaciones: "Normal",
  tensionCod: "170 Kv",
  corriente: "3150 A",
  anoFabricacion: 2012,
  bil: "750 KV",
  tipo: "Interruptor",
  datosExtra: {
    "Tensión soportada al rayo": "750 KV",
    "Frecuencia": "50Hz",
    "Corriente corto circuito": "40KA"
  }
};

const Asset: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(1);

  return (
    <>
    <div className="top-0 left-0 justify-center shadow-md z-50 ">
        <TopBar_l></TopBar_l>
    </div>
    <div className="max-w-4xl mt-16 mx-auto p-6 bg-white rounded-lg shadow-md">
        
        {/* Encabezado con TAG */}
        <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">TAG: {equipmentData.tag}</h1>
            <p className="text-gray-600 mt-1">{equipmentData.familia}</p>
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
                <p className="mt-1 text-sm text-gray-900">{equipmentData.corriente}</p>
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
            {equipmentData.datosExtra && Object.entries(equipmentData.datosExtra).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-500">{key}</label>
                <p className="mt-1 text-sm text-gray-900">{value}</p>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-500">Coordenadas</label>
              <p className="mt-1 text-sm text-gray-900">{equipmentData.coordenadas || "No especificadas"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Asset;