import * as pdf from 'html-pdf-node';
import * as fs from 'fs';
import * as path from 'path';

const LOGO_PATH = path.join(process.cwd(), 'public', 'vedic-health-logo.png');

// export function buildInvoiceHtml(data: any, footerData: any) {
//   const formatDate = (dateStr: string) => {
//     const d = new Date(dateStr);
//     return d.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric"
//     });
//   };

//   const formatDateWithTime = (dateStr: string) => {
//     const d = new Date(dateStr);
//     return `${d.toLocaleDateString("en-US")} ${d.toLocaleTimeString("en-US")}`;
//   };
//   const currencySymbol = "$"
//   const invoiceAmount =
//     data?.grandTotal ??
//     data?.invoiceAmount ??
//     data?.totals?.total ??
//     data?.amount ??
//     0;

//   // ✅ Convert logo to base64
//   let logoBase64 = '';
//   if (fs.existsSync(LOGO_PATH)) {
//     logoBase64 = fs.readFileSync(LOGO_PATH, { encoding: 'base64' });
//   }
//   const subTotal =
//     data?.totalAmount ??
//     data?.totals?.subtotal ??
//     data?.membership?.subtotal ??
//     invoiceAmount;
//   const discountAmount =
//     data?.discountAmount ??
//     data?.totals?.discount ??
//     data?.membership?.discount ??
//     0;
//   const deliveryCharge = data?.deliveryCharge ?? 0;
//   const grandTotal =
//     data?.grandTotal ??
//     data?.totals?.total ??
//     data?.membership?.total ??
//     invoiceAmount;
//   const cardType = data?.paymentDetails?.card?.brand || 'visa'
//   const last4digit = data?.paymentDetails?.card?.last4 || '2002'

//   const items = data.orderItems || [];

//   return `
//   <html>
//   <body style="font-family: Arial, sans-serif;margin:0;padding:0;background:#f0ede8;">

//   <table style="width:680px;margin:auto;background:#fff;border-radius:6px;padding:20px;box-shadow:0 0 6px #00000029;">
    
//     <!-- HEADER -->
//     <tr>
//       <td>
//         <table width="100%">
//           <tr>
//             <td width="70%" style="padding:15px;border-bottom:1px solid #C2C2C2;">
//               ${logoBase64
//       ? `<img src="data:image/png;base64,${logoBase64}" width="180" />`
//       : `<h2>Vedic Health</h2>`
//     }
//             </td>

//             <td style="padding:15px;border-bottom:1px solid #C2C2C2;font-size:12px;">
//               <b>INVOICE</b><br/>
//               Invoice # Ved${data.invoiceNo}<br/>
//               Invoice Date: ${formatDate(data.created_at)}<br/>
//               Invoice Amount: $${data.grandTotal}<br/>
//               <span style="color:#00BE55;font-weight:bold;">PAID</span>
//             </td>
//           </tr>
//         </table>
//       </td>
//     </tr>

//     <!-- FROM / TO -->
//     <tr>
//       <td style="padding:15px;">
//         <table width="100%">
//           <tr>
//             <td style="font-size:13px;">
//               <b>From:</b><br/>
//               Vedic Health Inc.<br/>
//               ${footerData?.address || ''}<br/>
//               ${footerData?.email || ''}
//             </td>

//             <td align="right" style="font-size:13px;">
//               <b>To:</b><br/>
//               ${data?.userInfo?.name || ''}<br/>
//               ${data?.userInfo?.email || ''}<br/>
//               ${data?.billingAddress1 || ''}
//             </td>
//           </tr>
//         </table>
//       </td>
//     </tr>

//     <!-- TABLE -->
//     <tr>
//       <td>
//         <table width="100%" style="border-collapse:collapse;">
//           <tr style="background:#f5f5f5 ; border-bottom: "1px solid #707070";">
//             <th style="padding:10px;border-bottom:1px solid #ccc;">DESCRIPTION</th>
//             <th style="padding:10px;border-bottom:1px solid #ccc;">COST</th>
//             <th style="padding:10px;border-bottom:1px solid #ccc;">UNIT</th>
//             <th style="padding:10px;border-bottom:1px solid #ccc;">AMOUNT</th>
//           </tr>

//           ${items.map((item: any) => `
//             <tr style:" border-bottom: "1px solid #707070"">
//               <td style="  padding:12px;
//   vertical-align:top;
//   text-align:left;
//   color:#000000;
//   font-size:12px;
//   font-weight:bold;
//   border-bottom:1px solid #C2C2C2;
// ;">${item.productName}</td>
//               <td style="padding: 12; vertical-align: top, color: #000000; font-size: 12; font-weight: normal; border-bottom: 1px solid #C2C2C2">$${item.productPrice}</td>
//               <td style="padding: 12; vertical-align: top, color: #000000; font-size: 12; font-weight: normal; border-bottom: 1px solid #C2C2C2">${item.quantity}</td>
//               <td style="padding: 12; vertical-align: top, color: #000000; font-size: 12; font-weight: bold; border-bottom: 1px solid #C2C2C2">$${item.productPrice * item.quantity}</td>
//             </tr>
//           `).join("")}

