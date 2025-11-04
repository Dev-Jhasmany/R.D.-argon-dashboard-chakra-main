# Diagramas de Flujo - Sistema de Pedidos y Ventas

## 1. FLUJO GENERAL: Venta → Pedido → Preparación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SISTEMA DE PEDIDOS Y VENTAS                           │
└─────────────────────────────────────────────────────────────────────────────┘

                                    VENDEDOR
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
              Venta Normal                        Venta Online
              (En Restaurante)                   (Cliente Web)
                    │                                   │
                    │                                   │
        ┌───────────▼───────────┐          ┌──────────▼──────────────┐
        │  RegisterSale.js      │          │  Cliente realiza pago  │
        │  - Carrito de compra  │          │  QR/PayPal/Stripe      │
        │  - Datos cliente      │          │                        │
        │  - Método de pago     │          └──────────┬─────────────┘
        └───────────┬───────────┘                     │
                    │                                 │
                    │ salesService.createSale()       │
                    │ POST /sales                     │
                    │                                 │
        ┌───────────▼──────────────────────────────────▼──────────┐
        │              BACKEND: Crea VENTA                         │
        │  - Actualiza stock                                       │
        │  - Registra movimientos                                  │
        │  - created_by_id: NULL si es online                     │
        └───────────┬──────────────────────────────────┬──────────┘
                    │                                  │
                    │ Retorna sale.id                  │
                    │                                  │
        ┌───────────▼──────────────────────────────────▼──────────┐
        │         FRONTEND: Crea PEDIDO Automático                │
        │  createOrderFromSale(sale)                              │
        │  - Obtiene tiempos de preparación                       │
        │  - Construye details[]                                  │
        │  - orderService.createOrder()                           │
        │  - POST /orders                                         │
        └───────────┬──────────────────────────────────┬──────────┘
                    │                                  │
                    │                                  │
        ┌───────────▼──────────────────────────────────▼──────────┐
        │      BACKEND: Crea PEDIDO en estado 'pending'           │
        │  - order_number asignado                                │
        │  - saleId guardado                                      │
        │  - sellerId registrado                                  │
        │  - details[] con tiempos                                │
        └───────────┬──────────────────────────────────┬──────────┘
                    │                                  │
                    │                                  │
        ┌───────────▼─────────────┐      ┌───────────▼─────────────┐
        │  Muestra TICKET         │      │  OnlineOrders.js        │
        │  - Limpia formulario    │      │  - Lista ventas online  │
        │  - Recarga historial    │      │  - Admin confirma pago  │
        └───────────┬─────────────┘      │  - PATCH /confirm      │
                    │                    │  - Crea pedido          │
                    │                    └───────────┬─────────────┘
                    │                                │
                    └────────────────┬───────────────┘
                                     │
                            ┌────────▼─────────┐
                            │ OrdersList.js    │
                            │ Pedidos Activos  │
                            │ para COCINERO    │
                            └────────┬─────────┘
                                     │
                            ┌────────▼─────────┐
                            │ COCINERO recibe  │
                            │ Recepciona       │
                            │ Estado: received │
                            └────────┬─────────┘
                                     │
                            ┌────────▼─────────┐
                            │ Prepara productos│
                            │ Estado: progress │
                            └────────┬─────────┘
                                     │
                            ┌────────▼─────────────┐
                            │ Marca: Concluido    │
                            │ Estado: completed   │
                            │ completedAt: now    │
                            └────────┬─────────────┘
                                     │
                            ┌────────▼──────────────┐
                            │ OrdersHistory.js     │
                            │ Aparece en historial │
                            │ Listo para entregar  │
                            └──────────────────────┘
```

---

## 2. FLUJO: Registro de Venta (RegisterSale.js)

```
USER INPUT
    │
    ▼
