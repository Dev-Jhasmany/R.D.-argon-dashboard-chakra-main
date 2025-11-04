# Exploración del Frontend - Sistema de PEDIDOS Y VENTAS

## Resumen Ejecutivo

Se encontró una arquitectura completa de componentes React para gestionar pedidos (orders) y ventas (sales) en un sistema de restaurante. El flujo principal es:

1. **Vendedor registra una VENTA** → Sistema crea un PEDIDO automáticamente en cocina
2. **Cocinero recibe el PEDIDO** → Lo marca como recepcionado
3. **Cocinero prepara los productos** → Marca como concluido cuando termina
4. **Cliente ve sus pedidos online** → En la sección "Mis Pedidos"

---

## 1. ARCHIVOS ENCONTRADOS

### Componentes de PEDIDOS (Orders)

| Archivo | Ruta | Propósito |
|---------|------|----------|
| **OrdersList.js** | `/src/views/Orders/OrdersList.js` | Lista de pedidos activos para cocinero (27KB) |
| **OrdersAdministration.js** | `/src/views/Orders/OrdersAdministration.js` | Administración de tiempos de preparación (14KB) |
| **OnlineOrders.js** | `/src/views/Orders/OnlineOrders.js` | Ventas online pendientes de confirmación (12KB) |
| **OrdersHistory.js** | `/src/views/Orders/OrdersHistory.js` | Historial de pedidos completados (14KB) |

### Componentes de VENTAS (Sales)

| Archivo | Ruta | Propósito |
|---------|------|----------|
| **RegisterSale.js** | `/src/views/Sales/RegisterSale.js` | Registro de ventas con carrito (2090 líneas) |
| **SalesList.js** | `/src/views/Sales/SalesList.js` | Listado y búsqueda de ventas (629 líneas) |

### Servicios

| Archivo | Ruta | Propósito |
|---------|------|----------|
| **orderService.js** | `/src/services/orderService.js` | API para gestionar pedidos |
| **salesService.js** | `/src/services/salesService.js` | API para gestionar ventas |

---

## 2. COMPONENTE: OrdersList.js (Pedidos Activos)

**Ubicación:** `/home/wilmafernandez1203/R.D.-argon-dashboard-chakra-main/src/views/Orders/OrdersList.js`

### Funcionalidad Principal
Lista de pedidos activos para que el cocinero los prepare. Muestra:
- Número de pedido
- Cliente (si es pedido online)
- Dirección de entrega
- Método de pago
- Productos a preparar
- Estado actual del pedido
- Tiempo estimado de preparación

### Estados del Pedido
```
pending (Pendiente)
  ↓ [Recepcionar Pedido]
received (Recepcionado)
  ↓ [Marcar como Concluido]
in_progress (En Preparación)
  ↓
completed (Concluido)
  ↓
delivered (Entregado)
```

### Características Especiales

#### 1. Auto-refresh cada 30 segundos
```javascript
const interval = setInterval(() => {
  loadOrdersSafe(true);
}, 30000);
```

#### 2. Cálculo automático de urgencia
- Calcula hora de inicio de preparación
- Resta tiempo estimado de la hora de entrega
- Muestra badge de urgencia con colores:
  - ROJO: "Preparar AHORA" (atrasado)
  - NARANJA: "Preparar en X min" (crítico)
  - AMARILLO: "Preparar en X min" (próximo)
  - VERDE: "Preparar en X min" (tiempo disponible)

#### 3. Diferenciación de pedidos
- **Pedidos normales:** Creados por vendedor (con created_by_id)
- **Pedidos online:** Sin created_by_id, con información de cliente en notas

#### 4. Enriquecimiento de datos
```javascript
// Busca venta asociada para extraer:
const emailMatch = notes.match(/Email:\s*([^\s-]+)/);
const addressMatch = notes.match(/Dirección:\s*([^-]+)/);
const timeMatch = notes.match(/Entrega programada:\s*(\d{2}:\d{2})/);
```

### Interacción del Usuario

1. **Carga inicial:** Obtiene pedidos activos del backend
2. **Ver detalles:** Expande tarjeta para ver productos
3. **Recepcionar:** Marca como "received" cuando comienza a preparar
4. **Concluir:** Marca como "completed" cuando termina

### Estado Local Gestionado
```javascript
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
```

---

