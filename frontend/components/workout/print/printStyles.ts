export const printStyles = `
@media print {
  body * { visibility: hidden; }
  #workout-print-view, #workout-print-view * { visibility: visible; }
  #workout-print-view {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 32px 40px;
  }
}

#workout-print-view {
  display: none;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #0f172a;
  max-width: 680px;
  margin: 0 auto;
  padding: 32px 40px;
  font-size: 13px;
  line-height: 1.5;
}

@media print {
  #workout-print-view { display: block; }
}

.print-header {
  border-bottom: 3px solid #f97316;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.print-app-name {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #f97316;
  margin-bottom: 4px;
}

.print-workout-name {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.print-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.print-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.print-tag-neutral {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.print-stimulus {
  margin: 16px 0 0 0;
  font-style: italic;
  color: #475569;
  font-size: 13px;
}

.print-section {
  margin-bottom: 20px;
  break-inside: avoid;
}

.print-section-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e2e8f0;
}

.print-section-type {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #f97316;
  min-width: fit-content;
}

.print-section-title {
  font-weight: 700;
  font-size: 14px;
  color: #0f172a;
}

.print-section-format {
  font-size: 11px;
  color: #64748b;
  margin-left: auto;
}

.print-section-desc {
  color: #475569;
  font-size: 12px;
  margin: 4px 0 8px 0;
  font-style: italic;
}

.print-exercise-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.print-exercise-item {
  display: flex;
  gap: 8px;
  padding: 3px 0;
  font-size: 13px;
  color: #1e293b;
}

.print-bullet {
  color: #f97316;
  font-weight: 700;
  flex-shrink: 0;
}

.print-equipment {
  margin-top: 24px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
}

.print-footer {
  margin-top: 32px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #94a3b8;
}

.print-score-box {
  margin-top: 24px;
  border: 1.5px dashed #cbd5e1;
  border-radius: 8px;
  padding: 12px 16px;
}

.print-score-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
  margin-bottom: 24px;
}

.print-score-line {
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 8px;
  height: 24px;
}
`
