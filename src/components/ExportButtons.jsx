// src/components/ExportButtons.jsx
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Import correcto
import { IconButton, Tooltip, Stack } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description"; // PDF
import TableViewIcon from "@mui/icons-material/TableView";     // XLSX
import logo from "../assets/HorizontalFullColor.png"; // Asegúrate de tener el logo

const ExportButtons = ({ rows, onFetchRows, fileName = "reporte", campus }) => {
  const [exportando, setExportando] = useState(false);

  const obtenerRowsExportacion = async () => {
    if (onFetchRows) {
      const data = await onFetchRows();
      return Array.isArray(data) ? data : [];
    }

    return rows;
  };

  const exportToExcel = async () => {
    setExportando(true);
    try {
    const rowsExport = await obtenerRowsExportacion();
    const ws = XLSX.utils.json_to_sheet(rowsExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `${fileName}.xlsx`
    );
    } finally {
      setExportando(false);
    }
  };

 const exportToPDF = async () => {
  setExportando(true);
  try {
  const rowsExport = await obtenerRowsExportacion();
  const doc = new jsPDF();

  // 🔹 Logo sin deformar (solo ancho, altura automática)
  const imgWidth = 50; // ajusta este valor hasta que se vea bien
  doc.addImage(logo, "PNG", 10, 10, imgWidth, 0);

  // 🔹 Ancho total de la página
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalPagesExp = "{total_pages_count_string}";
  // 🔹 Título centrado
  doc.setFontSize(12);
  doc.text("Servicios Académicos - Reporte de Solicitudes", pageWidth / 2, 20, {
    align: "center",
  });

  // 🔹 Campus (debajo del título)
    doc.setFontSize(11);
    doc.text(`${campus}`, pageWidth / 2, 28, { align: "center" });

  // 🔹 Fecha a la derecha
  const fecha = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.text(`Fecha: ${fecha}`, pageWidth - 20, 20, { align: "right" });

  // 🔹 Tabla
  autoTable(doc, {
    startY: 40, // un poco más abajo para que no choque con el logo
    head: [["Cuenta", "Alumno", "Documento", "Estado"]],
    body: rowsExport.map((r) => [
      r.CueCod || "-",
      r.AluNom || "-",
      r.DocNom || "-",
      r.EstNom || "-",
    ]),
    didDrawPage: (data) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

  // 🔹 Texto con total de páginas
  const pageStr = `Página ${pageCurrent} de ${totalPagesExp}`;

  // 🔹 Márgenes y dimensiones
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(9);

  // 🔹 A la derecha abajo
  doc.text(pageStr, pageWidth - 20, pageHeight - 10, { align: "center" });
},
  });

  if (typeof doc.putTotalPages === "function") {
    doc.putTotalPages(totalPagesExp);
  }

  // 🔹 Guardar PDF
  doc.save(`${fileName}.pdf`);
  } finally {
    setExportando(false);
  }
};

  return (
    <Stack direction="row" spacing={1}>
      <Tooltip title="Exportar XLSX">
        <IconButton color="secondary" onClick={exportToExcel} disabled={exportando}>
          <TableViewIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Exportar PDF">
        <IconButton color="error" onClick={exportToPDF} disabled={exportando}>
          <DescriptionIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default ExportButtons;
