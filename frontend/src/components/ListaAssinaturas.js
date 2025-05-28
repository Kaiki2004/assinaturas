import React, { useEffect, useState } from 'react';
import Navbar from './NavBar';
import jsPDF from 'jspdf';




function ListaAssinaturas() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [filtroCpf, setFiltroCpf] = useState('');

  useEffect(() => {
    fetch('http://172.16.4.221:3001/api/assinaturas')
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
    const middle = (doc.internal.pageSize.getWidth() / 2);
    doc.text('LISTA CESTA BÁSICA', middle, y, { align: 'center' });
    y += 30;
    doc.text('Itens:', margin, y);
    y += 30;
    doc.text('Lista de Assinaturas', margin, y);
    y += 20;

    assinaturasFiltradas.forEach((assinatura, index) => {
      doc.setFontSize(12);
      doc.text(`Nome: ${assinatura.Nome}`, margin, y);
      y += 15;
      doc.text(`CPF: ${assinatura.CPF}`, margin, y);
      y += 15;
      doc.text(`Data: ${assinatura.Data}`, margin, y);
      y += 15;

      // Adiciona imagem da assinatura
      if (assinatura.Assinatura) {
        try {
          doc.text('Assinatura:', margin, y);
          y += 10;
          if (assinatura.Assinatura !== "Não assinado") {
            doc.addImage(assinatura.Assinatura, 'PNG', margin, y,  150, 50);
          } else {
            y += 10;
            doc.text(' ', margin, y);
          }
          y += 30;
        } catch (error) {
          console.error('Erro ao adicionar imagem:', error);
        }
      }

      // Se quiser pular uma página a cada 3 assinaturas:
      /*if ((index + 1) % 3 === 0) {
        doc.addPage();
        y = margin;
      } else {
        y += 20;  // espaço entre registros
      }*/
    });

    doc.save('Lista_assinaturas_cesta_básica.pdf');
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
                    {assinatura.Assinatura && assinatura.Assinatura !== 'Não assinado' ? (
                      <img
                        src={assinatura.Assinatura}
                        alt="Assinatura"
                        style={styles.img}
                      />
                    ) : (
                      <span style={styles.span}>Sem assinatura</span>
                    )}
                  </td>
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