## 3. COMPONENTE: OnlineOrders.js (Ventas Online)

**Ubicación:** `/home/wilmafernandez1203/R.D.-argon-dashboard-chakra-main/src/views/Orders/OnlineOrders.js`

### Funcionalidad Principal
Gestiona ventas online pendientes de confirmación de pago ANTES de crear el pedido.

### Flujo de Interacción

1. **Cliente realiza compra online** → Crea VENTA sin created_by_id
2. **Sistema muestra en "Ventas Online Pendientes"**
3. **Administrador confirma pago** → Endpoint: `PATCH /sales/{id}/confirm-online`
4. **Se crea el PEDIDO automáticamente** → Aparece en OrdersList para cocinero

### Estados de Venta Online
```
Online sin pedido
  ↓ [Confirmar Pago]
Pedido creado (enviado a cocina)
  ↓
Cocinero lo recibe en OrdersList
```

### Características

#### Tabla de ventas online
- Número de venta
- Cliente (nombre)
- Fecha/hora
- Método de pago
- Total
- Botón de detalles
- Botón de confirmación

#### Modal de detalles
```
Información del cliente
+ Productos vendidos
+ Subtotal/Descuento/Total
+ Método de pago
+ Botón de confirmación
```

### Filtrado
```javascript
const onlineSales = allSales.filter(sale => {
  const isOnline = !sale.created_by_id;      // Sin usuario creador
  const hasOrder = allOrders.some(order => order.saleId === sale.id);
  return isOnline && !hasOrder;               // Online y sin pedido
});
```

---

## 4. COMPONENTE: RegisterSale.js (Registro de Ventas)

**Ubicación:** `/home/wilmafernandez1203/R.D.-argon-dashboard-chakra-main/src/views/Sales/RegisterSale.js`

### Funcionalidad Principal
Sistema completo de punto de venta (POS) con carrito de compras y múltiples métodos de pago.

### Flujo de Compra

```
1. Vendedor selecciona CAJA ABIERTA
   ↓
2. Agrega PRODUCTOS o PROMOCIONES al carrito
   ↓
3. Selecciona MÉTODO DE PAGO
   ↓
4. Registra datos del CLIENTE (opcional)
   ↓
5. Clica "Registrar Venta"
   ↓
6. BACKEND crea VENTA + actualiza STOCK
   ↓
7. FRONTEND crea PEDIDO automáticamente
   ↓
8. Muestra MODAL según método de pago:
     - EFECTIVO: Muestra ticket
     - QR: Muestra código QR
     - PAYPAL: Flujo de email
     - STRIPE: Flujo de teléfono
```

### Estructura de la Interfaz

#### Panel izquierdo (2/3 ancho):
- **Carrito de venta:** Tabla con productos agregados
  - Código, nombre, cantidad, precio unitario, subtotal
  - Botón eliminar para cada producto

#### Panel derecho (1/3 ancho):
- **Resumen:** Subtotal, descuento, total
- **Datos del cliente:** Nombre, NIT/CI, método pago, notas
- **Botón registrar venta**

#### Paneles inferiores (100% ancho):
- **Historial de ventas:** Últimas 10 ventas
- **Estado del inventario:** Stock actual de productos

### Métodos de Pago Soportados

#### 1. **EFECTIVO (default)**
```
Usuario selecciona "Efectivo"
  ↓
Registra venta
  ↓
Muestra ticket de venta
  ↓
Limpia formulario
```

#### 2. **QR**
```
Usuario selecciona "QR"
  ↓
Venta registrada en BD
  ↓
Modal QR muestra:
  - Monto a pagar
  - Código QR (JSON con datos)
  ↓
Usuario escanea QR
  ↓
Clica "Confirmar Pago"
```

JSON del QR:
```json
{
  "sale_number": "V-001",
  "total": "150.00",
  "currency": "BOB",
  "customer": "Juan Pérez",
  "timestamp": "2024-11-04T..."
}
```

#### 3. **PAYPAL**
```
Usuario selecciona "PayPal"
  ↓
Modal: Input email del cliente
  ↓ [Enviar solicitud]
  ↓
Estado "Sending" (2 seg)
  ↓
Estado "Waiting" (4 seg) - Esperando confirmación en app
  ↓
Estado "Confirmed" - Cliente confirmó en su app PayPal
  ↓ [Confirmar Pago]
  ↓
Muestra ticket
```

