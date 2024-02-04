import { R_OK } from 'constants';
import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}

export type TableData = Row[]

export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]) {
    const priceABC = (serverResponds[0].top_ask && serverResponds[0].top_bid) ? (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price) / 2 : 0;
    const priceDEF = (serverResponds[1].top_ask && serverResponds[1].top_bid) ? (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price) / 2 : 0;
    const ratio = priceABC / priceDEF;
    const upperBound = priceDEF + (priceDEF * .1);
    const lowerBound = priceDEF - (priceDEF * .1);

    return serverResponds.map((el: any) => {
      return {
        price_abc: priceABC,
        price_def: priceDEF,
        ratio,
        upper_bound: upperBound,
        lower_bound: lowerBound,
        stock: el.stock,
        top_ask_price: el.top_ask && el.top_ask.price || 0,
        trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
      };
    })
  }
}
