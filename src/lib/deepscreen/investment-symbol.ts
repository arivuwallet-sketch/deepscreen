/** Yahoo uses the NSE RR-series suffix for these listed REIT units. */
export function investmentQuoteCode(market:string,type:string,code:string):string {
 return market.toUpperCase()==="NSE" && type.toUpperCase()==="REIT" && ["BIRET","EMBASSY","MINDSPACE","NXST"].includes(code.toUpperCase()) ? `${code.toUpperCase()}-RR` : code;
}