┌──────────────────────────────┐
│ Selecciona Caja Abierta      │
│ (Validación: caja != null)   │
└──────────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Click: "Agregar Producto"│
    └──────────────┬───────────┘
                   │
                   ▼
    ┌────────────────────────────────┐
    │ Modal: Seleccionar Producto    │
    │  OR Promoción                  │
    │                                │
    │ ├─ Promotions (si hay activas) │
    │ └─ Productos Regulares         │
    └──────────────┬─────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
    ┌─────────────┐      ┌──────────────┐
    │ Promoción   │      │ Producto     │
    │ qty = 1     │      │ qty = input  │
    │ (readonly)  │      │ (validar)    │
    └──────┬──────┘      └──────┬───────┘
           │                    │
           │                    │ Validar:
           │                    ├─ qty > 0
           │                    ├─ qty <= stock
           │                    └─ producto != null
           │                    │
           │            ┌───────▼────────┐
           │            │ ¿Error?        │
           │            ├─ Sí: Toast err │
           │            └─ No: Continuar │
           │                    │
           └────────────┬───────┘
                        │
                        ▼
            ┌──────────────────────┐
            │ Agregar a Carrito    │
            │ setCart([...])       │
            │ Cerrar Modal         │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Carrito actualizado  │
            │ Recalcular totales   │
            │ - Subtotal           │
            │ - Descuento          │
            │ - Total              │
            └──────────┬───────────┘
                       │
    ┌──────────────────┴───────────────┐
    │ ¿Más productos?                  │
    ├─ Sí: Repetir desde "Agregar"    │
    └─ No: Continuar                   │
                       │
                       ▼
            ┌──────────────────────────┐
            │ Datos del Cliente         │
            │ (Opcionales)             │
            │ - Nombre                 │
            │ - NIT/CI                 │
            │ - Notas                  │
            └──────────┬───────────────┘
                       │
                       ▼
            ┌──────────────────────────┐
            │ Seleccionar Método Pago  │
            │ ├─ Efectivo (default)    │
            │ ├─ QR                    │
            │ ├─ PayPal                │
            │ └─ Stripe                │
            └──────────┬───────────────┘
                       │
                       ▼
            ┌──────────────────────────┐
            │ Click: "Registrar Venta" │
            └──────────┬───────────────┘
                       │
                       ▼
            ┌──────────────────────────┐
            │ Validaciones:            │
            │ ├─ cart.length > 0       │
            │ ├─ cash_register != null │
            │ └─ payment_method set    │
            └──────────┬───────────────┘
                       │
            ┌──────────▼──────────┐
            │ ¿Validación OK?     │
            ├─ No: Toast error   │
            └─ Sí: Continuar     │
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Construir saleData:          │
        │ ├─ customer_name             │
        │ ├─ customer_nit              │
        │ ├─ discount                  │
        │ ├─ payment_method            │
        │ ├─ notes                     │
        │ ├─ cash_register_id          │
        │ ├─ created_by_id (vendedor)  │
        │ └─ details[]                 │
        └──────────┬───────────────────┘
                   │
                   ▼
        ┌──────────────────────────────┐
        │ salesService.createSale()    │
        │ POST /sales                  │
        │ Backend procesa:             │
        │ - Registra venta             │
        │ - Actualiza stock            │
        │ - Retorna sale.id            │
        └──────────┬───────────────────┘
                   │
            ┌──────▼──────┐
            │ ¿OK?        │
            ├─ No: Error  │
            └─ Sí: Cont.  │
                   │
                   ▼
        ┌──────────────────────────────┐
        │ createOrderFromSale(sale)    │
        │ - Mapea cart→details[]       │
        │ - Obtiene tiempos prep.      │
        │ - orderService.createOrder() │
        │ - POST /orders               │
        └──────────┬───────────────────┘
                   │
                   ▼
        ┌──────────────────────────────┐
        │ ¿Método de Pago?             │
        └──────────┬───────────────────┘
                   │
        ┌──────────┼──────────┬────────────┐
        │          │          │            │
        ▼          ▼          ▼            ▼
    Efectivo    QR        PayPal       Stripe
        │       │          │            │
        │       ├─Modal:   ├─Modal:     ├─Modal:
        │       │ - QR     │ - Email    │ - Phone
        │       │ - Scan   │ - Status   │ - Method
        │       │          │            │
        └───────┼──────────┼────────────┘
                │
                ▼
        ┌──────────────────────────────┐
        │ Muestra Ticket               │
        │ TicketReceipt.js             │
        │ - Datos venta                │
        │ - Productos                  │
        │ - Total                      │
        └──────────┬───────────────────┘
                   │
                   ▼
        ┌──────────────────────────────┐
        │ resetForm():                 │
        │ - Limpia cart                │
        │ - Limpia formData            │
        │ - Recarga productos          │
        │ - Recarga historial          │
        └──────────┬───────────────────┘
                   │
                   ▼
            ┌──────────────┐
            │ ✓ VENTA OK   │
            │ ✓ PEDIDO OK  │
            │ ✓ Listo      │
            └──────────────┘