//         </table>
//       </td>
//     </tr>

//     <tr>
//   <td style="padding:12px;vertical-align:top;text-align:left;color:#000;font-size:12px;font-weight:bold;"></td>
//   <td style="padding:12px;vertical-align:top;color:#000;font-size:12px;"></td>
//   <td style="padding:12px;vertical-align:top;color:#C2C2C2;font-size:10px;">
//     Sub Total
//   </td>
//   <td style="padding:12px;vertical-align:top;color:#000;font-size:10px;font-weight:bold;">
//     ${currencySymbol} ${subTotal || 0}
//   </td>
// </tr>

// <tr>
//   <td style="padding:12px;vertical-align:top;text-align:left;color:#000;font-size:12px;font-weight:bold;"></td>
//   <td style="padding:12px;vertical-align:top;color:#000;font-size:12px;"></td>
//   <td style="padding:12px;vertical-align:top;color:#C2C2C2;font-size:10px;border-bottom:1px solid #C2C2C2;">
//     Discount
//   </td>
//   <td style="padding:12px;vertical-align:top;color:#000;font-size:10px;font-weight:bold;border-bottom:1px solid #C2C2C2;">
//     ${currencySymbol} ${discountAmount || 0}
//   </td>
// </tr>

// <tr>
//   <td style="padding:12px;vertical-align:top;text-align:left;color:#000;font-size:12px;font-weight:bold;"></td>
//   <td style="padding:12px;vertical-align:top;color:#000;font-size:12px;"></td>
//   <td style="padding:12px;vertical-align:top;color:#C2C2C2;font-size:10px;border-bottom:1px solid #C2C2C2;">
//     Delivery
//   </td>
//   <td style="padding:12px;vertical-align:top;color:#000;font-size:10px;font-weight:bold;border-bottom:1px solid #C2C2C2;">
//     ${currencySymbol} ${deliveryCharge || 0}
//   </td>
// </tr>
//     <!-- TOTAL -->
//     <tr>
//       <td style="padding:15px;text-align:right;">
//         <b>Total: $${data.grandTotal}</b>
//       </td>
//     </tr>

//     <!-- PAYMENT -->
//     <tr>
//       <td style="padding:15px;font-size:12px;">
//         <b>PAYMENTS</b><br/>
//         $${data.grandTotal} was paid on ${formatDateWithTime(data.created_at)}
//       </td>
//     </tr>

//     <!-- FOOTER -->
//     <tr>
//       <td style="text-align:center;padding:30px;font-size:14px;">
//         <b>Thank you for trusting us</b>
//       </td>
//     </tr>

//   </table>

//   </body>
//   </html>
//   `;
// }

