/* DDT JM SRL: stampa tramite PDF A4 (senza intestazioni e URL del browser).
   Mantiene l'impaginazione della bolla HTML e usa una sola pagina. */
(function () {
  "use strict";
  let working = false;
  function loadLibrary(src, check) {
    if (check()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => check() ? resolve() : reject(new Error("Libreria PDF non disponibile"));
      script.onerror = () => reject(new Error("Impossibile caricare la libreria PDF"));
      document.head.appendChild(script);
    });
  }
  window.ddtPrintPdf = async function () {
    if (working) return;
    const sheet = document.querySelector(".sheet");
    const button = document.querySelector("button.print");
    if (!sheet || !button) return;
    working = true;
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "PREPARAZIONE PDF…";
    try {
      await Promise.all([
        loadLibrary("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js", () => typeof window.html2canvas === "function"),
        loadLibrary("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js", () => !!window.jspdf?.jsPDF)
      ]);
      // Il clone rimuove solo lo zoom applicato su cellulare; il modello originale non cambia.
      const canvas = await window.html2canvas(sheet, {
        backgroundColor: "#ffffff",
        scale: 2.4,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        onclone: (doc) => {
          const copy = doc.querySelector(".sheet");
          if (!copy) return;
          const set = (key, val) => copy.style.setProperty(key, val, "important");
          set("transform", "none");
          set("margin", "0");
          set("width", "210mm");
          set("height", "296mm");
          set("min-height", "296mm");
          set("max-height", "296mm");
          set("overflow", "hidden");
          set("box-shadow", "none");
        }
      });
      if (!canvas.width || !canvas.height) throw new Error("Documento PDF vuoto");
      const pdf = new window.jspdf.jsPDF({
        orientation: "portrait", unit: "mm", format: "a4", compress: true
      });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 296, undefined, "FAST");
      // Il visualizzatore che supporta autoPrint apre direttamente la stampa.
      // Sugli altri dispositivi apre il PDF, stampabile dal visualizzatore.
      if (typeof pdf.autoPrint === "function") pdf.autoPrint();
      const url = URL.createObjectURL(pdf.output("blob"));
      // Il sistema stampa un vero PDF: nessun indirizzo del pannello nei margini.
      window.location.replace(url);
    } catch (error) {
      console.error("DDT PDF", error);
      alert("Non è stato possibile preparare il PDF senza indirizzo web. Controlla la connessione e riprova. Non è stata avviata la stampa della pagina del pannello.");
      working = false;
      button.disabled = false;
      button.textContent = originalLabel;
    }
  };
})();
