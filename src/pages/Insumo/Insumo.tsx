import { useState } from 'react';
import * as XLSX from 'xlsx';
import './Insumo.css';
import { Link } from 'react-router-dom'

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

function Insumos() {
    const [data, setData] = useState<any[][]>([]);
    const [linhaSelecionada, setLinhaSelecionada] = useState<number>(0);
    const [linhaInput, setLinhaInput] = useState<string>("");
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
            setLinhaInput("1"); // Inicializa o input com "1" (base 1)
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
        setLinhaInput(""); // Limpa o input
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
    <div className="insumos-extractor-main-container">
        <div className="insumos-extractor-navigation-buttons">
            
            <Link to="/acabado" className="insumos-extractor-btn insumos-extractor-btn-acabado">
               Produto Acabado
            </Link>
        </div>
        <div className="insumos-extractor-content-card">
            <h1 className="insumos-extractor-page-title">Garrafas de Insumos</h1>

            <FileUploader onFileSelect={handleFileUpload} />

            {data.length > 0 && (
                <div className="insumos-extractor-controls-wrapper">
                    <div className="insumos-extractor-file-info">
                        <span className="insumos-extractor-file-name">📄 {nomeArquivo}</span>
                        <span className="insumos-extractor-rows-counter">({data.length} linhas)</span>
                    </div>

                    <div className="insumos-extractor-line-selector">
                        <label className="insumos-extractor-line-label">Linha a exportar:</label>
                        <input
                            type="text"
                            value={linhaInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                    setLinhaInput(val); // Atualiza o valor temporário
                                    const num = val === "" ? 0 : parseInt(val, 10) - 1; // Ajusta para índice base 0
                                    setLinhaSelecionada(num >= 0 && num < data.length ? num : data.length - 1);
                                }
                            }}
                            className="insumos-extractor-line-input"
                        />
                    </div>

                    <div className="insumos-extractor-form-fields">
                        <div className="insumos-extractor-field-group">
                            <label className="insumos-extractor-field-label">Responsável pela Emissão: *</label>
                            <input
                                type="text"
                                value={responsavel}
                                onChange={(e) => setResponsavel(e.target.value)}
                                className="insumos-extractor-field-input"
                                placeholder="Digite o nome do responsável"
                            />
                        </div>

                        <div className="insumos-extractor-field-group">
                            <label className="insumos-extractor-field-label">Origem: *</label>
                            <input
                                type="text"
                                value={origem}
                                onChange={(e) => setOrigem(e.target.value)}
                                className="insumos-extractor-field-input"
                                placeholder="Digite a origem"
                            />
                        </div>

                        <div className="insumos-extractor-field-group">
                            <label className="insumos-extractor-field-label">Destino: *</label>
                            <input
                                type="text"
                                value={destino}
                                onChange={(e) => setDestino(e.target.value)}
                                className="insumos-extractor-field-input"
                                placeholder="Digite o destino"
                            />
                        </div>
                    </div>

                    <div className="insumos-extractor-actions-section">
                        <button onClick={exportarParaExcel} className="insumos-extractor-btn insumos-extractor-btn-export">
                            📊 Exportar Excel
                        </button>
                        <button onClick={limparDados} className="insumos-extractor-btn insumos-extractor-btn-clear">
                            🗑️ Limpar
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
);
}

export default Insumos;