import React, { useEffect, useState } from 'react';
import Navbar from './NavBar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ListaAssinaturas.css';

function ListaAssinaturas() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [filtroCpf, setFiltroCpf] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/assinaturas`)
      .then(res => res.json())
      .then(data => {
        console.log('Dados recebidos:', data);
        setAssinaturas(data.data || []);
      })
      .catch(err => {
        console.error('Erro ao buscar assinaturas:', err);
        setAssinaturas([]);
      });
  }, []);

  const assinaturasFiltradas = assinaturas.filter(assinatura =>
    assinatura.CPF.toLowerCase().includes(filtroCpf.toLowerCase())
  );

  const exportarPDFGerado = (empresa, cnpj, arquivoNome) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 20;
    let y = margin;
    const middle = doc.internal.pageSize.getWidth() / 2;

    const titulo = 'LISTA CESTA BÁSICA';
    const descricao = `Recebida da empresa ${empresa}, cadastrada no CNPJ ${cnpj}, uma (01) cesta básica no mês de ${new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}, conforme cláusula décima primeira da Convenção Coletiva do Sindicato dos Condutores de Veículos de Franca-SP.`;

    // Título e Descrição Centralizados
    doc.setFontSize(16);
    doc.text(titulo, middle, y, { align: 'center' });
    y += 30;

    const splitDescricao = doc.splitTextToSize(descricao, 500);
    doc.setFontSize(12);
    doc.text(splitDescricao, middle, y, { align: 'center' });
    y += splitDescricao.length * 14 + 20;

    const assinaturasEmpresa = assinaturasFiltradas.filter(
      (a) => a.Empresa === empresa
    );

    const tableBody = assinaturasEmpresa.map(({ Nome, CPF, Data, Empresa, Matricula }) => [
      { content: Nome || '-', styles: { valign: 'middle' } },
      { content: Matricula || '-', styles: { valign: 'middle' } },
      { content: CPF || '-', styles: { valign: 'middle' } },
      { content: Empresa || '-', styles: { valign: 'middle' } },
      { content: Data || '-', styles: { valign: 'middle' } },
      { content: '', styles: { cellWidth: 80, minCellHeight: 50 } },
      { content: '', styles: { cellWidth: 80, minCellHeight: 50 } },
    ]);

    autoTable(doc, {
      head: [['Nome', 'Matrícula', 'CPF', 'Empresa', 'Data', 'Assinatura', 'Foto']],
      body: tableBody,
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      didDrawCell: function (data) {
        if (data.section !== 'body') return;

        const rowIndex = data.row.index;
        const colIndex = data.column.index;
        const rowData = assinaturasEmpresa[rowIndex];

        try {
          if (colIndex === 5) {
            if (rowData.Assinatura && rowData.Assinatura !== 'Não assinado') {
              doc.addImage(rowData.Assinatura, 'PNG', data.cell.x + 2, data.cell.y + 2, 70, 40);
            } else {
              doc.text('Não assinado', data.cell.x + 5, data.cell.y + 20);
            }
          }

          if (colIndex === 6) {
            if (rowData.Foto && rowData.Foto.startsWith('data:image')) {
              doc.addImage(rowData.Foto, 'PNG', data.cell.x + 2, data.cell.y + 2, 70, 90);
            } else {
              doc.text('Sem foto', data.cell.x + 5, data.cell.y + 20);
            }
          }
        } catch (error) {
          console.warn(`Erro ao renderizar imagem na linha ${rowIndex}, coluna ${colIndex}:`, error);
        }
      },
    });

    doc.save(arquivoNome);
  };

  // Funções específicas para exportação dos PDFs
  const exportarPDF_Rizatti = () => {
    exportarPDFGerado('RIZATTI & CIA LTDA', '47.974.944/0001-23', 'Lista_Cestas_Rizatti.pdf');
  };

  const exportarPDF_Formulaexpress = () => {
    exportarPDFGerado('Formulaexpress', '36.666.191/0001-23', 'Lista_Cestas_Formula.pdf');
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="filtro-horizontal">
          <h2>Buscar pessoas:</h2>
          <input
            type="text"
            placeholder="Buscar por CPF..."
            value={filtroCpf}
            onChange={(e) => setFiltroCpf(e.target.value)}
            className="input_cpf"
          />
        </div>

        <div className="button-container">
          <button onClick={exportarPDF_Rizatti} className="button">
            Rizatti
          </button>
          <button onClick={exportarPDF_Formulaexpress} className="button_formula">
            FormulaExpress
          </button>
        </div>

        {assinaturasFiltradas.length > 0 ? (
          <table className="table">
            <thead>
              <tr className="tr">
                <th className="th">Nome</th>
                <th className="th">Matrícula</th>
                <th className="th">CPF</th>
                <th className="th">Data</th>
                <th className="th">Empresa</th>
                <th className="th">Assinatura</th>
                <th className="th">Foto</th>
              </tr>
            </thead>
            <tbody>
              {assinaturasFiltradas.map((assinatura) => (
                <tr key={assinatura.Id}>
                  <td className="td">{assinatura.Nome}</td>
                  <td className="td">{assinatura.Matricula}</td>
                  <td className="td">{assinatura.CPF}</td>
                  <td className="td">{assinatura.Data}</td>
                  <td className="td">{assinatura.Empresa}</td>
                  <td className="td">
                    {assinatura.Status === 'Bloqueado' ? (
                      <span className="span">Bloqueado, motivo: Falta</span>
                    ) : assinatura.Assinatura && assinatura.Assinatura !== 'Não assinado' ? (
                      <img src={assinatura.Assinatura} alt="Assinatura" className="img" />
                    ) : (
                      <span className="span">Sem assinatura</span>
                    )}
                  </td>
                  <td className="td">
                    {assinatura.Foto && <img src={assinatura.Foto} alt="Foto" className="img" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhuma assinatura encontrada.</p>
        )}
      </div>
    </div>
  );
}

export default ListaAssinaturas;