```

---

## 3. FLUJO: Pedidos Activos (OrdersList.js)

```
┌─────────────────────────────────────┐
│ COCINERO: OrdersList.js             │
│ Pedidos Activos para Preparar       │
└────────────────┬────────────────────┘
                 │
    ┌────────────▼──────────┐
    │ useEffect: componentDidMount
    │ - Carga pedidos activos
    │ - GET /orders/active
    │ - Auto-refresh cada 30s
    └────────────┬──────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │ Renderiza Grid 3 cols  │
    │ Por cada pedido:       │
    │                        │
    │ ┌──────────────────┐   │
    │ │ CARD PEDIDO      │   │
    │ │                  │   │
    │ │ ├─ N° Pedido     │   │
    │ │ ├─ Estado [badge]│   │
    │ │ ├─ Cliente (si)  │   │
    │ │ ├─ Teléfono      │   │
    │ │ ├─ Dirección     │   │
    │ │ ├─ Método pago   │   │
    │ │ │                │   │
    │ │ ├─ PRODUCTS SEC. │   │
    │ │ │ ┌────────────┐ │   │
    │ │ │ │ Producto   │ │   │
    │ │ │ │ - qty      │ │   │
    │ │ │ │ - name     │ │   │
    │ │ │ │ - time     │ │   │
    │ │ │ └────────────┘ │   │
    │ │ │                │   │
    │ │ ├─ DELIVERY SEC. │   │
    │ │ │ ├─ Tipo       │   │
    │ │ │ ├─ Hora       │   │
    │ │ │ ├─ Inicio Prep│   │
    │ │ │ └─ URGENCIA   │   │
    │ │ │                │   │
    │ │ ├─ BOTONES       │   │
    │ │ │ ├─ Recepcionar │   │
    │ │ │ └─ Concluir    │   │
    │ │                  │   │
    │ └──────────────────┘   │
    │                        │
    └────────────┬───────────┘
                 │
    ┌────────────▼──────────────┐
    │ Cocinero Lee Información: │
    │ - Productos a hacer       │
    │ - Urgencia (color badge)  │
    │ - Hora de entrega         │
    │ - Cliente (si delivery)   │
    └────────────┬──────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Cuando lista para recibir │
    │ Click: Recepcionar Pedido │
    └────────────┬──────────────┘
                 │
    ┌────────────▼─────────────┐
    │ Validaciones:            │
    │ ├─ user.id existe        │
    │ ├─ canReceiveOrder()     │
    │ │  (hora >= startTime)   │
    │ └─ estado = 'pending'    │
    └────────────┬─────────────┘
                 │
         ┌───────▼──────┐
         │ ¿OK?         │
         ├─ No: Tooltip │
         └─ Sí: Enviar  │
                 │
                 ▼
    ┌──────────────────────────┐
    │ orderService.markAs      │
    │ Received(orderId, user.id)
    │                          │
    │ PATCH /orders/{id}/receive
    │ { cookId: user.id }      │
    └────────────┬──────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Backend actualiza:       │
    │ - status = 'received'    │
    │ - cookId = user.id       │
    │ - receivedAt = now       │
    └────────────┬──────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Toast: Pedido receptado  │
    │ loadOrders() - Recarga   │
    └────────────┬──────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Cocinero PREPARA         │
    │ - Comienza a cocinar     │
    │ - Sigue instrucciones    │
    │ - Hace los productos     │
    └────────────┬──────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Cuando termina:          │
    │ Click: Marcar Concluido  │
    └────────────┬──────────────┘
                 │
    ┌────────────▼──────────────┐
    │ orderService.markAs      │
    │ Completed(orderId)        │
    │                          │
    │ PATCH /orders/{id}/complete
    └────────────┬──────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Backend actualiza:       │
    │ - status = 'completed'   │
    │ - completedAt = now      │
    │ - Calcula tiempo total   │
    └────────────┬──────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Toast: Pedido concluido  │
    │ loadOrders() - Recarga   │
    │ Pedido sale de lista     │
    └────────────┬──────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Aparece en:              │
    │ OrdersHistory.js         │
    │ (Con tiempos calculados) │
    │                          │
    │ ├─ Espera: created→received
    │ ├─ Prep: received→completed
    │ └─ Total: created→completed
    └──────────────────────────┘