export function buildInvoiceHtml(data: any, footerData: any) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatDateWithTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("en-US")} ${d.toLocaleTimeString("en-US")}`;
  };

  const currencySymbol = "$";

  // ✅ logo
  let logoBase64 = "";
  if (fs.existsSync(LOGO_PATH)) {
    logoBase64 = fs.readFileSync(LOGO_PATH, { encoding: "base64" });
  }
console.log(data.orderItems,"data.orderItems")
  const items = data.orderItems || [];

  const subTotal = data?.totalAmount ?? data?.grandTotal ?? 0;
  const discountAmount = data?.discountAmount ?? 0;
  const deliveryCharge = data?.deliveryCharge ?? 0;
  const grandTotal = data?.grandTotal ?? 0;
  const billingAddress = (` ${data?.billingAddress1 ||""},${data?.billingAddress2|| ""}, ${data?.billingCity || ""}, ${data?.billingState || ""}, ${data?.billingCountry || ""}, ${data?.billingZipcode || ""}`
      );
        const billingContact =  data?.userInfo?.mobileNo || data?.address?.mobile || "";


  return `
  <html>
  <body style="font-family: Arial, sans-serif; background:#f0ede8; padding:20px;">

  <table style="width:680px;margin:auto;background:#fff;border-radius:6px;padding:20px;box-shadow:0 0 6px #00000029;">

    <!-- HEADER -->
    <tr>
      <td>
        <table width="100%">
          <tr>
            <td style="padding:15px;border-bottom:1px solid #C2C2C2;">
              ${
                logoBase64
                  ? `<img src="data:image/png;base64,${logoBase64}" width="180" />`
                  : `<h2>Vedic Health</h2>`
              }
            </td>

            <td style="padding:15px;border-bottom:1px solid #C2C2C2;font-size:12px;text-align:right;">
              <b>INVOICE</b><br/>
              Invoice # Ved${data.invoiceNo}<br/>
              Invoice Date: ${formatDate(data.created_at)}<br/>
              Amount: ${currencySymbol} ${grandTotal}<br/>
              <span style="color:#00BE55;font-weight:bold;">PAID</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FROM / TO -->
    <tr>
      <td style="padding:15px;">
        <table width="100%">
          <tr>
            <td style="font-size:13px;">
              <b style="
                        color:#0546FF
                      ">From:</b><br/>
              Vedic Health Inc.<br/>
              ${footerData?.address || ""}<br/>
               ${footerData?.number}<br/>
              ${footerData?.email || ""}
            </td>

            <td style="font-size:13px;text-align:right;">
              <b style="
                        color: #0546FF">To:</b><br/>
              ${data?.userInfo?.name || "" } ${data?.userInfo?.lastName || ""}<br/>
              ${billingAddress || ""}
              <br/>
              ${billingContact}<br/>
              ${data?.userInfo?.email || ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ITEMS -->
    <tr>
      <td>
        <table width="100%" style="border-collapse:collapse;">
          <tr style="background:#f5f5f5;">
            <th style="padding:10px;border-bottom:1px solid #ccc;">DESCRIPTION</th>
            <th style="padding:10px;border-bottom:1px solid #ccc;">COST</th>
            <th style="padding:10px;border-bottom:1px solid #ccc;">UNIT</th>
            <th style="padding:10px;border-bottom:1px solid #ccc;">AMOUNT</th>
          </tr>

          ${items
            .map(
              (item: any) => `
            <tr>
              <td style="padding:12px;vertical-align:top;text-align:left;color:#000;font-size:12px;font-weight:bold;border-bottom:1px solid #C2C2C2;">
                ${item.productName}
              </td>
              <td style="padding:12px;vertical-align:top;color:#000;font-size:12px;border-bottom:1px solid #C2C2C2;">
                ${currencySymbol} ${item.productPrice}
              </td>
              <td style="padding:12px;vertical-align:top;color:#000;font-size:12px;border-bottom:1px solid #C2C2C2;">
                ${item.quantity}
              </td>
              <td style="padding:12px;vertical-align:top;color:#000;font-size:12px;font-weight:bold;border-bottom:1px solid #C2C2C2;">
                ${currencySymbol} ${item.productPrice * item.quantity}
              </td>
            </tr>
          `
            )
            .join("")}

          <!-- TOTALS -->
          <tr>
            <td></td><td></td>
            <td style="padding:12px;color:#C2C2C2;font-size:10px;">Sub Total</td>
            <td style="padding:12px;font-size:10px;font-weight:bold;">
              ${currencySymbol} ${subTotal}
            </td>
          </tr>

          <tr>
            <td></td><td></td>
            <td style="padding:12px;color:#C2C2C2;font-size:10px;">
              Discount
            </td>
            <td style="padding:12px;font-size:10px;font-weight:bold;;">
              ${currencySymbol} ${discountAmount}
            </td>
          </tr>

          <tr>
            <td></td><td></td>
            <td style="padding:12px;color:#C2C2C2;font-size:10px;border-bottom:1px solid #C2C2C2;">
              Delivery
            </td>
            <td style="padding:12px;font-size:10px;font-weight:bold;border-bottom:1px solid #C2C2C2;">
              ${currencySymbol} ${deliveryCharge}
            </td>
          </tr>

          <tr>
            <td></td><td></td>
            <td style="padding:12px;color:#000;font-size:12px;border-bottom:1px solid #C2C2C2;">Total</td>
            <td style="padding:12px;font-size:12px;font-weight:bold;border-bottom:1px solid #C2C2C2;">
              ${currencySymbol} ${grandTotal}
            </td>
          </tr>

        </table>
      </td>
    </tr>

    <!-- PAYMENT -->
    <tr>
      <td style="padding:15px;font-size:12px;">
        <b>PAYMENTS</b><br/>
        ${currencySymbol} ${grandTotal} paid on ${formatDateWithTime(data.created_at)}
      </td>
    </tr>

    <!-- FOOTER -->
    <tr style=" borderBottom: 1px solid #707070">
      <td style="text-align:center;padding:30px;">
        <b>Thank you for trusting us</b>
      </td>
    </tr>

  </table>
  </body>
  </html>
  `;
}

export async function generateInvoicePdfBuffer(data: any, footerData: any) {
  const html = buildInvoiceHtml(data, footerData);

  const file = { content: html };

  const options = {
    format: 'A4',
    printBackground: true
  };

  return await pdf.generatePdf(file, options);
}