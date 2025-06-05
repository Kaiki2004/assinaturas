import React, { useEffect, useState } from 'react';
import Navbar from './NavBar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


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

  const exportarPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 20;
    let y = margin;

    doc.setFontSize(16);
    const middle = doc.internal.pageSize.getWidth() / 2;
    doc.text('LISTA CESTA BÁSICA', middle, y, { align: 'center' });
    y += 40;

    const tableBody = assinaturasFiltradas.map((assinatura) => {
      const { Nome, CPF, Data } = assinatura;

      return [
        { content: Nome || '-', styles: { valign: 'middle' } },
        { content: CPF || '-', styles: { valign: 'middle' } },
        { content: Data || '-', styles: { valign: 'middle' } },
        { content: '', styles: { cellWidth: 80, minCellHeight: 50 } }, // Assinatura
        { content: '', styles: { cellWidth: 80, minCellHeight: 50 } }, // Foto
      ];
    });

    autoTable(doc, {
      head: [['Nome', 'CPF', 'Data', 'Assinatura', 'Foto']],
      body: tableBody,
      startY: y,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      didDrawCell: function (data) {
        const rowIndex = data.row.index;
        const colIndex = data.column.index;

        // Ignora cabeçalho
        if (data.section !== 'body') return;

        // Assinatura
        if (colIndex === 3) {
          const assinatura = assinaturasFiltradas[rowIndex].Assinatura;
          if (assinatura && assinatura !== 'Não assinado') {
            try {
              doc.addImage(assinatura, 'PNG', data.cell.x + 2, data.cell.y + 2, 70, 40);
            } catch (error) {
              console.warn(`Erro ao renderizar assinatura da linha ${rowIndex}:`, error);
              doc.text('Não assinado', data.cell.x + 5, data.cell.y + 20);
            }
          } else {
            doc.text('Não assinado', data.cell.x + 5, data.cell.y + 20);
          }
        }

        // Foto
        if (colIndex === 4) {
          const foto = assinaturasFiltradas[rowIndex].Foto;
          if (foto && foto.startsWith('data:image')) {
            try {
              doc.addImage(foto, 'PNG', data.cell.x + 2, data.cell.y + 2, 70, 40);
            } catch (error) {
              console.warn(`Erro ao renderizar foto da linha ${rowIndex}:`, error);
              doc.text('Sem foto', data.cell.x + 5, data.cell.y + 20);
            }
          } else {
            doc.text('Sem foto', data.cell.x + 5, data.cell.y + 20);
          }
        }
      }
    });

    doc.save('lista_cestas.pdf');
  };


  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Lista de Assinaturas</h2>

        <input
          type="text"
          placeholder="Buscar por CPF..."
          value={filtroCpf}
          onChange={(e) => setFiltroCpf(e.target.value)}
          style={styles.input}
        />

        {assinaturasFiltradas.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tr}>
                <th>Nome</th>
                <th>CPF</th>
                <th>Data</th>
                <th>Assinatura</th>
              </tr>
            </thead>
            <tbody>
              {assinaturasFiltradas.map((assinatura) => (
                <tr key={assinatura.Id}>
                  <td style={styles.td}>{assinatura.Nome}</td>
                  <td style={styles.td}>{assinatura.CPF}</td>
                  <td style={styles.td}>{assinatura.Data}</td>
                  <td style={styles.td}>
                    {assinatura.Status === 'Bloqueado' ? (
                      <span style={styles.span}>Bloqueado, motivo: Falta</span>
                    ) : assinatura.Assinatura && assinatura.Assinatura !== 'Não assinado' ? (
                      <img
                        src={assinatura.Assinatura}
                        alt="Assinatura"
                        style={styles.img}
                      />
                    ) : (
                      <span style={styles.span}>Sem assinatura</span>
                    )}
                  </td>
                  <td style={styles.td}> {assinatura.Foto && <img src={assinatura.Foto} alt="Foto" style={styles.img} />}</td>
                </tr>
              ))}
            </tbody>
          </table>

        ) : (
          <p>Nenhuma assinatura encontrada.</p>
        )}
        <button onClick={exportarPDF} style={styles.button}>
          Exportar em PDF
        </button>
      </div>
    </div>
  );
}

export default ListaAssinaturas;

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  input: {
    width: '100%',
    maxWidth: '300px',
    padding: '10px',
    marginBottom: '20px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  tr: {
    border: '1px solid black',
  },
  img: {
    width: '100px',
    height: 'auto',
    borderRadius: '4px'
  },
  th: {
    backgroundColor: '#f4f4f4',
    padding: '10px',
  },
  td: {
    border: '1px solid black',
  },
  button: {
    padding: '10px 20px',
    margin: '10px 0',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  span: {
    color: 'red',
  }

};