```

---

## 4. FLUJO: Ventas Online (OnlineOrders.js)

```
┌─────────────────────────────────┐
│ CLIENTE ONLINE                  │
│ Realiza compra en web           │
└────────────┬────────────────────┘
             │
             ▼
  ┌──────────────────────┐
  │ Selecciona productos │
  │ Suma al carrito      │
  │ Ingresa dirección    │
  │ Hora entrega         │
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │ Selecciona pago:     │
  │ ├─ QR                │
  │ ├─ PayPal            │
  │ └─ Stripe            │
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │ Realiza pago online  │
  │ (Completa transacción)
  └──────────┬───────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ Sistema crea VENTA:        │
  │ POST /sales                │
  │ ├─ created_by_id = NULL    │
  │ │  (indica: online)        │
  │ ├─ payment_method = 'qr'   │
  │ │  (según lo elegido)      │
  │ ├─ customer_name           │
  │ ├─ delivery_address        │
  │ ├─ delivery_time           │
  │ └─ NO CREA PEDIDO AÚN      │
  └──────────┬─────────────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ ADMINISTRADOR               │
  │ OnlineOrders.js             │
  │ Ve "Ventas Pendientes"      │
  │                            │
  │ Tabla:                      │
  │ ├─ N° Venta                 │
  │ ├─ Cliente                  │
  │ ├─ Fecha/hora               │
  │ ├─ Total                    │
  │ ├─ Botón: Ver detalles      │
  │ └─ Botón: Confirmar Pago    │
  └──────────┬──────────────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ Admin revisa detalles:     │
  │ Modal muestra:             │
  │ ├─ Datos cliente           │
  │ ├─ Productos               │
  │ ├─ Subtotal/Descuento/Total
  │ ├─ Pago: QR/PayPal/Stripe  │
  │ └─ Botón: Confirmar        │
  └──────────┬──────────────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ Admin clica:               │
  │ "Confirmar Pago"           │
  │                            │
  │ PATCH /sales/{id}/         │
  │       confirm-online       │
  └──────────┬──────────────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ BACKEND:                   │
  │ ├─ Valida pago              │
  │ ├─ Crea PEDIDO:            │
  │ │  ├─ order_number         │
  │ │  ├─ saleId referenciado  │
  │ │  ├─ order_type: 'online' │
  │ │  ├─ delivery_type        │
  │ │  ├─ delivery_time        │
  │ │  ├─ customer_name/phone  │
  │ │  ├─ delivery_address     │
  │ │  └─ details[]            │
  │ └─ status = 'pending'      │
  └──────────┬──────────────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ Toast: Pago confirmado     │
  │ Pedido creado en cocina    │
  └──────────┬──────────────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ COCINERO                   │
  │ Ve nuevo pedido en:        │
  │ OrdersList.js              │
  │                            │
  │ Card muestra:              │
  │ ├─ Badge: ONLINE           │
  │ ├─ Cliente: nombre/tel     │
  │ ├─ Tipo: Delivery/Pickup   │
  │ ├─ Hora entrega: HH:MM    │
  │ ├─ Dirección               │
  │ ├─ Productos a hacer       │
  │ └─ Urgencia calculada      │
  └──────────┬──────────────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ Cocinero:                  │
  │ [Recepcionar Pedido]       │
  │ status = 'received'        │
  └──────────┬──────────────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ Prepara productos          │
  │ Coloca en bandeja/empaque  │
  └──────────┬──────────────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ [Marcar Concluido]         │
  │ status = 'completed'       │
  └──────────┬──────────────────┘
             │
             ▼
  ┌────────────────────────────┐
  │ ENTREGA:                   │
  │ ├─ Delivery: Courier lleva │
  │ ├─ Pickup: Cliente retira  │
  │ └─ Dine-in: Lleva a mesa   │
  └─────────────────────────────┘
