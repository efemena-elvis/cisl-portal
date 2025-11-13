const version: string = "v1";
const invoiceNameSpace: string = `invoices/${version}`;
const transmittingNameSpace: string = `transmitting/${version}`;
const qrCodeNameSpace: string = `invoice-qr/${version}`;

export const dashboardRoutes = {
  getInvoices: `${invoiceNameSpace}/imports/zoho/invoices`,
  transformInvoice: `${invoiceNameSpace}/imports/zoho/invoices`,
  submitInvoice: `${invoiceNameSpace}/sign`,
  transmitInvoice: `${transmittingNameSpace}`,
  qrCode: `${qrCodeNameSpace}`,
  incomingInvoices: `${transmittingNameSpace}/received`,
};