#### 4. **STRIPE**
```
Usuario selecciona "Stripe"
  ↓
Modal: Teléfono + método (WhatsApp/SMS)
  ↓ [Enviar vínculo]
  ↓
Estado "Sending" (2 seg)
  ↓
Estado "Waiting" (5 seg) - Cliente recibe vínculo
  ↓
Estado "Confirmed" - Cliente completó pago en Stripe
  ↓ [Confirmar Pago]
  ↓
Muestra ticket
```

Vínculo de ejemplo:
```
https://pay.stripe.com/demo/V-001
```

### Funciones Críticas

#### 1. `handleAddToCart()`
Valida:
- Producto o promoción seleccionado
- Stock disponible
- Cantidad válida
- Promociones solo con cantidad 1

#### 2. `handleSubmit()`
```javascript
const saleData = {
  customer_name,
  customer_nit,
  discount,
  payment_method,
  notes,
  cash_register_id,
  created_by_id,
  details: [
    { product_id, quantity, unit_price, ... }
  ]
};

const result = await salesService.createSale(saleData);

// Crear pedido automáticamente
await createOrderFromSale(result.data);

// Mostrar modal según método de pago
if (payment_method === 'qr') { ... }
else if (payment_method === 'paypal') { ... }
else if (payment_method === 'stripe') { ... }
else { mostrar ticket }
```

#### 3. `createOrderFromSale(sale)`
Transforma venta en pedido:
```javascript
const orderDetails = cart.map((item) => {
  let preparationTime = 5; // default
  
  if (item.is_promotion) {
    preparationTime = 10; // o real de promoción
  } else {
    preparationTime = 5;  // o real del producto
  }
  
  return {
    type: 'product' | 'promotion',
    productId,
    promotionId,
    name,
    quantity,
    unitPrice,
    subtotal,
    preparationTime
  };
});

const orderData = {
  saleId: sale.id,
  sellerId: user.id,
  details: orderDetails,
  notes: formData.notes || productNames
};

await orderService.createOrder(orderData);
```

### Estado Local
```javascript
const [cart, setCart] = useState([]);                    // Carrito
const [formData, setFormData] = useState({               // Datos cliente
  customer_name: '',
  customer_nit: '',
  discount: 0,
  payment_method: 'efectivo',
  notes: '',
});
const [products, setProducts] = useState([]);            // Productos activos
const [promotions, setPromotions] = useState([]);        // Promociones activas
const [selectedCashRegister, setSelectedCashRegister] = null; // Caja seleccionada
const [isQRModalOpen, setIsQRModalOpen] = useState(false);
const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);
const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
const [paypalStatus, setPaypalStatus] = useState('input'); // input|sending|waiting|confirmed
const [stripeStatus, setStripeStatus] = useState('input'); // input|sending|waiting|confirmed
```

---

## 5. COMPONENTE: SalesList.js (Listado de Ventas)

**Ubicación:** `/home/wilmafernandez1203/R.D.-argon-dashboard-chakra-main/src/views/Sales/SalesList.js`

### Funcionalidad Principal
Listado completo de ventas históricas con búsqueda, filtrado y exportación.

### Features

#### 1. Búsqueda
```javascript
filtered = sales.filter(
  (sale) =>
    sale.sale_number.toLowerCase().includes(value.toLowerCase()) ||
    sale.customer_name?.toLowerCase().includes(value.toLowerCase()) ||
    sale.customer_nit?.toLowerCase().includes(value.toLowerCase())
);
```

#### 2. Información mostrada
- Número de venta
- Fecha/hora
- Cliente
- NIT/CI
- Total
- Método de pago
- Acciones (ver detalles, eliminar)

#### 3. Modal de detalles
```
Información general (fecha, cliente, NIT, pago)
+ Tabla de productos vendidos (código, nombre, cantidad, precio, subtotal, stock)
+ Totales (subtotal, descuento, total)
```

#### 4. Exportación a PDF
```javascript
const doc = new jsPDF('landscape');

// Encabezado con fecha
// Tabla con:
// - Venta
// - Cliente
// - Cantidad, Precio Unit., Subtotal
// - Stock Actual después de la venta

// Incluye código, producto, cantidad, precio unit., subtotal, stock
```

