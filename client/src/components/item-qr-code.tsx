import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { type InventoryItem } from "@shared/schema";

interface ItemQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function ItemQRCodeDialog({ open, onOpenChange, item }: ItemQRCodeDialogProps) {
  if (!item) return null;

  const qrValue = `SKU:${item.sku}|ID:${item.id}|NAME:${item.name}`;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const safeName = escapeHtml(item.name);
    const safeSku = escapeHtml(item.sku);
    const safeLocationRow = escapeHtml(item.locationRow);
    const safeLocationSection = escapeHtml(item.locationSection);
    const safeLocationBin = escapeHtml(item.locationBin);
    const safeQrValue = escapeHtml(qrValue);
    const locationText = `Row ${safeLocationRow} | Section ${safeLocationSection} | Bin ${safeLocationBin}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${safeSku}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Roboto:wght@400;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Roboto', sans-serif;
              padding: 20mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            
            .container {
              text-align: center;
              border: 2px solid #000;
              padding: 20px;
              max-width: 300px;
            }
            
            .qr-code {
              margin: 20px 0;
            }
            
            .item-name {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 8px;
              word-break: break-word;
            }
            
            .item-sku {
              font-family: 'Roboto Mono', monospace;
              font-size: 16px;
              margin-bottom: 12px;
            }
            
            .location {
              font-size: 12px;
              color: #333;
            }
            
            @media print {
              body {
                padding: 10mm;
              }
              
              @page {
                size: auto;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="item-name">${safeName}</div>
            <div class="item-sku">${safeSku}</div>
            <div class="qr-code" id="qr-placeholder"></div>
            <div class="location">${locationText}</div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            new QRCode(document.getElementById("qr-placeholder"), {
              text: ${JSON.stringify(qrValue)},
              width: 200,
              height: 200,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.M
            });
            setTimeout(function() { window.print(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {item.sku}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="p-4 bg-white rounded-md">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="M"
              includeMargin={false}
              data-testid={`qr-code-${item.id}`}
            />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold" data-testid="qr-item-name">{item.name}</p>
            <p className="font-mono text-sm text-muted-foreground" data-testid="qr-item-sku">{item.sku}</p>
            <p className="text-xs text-muted-foreground">
              Row {item.locationRow} | Section {item.locationSection} | Bin {item.locationBin}
            </p>
          </div>
          <Button onClick={handlePrint} className="w-full" data-testid="button-print-qr">
            <Printer className="w-4 h-4 mr-2" />
            Print QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
