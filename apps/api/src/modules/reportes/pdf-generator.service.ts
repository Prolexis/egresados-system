import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  async generateFromHtml(html: string): Promise<Buffer> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' },
        printBackground: true,
      });

      return Buffer.from(pdf);
    } catch (error) {
      this.logger.error('Error generando PDF:', error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }

  buildReportHtml(title: string, content: string, filters?: any): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; font-size: 11pt; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 24px 32px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { font-size: 20pt; font-weight: 700; letter-spacing: -0.5px; }
    .header .subtitle { font-size: 10pt; opacity: 0.8; margin-top: 4px; }
    .header .meta { text-align: right; font-size: 9pt; opacity: 0.75; }
    .content { padding: 0 32px 32px; }
    .kpis { display: flex; gap: 16px; margin-bottom: 24px; }
    .kpi-card { flex: 1; background: #f8f9ff; border: 1px solid #e0e4ff; border-radius: 8px; padding: 16px; text-align: center; }
    .kpi-value { font-size: 28pt; font-weight: 800; color: #0f3460; line-height: 1; }
    .kpi-label { font-size: 9pt; color: #666; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt; }
    thead tr { background: #0f3460; color: white; }
    thead th { padding: 10px 12px; text-align: left; font-weight: 600; letter-spacing: 0.3px; }
    tbody tr:nth-child(even) { background: #f8f9ff; }
    tbody tr:hover { background: #eef0ff; }
    tbody td { padding: 9px 12px; border-bottom: 1px solid #e8eaff; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 8pt; font-weight: 600; }
    .badge-contratado { background: #d1fae5; color: #065f46; }
    .badge-postulado { background: #dbeafe; color: #1e40af; }
    .badge-entrevista { background: #fef3c7; color: #92400e; }
    .badge-rechazado { background: #fee2e2; color: #991b1b; }
    .section-title { font-size: 13pt; font-weight: 700; color: #0f3460; margin: 20px 0 12px; border-bottom: 2px solid #0f3460; padding-bottom: 6px; }
    .filters { background: #f8f9ff; border: 1px solid #e0e4ff; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; font-size: 9pt; color: #555; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e0e4ff; font-size: 8pt; color: #888; display: flex; justify-content: space-between; }
    @page { margin: 0; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-size:10pt;opacity:0.7;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px">Sistema de Gestión</div>
      <h1>${title}</h1>
      <div class="subtitle">Reporte generado automáticamente</div>
    </div>
    <div class="meta">
      <div>Fecha: ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      <div style="margin-top:4px">Hora: ${new Date().toLocaleTimeString('es-PE')}</div>
    </div>
  </div>
  <div class="content">
    ${filters ? `<div class="filters">📋 Filtros aplicados: ${Object.entries(filters).filter(([k, v]) => v).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join(' | ')}</div>` : ''}
    ${content}
    <div class="footer">
      <span>Sistema Web de Egresados y Oferta Laboral</span>
      <span>Documento generado automáticamente — Confidencial</span>
    </div>
  </div>
</body>
</html>`;
  }
}
