module.exports = {
  launch_options: {
    executablePath: "/usr/local/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  pdf_options: {
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    printBackground: true,
  },
  stylesheet: ["pdf-styles.css"],
};