#### 5. Exportación a Excel
```javascript
const excelData = [];

filteredSales.forEach(sale => {
  excelData.push({
    'Nº Venta': sale.sale_number,
    'Fecha': ...,
    'Cliente': ...,
    'NIT/CI': ...,
    'Método de Pago': ...,
    'Total Venta': ...,
    'Código Producto': '',
    'Producto': '',
    ...
  });
  
  sale.details.forEach(detail => {
    excelData.push({
      'Nº Venta': '',
      ...
      'Código Producto': detail.product?.code,
      'Producto': detail.product?.name,
      'Cantidad': detail.quantity,
      ...
    });
  });
});
```

---

## 6. COMPONENTE: OrdersAdministration.js

**Ubicación:** `/home/wilmafernandez1203/R.D.-argon-dashboard-chakra-main/src/views/Orders/OrdersAdministration.js`

### Funcionalidad Principal
Administración de tiempos de preparación para productos y promociones.

### Interfaz con Tabs

#### Tab 1: Productos
Tabla editable:
- Código
- Nombre
- Categoría
- Estado (Activo/Inactivo)
- Tiempo de Preparación (editable)
- Acciones (Editar/Guardar)

#### Tab 2: Promociones
Tabla editable:
- Nombre
- Tipo (Descuento/Combo)
- Producto
- Estado
- Tiempo de Preparación (editable)
- Acciones

### Funciones

```javascript
const handleSaveProduct = async (productId) => {
  const time = preparationTimes[`product-${productId}`];
  
  // Validar >= 1 minuto
  
  const result = await orderService.updatePreparationTime(
    'product',
    productId,
    time
  );
};

const handleSavePromotion = async (promotionId) => {
  const result = await orderService.updatePreparationTime(
    'promotion',
    promotionId,
    time
  );
};
```

---

## 7. COMPONENTE: OrdersHistory.js

**Ubicación:** `/home/wilmafernandez1203/R.D.-argon-dashboard-chakra-main/src/views/Orders/OrdersHistory.js`

### Funcionalidad Principal
Historial completo de pedidos completados, entregados o cancelados.

### Datos Mostrados
- Número de pedido
- Fecha/hora creación
- Vendedor
- Cocinero
- Estado
- Tiempo de espera (creado→recepcionado)
- Tiempo de preparación (recepcionado→completado)
- Tiempo total (creado→completado)
- Hora recepción
- Hora conclusión

### Cálculos de Tiempo
```javascript
const calculateWaitTime = (order) => {
  const diffMs = order.receivedAt - order.createdAt;
  return Math.round(diffMs / 60000) + ' min';
};

const calculatePreparationTime = (order) => {
  const diffMs = order.completedAt - order.receivedAt;
  return Math.round(diffMs / 60000) + ' min';
};

const calculateTotalTime = (order) => {
  const diffMs = order.completedAt - order.createdAt;
  return Math.round(diffMs / 60000) + ' min';
};
```

### Filtrado
Select con opciones:
- Todos los estados
- Concluidos
- Entregados
- Cancelados

### Exportación
- **Excel (.xlsx):** Con columnas de tiempos calculados
- **PDF (landscape):** Tabla con información completa

---

## 8. SERVICIOS

### orderService.js

```javascript
{
  getAllOrders(status = null),              // GET /orders?status=...
  getActiveOrders(),                        // GET /orders/active
  getOrderById(id),                         // GET /orders/{id}
  createOrder(orderData),                   // POST /orders
  updateOrderStatus(id, statusData),        // PATCH /orders/{id}/status
  markAsReceived(id, cookId),               // PATCH /orders/{id}/receive
  markAsCompleted(id),                      // PATCH /orders/{id}/complete
  updatePreparationTime(itemType, itemId, preparationTime), // PATCH /orders/preparation-time
  getStatistics(),                          // GET /orders/statistics
  deleteOrder(id),                          // DELETE /orders/{id}
}
```

### salesService.js

```javascript
{
  getAllSales(),                            // GET /sales
  getSaleById(id),                          // GET /sales/{id}
  createSale(saleData),                     // POST /sales
  deleteSale(id),                           // DELETE /sales/{id}
  getSalesStats(),                          // GET /sales/stats
  cancelSale(id, reason),                   // PATCH /sales/{id}/cancel
  returnSale(id, reason),                   // PATCH /sales/{id}/return
  getPendingPaymentOrders(),                // Lógica local + API
}
```