```

---

## 5. FLUJO: Métodos de Pago

```
                    MÉTODOS DE PAGO
                          │
        ┌─────────────────┼─────────────────┬─────────────┐
        │                 │                 │             │
        ▼                 ▼                 ▼             ▼
    EFECTIVO              QR              PAYPAL        STRIPE
    ┌────────┐        ┌────────┐        ┌────────┐    ┌────────┐
    │        │        │        │        │        │    │        │
    │ Select │        │ Select │        │ Select │    │ Select │
    │        │        │        │        │        │    │        │
    └───┬────┘        └───┬────┘        └───┬────┘    └───┬────┘
        │                 │                 │             │
        ▼                 ▼                 ▼             ▼
    Registra         Modal:             Modal:          Modal:
    Venta           QR CODE          Email Input     Phone Input
    (BD)                │                 │         + Method (WA/SMS)
        │               │                 │             │
        ▼               ▼                 ▼             ▼
    Crea Pedido    Muestra:          Input: Email   Input: Phone
    (automático)   - Monto           addr@test.com  +591234567890
        │           - QR Code            │
        ▼           - Cliente            ▼           ┌──────────┐
    Muestra         - Botón:        [Enviar]        │ Selecciona│
    TICKET          Confirmar           │           │ WhatsApp  │
                        │               │           │ o SMS     │
                        │               ▼           └──────────┘
                        │           Status:              │
                        │           'sending'            ▼
                        │               │         [Enviar Vínculo]
                        │               ▼             │
                        │           Status:       Status:
                        │           'waiting'     'sending'
                        │               │             │
                        │               │ (4 seg)     │ (2 seg)
                        │               │             │
                        │               ▼             ▼
                        │           Status:       Status:
                        │           'confirmed'   'waiting'
                        │               │             │
                        │               ▼             │ (5 seg)
                        │           Toast OK          │
                        │               │             ▼
                        │               │         Status:
                        │               │         'confirmed'
                        │               │             │
                        │               │             ▼
                        │               │         Toast OK
                        │               │             │
        ┌───────────────┴───────────────┴─────────────┘
        │
        ▼
    Muestra TICKET
    Limpia formulario
    Recarga historial
```

---

## 6. DIAGRAMA: Estructura de VENTA vs PEDIDO

```
┌─────────────────────────────────────────────────────────────────┐
│                       VENTA (Sales)                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ sale_number: "V-001"                                      │  │
│  │ sale_id: UUID                                            │  │
│  │ customer_name: "Juan"                                    │  │
│  │ customer_nit: "12345"                                    │  │
│  │ payment_method: "efectivo"                               │  │
│  │ total: 250.50                                            │  │
│  │ created_by_id: UUID (vendedor) o NULL (online)          │  │
│  │ cash_register_id: UUID                                   │  │
│  │ created_at: "2024-11-04T14:30:00"                        │  │
│  │                                                          │  │
│  │ details: [                                               │  │
│  │   {                                                      │  │
│  │     product_id: UUID,                                    │  │
│  │     quantity: 2,                                         │  │
│  │     unit_price: 125.00,                                  │  │
│  │     subtotal: 250.00                                     │  │
│  │   }                                                      │  │
│  │ ]                                                        │  │
│  │                                                          │  │
│  │ PROPÓSITO: Registro contable/POS                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              Venta Registrada en BD
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │ RELACIÓN: Venta → Pedido (1 a N)        │
        │ ├─ saleId en orden               │
        │ └─ Una venta puede tener varios  │
        │   pedidos (en futuro)            │
        └──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PEDIDO (Orders)                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ order_number: "PED-001"                                   │  │
│  │ order_id: UUID                                            │  │
│  │ saleId: UUID (referencia a venta)                         │  │
│  │ sellerId: UUID (quien registró venta)                     │  │
│  │ cookId: UUID (quien prepara)                              │  │
│  │ status: "pending" → "received" → "completed"              │  │
│  │ createdAt: "2024-11-04T14:30:00"                          │  │
│  │ receivedAt: "2024-11-04T14:31:00" (cuando cocinero acept)│  │
│  │ completedAt: "2024-11-04T14:45:00" (cuando termina)       │  │
│  │                                                          │  │
│  │ [Para pedidos online:]                                   │  │
│  │ order_type: "online"                                     │  │
│  │ delivery_type: "delivery"/"pickup"/"dine-in"             │  │
│  │ delivery_time: "18:30"                                   │  │
│  │ customer_name: "Juan Pérez"                              │  │
│  │ customer_phone: "+591234567890"                           │  │
│  │ delivery_address: "Calle Principal 123"                  │  │
│  │                                                          │  │
│  │ details: [                                               │  │
│  │   {                                                      │  │
│  │     product_id: UUID,                                    │  │
│  │     name: "Hamburguesa",                                 │  │
│  │     quantity: 2,                                         │  │
│  │     unitPrice: 125.00,                                   │  │
│  │     subtotal: 250.00,                                    │  │
│  │     preparationTime: 15 (minutos)                         │  │
│  │   }                                                      │  │
│  │ ]                                                        │  │
│  │                                                          │  │
│  │ estimatedPreparationTime: 15 (máximo de todos)           │  │
│  │ notes: "Sin cebolla, extra queso"                        │  │
│  │                                                          │  │
│  │ PROPÓSITO: Gestión operativa de cocina                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

