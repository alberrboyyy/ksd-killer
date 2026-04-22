import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'login': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'logout': { paramsTuple?: []; params?: {} }
    'floor': { paramsTuple?: []; params?: {} }
    'order.show': { paramsTuple: [ParamValue]; params: {'tableId': ParamValue} }
    'order.takeaway': { paramsTuple?: []; params?: {} }
    'order.bill': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.addItem': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.removeItem': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'order.updateItemQuantity': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'order.send': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.pay': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.updateGuests': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'kitchen.display': { paramsTuple?: []; params?: {} }
    'kitchen.items': { paramsTuple?: []; params?: {} }
    'kitchen.updateStatus': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'bar.display': { paramsTuple?: []; params?: {} }
    'bar.items': { paramsTuple?: []; params?: {} }
    'bar.updateStatus': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
  }
  GET: {
    'login': { paramsTuple?: []; params?: {} }
    'floor': { paramsTuple?: []; params?: {} }
    'order.show': { paramsTuple: [ParamValue]; params: {'tableId': ParamValue} }
    'order.takeaway': { paramsTuple?: []; params?: {} }
    'order.bill': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'kitchen.display': { paramsTuple?: []; params?: {} }
    'kitchen.items': { paramsTuple?: []; params?: {} }
    'bar.display': { paramsTuple?: []; params?: {} }
    'bar.items': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'login': { paramsTuple?: []; params?: {} }
    'floor': { paramsTuple?: []; params?: {} }
    'order.show': { paramsTuple: [ParamValue]; params: {'tableId': ParamValue} }
    'order.takeaway': { paramsTuple?: []; params?: {} }
    'order.bill': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'kitchen.display': { paramsTuple?: []; params?: {} }
    'kitchen.items': { paramsTuple?: []; params?: {} }
    'bar.display': { paramsTuple?: []; params?: {} }
    'bar.items': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'session.store': { paramsTuple?: []; params?: {} }
    'logout': { paramsTuple?: []; params?: {} }
    'order.addItem': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.send': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.pay': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'order.removeItem': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
  }
  PATCH: {
    'order.updateItemQuantity': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'order.updateGuests': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'kitchen.updateStatus': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'bar.updateStatus': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}