---

## 9. FLUJOS COMPLETOS DE USUARIO

### Flujo A: Venta Normal (Efectivo/POS)

```
VENDEDOR
├─ Abre Terminal POS
├─ Selecciona Caja Abierta
├─ Clica "Agregar Producto"
├─ Modal:
│  ├─ Selecciona Promoción (opcional)
│  ├─ O selecciona Producto Regular
│  ├─ Ingresa Cantidad
│  └─ Clica "Agregar"
├─ Repite hasta tener carrito completo
├─ (Opcional) Ingresa datos del cliente
├─ Selecciona Método: EFECTIVO
├─ Clica "Registrar Venta"
└─ ✓ Venta registrada
   └─ Muestra ticket

BACKEND
├─ Crea registro de venta
├─ Actualiza stock de productos
├─ Registra movimientos de inventario
└─ Retorna sale.id

FRONTEND (automático)
├─ createOrderFromSale(sale)
├─ Obtiene tiempos de preparación
├─ Crea pedido con details[]
└─ Envía a /orders

COCINERO
├─ Ve pedido en OrdersList
├─ Clica "Recepcionar Pedido"
├─ Inicia preparación
├─ Clica "Marcar como Concluido"
└─ ✓ Pedido listo para entregar/recoger
```

### Flujo B: Venta Online + Pedido

```
CLIENTE (online)
├─ Completa compra en app web
├─ Selecciona método pago QR/PayPal/Stripe
├─ Realiza pago
└─ Sistema crea VENTA sin created_by_id

ADMINISTRADOR
├─ Ve pedido en "Ventas Online Pendientes"
├─ Revisa detalles en modal
├─ Clica "Confirmar Pago"
├─ Endpoint: PATCH /sales/{id}/confirm-online
└─ ✓ Pedido creado automáticamente

COCINERO
├─ Ve nuevo pedido en OrdersList
├─ Información del cliente visible:
│  ├─ Nombre
│  ├─ Teléfono
│  ├─ Dirección
│  ├─ Tipo pedido (delivery/pickup/dine-in)
│  └─ Hora de entrega programada
├─ Prepara productos
└─ Marca como concluido
```

### Flujo C: Pedido QR

```
REGISTRAR VENTA
├─ Método: QR
├─ Registra venta
├─ Modal QR abierto
│  ├─ Muestra monto
│  ├─ Genera código QR con datos venta
│  └─ Cliente escanea
├─ Cliente confirma en su app de pago
├─ Clica "Confirmar Pago y Cerrar"
└─ Muestra ticket y limpia formulario

BACKEND
└─ Venta ya registrada con payment_method='qr'
```

---

## 10. ESTRUCTURA DE DATOS

### Objeto Sale (Venta)
```javascript
{
  id: UUID,
  sale_number: "V-001",
  customer_name: "Juan Pérez",
  customer_nit: "123456789",
  payment_method: "efectivo" | "qr" | "paypal" | "stripe" | "tarjeta" | "transferencia",
  total: 250.50,
  subtotal: 265.00,
  discount: 14.50,
  notes: "Sin cebolla",
  created_by_id: UUID | null,           // null si es online
  cash_register_id: UUID,
  created_at: "2024-11-04T14:30:00",
  is_active: true | false,
  details: [
    {
      id: UUID,
      product_id: UUID,
      custom_name: "Combo Pizza",
      custom_code: "PROMO-001",
      quantity: 2,
      unit_price: 85.00,
      subtotal: 170.00,
      product: {
        id, code, name, stock, price, unit, category
      }
    }
  ]
}
```

