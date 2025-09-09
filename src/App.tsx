import React from 'react'
import { Link } from 'react-router-dom'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="excel-extractor-main-wrapper">
      <h1 className="excel-extractor-primary-heading">Excel Extractor</h1>
      
      <div className="excel-extractor-navigation-container">
        <Link to="/insumo" className="excel-extractor-btn excel-extractor-btn-insumos">
         Garrafa de Insumos
        </Link>
        <Link to="/acabado" className="excel-extractor-btn excel-extractor-btn-acabados">
          Produto Acabado
        </Link>
      </div>
    </div>
  )
}

export default App
