import { useState } from 'react';
import * as XLSX from 'xlsx';
import './Acabado.css';
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

function Acabado() {
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
            setLinhaInput("1");
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
        setLinhaInput("");
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const reorganizarDados = (linha: any[]): any[] => {
        const novaLinha: any[] = [];

        // 🔹 Novo mapa de colunas (Heineken)
        const mapa: [number, number][] = [
            [1, 0],   // Coluna B → Coluna A
            [1, 7],   // Coluna B → Coluna H
            [7, 19],  // Coluna H → Coluna T
            [8, 17],  // Coluna I → Coluna R
            [9, 18],  // Coluna J → Coluna S
            [10, 20], // Coluna K → Coluna U
            [18, 36], // Coluna S → Coluna AK
            [20, 47], // Coluna U → Coluna AV
        ];

        mapa.forEach(([origem, destino]) => {
            const valor = linha[origem];
            if (valor !== undefined && valor !== null && valor !== '') {
                novaLinha[destino] = valor;
            }
        });

        // 🔹 Inserções extras
        novaLinha[8] = new Date().toLocaleDateString();   // Coluna I → data de hoje
        if (responsavel.trim()) {
            novaLinha[9] = responsavel.trim().toUpperCase(); // Coluna J
        }
        if (origem.trim()) {
            novaLinha[10] = origem.trim().toUpperCase();     // Coluna K
        }
        if (destino.trim()) {
            novaLinha[12] = destino.trim().toUpperCase();    // Coluna M
        }

        novaLinha[35] = 'Frete Lotação'; // Coluna AJ
        novaLinha[46] = 'Frete Lotação'; // Coluna AU

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
        const nomeExportacao = `${nomeBase}-heineken.xlsx`;

        XLSX.writeFile(workbook, nomeExportacao);
    };

    return (
    <div className="acabado-extractor-main-container">
        <div className="acabado-extractor-navigation-buttons">

            <Link to="/insumo" className="acabado-extractor-btn acabado-extractor-btn-insumo">
                Garrafa Insumos
            </Link>

            <Link to="/unidocs" className="acabado-extractor-btn excel-extractor-btn-unidocs">
              Unidocs
            </Link>

        </div>
        <div className="acabado-extractor-content-card">
            <h1 className="acabado-extractor-page-title">Produto Acabado</h1>

            <FileUploader onFileSelect={handleFileUpload} />

            {data.length > 0 && (
                <div className="acabado-extractor-controls-wrapper">
                    <div className="acabado-extractor-file-info">
                        <span className="acabado-extractor-file-name">📄 {nomeArquivo}</span>
                        <span className="acabado-extractor-rows-counter">({data.length} linhas)</span>
                    </div>

                    <div className="acabado-extractor-line-selector">
                        <label className="acabado-extractor-line-label">Linha a exportar:</label>
                        <input
                            type="text"
                            value={linhaInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                    setLinhaInput(val);
                                    const num = val === "" ? 0 : parseInt(val, 10) - 1;
                                    setLinhaSelecionada(num >= 0 && num < data.length ? num : data.length - 1);
                                }
                            }}
                            className="acabado-extractor-line-input"
                        />
                    </div>

                    <div className="acabado-extractor-form-fields">
                        <div className="acabado-extractor-field-group">
                            <label className="acabado-extractor-field-label">Responsável pela Emissão: *</label>
                            <input
                                type="text"
                                value={responsavel}
                                onChange={(e) => setResponsavel(e.target.value)}
                                className="acabado-extractor-field-input"
                                placeholder="Digite o nome do responsável"
                            />
                        </div>

                        <div className="acabado-extractor-field-group">
                            <label className="acabado-extractor-field-label">Origem: *</label>
                            <input
                                type="text"
                                value={origem}
                                onChange={(e) => setOrigem(e.target.value)}
                                className="acabado-extractor-field-input"
                                placeholder="Digite a origem"
                            />
                        </div>

                        <div className="acabado-extractor-field-group">
                            <label className="acabado-extractor-field-label">Destino: *</label>
                            <input
                                type="text"
                                value={destino}
                                onChange={(e) => setDestino(e.target.value)}
                                className="acabado-extractor-field-input"
                                placeholder="Digite o destino"
                            />
                        </div>
                    </div>

                    <div className="acabado-extractor-actions-section">
                        <button onClick={exportarParaExcel} className="acabado-extractor-btn acabado-extractor-btn-export">
                            📊 Exportar Excel
                        </button>
                        <button onClick={limparDados} className="acabado-extractor-btn acabado-extractor-btn-clear">
                            🗑️ Limpar
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
);
}

export default Acabado;
