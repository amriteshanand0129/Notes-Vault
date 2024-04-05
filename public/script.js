function displaypdf(name, id) {
    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.src = `http://localhost:8080/subject/${name}/${id}`;
}