### Objeto Order (Pedido)
```javascript
{
  id: UUID,
  order_number: "PED-001",
  saleId: UUID,                         // Venta asociada
  sellerId: UUID,                       // Vendedor que creó
  cookId: UUID | null,                  // Cocinero asignado
  status: "pending" | "received" | "in_progress" | "completed" | "delivered" | "cancelled",
  notes: "1x Hamburguesa, 2x Papas...",
  createdAt: "2024-11-04T14:30:00",
  receivedAt: "2024-11-04T14:31:00",    // Cuando cocinero recepcionó
  completedAt: "2024-11-04T14:45:00",   // Cuando cocinero terminó
  estimatedPreparationTime: 15,         // Minutos
  order_type: "online" | null,          // Si es pedido online
  delivery_type: "pickup" | "delivery" | "dine-in",
  delivery_time: "18:30",               // Hora programada
  customer_name: "Juan Pérez",
  customer_phone: "+591234567890",
  customer_email: "juan@email.com",
  delivery_address: "Calle Principal 123",
  payment_method: "qr",
  seller: {
    id, full_name, full_last_name
  },
  cook: {
    id, full_name, full_last_name
  },
  details: [
    {
      id: UUID,
      type: "product" | "promotion",
      productId: UUID | null,
      promotionId: UUID | null,
      name: "Hamburguesa Especial",
      quantity: 1,
      unitPrice: 45.00,
      subtotal: 45.00,
      preparationTime: 10    // Minutos
    }
  ]
}
```

---

## 11. RUTAS API UTILIZADAS

### Orders
```
GET    /orders                      - Todos los pedidos
GET    /orders/active               - Pedidos activos (para cocinero)
GET    /orders/{id}                 - Un pedido específico
POST   /orders                      - Crear pedido
PATCH  /orders/{id}/status          - Actualizar estado
PATCH  /orders/{id}/receive         - Marcar como recepcionado
PATCH  /orders/{id}/complete        - Marcar como concluido
PATCH  /orders/preparation-time     - Actualizar tiempo preparación
GET    /orders/statistics           - Estadísticas
DELETE /orders/{id}                 - Eliminar
```

### Sales
```
GET    /sales                       - Todas las ventas
GET    /sales/{id}                  - Una venta específica
POST   /sales                       - Crear venta
DELETE /sales/{id}                  - Eliminar venta
GET    /sales/stats                 - Estadísticas
PATCH  /sales/{id}/cancel           - Anular venta
PATCH  /sales/{id}/return           - Devolver venta
PATCH  /sales/{id}/confirm-online   - Confirmar pago online
```

---

## 12. INTERACCIONES CLAVE

### 1. Cuando usuario registra venta
```
Input:
├─ Carrito con productos/promociones
├─ Datos cliente
├─ Método pago
└─ Caja abierta

Flujo:
├─ Validar carrito no vacío
├─ salesService.createSale() → POST /sales
├─ Backend registra y retorna sale.id
├─ Frontend crea pedido automáticamente
│  └─ orderService.createOrder() → POST /orders
├─ Muestra modal según payment_method
└─ Limpia formulario si todo OK

Output:
├─ Venta guardada en BD
├─ Pedido creado en estado 'pending'
└─ Aparece en OrdersList para cocinero
```

### 2. Cuando cocinero recepcionará
```
Input:
└─ Click en "Recepcionar Pedido"

Validaciones:
├─ Usuario debe estar autenticado
├─ Hora actual >= hora de inicio de preparación
└─ Estado debe ser 'pending'

Flujo:
├─ orderService.markAsReceived(orderId, user.id)
│  └─ PATCH /orders/{id}/receive { cookId }
├─ Backend cambia estado a 'received'
├─ Registra hora receivedAt
└─ Frontend recarga OrdersList

Output:
├─ Pedido con estado 'received'
├─ Se activa botón "Marcar como Concluido"
└─ Tiempo espera: createdAt → receivedAt
```

### 3. Cuando cocinero marca como concluido
```
Input:
└─ Click en "Marcar como Concluido"

Validaciones:
├─ Estado debe ser 'received' o 'in_progress'
└─ Debe haber productos listados

Flujo:
├─ orderService.markAsCompleted(orderId)
│  └─ PATCH /orders/{id}/complete
├─ Backend cambia estado a 'completed'
├─ Registra hora completedAt
├─ Mueve pedido del listado activo
└─ Frontend recarga OrdersList

Output:
├─ Pedido con estado 'completed'
├─ Aparece en Historial de Pedidos
├─ Tiempo de preparación: receivedAt → completedAt
└─ Cocinero puede entregar al cliente
```

### 4. Cuando admin confirma pago online
```
Input:
├─ Venta online en "Ventas Online Pendientes"
└─ Click en "Confirmar Pago"

Validaciones:
├─ Venta sin created_by_id (online)
├─ No debe tener pedido creado
└─ Comprobante de pago si aplica

Flujo:
├─ api.patch(`/sales/${saleId}/confirm-online`)
├─ Backend:
│  ├─ Crea orden automáticamente
│  └─ Retorna confirmación
├─ Frontend recarga "Ventas Online"
└─ Pedido aparece en OrdersList

Output:
├─ Venta marcada como confirmada
├─ Pedido en estado 'pending'
└─ Cocinero puede empezar a preparar
```

