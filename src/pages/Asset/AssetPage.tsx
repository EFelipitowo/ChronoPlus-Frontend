//src/pages/Asset/AssetPage.tsx
import React from 'react';
import "../../pages/styles/style.css"
import TopBar_l from '../../components/layout/TopBar_logged';
import AssetDetailView from '../../components/ui/AssetDetailView';

// Definimos los tipos TypeScript para nuestros datos

const AssetPage: React.FC = () => {
    return (
        <>
            <div className="top-0 left-0 justify-center shadow-md z-50 ">
                <TopBar_l></TopBar_l>
            </div>
            <AssetDetailView/>
        </>
    );
};

export default AssetPage;