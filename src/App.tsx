import { useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="file-uploader">
      <label htmlFor="file-upload" className="file-label">
        Selecione uma planilha Excel:
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".xlsx,.xls,.csv,.xlsb,.ods"
        onChange={handleChange}
        className="file-input"
      />
    </div>
  );
};

function App() {
  const [data, setData] = useState<any[][]>([]);
  const [linhaSelecionada, setLinhaSelecionada] = useState<number>(0);
  const [nomeArquivo, setNomeArquivo] = useState<string>('');

  const [responsavel, setResponsavel] = useState<string>('');
  const [origem, setOrigem] = useState<string>('');
  const [destino, setDestino] = useState<string>('');

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    setNomeArquivo(file.name);
    reader.onload = (evt) => {
      const buffer = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
      setData(json);
      setLinhaSelecionada(0);
    };
    reader.readAsArrayBuffer(file);
  };

  const limparDados = () => {
    setData([]);
    setLinhaSelecionada(0);
    setNomeArquivo('');
    setResponsavel('');
    setOrigem('');
    setDestino('');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const reorganizarDados = (linha: any[]): any[] => {
    const novaLinha: any[] = [];

    const mapa: [number, number][] = [
      [1, 0],   // B → A
      [6, 20],  // G → U
      [7, 18],  // H → S
      [8, 19],  // I → T
      [9, 21],  // J → V
      [13, 35], // N → AJ
      [15, 37], // P → AL
      [17, 48], // R → AW
    ];

    mapa.forEach(([origem, destino]) => {
      const valor = linha[origem];
      if (valor !== undefined && valor !== null && valor !== '') {
        novaLinha[destino] = valor;
      }
    });

    // 🔹 Inserir os dados extras (uppercase)
    const respUpper = responsavel.trim().toUpperCase();
    if (respUpper) {
      novaLinha[9] = respUpper; // Coluna J
    }
    if (novaLinha[0]) {
      novaLinha[7] = novaLinha[0]; // Coluna H repete A
    }
    novaLinha[8] = new Date().toLocaleDateString();  // Coluna I
    const origemUpper = origem.trim().toUpperCase();
    if (origemUpper) {
      novaLinha[10] = origemUpper; // Coluna K
    }
    const destinoUpper = destino.trim().toUpperCase();
    if (destinoUpper) {
      novaLinha[12] = destinoUpper; // Coluna M
    }

    novaLinha[36] = 'Frete Lotação';
    novaLinha[47] = 'Frete Lotação';
    
    return novaLinha;
  };



  const exportarParaExcel = () => {
    if (data.length === 0 || linhaSelecionada < 0 || linhaSelecionada >= data.length) {
      alert('Nenhuma linha válida selecionada');
      return;
    }

    const linhaReorganizada = reorganizarDados(data[linhaSelecionada]);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([linhaReorganizada]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Reorganizados');

    const nomeBase = nomeArquivo.replace(/\.[^/.]+$/, '') || 'planilha';
    const nomeExportacao = `${nomeBase}-reorganizada.xlsx`;

    XLSX.writeFile(workbook, nomeExportacao);
  };

  return (
    <div className="app-container">
      <div className="app-card">
        <h1 className="app-title">Excel Reorganizer</h1>

        <FileUploader onFileSelect={handleFileUpload} />

        {data.length > 0 && (
          <div className="controls-section">
            <div className="arquivo-info">
              <span className="arquivo-nome">📄 {nomeArquivo}</span>
              <span className="linhas-count">({data.length} linhas)</span>
            </div>

            <div className="linha-selector">
              <label className="linha-label">Linha a exportar:</label>
              <input
                type="text"
                value={linhaSelecionada}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    const num = val === "" ? 0 : parseInt(val, 10);
                    setLinhaSelecionada(num < data.length ? num : data.length - 1);
                  }
                }}
                className="linha-input"
              />
            </div>

            <div className="form-fields">
              <div className="field-group">
                <label className="field-label">Responsável pela Emissão: *</label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="field-input"
                  placeholder="Digite o nome do responsável"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Origem: *</label>
                <input
                  type="text"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  className="field-input"
                  placeholder="Digite a origem"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Destino: *</label>
                <input
                  type="text"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="field-input"
                  placeholder="Digite o destino"
                />
              </div>
            </div>

            <div className="buttons-section">
              <button onClick={exportarParaExcel} className="btn btn-primary">
                📊 Exportar Excel
              </button>
              <button onClick={limparDados} className="btn btn-secondary">
                🗑️ Limpar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;