---

## 13. CASOS DE USO POR ROL

### Rol: VENDEDOR
```
Accede a:
├─ Registrar Venta
├─ Historial de Ventas (últimas 10)
└─ Estado del Inventario

Acciones:
├─ Crear carrito
├─ Agregar/eliminar productos
├─ Aplicar descuentos
├─ Registrar cliente
├─ Elegir método pago
├─ Confirmar venta
└─ Ver ticket
```

### Rol: COCINERO
```
Accede a:
├─ Pedidos Activos (OrdersList)
└─ Historial de Pedidos

Acciones:
├─ Ver pedidos pendientes
├─ Recepcionar pedido
├─ Preparar productos
├─ Marcar como concluido
├─ Ver tiempos y urgencias
└─ Revisar historial
```

### Rol: ADMINISTRADOR
```
Accede a:
├─ Ventas Online Pendientes (OnlineOrders)
├─ Administración de Tiempos (OrdersAdministration)
├─ Listado de Ventas (SalesList)
├─ Historial de Pedidos (OrdersHistory)
└─ Estadísticas

Acciones:
├─ Confirmar pagos online
├─ Editar tiempos de preparación
├─ Ver todas las ventas
├─ Exportar reportes PDF/Excel
├─ Filtrar y buscar
└─ Eliminar registros
```

### Rol: CLIENTE ONLINE
```
Accede a:
└─ Mis Pedidos (MyOrders)

Puede ver:
├─ Número de pedido
├─ Estado (pending/confirmed/rejected)
├─ Fecha de creación
├─ Productos ordenados
├─ Total pagado
├─ Método de pago
├─ Dirección de entrega
├─ Comprobante de pago
└─ Fecha de confirmación
```

---

## 14. CONCLUSIONES Y PATRONES

### Patrón de Creación: Venta → Pedido

El sistema sigue un patrón donde:
1. **Toda venta genera automáticamente un pedido**
2. El pedido es el que va a cocina, no la venta
3. Las ventas son registro contable/POS
4. Los pedidos son para gestión operativa de cocina

### Validaciones Principales

```javascript
// Carrito
├─ No vacío
├─ Stock suficiente
├─ Cantidad válida
└─ Promociones con cantidad=1

// Venta
├─ Caja abierta seleccionada
└─ Al menos un producto

// Pedido
├─ Usuario autenticado
├─ Hora de inicio de preparación
└─ Estado correcto
```

### Timeouts y Actualizaciones

```javascript
// Auto-refresh de OrdersList cada 30 segundos
setInterval(() => loadOrdersSafe(true), 30000);

// Auto-refresh de MyOrders cada 5 segundos (cliente)
setInterval(() => loadOrders(), 5000);

// Cálculos en tiempo real
const minutesUntilStart = getMinutesUntilStart(...);
const urgencyBadge = getUrgencyBadge(minutesUntilStart);
```

### Estados de Pago Digital

```javascript
// PayPal
'input' → 'sending' → 'waiting' → 'confirmed'

// Stripe
'input' → 'sending' → 'waiting' → 'confirmed'

// QR (instant)
'input' → 'confirmed' (después de escanear)
```

---

## 15. ARCHIVOS RESUMEN UBICACIÓN

```
Frontend React Structure:
/src
├── views/
│   ├── Orders/
│   │   ├── OrdersList.js              (27KB) - Pedidos activos
│   │   ├── OrdersAdministration.js    (14KB) - Config tiempos
│   │   ├── OnlineOrders.js            (12KB) - Ventas online
│   │   └── OrdersHistory.js           (14KB) - Historial
│   ├── Sales/
│   │   ├── RegisterSale.js            (2090L) - POS completo
│   │   └── SalesList.js               (629L) - Listado ventas
│   └── Customer/
│       └── MyOrders.js                - Pedidos del cliente
├── services/
│   ├── orderService.js                - API pedidos
│   └── salesService.js                - API ventas
└── components/
    └── TicketReceipt/
        └── TicketReceipt.js           - Impresión de ticket
```

