import React from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'

const NotFound: React.FC = () => {
  return (
    <div className="notfound-container">
      <h1>404</h1>
      <p>Página não encontrada</p>
      <Link to="/" className="back-home">Voltar para a página inicial</Link>
    </div>
  )
}

export default NotFound