KEY DIFFERENCES:
├─ VENTA: Contabilidad, registro financiero
├─ PEDIDO: Operaciones, preparación
├─ VENTA: created_by_id siempre (vendedor o NULL si online)
├─ PEDIDO: cookId vacío hasta recepcionar
├─ VENTA: Datos cliente mínimos
├─ PEDIDO: Datos completos para delivery
├─ VENTA: payment_method es definitivo
├─ PEDIDO: tracking de tiempos
└─ RELACIÓN: Una venta → Un pedido (actualmente)
```

---

## 7. DIAGRAMA DE TIEMPOS (OrdersList urgencia)

```
TIMELINE DE ENTREGA

        Hora programada: 18:30
                 │
                 ▼
        ┌────────────────┐
        │    18:30       │  ← Hora de entrega
        └────────────────┘
                 ▲
                 │
                 │ (restar preparationTime)
                 │ Ej: 15 minutos
                 │
        ┌────────────────┐
        │    18:15       │  ← Hora de INICIO de preparación
        │  START TIME    │
        └────────────────┘
                 ▲
                 │
        ──────────────────────────────► TIEMPO
        13:45         14:45         18:15    18:30
        │             │             │        │
        AHORA      2h30m          15 min   Entrega
                                   antes


CÁLCULO EN TIEMPO REAL:

    minutesUntilStart = (startTime - now) / 60000

    if (minutesUntilStart <= 0) → ROJO: "PREPARAR AHORA"
    if (minutesUntilStart <= 5) → NARANJA: "Preparar en {X} min"
    if (minutesUntilStart <= 15) → AMARILLO: "Preparar en {X} min"
    if (minutesUntilStart > 15) → VERDE: "Preparar en {X} min"

EJEMPLO:
    Now: 18:10
    StartTime: 18:15 (5 minutos antes)
    
    minutesUntilStart = (18:15 - 18:10) = 5 minutos
    Badge: NARANJA ⚠️ "Preparar en 5 min"
```

---

## 8. CICLO DE VIDA DEL PEDIDO

```
                    CREACIÓN
                       │
                       ▼
        ┌──────────────────────────┐
        │ status: 'pending'        │
        │ createdAt: now           │
        │ (Esperando cocinero)     │
        └──────────────┬───────────┘
                       │
                       │ [Recepcionar Pedido]
                       ▼
        ┌──────────────────────────┐
        │ status: 'received'       │
        │ receivedAt: now          │
        │ cookId: assigned         │
        │ (Cocinero comienza)      │
        └──────────────┬───────────┘
                       │
                       │ [Preparando...]
                       │ (opcional: in_progress)
                       ▼
        ┌──────────────────────────┐
        │ status: 'in_progress'    │
        │ (Cocinero trabajando)    │
        └──────────────┬───────────┘
                       │
                       │ [Marcar Concluido]
                       ▼
        ┌──────────────────────────┐
        │ status: 'completed'      │
        │ completedAt: now         │
        │ (Listo para entregar)    │
        │                          │
        │ CÁLCULOS:               │
        │ - wait: received-created │
        │ - prep: completed-rcvd   │
        │ - total: completed-creat │
        └──────────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │ status: 'delivered'      │
        │ deliveredAt: (si aplica) │
        │ (Cliente recibió)        │
        └──────────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │ HISTORIAL               │
        │ OrdersHistory.js        │
        │ (Auditoría de tiempos)  │
        └──────────────────────────┘

OPTIONAL STATES:
├─ cancelled: Pedido cancelado
└─ rejected: Pedido rechazado
```

